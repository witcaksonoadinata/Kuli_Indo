import { LocalJobData, QuestType } from "./QuestModel";

export class QuestRuntime {
    private activeJob: LocalJobData | null = null;
    private remainingBudget: number = 0;

    public onQuestProgressUpdated?: (job: LocalJobData, budgetLeft: number) => void;
    public onJobCompleted?: (job: LocalJobData) => void;

    public loadJob(jobData: LocalJobData) {
        this.activeJob = JSON.parse(JSON.stringify(jobData));
        this.remainingBudget = jobData.budget;
        this.notifyUI();
    }

    public recordAction(type: QuestType, roomId: string, assetId?: string, amount: number = 1, cost: number = 0) {
        if (!this.activeJob) return;

        this.remainingBudget -= cost;
        let anyUpdated = false;

        for (const obj of this.activeJob.objectives) {
            if (obj.isCompleted) continue;

            const matchType = obj.type === type;
            const matchRoom = obj.targetRoomId === roomId || obj.targetRoomId === "ANY";
            const matchAsset = !obj.targetAssetId || obj.targetAssetId === assetId;

            if (matchType && matchRoom && matchAsset) {
                obj.currentCount = Math.min(obj.requiredCount, obj.currentCount + amount);
                if (obj.currentCount >= obj.requiredCount) {
                    obj.isCompleted = true;
                }
                anyUpdated = true;
            }
        }

        if (anyUpdated || cost > 0) {
            this.notifyUI();
            this.checkAllCompleted();
        }
    }

    private checkAllCompleted() {
        if (!this.activeJob) return;
        const allDone = this.activeJob.objectives.every(o => o.isCompleted);
        if (allDone && this.onJobCompleted) {
            this.onJobCompleted(this.activeJob);
        }
    }

    private notifyUI() {
        if (this.activeJob && this.onQuestProgressUpdated) {
            this.onQuestProgressUpdated(this.activeJob, this.remainingBudget);
        }
    }
}
