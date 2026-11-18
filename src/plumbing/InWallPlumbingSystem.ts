import * as BABYLON from "@babylonjs/core";
import { PlumbingRole } from "../data/catalogs/EthnicFurnitureCatalog";
import { HistoryManager } from "../core/HistoryManager";
import { Command } from "../core/Command";

export type PipeLineType = "AirBersih" | "Pembuangan";

export class PlumbingNodeComponent {
    public id: string;
    public role: PlumbingRole;
    public mesh: BABYLON.AbstractMesh;
    public hasCleanWater: boolean = false;

    public connectedSources: PlumbingNodeComponent[] = [];
    public connectedTargets: PlumbingNodeComponent[] = [];
    public onWaterStateChanged?: (hasWater: boolean) => void;

    constructor(id: string, role: PlumbingRole, mesh: BABYLON.AbstractMesh) {
        this.id = id;
        this.role = role;
        this.mesh = mesh;

        BABYLON.Tags.AddTagsTo(this.mesh, "PlumbingNode");
        this.mesh.metadata = this.mesh.metadata || {};
        this.mesh.metadata.plumbingNode = this;

        if (this.role === "WaterSource") {
            this.hasCleanWater = true;
        }
    }

    public evaluateWaterFlow() {
        const nextState =
            this.role === "WaterSource" ||
            this.connectedSources.some(src => src.hasCleanWater);

        if (this.hasCleanWater !== nextState) {
            this.hasCleanWater = nextState;
            if (this.onWaterStateChanged) {
                this.onWaterStateChanged(this.hasCleanWater);
            }
        }

        this.connectedTargets.forEach(target => target.evaluateWaterFlow());
    }
}

export class InWallPlumbingTool {
    private scene: BABYLON.Scene;
    private history: HistoryManager;

    public activePipeType: PipeLineType = "AirBersih";
    private firstSelectedNode: PlumbingNodeComponent | null = null;
    private allPipeMeshes: BABYLON.Mesh[] = [];
    private isPlumbingViewActive: boolean = false;

    constructor(scene: BABYLON.Scene, history: HistoryManager) {
        this.scene = scene;
        this.history = history;
    }

    public setPlumbingViewMode(enabled: boolean) {
        this.isPlumbingViewActive = enabled;

        const wallSegments = this.scene.getMeshesByTags("WallSegment");
        wallSegments.forEach(wall => {
            wall.visibility = enabled ? 0.25 : 1.0;
        });

        this.allPipeMeshes.forEach(pipe => {
            pipe.isVisible = enabled;
        });

        const nodes = this.scene.getMeshesByTags("PlumbingNode");
        nodes.forEach(nodeMesh => {
            nodeMesh.renderOutline = enabled;
            nodeMesh.outlineColor = new BABYLON.Color3(0.2, 0.75, 1.0);
            nodeMesh.outlineWidth = 0.04;
        });
    }

    public onPlumbingNodeClicked(mesh: BABYLON.AbstractMesh) {
        if (!this.isPlumbingViewActive) return;

        const node: PlumbingNodeComponent | undefined = mesh.metadata?.plumbingNode;
        if (!node) return;

        if (!this.firstSelectedNode) {
            this.firstSelectedNode = node;
            mesh.outlineColor = BABYLON.Color3.Yellow();
        } else {
            if (this.firstSelectedNode !== node) {
                const cmd = new ConnectPipeCommand(
                    this.scene,
                    this.firstSelectedNode,
                    node,
                    this.activePipeType,
                    this.allPipeMeshes
                );
                this.history.executeCommand(cmd);
            }
            this.firstSelectedNode.mesh.outlineColor = new BABYLON.Color3(0.2, 0.75, 1.0);
            this.firstSelectedNode = null;
        }
    }
}

class ConnectPipeCommand implements Command {
    private scene: BABYLON.Scene;
    private sourceNode: PlumbingNodeComponent;
    private targetNode: PlumbingNodeComponent;
    private pipeType: PipeLineType;
    private pipeRegistry: BABYLON.Mesh[];
    private createdPipeMesh: BABYLON.Mesh | null = null;

    constructor(
        scene: BABYLON.Scene,
        sourceNode: PlumbingNodeComponent,
        targetNode: PlumbingNodeComponent,
        pipeType: PipeLineType,
        pipeRegistry: BABYLON.Mesh[]
    ) {
        this.scene = scene;
        this.sourceNode = sourceNode;
        this.targetNode = targetNode;
        this.pipeType = pipeType;
        this.pipeRegistry = pipeRegistry;
    }

    public execute(): void {
        this.sourceNode.connectedTargets.push(this.targetNode);
        this.targetNode.connectedSources.push(this.sourceNode);

        const pStart = this.sourceNode.mesh.getAbsolutePosition().clone();
        const pEnd = this.targetNode.mesh.getAbsolutePosition().clone();
        const midCorner = new BABYLON.Vector3(pEnd.x, Math.min(pStart.y, pEnd.y) + 0.15, pStart.z);

        this.createdPipeMesh = BABYLON.MeshBuilder.CreateTube(
            `inWallPipe_${this.pipeType}_${Date.now()}`,
            {
                path: [pStart, midCorner, pEnd],
                radius: 0.035,
                tessellation: 8
            },
            this.scene
        );

        const pipeMat = new BABYLON.StandardMaterial(`pipeMat_${Date.now()}`, this.scene);
        pipeMat.diffuseColor =
            this.pipeType === "AirBersih"
                ? new BABYLON.Color3(0.15, 0.65, 0.95)
                : new BABYLON.Color3(0.45, 0.42, 0.38);
        pipeMat.specularColor = BABYLON.Color3.Black();

        this.createdPipeMesh.material = pipeMat;
        this.pipeRegistry.push(this.createdPipeMesh);

        this.sourceNode.evaluateWaterFlow();
    }

    public undo(): void {
        if (this.createdPipeMesh) {
            const idx = this.pipeRegistry.indexOf(this.createdPipeMesh);
            if (idx !== -1) this.pipeRegistry.splice(idx, 1);
            this.createdPipeMesh.dispose();
            this.createdPipeMesh = null;
        }

        this.sourceNode.connectedTargets = this.sourceNode.connectedTargets.filter(t => t !== this.targetNode);
        this.targetNode.connectedSources = this.targetNode.connectedSources.filter(s => s !== this.sourceNode);
        this.targetNode.evaluateWaterFlow();
    }

    public serialize(): any {
        return {
            type: "ConnectPipe",
            pipeType: this.pipeType,
            from: this.sourceNode.id,
            to: this.targetNode.id
        };
    }
}
