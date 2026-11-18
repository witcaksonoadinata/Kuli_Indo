import { Command } from "../../core/Command";
import { WallSegmentComponent } from "../../construction/WallSegmentComponent";

export class DestroyWallCommand implements Command {
    private wallComp: WallSegmentComponent;

    constructor(wallComp: WallSegmentComponent) {
        this.wallComp = wallComp;
    }

    public execute(): void {
        this.wallComp.mesh.setEnabled(false);
    }

    public undo(): void {
        this.wallComp.restore();
    }

    public serialize(): any {
        return {
            type: "DestroyWall",
            id: this.wallComp.mesh.id
        };
    }
}
