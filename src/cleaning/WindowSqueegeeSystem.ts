import * as BABYLON from "@babylonjs/core";
import { QuestRuntime } from "../quests/QuestRuntime";

export class DirtyWindowComponent {
    public glassMesh: BABYLON.Mesh;
    public roomId: string;
    public isClean: boolean = false;
    public wipeProgress: number = 0;

    private glassMaterial: BABYLON.StandardMaterial;

    constructor(glassMesh: BABYLON.Mesh, roomId: string, scene: BABYLON.Scene) {
        this.glassMesh = glassMesh;
        this.roomId = roomId;

        this.glassMaterial = new BABYLON.StandardMaterial(`windowMat_${Date.now()}`, scene);
        this.glassMaterial.diffuseColor = new BABYLON.Color3(0.55, 0.5, 0.42);
        this.glassMaterial.alpha = 0.85;
        this.glassMesh.material = this.glassMaterial;

        BABYLON.Tags.AddTagsTo(this.glassMesh, "DirtyWindow CleanableTarget");
        this.glassMesh.metadata = this.glassMesh.metadata || {};
        this.glassMesh.metadata.windowComponent = this;
    }

    public applyVerticalStroke(deltaDownward: number): boolean {
        if (this.isClean || deltaDownward <= 0) return false;

        this.wipeProgress = Math.min(1.0, this.wipeProgress + deltaDownward);
        this.glassMaterial.alpha = 0.85 - this.wipeProgress * 0.65;
        this.glassMaterial.diffuseColor = BABYLON.Color3.Lerp(
            new BABYLON.Color3(0.55, 0.5, 0.42),
            new BABYLON.Color3(0.85, 0.95, 1.0),
            this.wipeProgress
        );

        if (this.wipeProgress >= 0.95) {
            this.isClean = true;
            this.glassMaterial.alpha = 0.2;
            BABYLON.Tags.RemoveTagsFrom(this.glassMesh, "DirtyWindow CleanableTarget");
            return true;
        }
        return false;
    }
}

export class WindowSqueegeeTool {
    private scene: BABYLON.Scene;
    private camera: BABYLON.Camera;
    private questRuntime: QuestRuntime;

    private activeWindow: DirtyWindowComponent | null = null;
    private lastPointerY: number | null = null;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, questRuntime: QuestRuntime) {
        this.scene = scene;
        this.camera = camera;
        this.questRuntime = questRuntime;
    }

    public startWipe() {
        const ray = this.scene.createPickingRay(
            this.scene.pointerX,
            this.scene.pointerY,
            BABYLON.Matrix.Identity(),
            this.camera
        );
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.hit && hit.pickedMesh && BABYLON.Tags.MatchesQuery(hit.pickedMesh, "DirtyWindow")) {
            this.activeWindow = hit.pickedMesh.metadata?.windowComponent || null;
            this.lastPointerY = this.scene.pointerY;
        }
    }

    public updateWipe() {
        if (!this.activeWindow || this.lastPointerY === null) return;

        const deltaY = this.scene.pointerY - this.lastPointerY;
        this.lastPointerY = this.scene.pointerY;

        if (deltaY > 0) {
            const normalizedStroke = deltaY / 250;
            const justFinished = this.activeWindow.applyVerticalStroke(normalizedStroke);

            if (justFinished) {
                this.spawnCleanSparkle(this.activeWindow.glassMesh.position);
                this.questRuntime.recordAction("CleanStain", this.activeWindow.roomId, "WindowGlass", 1, 0);
                this.stopWipe();
            }
        }
    }

    public stopWipe() {
        this.activeWindow = null;
        this.lastPointerY = null;
    }

    private spawnCleanSparkle(position: BABYLON.Vector3) {
        const sparkle = new BABYLON.ParticleSystem("windowSparkle", 20, this.scene);
        sparkle.emitter = position.clone();
        sparkle.color1 = new BABYLON.Color4(1, 1, 0.9, 1);
        sparkle.color2 = new BABYLON.Color4(0.7, 0.95, 1, 1);
        sparkle.minSize = 0.08;
        sparkle.maxSize = 0.22;
        sparkle.minLifeTime = 0.3;
        sparkle.maxLifeTime = 0.6;
        sparkle.emitRate = 40;
        sparkle.start();

        setTimeout(() => {
            sparkle.stop();
            setTimeout(() => sparkle.dispose(), 700);
        }, 350);
    }
}
