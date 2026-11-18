import * as BABYLON from "@babylonjs/core";
import { ParcelSystem } from "./ParcelSystem";

export type FoliageType = "Bambu" | "Palem" | "RumputLiar";

export class TropicalFoliageSystem {
    private scene: BABYLON.Scene;
    private parcel: ParcelSystem;
    private templates: Map<FoliageType, BABYLON.Mesh> = new Map();
    private placedFoliage: BABYLON.InstancedMesh[] = [];

    constructor(scene: BABYLON.Scene, parcel: ParcelSystem) {
        this.scene = scene;
        this.parcel = parcel;
        this.initTemplates();
    }

    private initTemplates() {
        const grassMesh = BABYLON.MeshBuilder.CreateCylinder("grassTpl", { height: 0.6, diameterTop: 0.05, diameterBottom: 0.3 }, this.scene);
        const grassMat = new BABYLON.StandardMaterial("grassMat", this.scene);
        grassMat.diffuseColor = new BABYLON.Color3(0.3, 0.65, 0.25);
        grassMat.specularColor = BABYLON.Color3.Black();
        grassMesh.material = grassMat;
        grassMesh.isVisible = false;
        this.templates.set("RumputLiar", grassMesh);

        const bambooMesh = BABYLON.MeshBuilder.CreateCylinder("bambooTpl", { height: 4.5, diameter: 0.18 }, this.scene);
        const bambooMat = new BABYLON.StandardMaterial("bambooMat", this.scene);
        bambooMat.diffuseColor = new BABYLON.Color3(0.45, 0.7, 0.3);
        bambooMat.specularColor = BABYLON.Color3.Black();
        bambooMesh.material = bambooMat;
        bambooMesh.isVisible = false;
        this.templates.set("Bambu", bambooMesh);

        const palmMesh = BABYLON.MeshBuilder.CreateCylinder("palmTpl", { height: 5.2, diameterTop: 0.2, diameterBottom: 0.35 }, this.scene);
        const palmMat = new BABYLON.StandardMaterial("palmMat", this.scene);
        palmMat.diffuseColor = new BABYLON.Color3(0.48, 0.34, 0.2);
        palmMat.specularColor = BABYLON.Color3.Black();
        palmMesh.material = palmMat;
        palmMesh.isVisible = false;
        this.templates.set("Palem", palmMesh);
    }

    public placeFoliage(type: FoliageType, position: BABYLON.Vector3): BABYLON.InstancedMesh | null {
        if (!this.parcel.isPositionInside(position)) return null;

        const template = this.templates.get(type);
        if (!template) return null;

        const instance = template.createInstance(`${type}_${Date.now()}_${Math.random()}`);
        instance.position = position.clone();
        instance.position.y += type === "RumputLiar" ? 0.3 : 2.25;
        instance.rotation.y = Math.random() * Math.PI * 2;

        const randomScale = 0.85 + Math.random() * 0.35;
        instance.scaling.setAll(randomScale);

        BABYLON.Tags.AddTagsTo(instance, `Foliage ${type}`);
        this.placedFoliage.push(instance);
        return instance;
    }

    public trimGrassInRadius(center: BABYLON.Vector3, radius: number): number {
        let trimmedCount = 0;
        this.placedFoliage = this.placedFoliage.filter(item => {
            if (!item.isDisposed() && BABYLON.Tags.MatchesQuery(item, "RumputLiar") && BABYLON.Vector3.Distance(item.position, center) <= radius) {
                item.dispose();
                trimmedCount++;
                return false;
            }
            return true;
        });
        return trimmedCount;
    }
}
