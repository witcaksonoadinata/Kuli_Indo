import * as BABYLON from "@babylonjs/core";

export type NodeType = "Source" | "Switch" | "Load";

export class ElectricalNodeComponent {
    public id: string;
    public type: NodeType;
    public mesh: BABYLON.AbstractMesh;

    public isPowered: boolean = false;
    public isOn: boolean = false;

    public connectedInputs: ElectricalNodeComponent[] = [];
    public connectedOutputs: ElectricalNodeComponent[] = [];
    public onPowerChanged?: (isPowered: boolean) => void;

    constructor(id: string, type: NodeType, mesh: BABYLON.AbstractMesh) {
        this.id = id;
        this.type = type;
        this.mesh = mesh;

        this.mesh.metadata = this.mesh.metadata || {};
        this.mesh.metadata.electricalNode = this;
    }

    public toggleSwitch() {
        if (this.type !== "Switch") return;
        this.isOn = !this.isOn;
        this.evaluateNetwork();
    }

    public evaluateNetwork() {
        let hasPower = false;

        if (this.type === "Source") {
            hasPower = true;
        } else {
            hasPower = this.connectedInputs.some(input => {
                if (input.type === "Switch") {
                    return input.isPowered && input.isOn;
                }
                return input.isPowered;
            });
        }

        if (this.isPowered !== hasPower) {
            this.isPowered = hasPower;
            if (this.onPowerChanged) {
                this.onPowerChanged(this.isPowered);
            }
        }

        this.connectedOutputs.forEach(output => output.evaluateNetwork());
    }
}
