import React, { useEffect, useState } from "react";
import { TrashBagTool, TrashBagState } from "../../cleaning/TrashBagSystem";
import { StainCleanerTool } from "../../cleaning/StainCleanerSystem";

interface Props {
    trashBagTool: TrashBagTool;
    stainCleanerTool: StainCleanerTool;
}

export const CleaningHudWidget: React.FC<Props> = ({ trashBagTool, stainCleanerTool }) => {
    const [bagState, setBagState] = useState<TrashBagState>({
        currentCount: 0,
        maxCapacity: 5,
        isFull: false,
        isTied: false,
        holdProgress: 0
    });

    useEffect(() => {
        trashBagTool.onBagStateChanged = (newState) => {
            setBagState(newState);
        };
    }, [trashBagTool]);

    return (
        <div style={{
            position: "absolute",
            bottom: 24,
            right: 24,
            background: "rgba(20, 22, 28, 0.88)",
            padding: "14px 18px",
            borderRadius: "10px",
            color: "white",
            width: "260px",
            pointerEvents: "auto",
            border: "1px solid #3a3f4b"
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "14px" }}>🗑️ Kantong Sampah</strong>
                <span style={{
                    background: bagState.isFull ? "#e53935" : "#2e7d32",
                    padding: "2px 8px",
                    borderRadius: "12px",
                    fontSize: "12px",
                    fontWeight: "bold"
                }}>
                    {bagState.currentCount} / {bagState.maxCapacity}
                </span>
            </div>

            {bagState.holdProgress > 0 && (
                <div style={{ width: "100%", height: "6px", background: "#333", borderRadius: "4px", marginBottom: "8px" }}>
                    <div style={{
                        width: `${bagState.holdProgress * 100}%`,
                        height: "100%",
                        background: "#ffca28",
                        borderRadius: "4px"
                    }} />
                </div>
            )}

            <p style={{ fontSize: "12px", color: "#cfd8dc", margin: "4px 0 12px 0" }}>
                {bagState.isTied
                    ? "Kantong terikat! Klik Tong Sampah di luar rumah untuk membuang."
                    : bagState.isFull
                    ? "Kantong penuh! Tahan klik kiri untuk mengikat kantong."
                    : "Tahan klik kiri pada sampah untuk meraup."}
            </p>

            <button
                onClick={() => stainCleanerTool.triggerDirtScanner(3500)}
                style={{
                    width: "100%",
                    padding: "8px",
                    background: "#fbc02d",
                    color: "#111",
                    fontWeight: "bold",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px"
                }}
            >
                🔍 Scanner Kotoran (Flipper Sense)
            </button>
        </div>
    );
};
