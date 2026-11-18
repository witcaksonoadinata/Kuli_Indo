import * as BABYLON from "@babylonjs/core";

export class WallSegmentComponent {
    public mesh: BABYLON.InstancedMesh | BABYLON.Mesh;
    public maxHp: number;
    public currentHp: number;

    constructor(mesh: BABYLON.InstancedMesh | BABYLON.Mesh, hp: number = 3) {
        this.mesh = mesh;
        this.maxHp = hp;
        this.currentHp = hp;

        this.mesh.metadata = this.mesh.metadata || {};
        this.mesh.metadata.wallComponent = this;
    }

    public takeHit(damage: number = 1): boolean {
        this.currentHp -= damage;
        this.mesh.scaling.scaleInPlace(0.95);

        if (this.currentHp <= 0) {
            this.destroy();
            return true;
        }
        return false;
    }

    private destroy() {
        this.mesh.setEnabled(false);
    }

    public restore() {
        this.currentHp = this.maxHp;
        this.mesh.scaling.setAll(1);
        this.mesh.setEnabled(true);
    }
}
