import React, { useEffect, useRef, useState } from "react";
import { GameBootstrap } from "./app/GameBootstrap";
import { EditorOverlay } from "./ui/EditorOverlay";

export const App: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [bootstrap, setBootstrap] = useState<GameBootstrap | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        const instance = new GameBootstrap(canvasRef.current);
        setBootstrap(instance);

        return () => {
            instance.dispose();
            setBootstrap(null);
        };
    }, []);

    return (
        <main style={{ position: "relative", width: "100vw", height: "100vh", overflow: "hidden", background: "#111" }}>
            <canvas
                ref={canvasRef}
                style={{ width: "100%", height: "100%", display: "block", outline: "none" }}
            />
            {bootstrap && <EditorOverlay bootstrap={bootstrap} />}
        </main>
    );
};

export default App;
