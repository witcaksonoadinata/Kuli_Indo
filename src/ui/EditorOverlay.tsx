import React, { useEffect, useState } from "react";
import { GameBootstrap, UnifiedEditorSnapshot, UnifiedToolMode } from "../app/GameBootstrap";
import { TimePreset } from "../world/EnvironmentTimeSystem";
import { TerrainLayerType } from "../world/TerrainPaintSystem";

import { TraditionalArchPanel } from "./panels/TraditionalArchPanel";
import { EthnicFurnitureAndPlumbingPanel } from "./panels/EthnicFurnitureAndPlumbingPanel";
import { JobCreatorPanel } from "./panels/JobCreatorPanel";
import { VisualPolishPanel } from "./panels/VisualPolishPanel";
import { CleaningHudWidget } from "./panels/CleaningHudWidget";
import { MaterialDatabase, MaterialCategory } from "../data/catalogs/LocalMaterialCatalog";

interface Props {
    bootstrap: GameBootstrap;
}

type DrawerTab = "Arsitektur" | "Material" | "PerabotPipa" | "JobCreator" | "Visual";

const TIME_PRESETS: TimePreset[] = ["Pagi", "Siang", "Senja", "Malam"];
const TERRAIN_LAYERS: TerrainLayerType[] = ["RumputTropis", "TanahMerah", "PasirPesisir", "LumpurSawah", "BatuSetapak"];
const MAT_CATEGORIES: MaterialCategory[] = ["Plester", "Tegel", "Kayu", "Anyaman"];

export const EditorOverlay: React.FC<Props> = ({ bootstrap }) => {
    const [snapshot, setSnapshot] = useState<UnifiedEditorSnapshot>(() => bootstrap.getSnapshot());
    const [activeDrawer, setActiveDrawer] = useState<DrawerTab>("Arsitektur");
    const [matCategory, setMatCategory] = useState<MaterialCategory>("Anyaman");

    useEffect(() => {
        bootstrap.onSnapshotChanged = (nextSnap) => {
            setSnapshot({ ...nextSnap });
        };
    }, [bootstrap]);

    const toolButton = (mode: UnifiedToolMode, label: string) => {
        const isActive = snapshot.activeTool === mode;
        return (
            <button
                key={mode}
                onClick={() => bootstrap.setToolMode(mode)}
                style={{
                    padding: "7px 10px",
                    textAlign: "left",
                    background: isActive ? "#2e7d32" : "#252830",
                    color: "white",
                    border: isActive ? "1px solid #81c784" : "1px solid #3a3f4b",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    fontWeight: isActive ? "bold" : "normal"
                }}
            >
                {label}
            </button>
        );
    };

    return (
        <div style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            fontFamily: "system-ui, -apple-system, sans-serif",
            zIndex: 10
        }}>
            {/* BAR ATAS */}
            <div style={{
                position: "absolute",
                top: 14,
                left: 14,
                right: 14,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: "12px"
            }}>
                <div style={{
                    background: "rgba(18, 20, 26, 0.9)",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: "1px solid #374151",
                    pointerEvents: "auto",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flexWrap: "wrap",
                    color: "white"
                }}>
                    <strong style={{ fontSize: "13px", color: "#ffcc80", marginRight: "4px" }}>
                        🏡 Nusantara Flipper
                    </strong>

                    {TIME_PRESETS.map(preset => (
                        <button
                            key={preset}
                            onClick={() => bootstrap.setTimePreset(preset)}
                            style={{
                                padding: "5px 9px",
                                borderRadius: "5px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "11px",
                                background: snapshot.activeTimePreset === preset ? "#ef6c00" : "#2d323e",
                                color: "white",
                                fontWeight: snapshot.activeTimePreset === preset ? "bold" : "normal"
                            }}
                        >
                            {preset}
                        </button>
                    ))}

                    <span style={{ color: "#555" }}>|</span>

                    <button onClick={() => bootstrap.toggleGridSnap()} style={topSysBtnStyle}>
                        🧲 Snap: {snapshot.snapEnabled ? "ON" : "OFF"}
                    </button>
                    <button onClick={() => bootstrap.undo()} style={topSysBtnStyle}>↩️ Undo</button>
                    <button onClick={() => bootstrap.redo()} style={topSysBtnStyle}>↪️ Redo</button>
                    <button
                        onClick={() => bootstrap.saveProjectJSON()}
                        style={{ ...topSysBtnStyle, background: "#2e7d32", fontWeight: "bold" }}
                    >
                        💾 Ekspor JSON
                    </button>
                </div>

                {snapshot.activeJob && (
                    <div style={{
                        background: "rgba(22, 24, 30, 0.92)",
                        padding: "10px 14px",
                        borderRadius: "10px",
                        border: "1px solid #5d4037",
                        pointerEvents: "auto",
                        color: "white",
                        width: "340px"
                    }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "12px", color: "#ffe082" }}>
                                📜 {snapshot.activeJob.title}
                            </strong>
                            <span style={{ fontSize: "11px", color: "#a5d6a7", fontWeight: "bold" }}>
                                Sisa: Rp {snapshot.remainingBudget.toLocaleString("id-ID")}
                            </span>
                        </div>
                        <ul style={{ margin: "6px 0 0 0", paddingLeft: "16px", fontSize: "11px", color: "#e0e0e0" }}>
                            {snapshot.activeJob.objectives.map(obj => (
                                <li key={obj.id} style={{
                                    textDecoration: obj.isCompleted ? "line-through" : "none",
                                    color: obj.isCompleted ? "#81c784" : "#f5f5f5",
                                    marginBottom: "2px"
                                }}>
                                    {obj.description} ({obj.currentCount}/{obj.requiredCount})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* DOK KIRI */}
            <div style={{
                position: "absolute",
                top: 76,
                left: 14,
                width: "215px",
                background: "rgba(18, 20, 26, 0.9)",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #374151",
                pointerEvents: "auto",
                color: "white",
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                maxHeight: "calc(100vh - 135px)",
                overflowY: "auto"
            }}>
                <span style={sectionLabelStyle}>TRANSFORMASI (TAHAP 1)</span>
                {toolButton("Move", "↔️ Pindah Objek")}
                {toolButton("Rotate", "🔄 Putar Objek")}
                {toolButton("Resize", "📏 Ubah Skala")}

                <span style={sectionLabelStyle}>KONSTRUKSI (TAHAP 2)</span>
                {toolButton("BuildWall", "🧱 Tarik Dinding Bilik/Bata")}
                {toolButton("Demolish", "🔨 Palu Godam (Segmen)")}

                <span style={sectionLabelStyle}>PEMBERSIHAN (TAHAP 4)</span>
                {toolButton("TrashBag", "🗑️ Kantong Sampah")}
                {toolButton("CleanStain", "🧽 Sikat Noda Lumpur")}
                {toolButton("Squeegee", "🪟 Squeegee Jendela")}

                <span style={sectionLabelStyle}>UTILITAS (TAHAP 5)</span>
                {toolButton("Wiring", "⚡ Edit Wiring Listrik")}
                {toolButton("Plumbing", "🚰 Pipa Dalam Dinding")}

                <span style={sectionLabelStyle}>LANSKAP & TANAH (TAHAP 3)</span>
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                    {TERRAIN_LAYERS.map(layer => (
                        <button
                            key={layer}
                            onClick={() => bootstrap.selectTerrainLayer(layer)}
                            style={{
                                padding: "4px 6px",
                                fontSize: "10px",
                                borderRadius: "4px",
                                border: "1px solid #4b5563",
                                background: "#262b36",
                                color: "#e5e7eb",
                                cursor: "pointer"
                            }}
                        >
                            🎨 {layer}
                        </button>
                    ))}
                </div>
                <div style={{ display: "flex", gap: "4px", marginTop: "2px" }}>
                    <button onClick={() => bootstrap.selectFoliageType("Bambu")} style={miniActionBtn}>🎋 Bambu</button>
                    <button onClick={() => bootstrap.selectFoliageType("RumputLiar")} style={miniActionBtn}>🌿 Rumput</button>
                    {toolButton("TrimGrass", "✂️ Babat")}
                </div>
            </div>

            {/* LACI KONTEKSTUAL KANAN */}
            <div style={{
                position: "absolute",
                top: 118,
                right: 14,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "8px"
            }}>
                <div style={{
                    display: "flex",
                    gap: "4px",
                    background: "rgba(18, 20, 26, 0.92)",
                    padding: "6px",
                    borderRadius: "8px",
                    border: "1px solid #374151",
                    pointerEvents: "auto"
                }}>
                    {(["Arsitektur", "Material", "PerabotPipa", "JobCreator", "Visual"] as DrawerTab[]).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveDrawer(tab)}
                            style={{
                                padding: "6px 9px",
                                borderRadius: "5px",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "11px",
                                fontWeight: "bold",
                                background: activeDrawer === tab ? "#d84315" : "#2b303b",
                                color: "white"
                            }}
                        >
                            {tab === "PerabotPipa" ? "Perabot & Pipa" : tab}
                        </button>
                    ))}
                </div>

                {activeDrawer === "Arsitektur" && (
                    <TraditionalArchPanel
                        onSelectStiltFoundation={(h) => bootstrap.startStiltFoundationPlacement(h)}
                        onSelectOpeningTool={(type) => bootstrap.startOpeningPlacement(type)}
                        onBuildRoof={(style, pitch) => bootstrap.buildDefaultRoofOnPlatform(style, pitch)}
                    />
                )}

                {activeDrawer === "Material" && (
                    <div style={{
                        background: "rgba(20, 22, 26, 0.92)",
                        padding: "15px",
                        borderRadius: "10px",
                        width: "340px",
                        pointerEvents: "auto",
                        color: "white",
                        border: "1px solid #4b5563"
                    }}>
                        <h3 style={{ marginTop: 0, borderBottom: "1px solid #4b5563", paddingBottom: "8px" }}>
                            🖌️ Material Nusantara (Painter's Tape)
                        </h3>
                        <div style={{ display: "flex", gap: "5px", marginBottom: "12px" }}>
                            {MAT_CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setMatCategory(cat)}
                                    style={{
                                        flex: 1,
                                        padding: "6px 4px",
                                        cursor: "pointer",
                                        background: matCategory === cat ? "#2e7d32" : "#333",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        fontSize: "11px"
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                            {MaterialDatabase.filter(m => m.category === matCategory).map(mat => (
                                <button
                                    key={mat.id}
                                    onClick={() => bootstrap.selectLocalMaterial(mat.id)}
                                    style={{
                                        background: "#262930",
                                        color: "white",
                                        border: "1px solid #4b5563",
                                        borderRadius: "6px",
                                        padding: "10px 8px",
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        textAlign: "center"
                                    }}
                                >
                                    {mat.name}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeDrawer === "PerabotPipa" && (
                    <EthnicFurnitureAndPlumbingPanel
                        furnitureSystem={bootstrap.furnitureSystem}
                        plumbingTool={bootstrap.plumbingTool}
                        onSelectFurnitureMode={() => bootstrap.setToolMode("PlaceFurniture", "Klik lantai tanah atau dek panggung untuk meletakkan perabot.")}
                        onTogglePlumbingMode={(enabled) => bootstrap.setToolMode(enabled ? "Plumbing" : "Move")}
                    />
                )}

                {activeDrawer === "JobCreator" && (
                    <JobCreatorPanel
                        onSaveJobTemplate={(newJob) => bootstrap.activateJobScenario(newJob)}
                    />
                )}

                {activeDrawer === "Visual" && (
                    <VisualPolishPanel pipeline={bootstrap.visualPipeline} />
                )}
            </div>

            {/* HUD KANTONG SAMPAH */}
            <CleaningHudWidget
                trashBagTool={bootstrap.trashBagTool}
                stainCleanerTool={bootstrap.stainCleaner}
            />

            {/* BAR STATUS BAWAH */}
            <div style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                background: "rgba(15, 17, 22, 0.88)",
                color: "#e2e8f0",
                padding: "8px 14px",
                borderRadius: "8px",
                fontSize: "12px",
                border: "1px solid #334155"
            }}>
                <strong>Status:</strong> {snapshot.statusMessage} &nbsp;|&nbsp;
                <span style={{ color: "#94a3b8" }}>WASD + Mouse: Kamera • G: Grid • R: Putar • F: Scanner Kotoran</span>
            </div>
        </div>
    );
};

const topSysBtnStyle: React.CSSProperties = {
    padding: "5px 9px",
    background: "#2d323e",
    color: "white",
    border: "1px solid #4b5563",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "11px"
};

const sectionLabelStyle: React.CSSProperties = {
    fontSize: "10px",
    fontWeight: "bold",
    color: "#9ca3af",
    marginTop: "6px",
    letterSpacing: "0.04em"
};

const miniActionBtn: React.CSSProperties = {
    flex: 1,
    padding: "6px 4px",
    background: "#252830",
    color: "white",
    border: "1px solid #3a3f4b",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "11px"
};
