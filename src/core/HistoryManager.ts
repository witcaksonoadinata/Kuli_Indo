import { Command } from "./Command";

export class HistoryManager {
    private undoStack: Command[] = [];
    private redoStack: Command[] = [];

    public executeCommand(command: Command) {
        command.execute();
        this.undoStack.push(command);
        this.redoStack = [];
    }

    public undo() {
        if (this.undoStack.length === 0) return;
        const command = this.undoStack.pop();
        if (command) {
            command.undo();
            this.redoStack.push(command);
        }
    }

    public redo() {
        if (this.redoStack.length === 0) return;
        const command = this.redoStack.pop();
        if (command) {
            command.execute();
            this.undoStack.push(command);
        }
    }

    public getHistoryForSave(): any[] {
        return this.undoStack.map(cmd => cmd.serialize());
    }
}
