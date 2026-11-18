import * as BABYLON from "@babylonjs/core";
import { ElectricalNodeComponent } from "../wiring/ElectricalNodeComponent";
import { HistoryManager } from "../core/HistoryManager";

export class WiringTool {
    private scene: BABYLON.Scene;
    private history: HistoryManager;

    private firstSelectedNode: ElectricalNodeComponent | null = null;
    private activeWires: BABYLON.LinesMesh[] = [];

    constructor(scene: BABYLON.Scene, history: HistoryManager) {
        this.scene = scene;
        this.history = history;
    }

    public onNodeClicked(mesh: BABYLON.AbstractMesh) {
        const node: ElectricalNodeComponent | undefined = mesh.metadata?.electricalNode;
        if (!node) return;

        if (!this.firstSelectedNode) {
            this.firstSelectedNode = node;
            this.highlightMesh(mesh, true);
        } else {
            if (this.firstSelectedNode !== node) {
                this.connectNodes(this.firstSelectedNode, node);
            }
            this.highlightMesh(this.firstSelectedNode.mesh, false);
            this.firstSelectedNode = null;
        }
    }

    private connectNodes(sourceNode: ElectricalNodeComponent, targetNode: ElectricalNodeComponent) {
        sourceNode.connectedOutputs.push(targetNode);
        targetNode.connectedInputs.push(sourceNode);

        this.drawWireVisual(sourceNode.mesh.getAbsolutePosition(), targetNode.mesh.getAbsolutePosition());
        sourceNode.evaluateNetwork();
    }

    private drawWireVisual(start: BABYLON.Vector3, end: BABYLON.Vector3) {
        const wire = BABYLON.MeshBuilder.CreateLines("wire", {
            points: [start, end]
        }, this.scene);
        wire.color = BABYLON.Color3.Red();
        this.activeWires.push(wire);
    }

    public setWiresVisible(isVisible: boolean) {
        this.activeWires.forEach(wire => {
            wire.isVisible = isVisible;
        });
    }

    private highlightMesh(mesh: BABYLON.AbstractMesh, isActive: boolean) {
        mesh.renderOutline = isActive;
        mesh.outlineColor = BABYLON.Color3.Yellow();
        mesh.outlineWidth = 0.05;
    }
}
