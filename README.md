# Nusantara Flipper — Simulasi Renovasi Rumah Panggung Kearifan Lokal

Prototipe game simulasi renovasi dan konstruksi rumah tradisional Nusantara berbasis **Babylon.js**, **TypeScript**, dan **React.js** dengan estetika visual **anime cel-shading**.

## Cara Menjalankan Proyek

1. Pastikan **Node.js** (versi 18+) sudah terpasang.
2. Ekstrak file ZIP ini dan buka terminal di dalam folder proyek.
3. Pasang dependensi:
   ```bash
   npm install
   ```
4. Jalankan server pengembangan:
   ```bash
   npm run dev
   ```
5. Buka alamat lokal yang muncul di terminal (biasanya `http://localhost:5173`).

## Struktur Arsitektur Modul

- `src/app/GameBootstrap.ts` — Orkestrator utama Babylon.js, perutean input pointer/keyboard, dan starter scene Rumah Panggung.
- `src/core/` — *Command Pattern* (`Command.ts`) & `HistoryManager.ts` untuk mekanisme Undo/Redo.
- `src/construction/` — `GridSnapSystem`, `StiltFoundationSystem` (pondasi kayu rumah panggung & tangga), `WallBuilderSystem` (dinding bersegmen), `DoorWindowSnapSystem` (pintu kayu & jendela jalusi/kaca), dan `TraditionalRoofSystem` (atap pelana/limasan genteng merah).
- `src/tools/` — `DemolitionTool` (palu godam bersegmen), `PainterTapeSystem` & `SurfaceFinisherTool` (pembatasan area cat/ubin), serta `WiringTool` (koneksi kabel listrik).
- `src/cleaning/` — `TrashBagSystem` (kantong sampah & tong pembuangan), `StainCleanerSystem` (pembersih noda & scanner kotoran), dan `WindowSqueegeeSystem` (mini-game pembersih kaca).
- `src/plumbing/` — `InWallPlumbingSystem` (jalur pipa air bersih & pembuangan mode X-Ray dalam dinding).
- `src/objects/` — `TransformController` (gizmo pindah/putar/skala) & `FurniturePlacementSystem` (penempatan perabot etnik).
- `src/data/catalogs/` — `LocalMaterialCatalog` (plester kapur, tegel kunci, kayu jati, gedek bambu) & `EthnicFurnitureCatalog` (amben jati, kursi rotan, gentong air, bak mandi batu, sumur timba).
- `src/world/` — `ParcelSystem`, `SaveSystem` (ekspor JSON), `EnvironmentTimeSystem` (siklus Pagi/Siang/Senja/Malam), `TerrainPaintSystem` (kuas tanah merah/rumput/sawah), dan `TropicalFoliageSystem`.
- `src/quests/` — `QuestModel` & `QuestRuntime` (validator progres misi bernarasi lokal).
- `src/rendering/` — `CelToonMaterial` (shader kuantisasi 3-tingkat + rim light), `VisualPolishPipeline` (EdgeDetectionPostProcess outline + SSAO + kabut tropis), dan `TropicalBillboardFoliage`.
- `src/ui/` — `EditorOverlay.tsx` & panel kontrol React non-blocking.

## Kontrol & Pintasan Keyboard

- **W / A / S / D + Drag Mouse**: Navigasi kamera bebas (*Fly / FPS mode*)
- **G**: Aktif / Nonaktifkan *Grid Snapping*
- **R**: Putar rotasi pratinjau perabot (`45°`)
- **F**: Aktifkan *Scanner Kotoran (Flipper Sense)*
- **Ctrl + Z / Ctrl + Y**: Undo / Redo aksi konstruksi & renovasi
