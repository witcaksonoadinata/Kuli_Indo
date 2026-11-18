import * as BABYLON from "@babylonjs/core";

export type TimePreset = "Pagi" | "Siang" | "Senja" | "Malam";

export class EnvironmentTimeSystem {
    private scene: BABYLON.Scene;
    private sunLight: BABYLON.DirectionalLight;
    private hemiLight: BABYLON.HemisphericLight;

    public currentHour: number = 10.0;
    public isCycleEnabled: boolean = false;
    public timeSpeed: number = 0.05;

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;

        this.sunLight = new BABYLON.DirectionalLight(
            "sunLight",
            new BABYLON.Vector3(-0.5, -1, 0.5),
            this.scene
        );

        this.hemiLight = new BABYLON.HemisphericLight(
            "hemiLight",
            new BABYLON.Vector3(0, 1, 0),
            this.scene
        );

        this.applyLightingFromHour(this.currentHour);

        this.scene.onBeforeRenderObservable.add(() => {
            if (this.isCycleEnabled) {
                const deltaSeconds = this.scene.getEngine().getDeltaTime() / 1000;
                this.currentHour = (this.currentHour + deltaSeconds * this.timeSpeed) % 24;
                this.applyLightingFromHour(this.currentHour);
            }
        });
    }

    public setTimePreset(preset: TimePreset) {
        const presetMap: Record<TimePreset, number> = {
            Pagi: 7.5,
            Siang: 12.5,
            Senja: 17.5,
            Malam: 21.0
        };
        this.currentHour = presetMap[preset];
        this.applyLightingFromHour(this.currentHour);
    }

    public toggleDayNightCycle(enabled: boolean) {
        this.isCycleEnabled = enabled;
    }

    private applyLightingFromHour(hour: number) {
        const sunAngle = ((hour - 6) / 12) * Math.PI;
        const sunY = Math.sin(sunAngle);
        const sunX = Math.cos(sunAngle);

        this.sunLight.direction = new BABYLON.Vector3(-sunX, -Math.max(0.15, sunY), 0.4).normalize();

        if (hour >= 16.5 && hour <= 18.5) {
            this.sunLight.diffuse = new BABYLON.Color3(1.0, 0.58, 0.28);
            this.sunLight.intensity = 0.85;
            this.hemiLight.diffuse = new BABYLON.Color3(0.75, 0.55, 0.65);
            this.hemiLight.intensity = 0.55;
            this.scene.clearColor = new BABYLON.Color4(0.85, 0.52, 0.38, 1);
        } else if (hour > 18.5 || hour < 5.5) {
            this.sunLight.diffuse = new BABYLON.Color3(0.2, 0.3, 0.55);
            this.sunLight.intensity = 0.2;
            this.hemiLight.diffuse = new BABYLON.Color3(0.15, 0.2, 0.35);
            this.hemiLight.intensity = 0.35;
            this.scene.clearColor = new BABYLON.Color4(0.06, 0.09, 0.16, 1);
        } else {
            this.sunLight.diffuse = new BABYLON.Color3(1.0, 0.96, 0.88);
            this.sunLight.intensity = 1.15;
            this.hemiLight.diffuse = new BABYLON.Color3(0.75, 0.88, 1.0);
            this.hemiLight.groundColor = new BABYLON.Color3(0.32, 0.42, 0.25);
            this.hemiLight.intensity = 0.75;
            this.scene.clearColor = new BABYLON.Color4(0.55, 0.78, 0.95, 1);
        }
    }
}
