import * as BABYLON from "@babylonjs/core";
import { GridSnapSystem } from "./GridSnapSystem";
import { HistoryManager } from "../core/HistoryManager";
import { BuildWallCommand } from "./commands/BuildWallCommand";

export class WallBuilderSystem {
    private scene: BABYLON.Scene;
    private grid: GridSnapSystem;
    private history: HistoryManager;

    private brickTemplate: BABYLON.Mesh;
    private startPoint: BABYLON.Vector3 | null = null;
    private previewLine: BABYLON.LinesMesh | null = null;

    constructor(scene: BABYLON.Scene, grid: GridSnapSystem, history: HistoryManager) {
        this.scene = scene;
        this.grid = grid;
        this.history = history;
        this.createBrickTemplate();
    }

    private createBrickTemplate() {
        this.brickTemplate = BABYLON.MeshBuilder.CreateBox("brickTemplate", {
            width: 1,
            height: 3,
            depth: 0.2
        }, this.scene);

        const wallMat = new BABYLON.StandardMaterial("defaultBilikMat", this.scene);
        wallMat.diffuseColor = new BABYLON.Color3(0.78, 0.66, 0.45);
        wallMat.specularColor = BABYLON.Color3.Black();
        this.brickTemplate.material = wallMat;
        this.brickTemplate.isVisible = false;
    }

    public startBuilding(point: BABYLON.Vector3) {
        this.startPoint = this.grid.snapPosition(point);
    }

    public updatePreview(currentPoint: BABYLON.Vector3) {
        if (!this.startPoint) return;
        const endPoint = this.grid.snapPosition(currentPoint);

        if (this.previewLine) this.previewLine.dispose();

        this.previewLine = BABYLON.MeshBuilder.CreateLines("previewWall", {
            points: [
                this.startPoint.add(new BABYLON.Vector3(0, 0.05, 0)),
                endPoint.add(new BABYLON.Vector3(0, 0.05, 0))
            ]
        }, this.scene);
        this.previewLine.color = BABYLON.Color3.Yellow();
    }

    public commitBuilding(endPoint: BABYLON.Vector3) {
        if (!this.startPoint) return;
        const snappedEnd = this.grid.snapPosition(endPoint);

        const command = new BuildWallCommand(this.scene, this.brickTemplate, this.startPoint, snappedEnd);
        this.history.executeCommand(command);

        this.startPoint = null;
        if (this.previewLine) {
            this.previewLine.dispose();
            this.previewLine = null;
        }
    }
}
