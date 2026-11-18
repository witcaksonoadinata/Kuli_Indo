import * as BABYLON from "@babylonjs/core";

export class GridSnapSystem {
    public gridSize: number;
    public useSnap: boolean;

    constructor(gridSize: number = 1.0, useSnap: boolean = true) {
        this.gridSize = gridSize;
        this.useSnap = useSnap;
    }

    public snapPosition(pos: BABYLON.Vector3): BABYLON.Vector3 {
        if (!this.useSnap || this.gridSize <= 0) {
            return pos.clone();
        }
        return new BABYLON.Vector3(
            Math.round(pos.x / this.gridSize) * this.gridSize,
            pos.y,
            Math.round(pos.z / this.gridSize) * this.gridSize
        );
    }
}
