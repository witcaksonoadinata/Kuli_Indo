export type QuestType = "CleanTrash" | "CleanStain" | "BuildWall" | "DemolishWall" | "PaintSurface" | "PlaceItem";

export interface QuestObjective {
    id: string;
    type: QuestType;
    description: string;
    targetRoomId: string;
    targetAssetId?: string;
    requiredCount: number;
    currentCount: number;
    isCompleted: boolean;
}

export interface LocalJobData {
    jobId: string;
    title: string;
    clientName: string;
    regionContext: string;
    storyBrief: string;
    budget: number;
    reward: number;
    objectives: QuestObjective[];
}
