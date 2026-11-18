import * as BABYLON from "@babylonjs/core";
import { QuestRuntime } from "../quests/QuestRuntime";

export interface TrashMetadata {
    roomId: string;
    trashType: "DaunKering" | "PecahanGenteng" | "PlastikBekas" | "PuingKayu";
}

export interface TrashBagState {
    currentCount: number;
    maxCapacity: number;
    isFull: boolean;
    isTied: boolean;
    holdProgress: number;
}

export class TrashBagTool {
    private scene: BABYLON.Scene;
    private camera: BABYLON.Camera;
    private questRuntime: QuestRuntime;

    public maxCapacity: number = 5;
    public currentCount: number = 0;
    public isTied: boolean = false;

    private holdProgress: number = 0;
    private isHoldingAction: boolean = false;
    private activeTargetMesh: BABYLON.AbstractMesh | null = null;

    public onBagStateChanged?: (state: TrashBagState) => void;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, questRuntime: QuestRuntime) {
        this.scene = scene;
        this.camera = camera;
        this.questRuntime = questRuntime;

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.isHoldingAction) {
                const dt = this.scene.getEngine().getDeltaTime() / 1000;
                this.updateHoldAction(dt);
            }
        });
    }

    public startAction() {
        this.isHoldingAction = true;
        this.holdProgress = 0;

        const ray = this.scene.createPickingRay(
            this.scene.pointerX,
            this.scene.pointerY,
            BABYLON.Matrix.Identity(),
            this.camera
        );
        const hit = this.scene.pickWithRay(ray);

        if (hit && hit.hit && hit.pickedMesh) {
            if (this.isTied && BABYLON.Tags.MatchesQuery(hit.pickedMesh, "TrashBin")) {
                this.disposeBagIntoBin();
                return;
            }

            if (!this.isTied && this.currentCount < this.maxCapacity && BABYLON.Tags.MatchesQuery(hit.pickedMesh, "TrashItem")) {
                this.activeTargetMesh = hit.pickedMesh;
            }
        }
    }

    public stopAction() {
        this.isHoldingAction = false;
        this.holdProgress = 0;
        this.activeTargetMesh = null;
        this.notifyUI();
    }

    private updateHoldAction(dt: number) {
        if (this.currentCount >= this.maxCapacity && !this.isTied) {
            this.holdProgress += dt * 1.5;
            if (this.holdProgress >= 1.0) {
                this.isTied = true;
                this.holdProgress = 0;
                this.isHoldingAction = false;
            }
            this.notifyUI();
            return;
        }

        if (this.activeTargetMesh && !this.isTied && this.currentCount < this.maxCapacity) {
            this.holdProgress += dt * 2.5;
            if (this.holdProgress >= 1.0) {
                this.collectTrashItem(this.activeTargetMesh);
                this.activeTargetMesh = null;
                this.holdProgress = 0;
            }
            this.notifyUI();
        }
    }

    private collectTrashItem(mesh: BABYLON.AbstractMesh) {
        const meta: TrashMetadata = mesh.metadata?.trashData || { roomId: "ANY", trashType: "DaunKering" };
        this.currentCount++;
        mesh.dispose();
        this.questRuntime.recordAction("CleanTrash", meta.roomId, meta.trashType, 1, 0);
        this.notifyUI();
    }

    private disposeBagIntoBin() {
        this.currentCount = 0;
        this.isTied = false;
        this.holdProgress = 0;
        this.isHoldingAction = false;
        this.notifyUI();
    }

    private notifyUI() {
        if (this.onBagStateChanged) {
            this.onBagStateChanged({
                currentCount: this.currentCount,
                maxCapacity: this.maxCapacity,
                isFull: this.currentCount >= this.maxCapacity,
                isTied: this.isTied,
                holdProgress: Math.min(1, this.holdProgress)
            });
        }
    }
}
