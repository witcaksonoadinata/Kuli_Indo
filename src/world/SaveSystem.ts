import { HistoryManager } from "../core/HistoryManager";

export class SaveSystem {
    private history: HistoryManager;

    constructor(history: HistoryManager) {
        this.history = history;
    }

    public saveProject(projectName: string): string {
        const projectData = {
            version: "1.0",
            name: projectName,
            timestamp: new Date().toISOString(),
            actions: this.history.getHistoryForSave()
        };

        const jsonString = JSON.stringify(projectData, null, 2);
        this.downloadJSON(jsonString, `${projectName}_save.json`);
        return jsonString;
    }

    private downloadJSON(content: string, fileName: string) {
        const blob = new Blob([content], { type: "application/json" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
