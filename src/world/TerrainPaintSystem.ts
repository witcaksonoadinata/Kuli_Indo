import * as BABYLON from "@babylonjs/core";
import { Command } from "../core/Command";
import { HistoryManager } from "../core/HistoryManager";

export type TerrainLayerType = "RumputTropis" | "TanahMerah" | "PasirPesisir" | "LumpurSawah" | "BatuSetapak";

const LAYER_COLORS: Record<TerrainLayerType, string> = {
    RumputTropis: "#4a7c36",
    TanahMerah: "#8c4a32",
    PasirPesisir: "#d9c598",
    LumpurSawah: "#544332",
    BatuSetapak: "#7d7f82"
};

export class TerrainPaintSystem {
    private groundMesh: BABYLON.Mesh;
    private history: HistoryManager;
    private dynamicTexture: BABYLON.DynamicTexture;
    private ctx: CanvasRenderingContext2D;
    private texSize: number = 1024;

    public activeLayer: TerrainLayerType = "TanahMerah";
    public brushRadius: number = 32;
    private beforeStrokeSnapshot: ImageData | null = null;

    constructor(scene: BABYLON.Scene, groundMesh: BABYLON.Mesh, history: HistoryManager) {
        this.groundMesh = groundMesh;
        this.history = history;

        this.dynamicTexture = new BABYLON.DynamicTexture("terrainTex", this.texSize, scene, true);
        this.ctx = this.dynamicTexture.getContext() as CanvasRenderingContext2D;

        this.ctx.fillStyle = LAYER_COLORS.RumputTropis;
        this.ctx.fillRect(0, 0, this.texSize, this.texSize);
        this.dynamicTexture.update();

        const groundMat = new BABYLON.StandardMaterial("terrainMat", scene);
        groundMat.diffuseTexture = this.dynamicTexture;
        groundMat.specularColor = BABYLON.Color3.Black();
        this.groundMesh.material = groundMat;
    }

    public beginStroke() {
        this.beforeStrokeSnapshot = this.ctx.getImageData(0, 0, this.texSize, this.texSize);
    }

    public paintAtUV(uv: BABYLON.Vector2) {
        const px = uv.x * this.texSize;
        const py = (1 - uv.y) * this.texSize;

        const gradient = this.ctx.createRadialGradient(px, py, this.brushRadius * 0.2, px, py, this.brushRadius);
        gradient.addColorStop(0, LAYER_COLORS[this.activeLayer]);
        gradient.addColorStop(1, "rgba(0,0,0,0)");

        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(px, py, this.brushRadius, 0, Math.PI * 2);
        this.ctx.fill();

        this.dynamicTexture.update();
    }

    public endStroke() {
        if (!this.beforeStrokeSnapshot) return;
        const afterSnapshot = this.ctx.getImageData(0, 0, this.texSize, this.texSize);

        const command = new PaintTerrainCommand(
            this.ctx,
            this.dynamicTexture,
            this.beforeStrokeSnapshot,
            afterSnapshot
        );
        this.history.executeCommand(command);
        this.beforeStrokeSnapshot = null;
    }
}

class PaintTerrainCommand implements Command {
    private ctx: CanvasRenderingContext2D;
    private texture: BABYLON.DynamicTexture;
    private before: ImageData;
    private after: ImageData;

    constructor(ctx: CanvasRenderingContext2D, texture: BABYLON.DynamicTexture, before: ImageData, after: ImageData) {
        this.ctx = ctx;
        this.texture = texture;
        this.before = before;
        this.after = after;
    }

    public execute(): void {
        this.ctx.putImageData(this.after, 0, 0);
        this.texture.update();
    }

    public undo(): void {
        this.ctx.putImageData(this.before, 0, 0);
        this.texture.update();
    }

    public serialize(): any {
        return { type: "PaintTerrain", timestamp: Date.now() };
    }
}
