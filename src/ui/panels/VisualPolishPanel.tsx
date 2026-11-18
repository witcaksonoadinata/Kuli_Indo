import React, { useState } from "react";
import { VisualPolishPipeline } from "../../rendering/VisualPolishPipeline";
import { LOCAL_TOON_PALETTE } from "../../rendering/CelToonMaterial";

interface Props {
    pipeline: VisualPolishPipeline;
}

export const VisualPolishPanel: React.FC<Props> = ({ pipeline }) => {
    const [edgeWidth, setEdgeWidth] = useState<number>(0.125);
    const [contrast, setContrast] = useState<number>(1.18);
    const [fogDensity, setFogDensity] = useState<number>(0.008);
    const [ssaoActive, setSsaoActive] = useState<boolean>(true);

    const handleEdgeChange = (val: number) => {
        setEdgeWidth(val);
        pipeline.setOutlineWidth(val);
    };

    const handleContrastChange = (val: number) => {
        setContrast(val);
        pipeline.setContrast(val);
    };

    const handleFogChange = (val: number) => {
        setFogDensity(val);
        pipeline.setFogDensity(val);
    };

    const handleSsaoToggle = () => {
        const next = !ssaoActive;
        setSsaoActive(next);
        pipeline.setSSAOEnabled(next);
    };

    return (
        <div style={{
            background: "rgba(18, 20, 26, 0.92)",
            padding: "16px",
            borderRadius: "10px",
            width: "320px",
            color: "white",
            pointerEvents: "auto",
            border: "1px solid #455a64"
        }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #455a64", paddingBottom: "8px", color: "#80cbc4" }}>
                🎨 Kalibrasi Cel-Shading & SSAO
            </h3>

            <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Ketebalan Outline (EdgeWidth): <strong>{edgeWidth.toFixed(3)}</strong>
                </label>
                <input
                    type="range"
                    min={0.05}
                    max={0.35}
                    step={0.005}
                    value={edgeWidth}
                    onChange={(e) => handleEdgeChange(Number(e.target.value))}
                    style={{ width: "100%" }}
                />
            </div>

            <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Kontras Warna Anime: <strong>{contrast.toFixed(2)}</strong>
                </label>
                <input
                    type="range"
                    min={0.9}
                    max={1.5}
                    step={0.02}
                    value={contrast}
                    onChange={(e) => handleContrastChange(Number(e.target.value))}
                    style={{ width: "100%" }}
                />
            </div>

            <div style={{ marginBottom: "12px" }}>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Kabut Tropis (Fog Density): <strong>{fogDensity.toFixed(3)}</strong>
                </label>
                <input
                    type="range"
                    min={0}
                    max={0.025}
                    step={0.001}
                    value={fogDensity}
                    onChange={(e) => handleFogChange(Number(e.target.value))}
                    style={{ width: "100%" }}
                />
            </div>

            <button
                onClick={handleSsaoToggle}
                style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "14px",
                    background: ssaoActive ? "#00897b" : "#37474f",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "12px"
                }}
            >
                {ssaoActive ? "✅ SSAO Sudut Bangunan: AKTIF" : "⬜ SSAO Sudut Bangunan: NONAKTIF"}
            </button>

            <div>
                <span style={{ fontSize: "11px", color: "#b0bec5", display: "block", marginBottom: "6px" }}>
                    Palet Warna Standar Nusantara:
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "6px" }}>
                    {Object.entries(LOCAL_TOON_PALETTE).map(([label, hex]) => (
                        <div key={label} title={`${label} (${hex})`} style={{ textAlign: "center" }}>
                            <div style={{
                                width: "100%",
                                height: "24px",
                                background: hex,
                                borderRadius: "4px",
                                border: "1px solid #111"
                            }} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
