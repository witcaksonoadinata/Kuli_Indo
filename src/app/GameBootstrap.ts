import * as BABYLON from "@babylonjs/core";

import { GridSnapSystem } from "../construction/GridSnapSystem";
import { ParcelSystem } from "../world/ParcelSystem";
import { TransformController } from "../objects/TransformController";
import { HistoryManager } from "../core/HistoryManager";
import { SaveSystem } from "../world/SaveSystem";

import { WallBuilderSystem } from "../construction/WallBuilderSystem";
import { DemolitionTool } from "../tools/DemolitionTool";
import { StiltFoundationSystem } from "../construction/StiltFoundationSystem";
import { DoorWindowSnapSystem, OpeningType } from "../construction/DoorWindowSnapSystem";
import { TraditionalRoofSystem, RoofStyle } from "../construction/TraditionalRoofSystem";

import { EnvironmentTimeSystem, TimePreset } from "../world/EnvironmentTimeSystem";
import { TerrainPaintSystem, TerrainLayerType } from "../world/TerrainPaintSystem";
import { TropicalFoliageSystem, FoliageType } from "../world/TropicalFoliageSystem";

import { PainterTapeSystem } from "../tools/PainterTapeSystem";
import { SurfaceFinisherTool } from "../tools/SurfaceFinisherTool";
import { MaterialDatabase, MaterialManager } from "../data/catalogs/LocalMaterialCatalog";
import { TrashBagTool } from "../cleaning/TrashBagSystem";
import { StainCleanerTool, StainSpotComponent } from "../cleaning/StainCleanerSystem";
import { WindowSqueegeeTool, DirtyWindowComponent } from "../cleaning/WindowSqueegeeSystem";

import { WiringTool } from "../tools/WiringTool";
import { ElectricalNodeComponent } from "../wiring/ElectricalNodeComponent";
import { InWallPlumbingTool } from "../plumbing/InWallPlumbingSystem";
import { FurniturePlacementSystem } from "../objects/FurniturePlacementSystem";
import { QuestRuntime } from "../quests/QuestRuntime";
import { LocalJobData } from "../quests/QuestModel";

import { CelToonMaterialManager, LOCAL_TOON_PALETTE } from "../rendering/CelToonMaterial";
import { VisualPolishPipeline } from "../rendering/VisualPolishPipeline";
import { TropicalBillboardFoliage } from "../rendering/TropicalBillboardFoliage";

export type UnifiedToolMode =
    | "Move"
    | "Rotate"
    | "Resize"
    | "StiltFoundation"
    | "BuildWall"
    | "PlaceOpening"
    | "Demolish"
    | "Painter"
    | "TrashBag"
    | "CleanStain"
    | "Squeegee"
    | "Wiring"
    | "Plumbing"
    | "PlaceFurniture"
    | "PaintTerrain"
    | "PlaceFoliage"
    | "TrimGrass";

export interface UnifiedEditorSnapshot {
    activeTool: UnifiedToolMode;
    snapEnabled: boolean;
    activeTimePreset: TimePreset;
    activeJob: LocalJobData | null;
    remainingBudget: number;
    statusMessage: string;
}

export class GameBootstrap {
    public readonly engine: BABYLON.Engine;
    public readonly scene: BABYLON.Scene;
    public readonly camera: BABYLON.UniversalCamera;

    public readonly gridSnap: GridSnapSystem;
    public readonly parcelSystem: ParcelSystem;
    public readonly history: HistoryManager;
    public readonly saveSystem: SaveSystem;
    public readonly transformController: TransformController;

    public readonly stiltSystem: StiltFoundationSystem;
    public readonly wallBuilder: WallBuilderSystem;
    public readonly demolitionTool: DemolitionTool;
    public readonly doorWindowSystem: DoorWindowSnapSystem;
    public readonly roofSystem: TraditionalRoofSystem;

    public readonly timeSystem: EnvironmentTimeSystem;
    public readonly terrainPainter: TerrainPaintSystem;
    public readonly foliageSystem: TropicalFoliageSystem;

    public readonly materialManager: MaterialManager;
    public readonly painterTape: PainterTapeSystem;
    public readonly surfaceFinisher: SurfaceFinisherTool;
    public readonly trashBagTool: TrashBagTool;
    public readonly stainCleaner: StainCleanerTool;
    public readonly squeegeeTool: WindowSqueegeeTool;

    public readonly wiringTool: WiringTool;
    public readonly plumbingTool: InWallPlumbingTool;
    public readonly furnitureSystem: FurniturePlacementSystem;
    public readonly questRuntime: QuestRuntime;

    public readonly toonMaterialManager: CelToonMaterialManager;
    public readonly visualPipeline: VisualPolishPipeline;
    public readonly billboardFoliage: TropicalBillboardFoliage;

    private currentTool: UnifiedToolMode = "Move";
    private activeTimePreset: TimePreset = "Pagi";
    private pendingStiltHeight: number = 1.2;
    private stiltCornerA: BABYLON.Vector3 | null = null;
    private pendingOpeningType: OpeningType = "PintuKayu";
    private activeFoliageType: FoliageType = "Bambu";
    private isPointerDown: boolean = false;
    private activeJob: LocalJobData | null = null;
    private remainingBudget: number = 5000000;
    private statusMessage: string = "Siap merenovasi Rumah Panggung Nusantara.";

    public onSnapshotChanged?: (snapshot: UnifiedEditorSnapshot) => void;

    constructor(canvas: HTMLCanvasElement) {
        this.engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });
        this.scene = new BABYLON.Scene(this.engine);

        this.camera = new BABYLON.UniversalCamera("mainCamera", new BABYLON.Vector3(0, 5.5, -13), this.scene);
        this.camera.setTarget(new BABYLON.Vector3(0, 1.8, 0));
        this.camera.attachControl(canvas, true);
        this.camera.speed = 0.45;
        this.camera.keysUp.push(87);
        this.camera.keysDown.push(83);
        this.camera.keysLeft.push(65);
        this.camera.keysRight.push(68);

        this.gridSnap = new GridSnapSystem(1.0, true);
        this.parcelSystem = new ParcelSystem(this.scene, 32, 32);
        this.history = new HistoryManager();
        this.saveSystem = new SaveSystem(this.history);
        this.transformController = new TransformController(this.scene, this.gridSnap);

        this.toonMaterialManager = new CelToonMaterialManager(this.scene);
        this.visualPipeline = new VisualPolishPipeline(this.scene, this.camera);
        this.timeSystem = new EnvironmentTimeSystem(this.scene);
        this.terrainPainter = new TerrainPaintSystem(this.scene, this.parcelSystem.groundMesh, this.history);
        this.foliageSystem = new TropicalFoliageSystem(this.scene, this.parcelSystem);
        this.billboardFoliage = new TropicalBillboardFoliage(this.scene);

        this.stiltSystem = new StiltFoundationSystem(this.scene, this.gridSnap, this.history);
        this.wallBuilder = new WallBuilderSystem(this.scene, this.gridSnap, this.history);
        this.demolitionTool = new DemolitionTool(this.scene, this.camera, this.history);
        this.doorWindowSystem = new DoorWindowSnapSystem(this.scene, this.history);
        this.roofSystem = new TraditionalRoofSystem(this.scene, this.history);

        this.questRuntime = new QuestRuntime();
        this.materialManager = new MaterialManager(this.scene);
        this.painterTape = new PainterTapeSystem(this.scene, this.gridSnap);
        this.surfaceFinisher = new SurfaceFinisherTool(this.scene, this.painterTape, this.history);
        this.trashBagTool = new TrashBagTool(this.scene, this.camera, this.questRuntime);
        this.stainCleaner = new StainCleanerTool(this.scene, this.camera, this.questRuntime);
        this.squeegeeTool = new WindowSqueegeeTool(this.scene, this.camera, this.questRuntime);

        this.wiringTool = new WiringTool(this.scene, this.history);
        this.plumbingTool = new InWallPlumbingTool(this.scene, this.history);
        this.furnitureSystem = new FurniturePlacementSystem(
            this.scene,
            this.gridSnap,
            this.stiltSystem,
            this.history,
            this.questRuntime
        );

        this.questRuntime.onQuestProgressUpdated = (job, budgetLeft) => {
            this.activeJob = job;
            this.remainingBudget = budgetLeft;
            this.emitSnapshot();
        };
        this.questRuntime.onJobCompleted = (job) => {
            this.setStatus(`Selamat! Pekerjaan "${job.title}" telah selesai.`);
        };

        this.registerPointerEvents();
        this.registerKeyboardShortcuts();
        this.seedStarterNusantaraTestbed();

        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
        window.addEventListener("resize", () => this.engine.resize());
    }

    public setToolMode(mode: UnifiedToolMode, statusHint?: string) {
        this.currentTool = mode;
        this.stiltCornerA = null;

        this.wiringTool.setWiresVisible(mode === "Wiring");
        this.plumbingTool.setPlumbingViewMode(mode === "Plumbing");

        if (mode === "Move" || mode === "Rotate" || mode === "Resize") {
            this.transformController.setMode(mode);
        } else {
            this.transformController.setMode("Architect");
        }

        this.setStatus(statusHint || `Alat aktif: ${mode}`);
    }

    public toggleGridSnap() {
        this.gridSnap.useSnap = !this.gridSnap.useSnap;
        this.emitSnapshot();
    }

    public setTimePreset(preset: TimePreset) {
        this.activeTimePreset = preset;
        this.timeSystem.setTimePreset(preset);
        this.emitSnapshot();
    }

    public startStiltFoundationPlacement(stiltHeight: number) {
        this.pendingStiltHeight = stiltHeight;
        this.setToolMode("StiltFoundation", `Klik titik sudut pertama & kedua di tanah untuk pondasi panggung (${stiltHeight}m).`);
    }

    public startOpeningPlacement(type: OpeningType) {
        this.pendingOpeningType = type;
        this.setToolMode("PlaceOpening", `Arahkan ke segmen dinding bilik bambu dan klik untuk memasang ${type}.`);
    }

    public buildDefaultRoofOnPlatform(style: RoofStyle, pitchDegrees: number) {
        this.roofSystem.buildRoof({
            minX: -4,
            maxX: 4,
            minZ: -3,
            maxZ: 3,
            baseElevationY: 1.2 + 3.0,
            pitchDegrees,
            style
        });
        this.setStatus(`Atap ${style} (${pitchDegrees}°) terpasang di atas bangunan.`);
    }

    public selectLocalMaterial(materialId: string) {
        const matDef = MaterialDatabase.find(m => m.id === materialId);
        if (!matDef) return;
        this.surfaceFinisher.selectedMaterial = this.materialManager.getOrCreateMaterial(matDef);
        this.setToolMode("Painter", `Tarik kotak kuning (Painter's Tape) di dinding untuk melapisi ${matDef.name}.`);
    }

    public selectEthnicFurniture(furnitureId: string) {
        this.furnitureSystem.selectFurnitureById(furnitureId);
        this.setToolMode("PlaceFurniture", "Klik lantai tanah atau dek panggung untuk meletakkan perabot.");
    }

    public selectTerrainLayer(layer: TerrainLayerType) {
        this.terrainPainter.activeLayer = layer;
        this.setToolMode("PaintTerrain", `Tahan & geser kursor di tanah untuk mengecat lapisan ${layer}.`);
    }

    public selectFoliageType(type: FoliageType) {
        this.activeFoliageType = type;
        this.setToolMode("PlaceFoliage", `Klik area halaman untuk menanam ${type}.`);
    }

    public activateJobScenario(job: LocalJobData) {
        this.questRuntime.loadJob(job);
        this.setStatus(`Misi aktif: ${job.title} (Klien: ${job.clientName})`);
    }

    public undo() {
        this.history.undo();
        this.setStatus("Membatalkan tindakan terakhir (Undo).");
    }

    public redo() {
        this.history.redo();
        this.setStatus("Mengulangi tindakan (Redo).");
    }

    public saveProjectJSON(name: string = "Rumah_Panggung_Nusantara") {
        this.saveSystem.saveProject(name);
        this.setStatus(`Proyek diekspor ke ${name}_save.json.`);
    }

    private registerPointerEvents() {
        this.scene.onPointerObservable.add((pointerInfo) => {
            const pick = this.scene.pick(this.scene.pointerX, this.scene.pointerY);

            switch (pointerInfo.type) {
                case BABYLON.PointerEventTypes.POINTERDOWN:
                    if (pointerInfo.event.button !== 0) return;
                    this.isPointerDown = true;
                    this.handlePointerDown(pick);
                    break;

                case BABYLON.PointerEventTypes.POINTERMOVE:
                    if (!this.isPointerDown) return;
                    this.handlePointerMove(pick);
                    break;

                case BABYLON.PointerEventTypes.POINTERUP:
                    if (pointerInfo.event.button !== 0) return;
                    this.isPointerDown = false;
                    this.handlePointerUp(pick);
                    break;
            }
        });
    }

    private handlePointerDown(pick: BABYLON.PickingInfo | null) {
        switch (this.currentTool) {
            case "StiltFoundation": {
                if (!pick?.hit || !pick.pickedPoint) return;
                if (!this.stiltCornerA) {
                    this.stiltCornerA = pick.pickedPoint.clone();
                    this.setStatus("Titik sudut pertama dikunci. Klik sudut diagonal kedua.");
                } else {
                    this.stiltSystem.buildStiltPlatform(this.stiltCornerA, pick.pickedPoint, this.pendingStiltHeight);
                    this.stiltCornerA = null;
                    this.setStatus("Pondasi kayu rumah panggung & tangga berhasil dibangun.");
                }
                break;
            }

            case "BuildWall": {
                if (!pick?.hit || !pick.pickedPoint) return;
                const floorY = this.stiltSystem.getFloorElevationAt(pick.pickedPoint);
                const startPos = new BABYLON.Vector3(pick.pickedPoint.x, floorY, pick.pickedPoint.z);
                this.wallBuilder.startBuilding(startPos);
                break;
            }

            case "PlaceOpening": {
                if (!pick?.hit || !pick.pickedPoint) return;
                const nearestSeg = this.doorWindowSystem.findNearestWallSegment(pick.pickedPoint, 1.5);
                if (nearestSeg) {
                    this.doorWindowSystem.placeOpeningOnWall(nearestSeg, this.pendingOpeningType);
                    this.setStatus(`${this.pendingOpeningType} terpasang presisi pada dinding.`);
                }
                break;
            }

            case "Demolish":
                this.demolitionTool.swingHammer();
                break;

            case "Painter":
                if (pick?.hit && pick.pickedPoint && pick.pickedMesh) {
                    this.painterTape.startTape(pick.pickedPoint, pick.pickedMesh);
                }
                break;

            case "TrashBag":
                this.trashBagTool.startAction();
                break;

            case "CleanStain":
                this.stainCleaner.setScrubbing(true);
                break;

            case "Squeegee":
                this.squeegeeTool.startWipe();
                break;

            case "Wiring":
                if (pick?.hit && pick.pickedMesh) {
                    const elecNode: ElectricalNodeComponent | undefined = pick.pickedMesh.metadata?.electricalNode;
                    if (elecNode) {
                        this.wiringTool.onNodeClicked(pick.pickedMesh);
                    }
                }
                break;

            case "Plumbing":
                if (pick?.hit && pick.pickedMesh) {
                    this.plumbingTool.onPlumbingNodeClicked(pick.pickedMesh);
                }
                break;

            case "PlaceFurniture":
                if (pick?.hit && pick.pickedPoint) {
                    this.furnitureSystem.placeAt(pick.pickedPoint, "room_serambi");
                }
                break;

            case "PaintTerrain":
                if (pick?.hit && pick.pickedMesh === this.parcelSystem.groundMesh) {
                    this.terrainPainter.beginStroke();
                    const uv = pick.getTextureCoordinates();
                    if (uv) this.terrainPainter.paintAtUV(uv);
                }
                break;

            case "PlaceFoliage":
                if (pick?.hit && pick.pickedPoint) {
                    this.foliageSystem.placeFoliage(this.activeFoliageType, pick.pickedPoint);
                }
                break;

            case "TrimGrass":
                if (pick?.hit && pick.pickedPoint) {
                    const trimmed = this.foliageSystem.trimGrassInRadius(pick.pickedPoint, 1.5);
                    if (trimmed > 0) this.setStatus(`Memangkas ${trimmed} rumpun rumput liar.`);
                }
                break;
        }
    }

    private handlePointerMove(pick: BABYLON.PickingInfo | null) {
        if (!pick?.hit || !pick.pickedPoint) return;

        if (this.currentTool === "BuildWall") {
            const floorY = this.stiltSystem.getFloorElevationAt(pick.pickedPoint);
            this.wallBuilder.updatePreview(new BABYLON.Vector3(pick.pickedPoint.x, floorY, pick.pickedPoint.z));
        } else if (this.currentTool === "Painter") {
            this.painterTape.updateTapePreview(pick.pickedPoint);
        } else if (this.currentTool === "Squeegee") {
            this.squeegeeTool.updateWipe();
        } else if (this.currentTool === "PaintTerrain" && pick.pickedMesh === this.parcelSystem.groundMesh) {
            const uv = pick.getTextureCoordinates();
            if (uv) this.terrainPainter.paintAtUV(uv);
        }
    }

    private handlePointerUp(pick: BABYLON.PickingInfo | null) {
        if (this.currentTool === "BuildWall" && pick?.hit && pick.pickedPoint) {
            const floorY = this.stiltSystem.getFloorElevationAt(pick.pickedPoint);
            this.wallBuilder.commitBuilding(new BABYLON.Vector3(pick.pickedPoint.x, floorY, pick.pickedPoint.z));
        } else if (this.currentTool === "Painter" && pick?.hit && pick.pickedPoint && this.painterTape.targetWall) {
            const targetMesh = this.painterTape.targetWall;
            const bounds = this.painterTape.finishTape(pick.pickedPoint);
            if (bounds) {
                this.surfaceFinisher.applyFinish(targetMesh, bounds);
                this.questRuntime.recordAction("PaintSurface", "room_serambi", undefined, 1, 75000);
            }
        } else if (this.currentTool === "TrashBag") {
            this.trashBagTool.stopAction();
        } else if (this.currentTool === "CleanStain") {
            this.stainCleaner.setScrubbing(false);
        } else if (this.currentTool === "Squeegee") {
            this.squeegeeTool.stopWipe();
        } else if (this.currentTool === "PaintTerrain") {
            this.terrainPainter.endStroke();
        }
    }

    private registerKeyboardShortcuts() {
        window.addEventListener("keydown", (e) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            if (e.key === "g" || e.key === "G") this.toggleGridSnap();
            if (e.key === "r" || e.key === "R") this.furnitureSystem.rotatePreview(Math.PI / 4);
            if (e.key === "f" || e.key === "F") this.stainCleaner.triggerDirtScanner(3500);
            if (e.ctrlKey && e.key.toLowerCase() === "z") this.undo();
            if (e.ctrlKey && e.key.toLowerCase() === "y") this.redo();
        });
    }

    private seedStarterNusantaraTestbed() {
        this.stiltSystem.buildStiltPlatform(new BABYLON.Vector3(-4, 0, -3), new BABYLON.Vector3(4, 0, 3), 1.2);

        this.wallBuilder.startBuilding(new BABYLON.Vector3(-4, 1.2, 3));
        this.wallBuilder.commitBuilding(new BABYLON.Vector3(4, 1.2, 3));

        this.wallBuilder.startBuilding(new BABYLON.Vector3(-4, 1.2, -3));
        this.wallBuilder.commitBuilding(new BABYLON.Vector3(-4, 1.2, 3));

        const dirtyGlass = BABYLON.MeshBuilder.CreateBox("starterDirtyWindow", { width: 1.2, height: 1.1, depth: 0.08 }, this.scene);
        dirtyGlass.position = new BABYLON.Vector3(-1.5, 2.7, 2.88);
        new DirtyWindowComponent(dirtyGlass, "room_serambi", this.scene);

        const stainMat = this.toonMaterialManager.createToonMaterial("mudStainToon", {
            hexColor: LOCAL_TOON_PALETTE.TanahMerah,
            rimIntensity: 0.05
        });
        const mudStain = BABYLON.MeshBuilder.CreateDisc("mudStain_1", { radius: 0.55 }, this.scene);
        mudStain.rotation.x = Math.PI / 2;
        mudStain.position = new BABYLON.Vector3(1.2, 1.22, 0.5);
        mudStain.material = stainMat;
        new StainSpotComponent(mudStain, "room_serambi", "NodaLumpur");

        const trashMat = this.toonMaterialManager.createToonMaterial("leafTrashToon", {
            hexColor: "#8B7A5A"
        });
        for (let i = 0; i < 3; i++) {
            const leafPile = BABYLON.MeshBuilder.CreateSphere(`trashLeaf_${i}`, { diameter: 0.35 }, this.scene);
            leafPile.scaling.y = 0.35;
            leafPile.position = new BABYLON.Vector3(-2 + i * 0.8, 1.26, -1.2);
            leafPile.material = trashMat;
            BABYLON.Tags.AddTagsTo(leafPile, "TrashItem");
            leafPile.metadata = { trashData: { roomId: "room_serambi", trashType: "DaunKering" } };
        }

        const binMat = this.toonMaterialManager.createToonMaterial("trashBinToon", { hexColor: "#2E7D32" });
        const trashBin = BABYLON.MeshBuilder.CreateCylinder("outdoorTrashBin", { height: 0.9, diameter: 0.6 }, this.scene);
        trashBin.position = new BABYLON.Vector3(5.5, 0.45, -4.5);
        trashBin.material = binMat;
        BABYLON.Tags.AddTagsTo(trashBin, "TrashBin");

        const fuseMesh = BABYLON.MeshBuilder.CreateBox("starterFuseBox", { width: 0.4, height: 0.55, depth: 0.15 }, this.scene);
        fuseMesh.position = new BABYLON.Vector3(-3.85, 2.6, 1.5);
        new ElectricalNodeComponent("fuse_main", "Source", fuseMesh);

        const switchMesh = BABYLON.MeshBuilder.CreateBox("starterSwitch", { width: 0.18, height: 0.25, depth: 0.08 }, this.scene);
        switchMesh.position = new BABYLON.Vector3(-3.85, 2.3, 0.2);
        const switchNode = new ElectricalNodeComponent("switch_serambi", "Switch", switchMesh);
        switchMesh.actionManager = new BABYLON.ActionManager(this.scene);
        switchMesh.actionManager.registerAction(
            new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnPickTrigger, () => {
                if (this.currentTool !== "Wiring") {
                    switchNode.toggleSwitch();
                }
            })
        );

        const lampMesh = BABYLON.MeshBuilder.CreateSphere("starterLamp", { diameter: 0.45 }, this.scene);
        lampMesh.position = new BABYLON.Vector3(0, 3.85, 0);
        const lampMat = new BABYLON.StandardMaterial("starterLampMat", this.scene);
        lampMat.emissiveColor = new BABYLON.Color3(0.1, 0.1, 0.1);
        lampMesh.material = lampMat;
        const lampLight = new BABYLON.PointLight("starterLampLight", lampMesh.position, this.scene);
        lampLight.diffuse = new BABYLON.Color3(1.0, 0.85, 0.55);
        lampLight.intensity = 0;

        const lampNode = new ElectricalNodeComponent("lamp_serambi", "Load", lampMesh);
        lampNode.onPowerChanged = (powered) => {
            lampMat.emissiveColor = powered ? new BABYLON.Color3(1, 0.92, 0.65) : new BABYLON.Color3(0.1, 0.1, 0.1);
            lampLight.intensity = powered ? 1.4 : 0;
        };

        this.foliageSystem.placeFoliage("Bambu", new BABYLON.Vector3(-6.5, 0, 5.5));
        this.foliageSystem.placeFoliage("Bambu", new BABYLON.Vector3(-5.8, 0, 6.2));
        this.foliageSystem.placeFoliage("RumputLiar", new BABYLON.Vector3(3.5, 0, -5.0));
        this.foliageSystem.placeFoliage("RumputLiar", new BABYLON.Vector3(4.2, 0, -4.8));
        this.billboardFoliage.scatterGrassField(new BABYLON.Vector3(0, 0, 0), 13, 60);

        this.activateJobScenario({
            jobId: "job_starter_panggung",
            title: "Restorasi Serambi Rumah Panggung",
            clientName: "Abah Soma",
            regionContext: "Arsitektur Panggung Sunda / Nusantara",
            storyBrief: "Hujan semalam membawa lumpur dan daun kering ke serambi. Tolong bersihkan noda, buang sampah ke tong luar, pasang amben jati, dan sambungkan lampu teras sebelum senja.",
            budget: 5000000,
            reward: 1250000,
            objectives: [
                {
                    id: "obj_trash",
                    type: "CleanTrash",
                    description: "Raup tumpukan daun kering di serambi",
                    targetRoomId: "room_serambi",
                    requiredCount: 3,
                    currentCount: 0,
                    isCompleted: false
                },
                {
                    id: "obj_stain",
                    type: "CleanStain",
                    description: "Bersihkan noda lumpur & jendela kotor",
                    targetRoomId: "room_serambi",
                    requiredCount: 2,
                    currentCount: 0,
                    isCompleted: false
                },
                {
                    id: "obj_furn",
                    type: "PlaceItem",
                    description: "Tempatkan Amben Kayu Jati di serambi",
                    targetRoomId: "room_serambi",
                    targetAssetId: "item_amben_jati",
                    requiredCount: 1,
                    currentCount: 0,
                    isCompleted: false
                }
            ]
        });
    }

    public getSnapshot(): UnifiedEditorSnapshot {
        return {
            activeTool: this.currentTool,
            snapEnabled: this.gridSnap.useSnap,
            activeTimePreset: this.activeTimePreset,
            activeJob: this.activeJob,
            remainingBudget: this.remainingBudget,
            statusMessage: this.statusMessage
        };
    }

    private setStatus(msg: string) {
        this.statusMessage = msg;
        this.emitSnapshot();
    }

    private emitSnapshot() {
        if (this.onSnapshotChanged) {
            this.onSnapshotChanged(this.getSnapshot());
        }
    }

    public dispose() {
        this.engine.dispose();
    }
}
