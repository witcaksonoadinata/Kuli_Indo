import * as BABYLON from "@babylonjs/core";
import { GridSnapSystem } from "../construction/GridSnapSystem";

export type TransformToolMode = "Move" | "Rotate" | "Resize" | "Architect" | "Flipper" | string;

export class TransformController {
    private scene: BABYLON.Scene;
    private gizmoManager: BABYLON.GizmoManager;
    private gridSnap: GridSnapSystem;

    constructor(scene: BABYLON.Scene, gridSnap: GridSnapSystem) {
        this.scene = scene;
        this.gridSnap = gridSnap;

        this.gizmoManager = new BABYLON.GizmoManager(scene);
        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;
        this.gizmoManager.boundingBoxGizmoEnabled = false;
        this.gizmoManager.usePointerToAttach = true;

        this.setupSnapping();
    }

    private setupSnapping() {
        if (this.gizmoManager.gizmos.positionGizmo) {
            this.gizmoManager.gizmos.positionGizmo.snapDistance = this.gridSnap.gridSize;
            this.scene.onBeforeRenderObservable.add(() => {
                if (this.gizmoManager.gizmos.positionGizmo) {
                    this.gizmoManager.gizmos.positionGizmo.snapDistance = this.gridSnap.useSnap ? this.gridSnap.gridSize : 0;
                }
            });
        }
    }

    public setMode(mode: TransformToolMode) {
        this.gizmoManager.positionGizmoEnabled = false;
        this.gizmoManager.rotationGizmoEnabled = false;
        this.gizmoManager.scaleGizmoEnabled = false;

        switch (mode) {
            case "Move":
                this.gizmoManager.positionGizmoEnabled = true;
                break;
            case "Rotate":
                this.gizmoManager.rotationGizmoEnabled = true;
                break;
            case "Resize":
                this.gizmoManager.scaleGizmoEnabled = true;
                break;
            default:
                this.gizmoManager.attachToMesh(null);
                break;
        }
    }

    public applyMaterial(targetMesh: BABYLON.AbstractMesh, sourceMaterial: BABYLON.Material) {
        targetMesh.material = sourceMaterial;
    }
}
