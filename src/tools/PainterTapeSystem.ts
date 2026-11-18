import * as BABYLON from "@babylonjs/core";
import { GridSnapSystem } from "../construction/GridSnapSystem";

export class PainterTapeSystem {
    private scene: BABYLON.Scene;
    private grid: GridSnapSystem;

    public startPoint: BABYLON.Vector3 | null = null;
    public targetWall: BABYLON.AbstractMesh | null = null;
    private tapeVisual: BABYLON.LinesMesh | null = null;

    constructor(scene: BABYLON.Scene, grid: GridSnapSystem) {
        this.scene = scene;
        this.grid = grid;
    }

    public startTape(hitPoint: BABYLON.Vector3, mesh: BABYLON.AbstractMesh) {
        if (!BABYLON.Tags.MatchesQuery(mesh, "WallSegment")) return;
        this.targetWall = mesh;
        this.startPoint = hitPoint.clone();
    }

    public updateTapePreview(currentHitPoint: BABYLON.Vector3) {
        if (!this.startPoint || !this.targetWall) return;
        this.drawTapeBox(this.startPoint, currentHitPoint);
    }

    private drawTapeBox(p1: BABYLON.Vector3, p2: BABYLON.Vector3) {
        if (this.tapeVisual) this.tapeVisual.dispose();

        const points = [
            new BABYLON.Vector3(p1.x, p1.y, p1.z - 0.01),
            new BABYLON.Vector3(p2.x, p1.y, p2.z - 0.01),
            new BABYLON.Vector3(p2.x, p2.y, p2.z - 0.01),
            new BABYLON.Vector3(p1.x, p2.y, p1.z - 0.01),
            new BABYLON.Vector3(p1.x, p1.y, p1.z - 0.01)
        ];

        this.tapeVisual = BABYLON.MeshBuilder.CreateLines("painterTape", { points }, this.scene);
        this.tapeVisual.color = BABYLON.Color3.Yellow();
    }

    public finishTape(endHitPoint: BABYLON.Vector3): BABYLON.BoundingBox | null {
        if (!this.startPoint || !this.targetWall) return null;

        const bounds = new BABYLON.BoundingBox(this.startPoint, endHitPoint);
        if (this.tapeVisual) {
            this.tapeVisual.dispose();
            this.tapeVisual = null;
        }
        this.reset();
        return bounds;
    }

    private reset() {
        this.startPoint = null;
        this.targetWall = null;
    }
}
