import { DailyLog, DailyGoal } from "./types";

export const DEFAULT_GOAL: DailyGoal = {
  calories: 2000,
  waterGlasses: 8
};

// Helper to get formatted date string
export function getOffsetDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

export const INITIAL_LOGS: DailyLog[] = [
  {
    date: getOffsetDateString(-2), // Monday
    meals: [
      {
        id: "m1",
        category: "Sarapan",
        name: "Bubur Ayam Lengkap",
        calories: 380,
        carbs: 45,
        protein: 15,
        fat: 10,
        explanation: "Bubur beras (250 kkal), suwiran ayam (80 kkal), kacang tanah goreng (30 kkal), kuah kuning kaldu (20 kkal).",
        journalNote: "Sarapan hangat yang sempurna untuk memulai hari senin! Kondisi hidrasi pagi juga bagus.",
        timestamp: "07:30"
      },
      {
        id: "m2",
        category: "Makan Siang",
        name: "Nasi Padang Rendang & Sayur Nangka",
        calories: 750,
        carbs: 85,
        protein: 32,
        fat: 31,
        explanation: "Nasi putih (240 kkal), rendang daging sapi sedang (280 kkal), gulai tunjang kecil (150 kkal), sayur nangka muda kuah santan (80 kkal).",
        journalNote: "Makanan padang selalu menggoda selera makan siang. Kalori agak tinggi tapi proteinnya mantap!",
        timestamp: "12:45"
      },
      {
        id: "m3",
        category: "Makan Malam",
        name: "Sate Ayam Madura tanpa Kelapa",
        calories: 420,
        carbs: 24,
        protein: 28,
        fat: 22,
        explanation: "8 tusuk sate ayam dada (220 kkal) + bumbu kacang gurih sedang (150 kkal) + lontong kecil (50 kkal).",
        journalNote: "Makan malam santai. Membatasi nasi diganti sedikit lontong agar tetap sesuai target harian.",
        timestamp: "19:15"
      },
      {
        id: "m4",
        category: "Camilan",
        name: "Apel Malang Segar",
        calories: 95,
        carbs: 25,
        protein: 0.5,
        fat: 0.3,
        explanation: "Satu buah apel Malang ukuran sedang.",
        journalNote: "Camilan buah segar yang kaya serat untuk mengganjal rasa manis di sore hari.",
        timestamp: "16:00"
      }
    ],
    water: [
      { id: "w1", amountMl: 250, timestamp: "08:00" },
      { id: "w2", amountMl: 250, timestamp: "10:30" },
      { id: "w3", amountMl: 250, timestamp: "13:00" },
      { id: "w4", amountMl: 250, timestamp: "15:30" },
      { id: "w5", amountMl: 250, timestamp: "18:00" },
      { id: "w6", amountMl: 250, timestamp: "20:00" },
      { id: "w7", amountMl: 250, timestamp: "21:30" }
    ],
    notes: "Hari Senin yang sangat produktif! Target kalori tercapai dan hampir berhasil mencapai 8 gelas air."
  },
  {
    date: getOffsetDateString(-1), // Tuesday
    meals: [
      {
        id: "m5",
        category: "Sarapan",
        name: "Roti Gandum dengan Telur Mata Sapi",
        calories: 290,
        carbs: 28,
        protein: 16,
        fat: 12,
        explanation: "2 helai roti tawar gandum panggang (140 kkal), 1 butir telur ceplok mentega sedikit (90 kkal), tomat & selada (60 kkal).",
        journalNote: "Cepat, sehat, dan mengenyangkan. Pas untuk mengawali aktivitas.",
        timestamp: "08:15"
      },
      {
        id: "m6",
        category: "Makan Siang",
        name: "Gado-Gado Lontong Tengah Kota",
        calories: 520,
        carbs: 60,
        protein: 18,
        fat: 22,
        explanation: "Sayuran rebus bayam, toge, kol, kacang panjang (120 kkal), tahu & tempe goreng potong (150 kkal), lontong sedang (100 kkal), bumbu siram kacang (150 kkal).",
        journalNote: "Isi piring penuh serat nabati hari ini. Bumbu kacangnya melimpah dan lezat.",
        timestamp: "13:10"
      },
      {
        id: "m7",
        category: "Makan Malam",
        name: "Soto Ayam Lamongan Ceker",
        calories: 380,
        carbs: 20,
        protein: 26,
        fat: 14,
        explanation: "Soto ayam bertulang tanpa koya berlebih (220 kkal), nasi putih 3/4 porsi (120 kkal), soun (40 kkal).",
        journalNote: "Soto hangat di tengah gerimis malam. Sangat menenangkan jiwa.",
        timestamp: "19:40"
      },
      {
        id: "m8",
        category: "Camilan",
        name: "Kopi Hitam Tanpa Gula & Pisang Ambon",
        calories: 110,
        carbs: 26,
        protein: 1.2,
        fat: 0.2,
        explanation: "Americano murni (5 kkal) + satu buah pisang segar (105 kkal).",
        journalNote: "Penambah semangat mengantuk jam 3 sore. Sederhana dan alami.",
        timestamp: "15:00"
      }
    ],
    water: [
      { id: "w8", amountMl: 250, timestamp: "07:45" },
      { id: "w9", amountMl: 250, timestamp: "09:30" },
      { id: "w10", amountMl: 250, timestamp: "11:15" },
      { id: "w11", amountMl: 250, timestamp: "13:30" },
      { id: "w12", amountMl: 250, timestamp: "15:45" },
      { id: "w13", amountMl: 250, timestamp: "17:15" },
      { id: "w14", amountMl: 250, timestamp: "19:30" },
      { id: "w15", amountMl: 250, timestamp: "21:00" }
    ],
    notes: "Tidur lebih pulas malam ini karena hidrasi 8 gelas penuh terpenuhi! Tubuh terasa lebih bugar."
  },
  {
    date: getOffsetDateString(0), // Today
    meals: [
      {
        id: "m9",
        category: "Sarapan",
        name: "Oatmeal Pisang & Madu",
        calories: 320,
        carbs: 55,
        protein: 8,
        fat: 4,
        explanation: "Oat gandum instan 4 sendok makan masakan air hangat (150 kkal), pisang ambon potong (105 kkal), 1 sdm madu murni (65 kkal).",
        journalNote: "Makanan super sehat untuk memulai hari! Rasanya manis alami dari buah dan madu.",
        timestamp: "08:00"
      }
    ],
    water: [
      { id: "w16", amountMl: 250, timestamp: "08:30" },
      { id: "w17", amountMl: 250, timestamp: "10:15" }
    ],
    notes: "Menulis catatan hari ini..."
  }
];
