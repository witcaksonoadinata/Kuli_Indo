import * as BABYLON from "@babylonjs/core";
import { EdgeDetectionPostProcess } from "@babylonjs/post-processes/edgeDetection/edgeDetectionPostProcess";

export class VisualPolishPipeline {
    private scene: BABYLON.Scene;
    private camera: BABYLON.Camera;

    private outlinePostProcess: EdgeDetectionPostProcess;
    private defaultPipeline: BABYLON.DefaultRenderingPipeline;
    private ssaoPipeline: BABYLON.SSAORenderingPipeline | null = null;

    constructor(scene: BABYLON.Scene, camera: BABYLON.Camera) {
        this.scene = scene;
        this.camera = camera;

        this.scene.shadowsEnabled = false;

        this.outlinePostProcess = new EdgeDetectionPostProcess("toonOutline", this.scene, 1.0, this.camera);
        this.outlinePostProcess.edgeColor = BABYLON.Color3.Black();
        this.outlinePostProcess.edgeIntensity = 0.08;
        this.outlinePostProcess.edgeWidth = 0.125;

        this.setupSSAO();

        this.defaultPipeline = new BABYLON.DefaultRenderingPipeline("animeColorPipeline", true, this.scene, [this.camera]);
        this.defaultPipeline.samples = 4;
        this.defaultPipeline.imageProcessingEnabled = true;
        this.defaultPipeline.imageProcessing.contrast = 1.18;
        this.defaultPipeline.imageProcessing.exposure = 1.05;
        this.defaultPipeline.imageProcessing.toneMappingEnabled = true;

        this.scene.fogMode = BABYLON.Scene.FOGMODE_EXP;
        this.scene.fogColor = new BABYLON.Color3(0.9, 0.9, 0.85);
        this.scene.fogDensity = 0.008;
    }

    private setupSSAO() {
        try {
            this.ssaoPipeline = new BABYLON.SSAORenderingPipeline("subtleSSAO", this.scene, 0.5, [this.camera]);
            this.ssaoPipeline.fallOff = 0.000001;
            this.ssaoPipeline.area = 0.0075;
            this.ssaoPipeline.radius = 0.5;
            this.ssaoPipeline.totalStrength = 0.65;
            this.ssaoPipeline.base = 0.5;
        } catch (err) {
            console.warn("SSAO tidak didukung pada konteks GPU ini:", err);
        }
    }

    public setOutlineWidth(width: number) {
        this.outlinePostProcess.edgeWidth = width;
    }

    public setOutlineIntensity(intensity: number) {
        this.outlinePostProcess.edgeIntensity = intensity;
    }

    public setContrast(value: number) {
        this.defaultPipeline.imageProcessing.contrast = value;
    }

    public setFogDensity(density: number) {
        this.scene.fogDensity = density;
    }

    public setSSAOEnabled(enabled: boolean) {
        if (!this.ssaoPipeline) return;
        if (enabled) {
            this.scene.postProcessRenderPipelineManager.attachCamerasToRenderPipeline("subtleSSAO", this.camera);
        } else {
            this.scene.postProcessRenderPipelineManager.detachCamerasFromRenderPipeline("subtleSSAO", this.camera);
        }
    }
}
