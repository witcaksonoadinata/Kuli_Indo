import * as BABYLON from "@babylonjs/core";

export type MaterialCategory = "Plester" | "Tegel" | "Kayu" | "Anyaman";

export interface MaterialDef {
    id: string;
    name: string;
    category: MaterialCategory;
    baseHex: string;
    accentHex: string;
}

export const MaterialDatabase: MaterialDef[] = [
    { id: "mat_plester_kapur", name: "Plester Kapur Tradisional", category: "Plester", baseHex: "#D8C3A5", accentHex: "#C5AE8E" },
    { id: "mat_bata_ekspos", name: "Bata Merah Ekspos", category: "Plester", baseHex: "#B63B1C", accentHex: "#8C2B12" },
    { id: "mat_tegel_kunci", name: "Tegel Motif Kunci (Klasik)", category: "Tegel", baseHex: "#2E6F40", accentHex: "#E8DFC8" },
    { id: "mat_batu_candi", name: "Batu Alam Candi", category: "Tegel", baseHex: "#54585A", accentHex: "#3C4042" },
    { id: "mat_kayu_jati", name: "Papan Kayu Jati", category: "Kayu", baseHex: "#7A4424", accentHex: "#5C3016" },
    { id: "mat_anyaman_bambu", name: "Gedek (Anyaman Bambu)", category: "Anyaman", baseHex: "#C7A876", accentHex: "#9C7B49" }
];

export class MaterialManager {
    private scene: BABYLON.Scene;
    private loadedMaterials: Map<string, BABYLON.Material> = new Map();

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
    }

    public getOrCreateMaterial(matDef: MaterialDef): BABYLON.Material {
        if (this.loadedMaterials.has(matDef.id)) {
            return this.loadedMaterials.get(matDef.id)!;
        }

        const mat = new BABYLON.StandardMaterial(matDef.id, this.scene);
        mat.diffuseTexture = this.createProceduralPatternTexture(matDef);
        mat.specularColor = new BABYLON.Color3(0, 0, 0);

        this.loadedMaterials.set(matDef.id, mat);
        return mat;
    }

    private createProceduralPatternTexture(matDef: MaterialDef): BABYLON.DynamicTexture {
        const size = 256;
        const tex = new BABYLON.DynamicTexture(`tex_${matDef.id}`, size, this.scene, true);
        const ctx = tex.getContext() as CanvasRenderingContext2D;

        ctx.fillStyle = matDef.baseHex;
        ctx.fillRect(0, 0, size, size);
        ctx.strokeStyle = matDef.accentHex;
        ctx.fillStyle = matDef.accentHex;

        if (matDef.id === "mat_anyaman_bambu") {
            const step = 32;
            for (let y = 0; y < size; y += step) {
                for (let x = 0; x < size; x += step) {
                    if (((x + y) / step) % 2 === 0) {
                        ctx.fillRect(x + 2, y + 2, step - 4, step / 2 - 2);
                    } else {
                        ctx.fillRect(x + 2, y + 2, step / 2 - 2, step - 4);
                    }
                }
            }
        } else if (matDef.id === "mat_bata_ekspos") {
            const rowH = 32;
            const brickW = 64;
            ctx.lineWidth = 4;
            for (let row = 0; row < size / rowH; row++) {
                const y = row * rowH;
                const offset = (row % 2) * (brickW / 2);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(size, y);
                ctx.stroke();
                for (let x = -offset; x < size; x += brickW) {
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(x, y + rowH);
                    ctx.stroke();
                }
            }
        } else if (matDef.id === "mat_tegel_kunci") {
            ctx.lineWidth = 6;
            ctx.strokeRect(12, 12, size - 24, size - 24);
            ctx.beginPath();
            ctx.arc(size / 2, size / 2, 54, 0, Math.PI * 2);
            ctx.stroke();
        } else if (matDef.id === "mat_kayu_jati") {
            ctx.lineWidth = 3;
            for (let x = 0; x < size; x += 42) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, size);
                ctx.stroke();
            }
        }

        tex.update();
        return tex;
    }
}
