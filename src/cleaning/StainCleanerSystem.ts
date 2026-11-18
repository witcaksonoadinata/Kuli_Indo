import * as BABYLON from "@babylonjs/core";
import { QuestRuntime } from "../quests/QuestRuntime";

export class StainSpotComponent {
    public mesh: BABYLON.AbstractMesh;
    public roomId: string;
    public stainType: string;
    public cleanliness: number = 0;

    constructor(mesh: BABYLON.AbstractMesh, roomId: string, stainType: string = "NodaLumpur") {
        this.mesh = mesh;
        this.roomId = roomId;
        this.stainType = stainType;

        BABYLON.Tags.AddTagsTo(this.mesh, "StainSpot CleanableTarget");
        this.mesh.metadata = this.mesh.metadata || {};
        this.mesh.metadata.stainComponent = this;
    }

    public scrub(amount: number): boolean {
        this.cleanliness = Math.min(1, this.cleanliness + amount);
        this.mesh.visibility = 1 - this.cleanliness;

        if (this.cleanliness >= 1) {
            this.mesh.dispose();
            return true;
        }
        return false;
    }
}

export class StainCleanerTool {
    private scene: BABYLON.Scene;
    private camera: BABYLON.Camera;
    private questRuntime: QuestRuntime;
    private isScrubbing: boolean = false;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, questRuntime: QuestRuntime) {
        this.scene = scene;
        this.camera = camera;
        this.questRuntime = questRuntime;

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.isScrubbing) {
                const dt = this.scene.getEngine().getDeltaTime() / 1000;
                this.performScrubRaycast(dt);
            }
        });
    }

    public setScrubbing(active: boolean) {
        this.isScrubbing = active;
    }

    private performScrubRaycast(dt: number) {
        const ray = this.scene.createPickingRay(
            this.scene.pointerX,
            this.scene.pointerY,
            BABYLON.Matrix.Identity(),
            this.camera
        );
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.hit && hit.pickedMesh && BABYLON.Tags.MatchesQuery(hit.pickedMesh, "StainSpot")) {
            const stainComp: StainSpotComponent | undefined = hit.pickedMesh.metadata?.stainComponent;
            if (stainComp) {
                const isCleaned = stainComp.scrub(dt * 1.25);
                if (isCleaned) {
                    this.questRuntime.recordAction("CleanStain", stainComp.roomId, stainComp.stainType, 1, 0);
                }
            }
        }
    }

    public triggerDirtScanner(durationMs: number = 3500) {
        const targets = this.scene.getMeshesByTags("CleanableTarget || TrashItem");

        targets.forEach(mesh => {
            mesh.renderOutline = true;
            mesh.outlineColor = BABYLON.Color3.Yellow();
            mesh.outlineWidth = 0.04;
        });

        setTimeout(() => {
            targets.forEach(mesh => {
                if (!mesh.isDisposed()) {
                    mesh.renderOutline = false;
                }
            });
        }, durationMs);
    }
}
