import React, { useState } from "react";
import { LocalJobData, QuestObjective } from "../../quests/QuestModel";

interface Props {
    onSaveJobTemplate: (job: LocalJobData) => void;
}

export const JobCreatorPanel: React.FC<Props> = ({ onSaveJobTemplate }) => {
    const [title, setTitle] = useState("Perbaikan Pendopo & Teras");
    const [clientName, setClientName] = useState("Pak Raden");
    const [regionContext, setRegionContext] = useState("Arsitektur Joglo - Jawa");
    const [storyBrief, setStoryBrief] = useState("Angin kencang semalam merusak dinding anyaman di serambi. Tolong ganti dengan gedek baru dan pasang tegel kunci agar nyaman untuk berkumpul warga.");
    const [budget, setBudget] = useState(5000000);
    const [objectives, setObjectives] = useState<QuestObjective[]>([
        {
            id: "obj_1",
            type: "PaintSurface",
            description: "Lapisi dinding serambi dengan Gedek (Anyaman Bambu)",
            targetRoomId: "room_serambi",
            targetAssetId: "mat_anyaman_bambu",
            requiredCount: 4,
            currentCount: 0,
            isCompleted: false
        }
    ]);

    const addObjective = () => {
        const newObj: QuestObjective = {
            id: `obj_${Date.now()}`,
            type: "PlaceItem",
            description: "Tempatkan Kursi Rotan Teras",
            targetRoomId: "room_serambi",
            targetAssetId: "item_kursi_rotan",
            requiredCount: 2,
            currentCount: 0,
            isCompleted: false
        };
        setObjectives([...objectives, newObj]);
    };

    const handleExport = () => {
        const jobData: LocalJobData = {
            jobId: `job_${Date.now()}`,
            title,
            clientName,
            regionContext,
            storyBrief,
            budget,
            reward: Math.round(budget * 0.25),
            objectives
        };
        onSaveJobTemplate(jobData);
    };

    return (
        <div style={{ background: "rgba(25, 25, 30, 0.92)", padding: "18px", borderRadius: "8px", width: "380px", color: "white", pointerEvents: "auto" }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #555", paddingBottom: "8px" }}>📜 Job Creator (Skenario Lokal)</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
                <label>Judul Pekerjaan:</label>
                <input value={title} onChange={e => setTitle(e.target.value)} style={{ padding: "6px", background: "#222", color: "white", border: "1px solid #444" }} />

                <div style={{ display: "flex", gap: "8px" }}>
                    <div style={{ flex: 1 }}>
                        <label>Nama Klien:</label>
                        <input value={clientName} onChange={e => setClientName(e.target.value)} style={{ width: "100%", padding: "6px", background: "#222", color: "white", border: "1px solid #444" }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label>Konteks Budaya:</label>
                        <input value={regionContext} onChange={e => setRegionContext(e.target.value)} style={{ width: "100%", padding: "6px", background: "#222", color: "white", border: "1px solid #444" }} />
                    </div>
                </div>

                <label>Surat / Cerita Klien:</label>
                <textarea rows={3} value={storyBrief} onChange={e => setStoryBrief(e.target.value)} style={{ padding: "6px", background: "#222", color: "white", border: "1px solid #444" }} />

                <label>Anggaran Klien (Rp):</label>
                <input type="number" value={budget} onChange={e => setBudget(Number(e.target.value))} style={{ padding: "6px", background: "#222", color: "white", border: "1px solid #444" }} />
            </div>

            <hr style={{ borderColor: "#444", margin: "12px 0" }} />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong>Daftar Tugas ({objectives.length})</strong>
                <button onClick={addObjective} style={{ padding: "4px 8px", background: "#2196F3", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}>
                    + Tambah Tugas
                </button>
            </div>

            <ul style={{ paddingLeft: "18px", fontSize: "12px", maxHeight: "120px", overflowY: "auto" }}>
                {objectives.map(obj => (
                    <li key={obj.id} style={{ marginBottom: "4px" }}>
                        [{obj.type}] {obj.description} (Target: {obj.requiredCount})
                    </li>
                ))}
            </ul>

            <button onClick={handleExport} style={{ width: "100%", marginTop: "10px", padding: "10px", background: "#4CAF50", color: "white", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
                Aktifkan Skenario Job
            </button>
        </div>
    );
};
