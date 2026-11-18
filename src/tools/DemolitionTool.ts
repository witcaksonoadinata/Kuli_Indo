import * as BABYLON from "@babylonjs/core";
import { WallSegmentComponent } from "../construction/WallSegmentComponent";
import { HistoryManager } from "../core/HistoryManager";
import { DestroyWallCommand } from "./commands/DestroyWallCommand";

export class DemolitionTool {
    private scene: BABYLON.Scene;
    private camera: BABYLON.Camera;
    private history: HistoryManager;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera, history: HistoryManager) {
        this.scene = scene;
        this.camera = camera;
        this.history = history;
    }

    public swingHammer() {
        const ray = this.scene.createPickingRay(
            this.scene.pointerX,
            this.scene.pointerY,
            BABYLON.Matrix.Identity(),
            this.camera
        );

        const hit = this.scene.pickWithRay(ray);
        if (hit && hit.hit && hit.pickedMesh) {
            this.processHit(hit.pickedMesh);
        }
    }

    private processHit(mesh: BABYLON.AbstractMesh) {
        if (BABYLON.Tags.HasTags(mesh) && BABYLON.Tags.MatchesQuery(mesh, "WallSegment")) {
            const wallComp: WallSegmentComponent | undefined = mesh.metadata?.wallComponent;
            if (wallComp) {
                const isDestroyed = wallComp.takeHit(1);
                if (isDestroyed) {
                    const command = new DestroyWallCommand(wallComp);
                    this.history.executeCommand(command);
                    this.spawnDustParticles(mesh.position);
                }
            }
        }
    }

    private spawnDustParticles(position: BABYLON.Vector3) {
        const particleSystem = new BABYLON.ParticleSystem("dust", 30, this.scene);
        particleSystem.emitter = position.clone();
        particleSystem.color1 = new BABYLON.Color4(0.85, 0.8, 0.72, 1);
        particleSystem.color2 = new BABYLON.Color4(0.65, 0.6, 0.52, 0.6);
        particleSystem.minSize = 0.08;
        particleSystem.maxSize = 0.25;
        particleSystem.minLifeTime = 0.25;
        particleSystem.maxLifeTime = 0.55;
        particleSystem.emitRate = 60;
        particleSystem.start();
        setTimeout(() => {
            particleSystem.stop();
            setTimeout(() => particleSystem.dispose(), 600);
        }, 350);
    }
}
