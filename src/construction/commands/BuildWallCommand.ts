import * as BABYLON from "@babylonjs/core";
import { Command } from "../../core/Command";
import { WallSegmentComponent } from "../WallSegmentComponent";

export class BuildWallCommand implements Command {
    private scene: BABYLON.Scene;
    private template: BABYLON.Mesh;
    private start: BABYLON.Vector3;
    private end: BABYLON.Vector3;
    private builtSegments: BABYLON.InstancedMesh[] = [];

    constructor(scene: BABYLON.Scene, template: BABYLON.Mesh, start: BABYLON.Vector3, end: BABYLON.Vector3) {
        this.scene = scene;
        this.template = template;
        this.start = start.clone();
        this.end = end.clone();
    }

    public execute(): void {
        const distance = BABYLON.Vector3.Distance(this.start, this.end);
        const segmentWidth = 1.0;
        const numSegments = Math.max(1, Math.round(distance / segmentWidth));

        const direction = distance > 0.001
            ? this.end.subtract(this.start).normalize()
            : new BABYLON.Vector3(1, 0, 0);
        const angle = Math.atan2(direction.x, direction.z) + Math.PI / 2;

        for (let i = 0; i < numSegments; i++) {
            const segment = this.template.createInstance(`wall_segment_${Date.now()}_${i}`);
            segment.position = this.start.add(direction.scale((i + 0.5) * segmentWidth));
            segment.position.y += 1.5;
            segment.rotation.y = angle;

            BABYLON.Tags.AddTagsTo(segment, "WallSegment");
            new WallSegmentComponent(segment, 3);
            this.builtSegments.push(segment);
        }
    }

    public undo(): void {
        this.builtSegments.forEach(seg => seg.dispose());
        this.builtSegments = [];
    }

    public serialize(): any {
        return {
            type: "BuildWall",
            start: { x: this.start.x, y: this.start.y, z: this.start.z },
            end: { x: this.end.x, y: this.end.y, z: this.end.z }
        };
    }
}
