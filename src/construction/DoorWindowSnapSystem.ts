import * as BABYLON from "@babylonjs/core";
import { HistoryManager } from "../core/HistoryManager";
import { Command } from "../core/Command";

export type OpeningType = "PintuKayu" | "PintuKupuTarung" | "JendelaJalusi" | "JendelaKaca";

export class DoorWindowSnapSystem {
    private scene: BABYLON.Scene;
    private history: HistoryManager;

    constructor(scene: BABYLON.Scene, history: HistoryManager) {
        this.scene = scene;
        this.history = history;
    }

    public findNearestWallSegment(point: BABYLON.Vector3, maxDistance: number = 1.2): BABYLON.AbstractMesh | null {
        const wallSegments = this.scene.getMeshesByTags("WallSegment");
        let nearest: BABYLON.AbstractMesh | null = null;
        let minDist = maxDistance;

        for (const seg of wallSegments) {
            if (!seg.isEnabled()) continue;
            const dist = BABYLON.Vector3.Distance(
                new BABYLON.Vector3(point.x, seg.position.y, point.z),
                seg.position
            );
            if (dist < minDist) {
                minDist = dist;
                nearest = seg;
            }
        }
        return nearest;
    }

    public placeOpeningOnWall(targetSegment: BABYLON.AbstractMesh, type: OpeningType) {
        if (!targetSegment || !targetSegment.isEnabled()) return;

        const cmd = new PlaceOpeningCommand(this.scene, targetSegment, type);
        this.history.executeCommand(cmd);
    }
}

class PlaceOpeningCommand implements Command {
    private scene: BABYLON.Scene;
    private targetWallSegment: BABYLON.AbstractMesh;
    private openingType: OpeningType;
    private openingRoot: BABYLON.TransformNode | null = null;
    private isDoorOpen: boolean = false;

    constructor(scene: BABYLON.Scene, targetWallSegment: BABYLON.AbstractMesh, openingType: OpeningType) {
        this.scene = scene;
        this.targetWallSegment = targetWallSegment;
        this.openingType = openingType;
    }

    public execute(): void {
        this.targetWallSegment.setEnabled(false);

        const pos = this.targetWallSegment.position.clone();
        const rotY = this.targetWallSegment.rotation.y;
        const wallBottomY = pos.y - 1.5;

        this.openingRoot = new BABYLON.TransformNode(`opening_${this.openingType}_${Date.now()}`, this.scene);
        this.openingRoot.position = new BABYLON.Vector3(pos.x, wallBottomY, pos.z);
        this.openingRoot.rotation.y = rotY;

        const frameMat = new BABYLON.StandardMaterial("kusenMat", this.scene);
        frameMat.diffuseColor = new BABYLON.Color3(0.38, 0.22, 0.12);
        frameMat.specularColor = BABYLON.Color3.Black();

        const bambooWallMat = new BABYLON.StandardMaterial("ambangBilikMat", this.scene);
        bambooWallMat.diffuseColor = new BABYLON.Color3(0.76, 0.64, 0.42);
        bambooWallMat.specularColor = BABYLON.Color3.Black();

        const isDoor = this.openingType === "PintuKayu" || this.openingType === "PintuKupuTarung";

        if (isDoor) {
            const topWall = BABYLON.MeshBuilder.CreateBox("doorHeaderWall", { width: 1.0, height: 0.9, depth: 0.2 }, this.scene);
            topWall.position.y = 2.55;
            topWall.material = bambooWallMat;
            topWall.parent = this.openingRoot;

            const leftJamb = BABYLON.MeshBuilder.CreateBox("leftJamb", { width: 0.08, height: 2.1, depth: 0.24 }, this.scene);
            leftJamb.position = new BABYLON.Vector3(-0.46, 1.05, 0);
            leftJamb.material = frameMat;
            leftJamb.parent = this.openingRoot;

            const rightJamb = leftJamb.clone("rightJamb");
            rightJamb.position.x = 0.46;

            const doorPivot = new BABYLON.TransformNode("doorPivot", this.scene);
            doorPivot.position = new BABYLON.Vector3(-0.42, 1.05, 0);
            doorPivot.parent = this.openingRoot;

            const doorLeaf = BABYLON.MeshBuilder.CreateBox("doorLeaf", { width: 0.84, height: 2.05, depth: 0.06 }, this.scene);
            doorLeaf.position.x = 0.42;
            doorLeaf.material = frameMat;
            doorLeaf.parent = doorPivot;

            BABYLON.Tags.AddTagsTo(doorLeaf, "InteractiveDoor");
            doorLeaf.actionManager = new BABYLON.ActionManager(this.scene);
            doorLeaf.actionManager.registerAction(
                new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                    this.isDoorOpen = !this.isDoorOpen;
                    doorPivot.rotation.y = this.isDoorOpen ? Math.PI * 0.48 : 0;
                })
            );
        } else {
            const bottomWall = BABYLON.MeshBuilder.CreateBox("winSillWall", { width: 1.0, height: 0.9, depth: 0.2 }, this.scene);
            bottomWall.position.y = 0.45;
            bottomWall.material = bambooWallMat;
            bottomWall.parent = this.openingRoot;

            const topWall = BABYLON.MeshBuilder.CreateBox("winHeaderWall", { width: 1.0, height: 0.9, depth: 0.2 }, this.scene);
            topWall.position.y = 2.55;
            topWall.material = bambooWallMat;
            topWall.parent = this.openingRoot;

            const windowPane = BABYLON.MeshBuilder.CreateBox("windowPane", { width: 0.86, height: 1.12, depth: 0.05 }, this.scene);
            windowPane.position.y = 1.5;
            windowPane.parent = this.openingRoot;

            if (this.openingType === "JendelaJalusi") {
                windowPane.material = frameMat;
                BABYLON.Tags.AddTagsTo(windowPane, "TraditionalWindow");
            } else {
                const glassMat = new BABYLON.StandardMaterial("winGlassMat", this.scene);
                glassMat.diffuseColor = new BABYLON.Color3(0.8, 0.92, 0.98);
                glassMat.alpha = 0.35;
                windowPane.material = glassMat;
                BABYLON.Tags.AddTagsTo(windowPane, "TraditionalWindow GlassWindow");
            }
        }
    }

    public undo(): void {
        if (this.openingRoot) {
            this.openingRoot.dispose();
            this.openingRoot = null;
        }
        this.targetWallSegment.setEnabled(true);
    }

    public serialize(): any {
        return {
            type: "PlaceOpening",
            wallId: this.targetWallSegment.id,
            openingType: this.openingType
        };
    }
}
