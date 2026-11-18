import * as BABYLON from "@babylonjs/core";
import { GridSnapSystem } from "./GridSnapSystem";
import { HistoryManager } from "../core/HistoryManager";
import { Command } from "../core/Command";

export interface StiltBounds {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
    stiltHeight: number;
}

export class StiltFoundationSystem {
    private scene: BABYLON.Scene;
    private grid: GridSnapSystem;
    private history: HistoryManager;

    private pillarTemplate: BABYLON.Mesh;
    private umpakTemplate: BABYLON.Mesh;
    private woodMat: BABYLON.StandardMaterial;
    private activeFoundations: StiltBounds[] = [];

    constructor(scene: BABYLON.Scene, grid: GridSnapSystem, history: HistoryManager) {
        this.scene = scene;
        this.grid = grid;
        this.history = history;

        this.woodMat = new BABYLON.StandardMaterial("stiltWoodMat", this.scene);
        this.woodMat.diffuseColor = new BABYLON.Color3(0.45, 0.28, 0.16);
        this.woodMat.specularColor = BABYLON.Color3.Black();

        const stoneMat = new BABYLON.StandardMaterial("umpakStoneMat", this.scene);
        stoneMat.diffuseColor = new BABYLON.Color3(0.42, 0.44, 0.45);
        stoneMat.specularColor = BABYLON.Color3.Black();

        this.pillarTemplate = BABYLON.MeshBuilder.CreateBox("pillarTpl", { width: 0.22, height: 1, depth: 0.22 }, this.scene);
        this.pillarTemplate.material = this.woodMat;
        this.pillarTemplate.isVisible = false;

        this.umpakTemplate = BABYLON.MeshBuilder.CreateBox("umpakTpl", { width: 0.34, height: 0.25, depth: 0.34 }, this.scene);
        this.umpakTemplate.material = stoneMat;
        this.umpakTemplate.isVisible = false;
    }

    public buildStiltPlatform(cornerA: BABYLON.Vector3, cornerB: BABYLON.Vector3, stiltHeight: number = 1.2) {
        const p1 = this.grid.snapPosition(cornerA);
        const p2 = this.grid.snapPosition(cornerB);

        const bounds: StiltBounds = {
            minX: Math.min(p1.x, p2.x),
            maxX: Math.max(p1.x, p2.x),
            minZ: Math.min(p1.z, p2.z),
            maxZ: Math.max(p1.z, p2.z),
            stiltHeight
        };

        if (bounds.maxX - bounds.minX < 1 || bounds.maxZ - bounds.minZ < 1) return;

        const cmd = new BuildStiltFoundationCommand(
            this.scene,
            bounds,
            this.pillarTemplate,
            this.umpakTemplate,
            this.woodMat,
            this.activeFoundations
        );
        this.history.executeCommand(cmd);
    }

    public getFloorElevationAt(pos: BABYLON.Vector3): number {
        for (const f of this.activeFoundations) {
            if (pos.x >= f.minX && pos.x <= f.maxX && pos.z >= f.minZ && pos.z <= f.maxZ) {
                return f.stiltHeight;
            }
        }
        return 0;
    }
}

class BuildStiltFoundationCommand implements Command {
    private scene: BABYLON.Scene;
    private bounds: StiltBounds;
    private pillarTpl: BABYLON.Mesh;
    private umpakTpl: BABYLON.Mesh;
    private woodMat: BABYLON.StandardMaterial;
    private registry: StiltBounds[];
    private createdMeshes: BABYLON.AbstractMesh[] = [];

    constructor(
        scene: BABYLON.Scene,
        bounds: StiltBounds,
        pillarTpl: BABYLON.Mesh,
        umpakTpl: BABYLON.Mesh,
        woodMat: BABYLON.StandardMaterial,
        registry: StiltBounds[]
    ) {
        this.scene = scene;
        this.bounds = bounds;
        this.pillarTpl = pillarTpl;
        this.umpakTpl = umpakTpl;
        this.woodMat = woodMat;
        this.registry = registry;
    }

    public execute(): void {
        const { minX, maxX, minZ, maxZ, stiltHeight } = this.bounds;
        const width = maxX - minX;
        const depth = maxZ - minZ;
        const centerX = (minX + maxX) / 2;
        const centerZ = (minZ + maxZ) / 2;

        const step = 2.0;
        for (let x = minX; x <= maxX; x += step) {
            for (let z = minZ; z <= maxZ; z += step) {
                const umpak = this.umpakTpl.createInstance(`umpak_${x}_${z}`);
                umpak.position = new BABYLON.Vector3(x, 0.125, z);

                const pillar = this.pillarTpl.createInstance(`pillar_${x}_${z}`);
                pillar.scaling.y = stiltHeight;
                pillar.position = new BABYLON.Vector3(x, stiltHeight / 2, z);

                BABYLON.Tags.AddTagsTo(pillar, "StiltFoundation");
                this.createdMeshes.push(umpak, pillar);
            }
        }

        const deck = BABYLON.MeshBuilder.CreateBox("stiltFloorDeck", {
            width: width + 0.2,
            height: 0.14,
            depth: depth + 0.2
        }, this.scene);
        deck.position = new BABYLON.Vector3(centerX, stiltHeight - 0.07, centerZ);
        deck.material = this.woodMat;
        BABYLON.Tags.AddTagsTo(deck, "StiltFloor");
        this.createdMeshes.push(deck);

        const stepsCount = Math.max(3, Math.round(stiltHeight / 0.25));
        for (let s = 0; s < stepsCount; s++) {
            const ratio = (s + 1) / stepsCount;
            const stairStep = BABYLON.MeshBuilder.CreateBox(`stair_${s}`, {
                width: 1.2,
                height: 0.08,
                depth: 0.28
            }, this.scene);
            stairStep.position = new BABYLON.Vector3(
                centerX,
                ratio * stiltHeight - 0.04,
                minZ - (1 - ratio) * 1.1 - 0.15
            );
            stairStep.material = this.woodMat;
            this.createdMeshes.push(stairStep);
        }

        this.registry.push(this.bounds);
    }

    public undo(): void {
        this.createdMeshes.forEach(m => m.dispose());
        this.createdMeshes = [];
        const idx = this.registry.indexOf(this.bounds);
        if (idx !== -1) this.registry.splice(idx, 1);
    }

    public serialize(): any {
        return { type: "BuildStiltFoundation", bounds: this.bounds };
    }
}
