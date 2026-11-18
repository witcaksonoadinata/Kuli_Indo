import React, { useState } from "react";
import { OpeningType } from "../../construction/DoorWindowSnapSystem";
import { RoofStyle } from "../../construction/TraditionalRoofSystem";

interface Props {
    onSelectStiltFoundation: (stiltHeight: number) => void;
    onSelectOpeningTool: (type: OpeningType) => void;
    onBuildRoof: (style: RoofStyle, pitch: number) => void;
}

export const TraditionalArchPanel: React.FC<Props> = ({
    onSelectStiltFoundation,
    onSelectOpeningTool,
    onBuildRoof
}) => {
    const [stiltHeight, setStiltHeight] = useState<number>(1.2);
    const [roofStyle, setRoofStyle] = useState<RoofStyle>("PelanaGentengMerah");
    const [roofPitch, setRoofPitch] = useState<number>(34);

    return (
        <div style={{
            background: "rgba(24, 22, 20, 0.92)",
            padding: "16px",
            borderRadius: "10px",
            width: "340px",
            color: "white",
            pointerEvents: "auto",
            border: "1px solid #5d4037"
        }}>
            <h3 style={{ marginTop: 0, borderBottom: "1px solid #5d4037", paddingBottom: "8px", color: "#ffcc80" }}>
                🏛️ Arsitektur Rumah Panggung
            </h3>

            <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Tinggi Kolong Panggung: <strong>{stiltHeight.toFixed(1)} m</strong>
                </label>
                <input
                    type="range"
                    min={0.6}
                    max={2.2}
                    step={0.2}
                    value={stiltHeight}
                    onChange={(e) => setStiltHeight(Number(e.target.value))}
                    style={{ width: "100%", marginBottom: "6px" }}
                />
                <button
                    onClick={() => onSelectStiltFoundation(stiltHeight)}
                    style={{
                        width: "100%", padding: "8px", background: "#6d4c41",
                        color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                    }}
                >
                    🪵 Pasang Pondasi Kayu & Tangga
                </button>
            </div>

            <div style={{ marginBottom: "14px" }}>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "6px" }}>
                    Bukaan Pintu & Jendela (Snap ke Dinding):
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                    <button onClick={() => onSelectOpeningTool("PintuKayu")} style={btnStyle}>
                        🚪 Pintu Kayu
                    </button>
                    <button onClick={() => onSelectOpeningTool("PintuKupuTarung")} style={btnStyle}>
                        🚪 Pintu Kupu Tarung
                    </button>
                    <button onClick={() => onSelectOpeningTool("JendelaJalusi")} style={btnStyle}>
                        🪟 Jendela Jalusi
                    </button>
                    <button onClick={() => onSelectOpeningTool("JendelaKaca")} style={btnStyle}>
                        🪟 Jendela Kaca
                    </button>
                </div>
            </div>

            <div>
                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Model Atap Genteng Merah:
                </label>
                <select
                    value={roofStyle}
                    onChange={(e) => setRoofStyle(e.target.value as RoofStyle)}
                    style={{ width: "100%", padding: "6px", background: "#2c2522", color: "white", border: "1px solid #5d4037", borderRadius: "4px", marginBottom: "6px" }}
                >
                    <option value="PelanaGentengMerah">Atap Pelana (Rumah Kampung)</option>
                    <option value="LimasanGentengMerah">Atap Limasan Nusantara</option>
                </select>

                <label style={{ fontSize: "12px", display: "block", marginBottom: "4px" }}>
                    Kemiringan Atap: <strong>{roofPitch}°</strong>
                </label>
                <input
                    type="range"
                    min={24}
                    max={45}
                    step={2}
                    value={roofPitch}
                    onChange={(e) => setRoofPitch(Number(e.target.value))}
                    style={{ width: "100%", marginBottom: "8px" }}
                />

                <button
                    onClick={() => onBuildRoof(roofStyle, roofPitch)}
                    style={{
                        width: "100%", padding: "9px", background: "#b63b1c",
                        color: "white", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold"
                    }}
                >
                    🏠 Pasang Atap Genteng Merah
                </button>
            </div>
        </div>
    );
};

const btnStyle: React.CSSProperties = {
    padding: "7px 6px",
    background: "#3e2723",
    color: "white",
    border: "1px solid #5d4037",
    borderRadius: "5px",
    cursor: "pointer",
    fontSize: "12px"
};
