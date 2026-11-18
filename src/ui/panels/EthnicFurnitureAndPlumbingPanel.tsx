import React, { useState } from "react";
import {
    EthnicFurnitureDatabase,
    FurnitureCategory
} from "../../data/catalogs/EthnicFurnitureCatalog";
import { FurniturePlacementSystem } from "../../objects/FurniturePlacementSystem";
import { InWallPlumbingTool, PipeLineType } from "../../plumbing/InWallPlumbingSystem";

interface Props {
    furnitureSystem: FurniturePlacementSystem;
    plumbingTool: InWallPlumbingTool;
    onSelectFurnitureMode?: () => void;
    onTogglePlumbingMode?: (enabled: boolean) => void;
}

const CATEGORIES: FurnitureCategory[] = ["Teras & Tamu", "Dapur & Air", "Sanitasi & Sumur"];

export const EthnicFurnitureAndPlumbingPanel: React.FC<Props> = ({
    furnitureSystem,
    plumbingTool,
    onSelectFurnitureMode,
    onTogglePlumbingMode
}) => {
    const [activeTab, setActiveTab] = useState<FurnitureCategory>("Teras & Tamu");
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [plumbingXRay, setPlumbingXRay] = useState<boolean>(false);
    const [pipeType, setPipeType] = useState<PipeLineType>("AirBersih");

    const handleSelectFurniture = (id: string) => {
        setSelectedItemId(id);
        furnitureSystem.selectFurnitureById(id);
        if (plumbingXRay) {
            setPlumbingXRay(false);
            plumbingTool.setPlumbingViewMode(false);
        }
        onSelectFurnitureMode?.();
    };

    const togglePlumbingMode = () => {
        const next = !plumbingXRay;
        setPlumbingXRay(next);
        plumbingTool.setPlumbingViewMode(next);
        onTogglePlumbingMode?.(next);
    };

    const handlePipeTypeChange = (type: PipeLineType) => {
        setPipeType(type);
        plumbingTool.activePipeType = type;
    };

    const filteredItems = EthnicFurnitureDatabase.filter(item => item.category === activeTab);

    return (
        <div style={{
            background: "rgba(22, 20, 18, 0.92)",
            padding: "16px",
            borderRadius: "10px",
            width: "360px",
            color: "white",
            pointerEvents: "auto",
            border: "1px solid #6d4c41"
        }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #6d4c41", paddingBottom: "8px", color: "#ffe082" }}>
                🪑 Katalog Perabot Etnik & Utilitas Air
            </h3>

            <div style={{
                background: "#1c262b",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "14px",
                border: "1px solid #29b6f6"
            }}>
                <button
                    onClick={togglePlumbingMode}
                    style={{
                        width: "100%",
                        padding: "8px",
                        background: plumbingXRay ? "#0288d1" : "#263238",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        fontSize: "12px"
                    }}
                >
                    {plumbingXRay ? "🚰 Mode Perpipaan (X-Ray Dinding): AKTIF" : "🔧 Buka Mode Perpipaan Dalam Dinding"}
                </button>

                {plumbingXRay && (
                    <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                        <button
                            onClick={() => handlePipeTypeChange("AirBersih")}
                            style={{
                                flex: 1,
                                padding: "6px",
                                background: pipeType === "AirBersih" ? "#039be5" : "#37474f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px"
                            }}
                        >
                            💧 Pipa Air Bersih
                        </button>
                        <button
                            onClick={() => handlePipeTypeChange("Pembuangan")}
                            style={{
                                flex: 1,
                                padding: "6px",
                                background: pipeType === "Pembuangan" ? "#6d4c41" : "#37474f",
                                color: "white",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "11px"
                            }}
                        >
                            🕳️ Pipa Pembuangan
                        </button>
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "5px", marginBottom: "10px" }}>
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveTab(cat)}
                        style={{
                            flex: 1,
                            padding: "6px 4px",
                            background: activeTab === cat ? "#8d6e63" : "#2e2927",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "11px",
                            fontWeight: activeTab === cat ? "bold" : "normal"
                        }}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "11px", color: "#bcaaa4" }}>Klik lantai/panggung untuk menaruh</span>
                <button
                    onClick={() => furnitureSystem.rotatePreview(Math.PI / 4)}
                    style={{
                        padding: "4px 10px",
                        background: "#4e342e",
                        color: "white",
                        border: "1px solid #8d6e63",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "11px"
                    }}
                >
                    🔄 Putar 45°
                </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "260px", overflowY: "auto" }}>
                {filteredItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => handleSelectFurniture(item.id)}
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            background: selectedItemId === item.id ? "#3e2723" : "#262220",
                            border: selectedItemId === item.id ? "1px solid #ffb300" : "1px solid #3e3835",
                            cursor: "pointer"
                        }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "13px" }}>{item.name}</strong>
                            <span style={{ fontSize: "11px", color: "#a5d6a7", fontWeight: "bold" }}>
                                Rp {item.price.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <div style={{ fontSize: "11px", color: "#bdbdbd", marginTop: "4px" }}>
                            Asal: {item.regionOrigin} • Bahan: {item.primaryMaterial}
                        </div>
                        {item.plumbingRole !== "None" && (
                            <span style={{
                                display: "inline-block",
                                marginTop: "5px",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                fontSize: "10px",
                                background: item.plumbingRole === "WaterSource" ? "#01579b" : "#006064",
                                color: "#e0f7fa"
                            }}>
                                {item.plumbingRole === "WaterSource" ? "🚰 Sumber Air Utama" : "💧 Memerlukan Pipa Air"}
                            </span>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};
