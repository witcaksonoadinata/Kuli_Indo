export type FurnitureCategory = "Teras & Tamu" | "Dapur & Air" | "Sanitasi & Sumur";
export type PlumbingRole = "None" | "WaterSource" | "WaterLoad" | "DrainOutlet";

export interface EthnicFurnitureDef {
    id: string;
    name: string;
    category: FurnitureCategory;
    regionOrigin: string;
    primaryMaterial: string;
    price: number;
    dimensions: { width: number; height: number; depth: number };
    plumbingRole: PlumbingRole;
    hexColor: string;
    accentHexColor?: string;
}

export const EthnicFurnitureDatabase: EthnicFurnitureDef[] = [
    {
        id: "item_amben_jati",
        name: "Amben Kayu Jati Tradisional",
        category: "Teras & Tamu",
        regionOrigin: "Jawa Tengah & Yogyakarta",
        primaryMaterial: "Kayu Jati Tua",
        price: 1250000,
        dimensions: { width: 1.8, height: 0.55, depth: 0.9 },
        plumbingRole: "None",
        hexColor: "#6D3B1E",
        accentHexColor: "#C8A97E"
    },
    {
        id: "item_kursi_rotan",
        name: "Kursi Rotan Anyam Teras",
        category: "Teras & Tamu",
        regionOrigin: "Cirebon & Pesisir",
        primaryMaterial: "Rotan Alami",
        price: 450000,
        dimensions: { width: 0.65, height: 0.85, depth: 0.65 },
        plumbingRole: "None",
        hexColor: "#C18D4E",
        accentHexColor: "#8C5828"
    },
    {
        id: "item_tikar_pandan",
        name: "Tikar Anyaman Daun Pandan",
        category: "Teras & Tamu",
        regionOrigin: "Nusantara",
        primaryMaterial: "Anyaman Pandan",
        price: 180000,
        dimensions: { width: 2.0, height: 0.03, depth: 1.5 },
        plumbingRole: "None",
        hexColor: "#D4BE8D"
    },
    {
        id: "item_gentong_air",
        name: "Gentong Air Tanah Liat + Siwur",
        category: "Dapur & Air",
        regionOrigin: "Pedesaan Nusantara",
        primaryMaterial: "Terakota / Tanah Liat",
        price: 320000,
        dimensions: { width: 0.65, height: 0.85, depth: 0.65 },
        plumbingRole: "WaterLoad",
        hexColor: "#9E472A",
        accentHexColor: "#3A7CA5"
    },
    {
        id: "item_meja_kenduri",
        name: "Meja Kayu Rendah & Teko Blirik",
        category: "Dapur & Air",
        regionOrigin: "Jawa & Sunda",
        primaryMaterial: "Kayu Nangka & Enamel",
        price: 650000,
        dimensions: { width: 1.1, height: 0.45, depth: 0.7 },
        plumbingRole: "None",
        hexColor: "#7A4424",
        accentHexColor: "#2E6F40"
    },
    {
        id: "item_bak_mandi_batu",
        name: "Bak Mandi Batu Alam & Gayung",
        category: "Sanitasi & Sumur",
        regionOrigin: "Kamar Mandi Tradisional",
        primaryMaterial: "Batu Candi & Keramik",
        price: 1400000,
        dimensions: { width: 1.1, height: 0.95, depth: 0.85 },
        plumbingRole: "WaterLoad",
        hexColor: "#54585A",
        accentHexColor: "#4FC3F7"
    },
    {
        id: "item_wastafel_gentong",
        name: "Wastafel Cuci Tangan Terakota",
        category: "Sanitasi & Sumur",
        regionOrigin: "Nusantara Kontemporer",
        primaryMaterial: "Terakota & Bambu",
        price: 780000,
        dimensions: { width: 0.6, height: 0.85, depth: 0.5 },
        plumbingRole: "WaterLoad",
        hexColor: "#A64B2A",
        accentHexColor: "#B0BEC5"
    },
    {
        id: "item_sumur_timba",
        name: "Sumur Batu Alam & Pompa Air",
        category: "Sanitasi & Sumur",
        regionOrigin: "Halaman Kampung",
        primaryMaterial: "Batu Kali & Kayu",
        price: 2200000,
        dimensions: { width: 1.3, height: 1.8, depth: 1.3 },
        plumbingRole: "WaterSource",
        hexColor: "#686C6E",
        accentHexColor: "#5D4037"
    }
];
