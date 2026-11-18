import * as BABYLON from "@babylonjs/core";
import { HistoryManager } from "../core/HistoryManager";
import { Command } from "../core/Command";

export type RoofStyle = "PelanaGentengMerah" | "LimasanGentengMerah";

export interface RoofConfig {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    baseElevationY: number;
    pitchDegrees: number;
    style: RoofStyle;
}

export class TraditionalRoofSystem {
    private scene: BABYLON.Scene;
    private history: HistoryManager;

    constructor(scene: BABYLON.Scene, history: HistoryManager) {
        this.scene = scene;
        this.history = history;
    }

    public buildRoof(config: RoofConfig) {
        const cmd = new BuildRoofCommand(this.scene, config);
        this.history.executeCommand(cmd);
    }
}

class BuildRoofCommand implements Command {
    private scene: BABYLON.Scene;
    private config: RoofConfig;
    private roofRoot: BABYLON.TransformNode | null = null;

    constructor(scene: BABYLON.Scene, config: RoofConfig) {
        this.scene = scene;
        this.config = config;
    }

    public execute(): void {
        const { minX, maxX, minZ, maxZ, baseElevationY, pitchDegrees, style } = this.config;
        const overhang = 0.65;

        const width = (maxX - minX) + overhang * 2;
        const depth = (maxZ - minZ) + overhang * 2;
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        const pitchRad = BABYLON.Tools.ToRadians(pitchDegrees);
        const halfSpan = depth / 2;
        const ridgeHeight = Math.tan(pitchRad) * halfSpan;
        const slopeLength = halfSpan / Math.cos(pitchRad);

        this.roofRoot = new BABYLON.TransformNode(`roof_${style}_${Date.now()}`, this.scene);
        this.roofRoot.position = new BABYLON.Vector3(centerX, baseElevationY, centerZ);

        const redTileMat = new BABYLON.StandardMaterial("redClayTileMat", this.scene);
        redTileMat.diffuseColor = new BABYLON.Color3(0.71, 0.23, 0.11);
        redTileMat.specularColor = BABYLON.Color3.Black();

        const ridgeMat = new BABYLON.StandardMaterial("ridgeCapMat", this.scene);
        ridgeMat.diffuseColor = new BABYLON.Color3(0.62, 0.18, 0.09);
        ridgeMat.specularColor = BABYLON.Color3.Black();

        const frontSlope = BABYLON.MeshBuilder.CreateBox("roofFrontSlope", {
            width,
            height: 0.12,
            depth: slopeLength
        }, this.scene);
        frontSlope.position = new BABYLON.Vector3(0, ridgeHeight / 2, halfSpan / 2);
        frontSlope.rotation.x = pitchRad;
        frontSlope.material = redTileMat;
        frontSlope.parent = this.roofRoot;

        const backSlope = BABYLON.MeshBuilder.CreateBox("roofBackSlope", {
            width,
            height: 0.12,
            depth: slopeLength
        }, this.scene);
        backSlope.position = new BABYLON.Vector3(0, ridgeHeight / 2, -halfSpan / 2);
        backSlope.rotation.x = -pitchRad;
        backSlope.material = redTileMat;
        backSlope.parent = this.roofRoot;

        const ridgeLength = style === "LimasanGentengMerah" ? Math.max(1.2, width * 0.55) : width + 0.1;
        const ridgeCap = BABYLON.MeshBuilder.CreateCylinder("roofRidgeCap", {
            height: ridgeLength,
            diameter: 0.26,
            tessellation: 8
        }, this.scene);
        ridgeCap.rotation.z = Math.PI / 2;
        ridgeCap.position = new BABYLON.Vector3(0, ridgeHeight + 0.06, 0);
        ridgeCap.material = ridgeMat;
        ridgeCap.parent = this.roofRoot;

        if (style === "PelanaGentengMerah") {
            const gableMat = new BABYLON.StandardMaterial("gableBambooMat", this.scene);
            gableMat.diffuseColor = new BABYLON.Color3(0.74, 0.61, 0.39);
            gableMat.specularColor = BABYLON.Color3.Black();

            [-1, 1].forEach(side => {
                const gable = BABYLON.MeshBuilder.CreateCylinder(`gable_${side}`, {
                    diameterTop: 0,
                    diameterBottom: depth - overhang * 1.5,
                    height: ridgeHeight,
                    tessellation: 4
                }, this.scene);
                gable.scaling.x = 0.08;
                gable.rotation.y = Math.PI / 4;
                gable.position = new BABYLON.Vector3(side * ((maxX - minX) / 2), ridgeHeight / 2, 0);
                gable.material = gableMat;
                gable.parent = this.roofRoot;
            });
        }
    }

    public undo(): void {
        if (this.roofRoot) {
            this.roofRoot.dispose();
            this.roofRoot = null;
        }
    }

    public serialize(): any {
        return { type: "BuildRoof", config: this.config };
    }
}
