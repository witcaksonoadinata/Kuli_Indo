import * as BABYLON from "@babylonjs/core";
import { EthnicFurnitureDatabase, EthnicFurnitureDef } from "../data/catalogs/EthnicFurnitureCatalog";
import { GridSnapSystem } from "../construction/GridSnapSystem";
import { StiltFoundationSystem } from "../construction/StiltFoundationSystem";
import { HistoryManager } from "../core/HistoryManager";
import { Command } from "../core/Command";
import { QuestRuntime } from "../quests/QuestRuntime";
import { PlumbingNodeComponent } from "../plumbing/InWallPlumbingSystem";

export class FurniturePlacementSystem {
    private scene: BABYLON.Scene;
    private grid: GridSnapSystem;
    private stiltSystem: StiltFoundationSystem;
    private history: HistoryManager;
    private questRuntime: QuestRuntime;

    public selectedFurniture: EthnicFurnitureDef | null = null;
    public currentRotationY: number = 0;

    constructor(
        scene: BABYLON.Scene,
        grid: GridSnapSystem,
        stiltSystem: StiltFoundationSystem,
        history: HistoryManager,
        questRuntime: QuestRuntime
    ) {
        this.scene = scene;
        this.grid = grid;
        this.stiltSystem = stiltSystem;
        this.history = history;
        this.questRuntime = questRuntime;
    }

    public selectFurnitureById(id: string) {
        this.selectedFurniture = EthnicFurnitureDatabase.find(f => f.id === id) || null;
    }

    public rotatePreview(stepRadians: number = Math.PI / 4) {
        this.currentRotationY = (this.currentRotationY + stepRadians) % (Math.PI * 2);
    }

    public placeAt(rawPoint: BABYLON.Vector3, roomId: string = "ANY") {
        if (!this.selectedFurniture) return;

        const snapped = this.grid.snapPosition(rawPoint);
        const floorY = this.stiltSystem.getFloorElevationAt(snapped);
        const finalPos = new BABYLON.Vector3(snapped.x, floorY, snapped.z);

        const cmd = new PlaceFurnitureCommand(
            this.scene,
            this.selectedFurniture,
            finalPos,
            this.currentRotationY,
            roomId,
            this.questRuntime
        );
        this.history.executeCommand(cmd);
    }
}

class PlaceFurnitureCommand implements Command {
    private scene: BABYLON.Scene;
    private def: EthnicFurnitureDef;
    private position: BABYLON.Vector3;
    private rotationY: number;
    private roomId: string;
    private questRuntime: QuestRuntime;
    private rootNode: BABYLON.TransformNode | null = null;

    constructor(
        scene: BABYLON.Scene,
        def: EthnicFurnitureDef,
        position: BABYLON.Vector3,
        rotationY: number,
        roomId: string,
        questRuntime: QuestRuntime
    ) {
        this.scene = scene;
        this.def = def;
        this.position = position.clone();
        this.rotationY = rotationY;
        this.roomId = roomId;
        this.questRuntime = questRuntime;
    }

    public execute(): void {
        this.rootNode = new BABYLON.TransformNode(`furn_${this.def.id}_${Date.now()}`, this.scene);
        this.rootNode.position = this.position.clone();
        this.rootNode.rotation.y = this.rotationY;

        const mainMesh = this.buildStylizedEthnicMesh(this.def, this.rootNode);
        BABYLON.Tags.AddTagsTo(mainMesh, `EthnicFurniture ${this.def.id}`);

        if (this.def.plumbingRole !== "None") {
            const waterIndicator = mainMesh.getChildMeshes().find(m => m.name === "waterFillSurface") as BABYLON.Mesh | undefined;
            const plumbNode = new PlumbingNodeComponent(
                `plumb_${this.def.id}_${Date.now()}`,
                this.def.plumbingRole,
                mainMesh
            );

            plumbNode.onWaterStateChanged = (hasWater) => {
                if (waterIndicator) {
                    waterIndicator.isVisible = hasWater;
                }
            };
        }

        this.questRuntime.recordAction("PlaceItem", this.roomId, this.def.id, 1, this.def.price);
    }

    private buildStylizedEthnicMesh(def: EthnicFurnitureDef, parent: BABYLON.TransformNode): BABYLON.Mesh {
        const primaryMat = new BABYLON.StandardMaterial(`mat_${def.id}_${Date.now()}`, this.scene);
        primaryMat.diffuseColor = BABYLON.Color3.FromHexString(def.hexColor);
        primaryMat.specularColor = BABYLON.Color3.Black();

        const accentMat = new BABYLON.StandardMaterial(`accent_${def.id}_${Date.now()}`, this.scene);
        accentMat.diffuseColor = BABYLON.Color3.FromHexString(def.accentHexColor || "#D7CCC8");
        accentMat.specularColor = BABYLON.Color3.Black();

        const { width, height, depth } = def.dimensions;

        if (def.id === "item_amben_jati") {
            const topBoard = BABYLON.MeshBuilder.CreateBox("ambenTop", { width, height: 0.1, depth }, this.scene);
            topBoard.position.y = height - 0.05;
            topBoard.material = primaryMat;
            topBoard.parent = parent;

            const matOverlay = BABYLON.MeshBuilder.CreateBox("ambenMat", { width: width * 0.75, height: 0.02, depth: depth * 0.85 }, this.scene);
            matOverlay.position.y = height + 0.01;
            matOverlay.material = accentMat;
            matOverlay.parent = parent;

            const legOffsets = [
                [-width / 2 + 0.1, -depth / 2 + 0.1],
                [width / 2 - 0.1, -depth / 2 + 0.1],
                [-width / 2 + 0.1, depth / 2 - 0.1],
                [width / 2 - 0.1, depth / 2 - 0.1]
            ];
            legOffsets.forEach(([lx, lz], i) => {
                const leg = BABYLON.MeshBuilder.CreateBox(`ambenLeg_${i}`, { width: 0.12, height: height - 0.1, depth: 0.12 }, this.scene);
                leg.position = new BABYLON.Vector3(lx, (height - 0.1) / 2, lz);
                leg.material = primaryMat;
                leg.parent = parent;
            });

            return topBoard;
        }

        if (def.id === "item_gentong_air") {
            const jarBody = BABYLON.MeshBuilder.CreateCylinder("gentongBody", {
                height,
                diameterTop: width * 0.75,
                diameterBottom: width * 0.65,
                tessellation: 14
            }, this.scene);
            jarBody.position.y = height / 2;
            jarBody.material = primaryMat;
            jarBody.parent = parent;

            const waterSurface = BABYLON.MeshBuilder.CreateDisc("waterFillSurface", { radius: width * 0.34, tessellation: 14 }, this.scene);
            waterSurface.rotation.x = Math.PI / 2;
            waterSurface.position.y = height - 0.06;
            waterSurface.material = accentMat;
            waterSurface.isVisible = false;
            waterSurface.parent = jarBody;

            return jarBody;
        }

        if (def.id === "item_bak_mandi_batu") {
            const tubShell = BABYLON.MeshBuilder.CreateBox("bakMandiShell", { width, height, depth }, this.scene);
            tubShell.position.y = height / 2;
            tubShell.material = primaryMat;
            tubShell.parent = parent;

            const waterSurface = BABYLON.MeshBuilder.CreateGround("waterFillSurface", {
                width: width - 0.16,
                height: depth - 0.16
            }, this.scene);
            waterSurface.position.y = height / 2 - 0.05;
            waterSurface.material = accentMat;
            waterSurface.isVisible = false;
            waterSurface.parent = tubShell;

            return tubShell;
        }

        if (def.id === "item_sumur_timba") {
            const wellRing = BABYLON.MeshBuilder.CreateCylinder("sumurRing", {
                height: 0.85,
                diameter: width,
                tessellation: 16
            }, this.scene);
            wellRing.position.y = 0.425;
            wellRing.material = primaryMat;
            wellRing.parent = parent;

            [-width * 0.45, width * 0.45].forEach((px, idx) => {
                const post = BABYLON.MeshBuilder.CreateBox(`sumurPost_${idx}`, { width: 0.1, height: height, depth: 0.1 }, this.scene);
                post.position = new BABYLON.Vector3(px, height / 2, 0);
                post.material = accentMat;
                post.parent = parent;
            });

            const crossBeam = BABYLON.MeshBuilder.CreateBox("sumurBeam", { width: width + 0.1, height: 0.1, depth: 0.1 }, this.scene);
            crossBeam.position.y = height - 0.08;
            crossBeam.material = accentMat;
            crossBeam.parent = parent;

            return wellRing;
        }

        const genericBox = BABYLON.MeshBuilder.CreateBox(def.id, { width, height, depth }, this.scene);
        genericBox.position.y = height / 2;
        genericBox.material = primaryMat;
        genericBox.parent = parent;
        return genericBox;
    }

    public undo(): void {
        if (this.rootNode) {
            this.rootNode.dispose();
            this.rootNode = null;
        }
    }

    public serialize(): any {
        return {
            type: "PlaceFurniture",
            furnitureId: this.def.id,
            position: { x: this.position.x, y: this.position.y, z: this.position.z },
            rotationY: this.rotationY
        };
    }
}
