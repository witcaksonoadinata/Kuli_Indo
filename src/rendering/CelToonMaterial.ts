import * as BABYLON from "@babylonjs/core";

export const LOCAL_TOON_PALETTE = {
    BataGentengMerah: "#B63B1C",
    PlesterKapur: "#D8C3A5",
    BetonKusam: "#E0D5B8",
    KayuPanggung: "#A0522D",
    KayuGelap: "#5C4033",
    BatangBambu: "#B4A56F",
    DaunBambu: "#7FB77E",
    RumputTropis: "#5DA43C",
    TanahMerah: "#8B5A2B",
    SengKarat: "#C1440E"
} as const;

BABYLON.Effect.ShadersStore["celToonVertexShader"] = `
    precision highp float;

    attribute vec3 position;
    attribute vec3 normal;
    attribute vec2 uv;

    uniform mat4 world;
    uniform mat4 worldViewProjection;
    uniform vec2 uUvScale;

    varying vec3 vNormalW;
    varying vec3 vPositionW;
    varying vec2 vUV;

    void main(void) {
        vec4 worldPos = world * vec4(position, 1.0);
        vPositionW = worldPos.xyz;
        vNormalW = normalize(mat3(world) * normal);
        vUV = uv * uUvScale;
        gl_Position = worldViewProjection * vec4(position, 1.0);
    }
`;

BABYLON.Effect.ShadersStore["celToonFragmentShader"] = `
    precision highp float;

    varying vec3 vNormalW;
    varying vec3 vPositionW;
    varying vec2 vUV;

    uniform vec3 uLightDir;
    uniform vec3 uCameraPosition;
    uniform vec3 uDiffuseColor;
    uniform sampler2D uDiffuseSampler;
    uniform float uHasTexture;
    uniform vec3 uRimColor;
    uniform float uRimPower;
    uniform float uRimIntensity;

    void main(void) {
        vec3 N = normalize(vNormalW);
        vec3 L = normalize(-uLightDir);
        vec3 V = normalize(uCameraPosition - vPositionW);

        float NdotL = max(dot(N, L), 0.0);
        float toonBand;
        if (NdotL > 0.66) {
            toonBand = 1.0;
        } else if (NdotL > 0.33) {
            toonBand = 0.62;
        } else {
            toonBand = 0.35;
        }

        vec3 baseColor = uDiffuseColor;
        if (uHasTexture > 0.5) {
            baseColor *= texture2D(uDiffuseSampler, vUV).rgb;
        }

        vec3 shadedColor = baseColor * toonBand;
        float rimFactor = pow(1.0 - max(dot(N, V), 0.0), uRimPower);
        shadedColor += rimFactor * uRimColor * uRimIntensity;

        gl_FragColor = vec4(shadedColor, 1.0);
    }
`;

export interface ToonMaterialOptions {
    hexColor?: string;
    textureUrl?: string;
    uScale?: number;
    vScale?: number;
    rimIntensity?: number;
}

export class CelToonMaterialManager {
    private scene: BABYLON.Scene;
    private activeMaterials: BABYLON.ShaderMaterial[] = [];
    private currentLightDir: BABYLON.Vector3 = new BABYLON.Vector3(-0.5, -1.0, 0.4).normalize();

    constructor(scene: BABYLON.Scene) {
        this.scene = scene;

        this.scene.onBeforeRenderObservable.add(() => {
            const camPos = this.scene.activeCamera?.position || BABYLON.Vector3.Zero();
            for (const mat of this.activeMaterials) {
                mat.setVector3("uCameraPosition", camPos);
            }
        });
    }

    public createToonMaterial(name: string, options: ToonMaterialOptions = {}): BABYLON.ShaderMaterial {
        const shaderMat = new BABYLON.ShaderMaterial(
            name,
            this.scene,
            { vertex: "celToon", fragment: "celToon" },
            {
                attributes: ["position", "normal", "uv"],
                uniforms: [
                    "world",
                    "worldViewProjection",
                    "uUvScale",
                    "uLightDir",
                    "uCameraPosition",
                    "uDiffuseColor",
                    "uHasTexture",
                    "uRimColor",
                    "uRimPower",
                    "uRimIntensity"
                ],
                samplers: ["uDiffuseSampler"]
            }
        );

        const baseColor = BABYLON.Color3.FromHexString(options.hexColor || "#FFFFFF");
        shaderMat.setColor3("uDiffuseColor", baseColor);
        shaderMat.setVector2("uUvScale", new BABYLON.Vector2(options.uScale ?? 1, options.vScale ?? 1));
        shaderMat.setVector3("uLightDir", this.currentLightDir);
        shaderMat.setVector3("uCameraPosition", this.scene.activeCamera?.position || BABYLON.Vector3.Zero());

        shaderMat.setColor3("uRimColor", new BABYLON.Color3(1.0, 0.96, 0.84));
        shaderMat.setFloat("uRimPower", 3.5);
        shaderMat.setFloat("uRimIntensity", options.rimIntensity ?? 0.22);

        if (options.textureUrl) {
            const tex = new BABYLON.Texture(options.textureUrl, this.scene);
            shaderMat.setTexture("uDiffuseSampler", tex);
            shaderMat.setFloat("uHasTexture", 1.0);
        } else {
            shaderMat.setFloat("uHasTexture", 0.0);
        }

        this.activeMaterials.push(shaderMat);
        return shaderMat;
    }

    public syncSunDirection(direction: BABYLON.Vector3) {
        this.currentLightDir = direction.clone().normalize();
        for (const mat of this.activeMaterials) {
            mat.setVector3("uLightDir", this.currentLightDir);
        }
    }
}
