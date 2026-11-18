import * as BABYLON from "@babylonjs/core";

export class ParcelSystem {
    private scene: BABYLON.Scene;
    public readonly width: number;
    public readonly depth: number;
    public readonly groundMesh: BABYLON.Mesh;
    private borderLines: BABYLON.LinesMesh;

    constructor(scene: BABYLON.Scene, width: number = 32, depth: number = 32) {
        this.scene = scene;
        this.width = width;
        this.depth = depth;

        this.groundMesh = BABYLON.MeshBuilder.CreateGround(
            "parcelGround",
            { width: this.width, height: this.depth, subdivisions: 32 },
            this.scene
        );
        this.groundMesh.receiveShadows = false;

        const halfW = this.width / 2;
        const halfD = this.depth / 2;
        const borderPoints = [
            new BABYLON.Vector3(-halfW, 0.03, -halfD),
            new BABYLON.Vector3(halfW, 0.03, -halfD),
            new BABYLON.Vector3(halfW, 0.03, halfD),
            new BABYLON.Vector3(-halfW, 0.03, halfD),
            new BABYLON.Vector3(-halfW, 0.03, -halfD)
        ];

        this.borderLines = BABYLON.MeshBuilder.CreateLines("parcelBorder", { points: borderPoints }, this.scene);
        this.borderLines.color = new BABYLON.Color3(0.95, 0.85, 0.35);
    }

    public isPositionInside(position: BABYLON.Vector3): boolean {
        const halfW = this.width / 2;
        const halfD = this.depth / 2;
        return (
            position.x >= -halfW &&
            position.x <= halfW &&
            position.z >= -halfD &&
            position.z <= halfD
        );
    }
}
