import * as BABYLON from "@babylonjs/core";

export class TropicalBillboardFoliage {
    private scene: BABYLON.Scene;
    private grassCardTemplate: BABYLON.Mesh;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;
        this.grassCardTemplate = this.createCurvedGrassCardTemplate();
    }

    private createCurvedGrassCardTemplate(): BABYLON.Mesh {
        const planeA = BABYLON.MeshBuilder.CreatePlane("grassBladeA", { width: 0.7, height: 0.55 }, this.scene);
        const planeB = BABYLON.MeshBuilder.CreatePlane("grassBladeB", { width: 0.7, height: 0.55 }, this.scene);
        planeB.rotation.y = Math.PI / 2;

        const merged = BABYLON.Mesh.MergeMeshes([planeA, planeB], true, true, undefined, false, false)!;
        merged.name = "grassCardTemplate";

        const grassCardMat = new BABYLON.StandardMaterial("grassCardMat", this.scene);
        const grassTex = this.createProceduralGrassBladeTexture();
        grassCardMat.diffuseTexture = grassTex;
        grassCardMat.useAlphaFromDiffuseTexture = true;
        grassCardMat.specularColor = BABYLON.Color3.Black();
        grassCardMat.backFaceCulling = false;

        merged.material = grassCardMat;
        merged.isVisible = false;
        return merged;
    }

    private createProceduralGrassBladeTexture(): BABYLON.DynamicTexture {
        const size = 128;
        const tex = new BABYLON.DynamicTexture("procGrassBlade", size, this.scene, true);
        tex.hasAlpha = true;
        const ctx = tex.getContext() as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, size, size);

        const bladeColors = ["#5DA43C", "#7FB77E", "#88B04B"];
        for (let i = 0; i < 9; i++) {
            const baseX = 16 + i * 12;
            const tipX = baseX + (i - 4) * 5;
            const tipY = 18 + (i % 3) * 14;
            ctx.fillStyle = bladeColors[i % bladeColors.length];
            ctx.beginPath();
            ctx.moveTo(baseX - 4, size);
            ctx.lineTo(tipX, tipY);
            ctx.lineTo(baseX + 4, size);
            ctx.closePath();
            ctx.fill();
        }

        tex.update();
        return tex;
    }

    public scatterGrassField(center: BABYLON.Vector3, radius: number, count: number) {
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const r = Math.sqrt(Math.random()) * radius;
            const x = center.x + Math.cos(angle) * r;
            const z = center.z + Math.sin(angle) * r;

            // Sisakan area kolong rumah panggung agar rumput tidak menembus lantai
            if (Math.abs(x) < 4.5 && Math.abs(z) < 3.5) continue;

            const card = this.grassCardTemplate.createInstance(`grassCard_${i}`);
            card.position = new BABYLON.Vector3(x, 0.25, z);
            card.rotation.y = Math.random() * Math.PI;
            card.scaling.setAll(0.8 + Math.random() * 0.45);
        }
    }
}
