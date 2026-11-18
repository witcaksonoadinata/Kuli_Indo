import * as BABYLON from "@babylonjs/core";
import { PainterTapeSystem } from "./PainterTapeSystem";
import { HistoryManager } from "../core/HistoryManager";
import { Command } from "../core/Command";

export class SurfaceFinisherTool {
    private scene: BABYLON.Scene;
    private tapeSystem: PainterTapeSystem;
    private history: HistoryManager;

    public selectedMaterial: BABYLON.Material | null = null;

    constructor(scene: BABYLON.Scene, tapeSystem: PainterTapeSystem, history: HistoryManager) {
        this.scene = scene;
        this.tapeSystem = tapeSystem;
        this.history = history;
    }

    public applyFinish(targetMesh: BABYLON.AbstractMesh, bounds: BABYLON.BoundingBox) {
        if (!this.selectedMaterial) return;

        const center = bounds.center;
        const size = bounds.maximum.subtract(bounds.minimum);

        const command = new ApplyPaintCommand(
            this.scene,
            targetMesh,
            this.selectedMaterial,
            center,
            size
        );
        this.history.executeCommand(command);
    }
}

class ApplyPaintCommand implements Command {
    private scene: BABYLON.Scene;
    private targetWall: BABYLON.AbstractMesh;
    private paintMaterial: BABYLON.Material;
    private centerPosition: BABYLON.Vector3;
    private paintSize: BABYLON.Vector3;
    private appliedDecal: BABYLON.Mesh | null = null;

    constructor(scene: BABYLON.Scene, wall: BABYLON.AbstractMesh, mat: BABYLON.Material, center: BABYLON.Vector3, size: BABYLON.Vector3) {
        this.scene = scene;
        this.targetWall = wall;
        this.paintMaterial = mat;
        this.centerPosition = center.clone();
        this.paintSize = new BABYLON.Vector3(
            Math.max(0.25, Math.abs(size.x)),
            Math.max(0.25, Math.abs(size.y)),
            Math.max(0.25, Math.abs(size.z))
        );
    }

    public execute(): void {
        this.appliedDecal = BABYLON.MeshBuilder.CreateDecal("paintPatch", this.targetWall, {
            position: this.centerPosition,
            normal: new BABYLON.Vector3(0, 0, -1),
            size: this.paintSize
        });
        this.appliedDecal.material = this.paintMaterial;
        this.appliedDecal.position.z -= 0.002;
    }

    public undo(): void {
        if (this.appliedDecal) {
            this.appliedDecal.dispose();
            this.appliedDecal = null;
        }
    }

    public serialize(): any {
        return {
            type: "ApplyPaint",
            wallId: this.targetWall.id
        };
    }
}
