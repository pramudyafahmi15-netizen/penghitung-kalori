import React, { useState, useEffect, useRef } from "react";
import { 
  DailyLog, 
  Meal, 
  WaterLog, 
  DailyGoal, 
  MealCategory 
} from "./types";
import { INITIAL_LOGS, DEFAULT_GOAL, getOffsetDateString } from "./dataMock";
import AiAnalysisStamp from "./components/AiAnalysisStamp";
import { 
  Plus, 
  Book, 
  TrendingUp, 
  Calendar, 
  PlusCircle, 
  Trash2, 
  Camera, 
  Compass, 
  ChevronLeft, 
  ChevronRight, 
  Droplet,
  Coffee,
  HelpCircle,
  FileText,
  Award,
  Flame,
  ChevronDown
} from "lucide-react";

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<"daily" | "weekly">("daily");
  const [selectedDate, setSelectedDate] = useState<string>(getOffsetDateString(0));
  
  // Data State
  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem("daily_calorie_tracker_logs");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return INITIAL_LOGS;
  });

  const [goals, setGoals] = useState<DailyGoal>(() => {
    const saved = localStorage.getItem("daily_calorie_tracker_goals");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return DEFAULT_GOAL;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("daily_calorie_tracker_logs", JSON.stringify(logs));
  }, [logs]);

  useEffect(() => {
    localStorage.setItem("daily_calorie_tracker_goals", JSON.stringify(goals));
  }, [goals]);

  // Current day log helper or construct placeholder
  const currentLog = logs.find(l => l.date === selectedDate) || {
    date: selectedDate,
    meals: [],
    water: [],
    notes: ""
  };

  // State for manual food adding
  const [mealName, setMealName] = useState("");
  const [mealCalories, setMealCalories] = useState("");
  const [mealCategory, setMealCategory] = useState<MealCategory>("Sarapan");
  const [mealCarbs, setMealCarbs] = useState("");
  const [mealProtein, setMealProtein] = useState("");
  const [mealFat, setMealFat] = useState("");

  // Target values goals editing state
  const [showGoalEditor, setShowGoalEditor] = useState(false);
  const [tempCalorieGoal, setTempCalorieGoal] = useState(goals.calories.toString());
  const [tempWaterGoal, setTempWaterGoal] = useState(goals.waterGlasses.toString());

  // State for AI Analysis Scanner
  const [aiImageBase64, setAiImageBase64] = useState<string | null>(null);
  const [aiImageFile, setAiImageFile] = useState<File | null>(null);
  const [aiDescription, setAiDescription] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<Partial<Meal> | null>(null);
  const [aiResultCategory, setAiResultCategory] = useState<MealCategory>("Makan Siang");
  const [aiError, setAiError] = useState<string | null>(null);

  // File input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats Helper Calculations
  const getDailyTotals = (log: DailyLog) => {
    const calories = log.meals.reduce((sum, m) => sum + m.calories, 0);
    const carbs = log.meals.reduce((sum, m) => sum + (m.carbs || 0), 0);
    const protein = log.meals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const fat = log.meals.reduce((sum, m) => sum + (m.fat || 0), 0);
    const waterCups = log.water.length;
    return { calories, carbs, protein, fat, waterCups };
  };

  const currentTotals = getDailyTotals(currentLog as DailyLog);

  // Update notes
  const handleNoteChange = (text: string) => {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === selectedDate);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], notes: text };
        return updated;
      } else {
        return [...prev, { date: selectedDate, meals: [], water: [], notes: text }];
      }
    });
  };

  // Add water log
  const handleAddWater = () => {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const newLogItem: WaterLog = {
      id: `w_${Date.now()}`,
      amountMl: 250,
      timestamp: ts
    };

    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === selectedDate);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], water: [...updated[idx].water, newLogItem] };
        return updated;
      } else {
        return [...prev, { date: selectedDate, meals: [], water: [newLogItem], notes: "" }];
      }
    });
    // Synthesize subtle hydration drop sound using Web Audio
    playBeep(450, 0.1, "sine");
  };

  // Remove last water cup
  const handleRemoveWater = () => {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === selectedDate);
      if (idx > -1) {
        const updated = [...prev];
        const newWater = [...updated[idx].water];
        if (newWater.length > 0) {
          newWater.pop();
          updated[idx] = { ...updated[idx], water: newWater };
          return updated;
        }
      }
      return prev;
    });
    playBeep(220, 0.1, "sawtooth");
  };

  // Add custom meal
  const handleAddCustomMeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mealName.trim() || !mealCalories) return;

    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    
    const newMeal: Meal = {
      id: `m_${Date.now()}`,
      category: mealCategory,
      name: mealName.trim(),
      calories: parseInt(mealCalories) || 0,
      carbs: parseFloat(mealCarbs) || 0,
      protein: parseFloat(mealProtein) || 0,
      fat: parseFloat(mealFat) || 0,
      timestamp: ts,
      journalNote: "Makanan dicatat manual."
    };

    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === selectedDate);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], meals: [...updated[idx].meals, newMeal] };
        return updated;
      } else {
        return [...prev, { date: selectedDate, meals: [newMeal], water: [], notes: "" }];
      }
    });

    // Reset Form
    setMealName("");
    setMealCalories("");
    setMealCarbs("");
    setMealProtein("");
    setMealFat("");
    
    playBeep(600, 0.15, "triangle");
  };

  // Log food after AI analysis stamp confirmed
  const handleLogAiMeal = () => {
    if (!aiResult || !aiResult.name) return;

    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    const newMeal: Meal = {
      id: `m_${Date.now()}`,
      category: aiResultCategory,
      name: aiResult.name,
      calories: aiResult.calories || 0,
      carbs: aiResult.carbs || 0,
      protein: aiResult.protein || 0,
      fat: aiResult.fat || 0,
      explanation: aiResult.explanation,
      journalNote: aiResult.journalNote,
      photoUrl: aiImageBase64 || undefined,
      timestamp: ts
    };

    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === selectedDate);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], meals: [...updated[idx].meals, newMeal] };
        return updated;
      } else {
        return [...prev, { date: selectedDate, meals: [newMeal], water: [], notes: "" }];
      }
    });

    // Save notes with AI written handwritten note if currently empty
    if (!currentLog.notes || currentLog.notes === "Menulis catatan hari ini...") {
      handleNoteChange(aiResult.journalNote || "AI menyarankan porsi makan seimbang.");
    }

    // Reset AI Scanner Form
    setAiResult(null);
    setAiImageBase64(null);
    setAiImageFile(null);
    setAiDescription("");
    setAiError(null);

    playBeep(520, 0.2, "sine");
  };

  // Remove meal
  const handleRemoveMeal = (mealId: string) => {
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === selectedDate);
      if (idx > -1) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx],
          meals: updated[idx].meals.filter(m => m.id !== mealId)
        };
        return updated;
      }
      return prev;
    });
    playBeep(180, 0.15, "sawtooth");
  };

  // File Upload base64 generator
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAiImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAiImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Run Real AI analysis via backend /api/analyze-food proxy
  const analyzeFoodWithAI = async () => {
    if (!aiImageBase64 && !aiDescription.trim()) {
      setAiError("Mohon unggah foto makanan atau jelaskan teks makanannya.");
      return;
    }

    setAiLoading(true);
    setAiResult(null);
    setAiError(null);

    try {
      const response = await fetch("/api/analyze-food", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: aiImageBase64,
          description: aiDescription.trim()
        })
      });

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Gagal menghubungi server gizi.");
      }

      const result = await response.json();
      setAiResult({
        name: result.foodName,
        calories: result.calories,
        carbs: result.carbs,
        protein: result.protein,
        fat: result.fat,
        explanation: result.explanation,
        journalNote: result.journalNote
      });
    } catch (e: any) {
      console.error(e);
      setAiError(e.message || "Gagal menganalisis gizi makanan. Pastikan kunci API Gemini sudah dikonfigurasi.");
    } finally {
      setAiLoading(false);
    }
  };

  // Sound Synthesizer Fallback
  const playBeep = (freq = 440, duration = 0.1, type: OscillatorType = "sine") => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Ignored if sound not allowed
    }
  };

  // Date shifting page turn effect
  const adjustDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    const nextDateStr = d.toISOString().split("T")[0];
    setSelectedDate(nextDateStr);
    playBeep(300, 0.12, "triangle");
  };

  // Get localized gorgeous Indonesian dates
  const formatIndoDate = (dateStr: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", options);
  };

  const formatShortDay = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    const days = ["Ming", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
    return days[day];
  };

  // Save changes to physical setup goal overrides
  const handleSaveGoals = (e: React.FormEvent) => {
    e.preventDefault();
    setGoals({
      calories: parseInt(tempCalorieGoal) || 2000,
      waterGlasses: parseInt(tempWaterGoal) || 8
    });
    setShowGoalEditor(false);
    playBeep(400, 0.2, "sine");
  };

  // Stats / Weekly summary generation based on 7 days of logs
  const getWeeklyRecap = () => {
    // Generate dates for current week ending on selectedDate
    const weekLogs: DailyLog[] = [];
    const baseDate = new Date(selectedDate);
    
    for (let i = 6; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(baseDate.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const match = logs.find(l => l.date === dateStr);
      if (match) {
        weekLogs.push(match);
      } else {
        weekLogs.push({
          date: dateStr,
          meals: [],
          water: [],
          notes: ""
        });
      }
    }

    const totalDaysCount = weekLogs.length;
    const totalsPerDay = weekLogs.map(wl => getDailyTotals(wl));
    const totalCal = totalsPerDay.reduce((sum, d) => sum + d.calories, 0);
    const totalWater = totalsPerDay.reduce((sum, d) => sum + d.waterCups, 0);
    const avgCal = Math.round(totalCal / totalDaysCount);
    const avgWater = parseFloat((totalWater / totalDaysCount).toFixed(1));

    // Warm friendly hand-written response advice from dietitian point of view
    let advice = "Buku harian Anda terlihat rapi! Teruskan hidrasi air minimal 8 gelas per hari untuk metabolisme yang optimal.";
    if (avgCal > goals.calories) {
      advice = `Asupan rata-rata kalori Anda (${avgCal} kkal) sedikit melampaui target ${goals.calories} kkal Anda minggu ini. Usahakan porsi camilan sore diganti buah-buahan segar.`;
    } else if (avgCal > 0 && avgCal < goals.calories - 500) {
      advice = `Kalori Anda (${avgCal} kkal) tergolong sangat rendah dibanding standar keaktifan Anda. Pastikan sarapan Anda berisi protein gizi tinggi agar tetap bertenaga saat waktu beraktivitas harian.`;
    }

    if (avgWater < 5) {
      advice += " Ingat, asupan air sangat minim! Letakkan botol air di samping keyboard agar selalu ingat minum.";
    }

    return {
      weekLogs,
      avgCal,
      avgWater,
      advice
    };
  };

  const weeklyRecap = getWeeklyRecap();

  // Highlight meal categorisation statistics
  const mealCategoriesList: MealCategory[] = ["Sarapan", "Makan Siang", "Makan Malam", "Camilan"];

  return (
    <div className="wooden-desk min-h-screen w-full flex flex-col items-center justify-start p-4 md:p-8 font-sans overflow-y-auto selection:bg-[#8d6e63] selection:text-white relative">
      
      {/* Decorative Warm Coffee Desk Cup Top-Right */}
      <div className="hidden lg:flex absolute top-6 right-16 w-32 h-32 rounded-full bg-[#fcf9f2] shadow-2xl flex-col items-center justify-center border-[10px] border-amber-950/20 transform rotate-6 z-0 select-none cursor-pointer hover:rotate-12 transition-transform" onClick={() => playBeep(250, 0.3, "sine")}>
        <div className="absolute top-1/2 left-1/2 w-20 h-20 -translate-x-1/2 -translate-y-1/2 bg-[#3e2723] rounded-full flex flex-col items-center justify-center shadow-inner">
          <div className="w-16 h-16 rounded-full bg-[#5d4037] border border-orange-200/20 flex flex-col items-center justify-center relative">
            <span className="font-handwritten text-orange-200 text-sm leading-none">Coffee OK</span>
            <div className="w-full flex justify-center mt-1">
              <span className="w-1 h-2 bg-[#8d6e63]/40 rounded-full animate-bounce"></span>
              <span className="w-1 h-3 bg-[#8d6e63]/40 rounded-full mx-0.5 animate-pulse"></span>
              <span className="w-1 h-2 bg-[#8d6e63]/40 rounded-full animate-bounce"></span>
            </div>
          </div>
        </div>
        <div className="absolute top-1 right-2 w-4 h-12 bg-white/10 rounded-full blur-xs"></div>
        <div className="absolute -right-5 top-1/2 -translate-y-1/2 w-8 h-10 border-[6px] border-amber-950/20 rounded-r-xl"></div>
      </div>

      {/* Decorative Reading Pocket-Glasses Top-Left */}
      <div className="hidden xl:block absolute top-10 left-10 w-44 h-14 bg-slate-300/10 border border-white/5 backdrop-blur-xs rounded-full pointer-events-none transform -rotate-12 z-0">
        <div className="absolute left-6 w-12 h-12 rounded-full border-2 border-slate-600/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-teal-500/10 bg-slate-200/5"></div>
        </div>
        <div className="absolute right-6 w-12 h-12 rounded-full border-2 border-slate-600/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border border-teal-500/10 bg-slate-200/5"></div>
        </div>
        <div className="absolute left-1/2 top-4 w-6 h-1.5 border-t border-slate-400 -translate-x-1/2"></div>
      </div>

      {/* App Header Logo Title banner block */}
      <div className="text-center mb-6 relative z-10">
        <div className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-950/40 to-[#2c1e14]/40 backdrop-blur-md rounded-full border border-amber-900/40 shadow-lg">
          <Book className="w-5 h-5 text-amber-200 animate-pulse" />
          <h1 className="text-2xl md:text-3xl font-serif font-black tracking-wider text-amber-100 uppercase italic">
            LeisureLog <span className="text-amber-400 font-handwritten text-3xl capitalize tracking-normal ml-1">AI Nutri-Journal</span>
          </h1>
        </div>
        <p className="text-xs text-amber-300 pb-1 mt-1 opacity-80 tracking-wide font-sans font-medium uppercase">
          🌿 Catat Kalori Makanan &amp; Hidrasi Air Harian dengan Teknologi Pintar AI
        </p>
      </div>

      {/* The Central Journal Book container */}
      <div className="relative w-full max-w-6xl min-h-[680px] bg-[#5d4037] rounded-3xl shadow-[0_30px_70px_rgba(0,0,0,0.85),inset_0_0_50px_rgba(0,0,0,0.7)] border-y-8 border-r-[12px] border-[#3e2723] flex flex-col lg:flex-row p-1.5 md:p-3 overflow-visible mb-12 z-10 transition-all duration-300">
        
        {/* Binder / Hard Leather Spine simulation for Large screens inside paper */}
        <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 hidden lg:flex flex-col justify-around py-12 z-30 pointer-events-none">
          <div className="w-6 h-6 rounded-full binder-ring translate-x-1"></div>
          <div className="w-6 h-6 rounded-full binder-ring translate-x-1"></div>
          <div className="w-6 h-6 rounded-full binder-ring translate-x-1"></div>
          <div className="w-6 h-6 rounded-full binder-ring translate-x-1"></div>
          <div className="w-6 h-6 rounded-full binder-ring translate-x-1"></div>
          <div className="w-6 h-6 rounded-full binder-ring translate-x-1"></div>
        </div>

        {/* LEFT PAGE - Food logger & AI Scanner */}
        <div className={`w-full lg:w-1/2 flex flex-col bg-[#fdfcf0] rounded-2xl lg:rounded-r-none relative shadow-inner p-4 md:p-8 border-r border-gray-300 lg:border-r-2 ${activeTab === 'weekly' ? 'hidden lg:flex' : 'flex'}`} style={{ background: "linear-gradient(to right, #fdfcf0 96%, #f2efe0 100%)" }}>
          
          {/* Header Left Page */}
          <div className="flex justify-between items-center mb-6 border-b-2 border-red-100 pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-800" />
              <button 
                onClick={() => adjustDate(-1)} 
                className="p-1 hover:bg-[#efebe9]/60 rounded text-[#5d4037] active:scale-90 transition-all"
                title="Hari Sebelumnya"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>
              <span className="font-serif font-black text-sm md:text-base text-[#3e2723] select-none text-center min-w-32 truncate px-1">
                {formatIndoDate(selectedDate)}
              </span>
              <button 
                onClick={() => adjustDate(1)} 
                className="p-1 hover:bg-[#efebe9]/60 rounded text-[#5d4037] active:scale-90 transition-all"
                title="Hari Berikutnya"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>
            
            <button 
              onClick={() => setSelectedDate(getOffsetDateString(0))}
              className="text-xs bg-[#8d6e63]/15 hover:bg-[#8d6e63]/25 font-bold transition-all px-2.5 py-1 rounded text-[#5d4037] font-serif tracking-tighter"
              title="Reset ke Hari Ini"
            >
              HARI INI
            </button>
          </div>

          {/* Goal Targets Dashboard overview */}
          <div className="bg-[#f0ece1]/60 p-3 rounded-lg border border-[#e1dcd0] mb-4 flex flex-wrap justify-between items-center gap-2">
            <div>
              <span className="text-xs text-gray-500 font-semibold block uppercase tracking-wider">Target Energi Harian</span>
              <div className="flex items-baseline gap-1">
                <span className="font-serif font-black text-xl text-[#3e2723]">{currentTotals.calories}</span>
                <span className="text-xs text-slate-500">/</span>
                <span className="text-xs text-[#8d6e63] font-bold">{goals.calories} kkal</span>
              </div>
            </div>
            
            {/* Real-time calculated bar progress styled with canvas look */}
            <div className="flex-1 min-w-[120px] max-w-[200px]">
              <div className="w-full bg-[#e8e4d8] h-4 rounded-full overflow-hidden border border-gray-300 shadow-inner relative">
                <div 
                  className={`h-full transition-all duration-500 ${currentTotals.calories > goals.calories ? 'bg-orange-600' : 'bg-[#8d6e63]'}`}
                  style={{ width: `${Math.min(100, (currentTotals.calories / goals.calories) * 100)}%` }}
                ></div>
                <span className="absolute inset-0 text-[10px] font-bold text-center text-slate-700 leading-3 scale-95 flex items-center justify-center mix-blend-difference">
                  {Math.round((currentTotals.calories / goals.calories) * 100)}%
                </span>
              </div>
            </div>

            <button 
              onClick={() => {
                setTempCalorieGoal(goals.calories.toString());
                setTempWaterGoal(goals.waterGlasses.toString());
                setShowGoalEditor(!showGoalEditor);
              }}
              className="text-[11px] font-bold bg-[#8d6e63] hover:bg-[#5d4037] text-white px-2 py-1 rounded shadow-xs"
            >
              Atur Target
            </button>
          </div>

          {/* Goal Target Form Editor (Popup overlay within page) */}
          {showGoalEditor && (
            <form onSubmit={handleSaveGoals} className="bg-amber-100/90 border-2 border-dashed border-[#8d6e63] p-4 rounded-lg my-3 space-y-3 z-10 shadow-lg">
              <h4 className="text-sm font-serif font-bold text-[#3e2723]">Tetapkan Target Sehat Baru</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600">Energi (kkal)</label>
                  <input 
                    type="number" 
                    value={tempCalorieGoal}
                    onChange={e => setTempCalorieGoal(e.target.value)}
                    className="w-full text-sm bg-white/90 p-1.5 rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase font-bold text-slate-600">Minum Air (Gelas)</label>
                  <input 
                    type="number" 
                    value={tempWaterGoal}
                    onChange={e => setTempWaterGoal(e.target.value)}
                    className="w-full text-sm bg-white/90 p-1.5 rounded border border-gray-300"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 text-xs font-serif pt-1">
                <button type="button" onClick={() => setShowGoalEditor(false)} className="px-3 py-1 bg-white/70 rounded">Batal</button>
                <button type="submit" className="px-3 py-1 bg-[#3e2723] text-white rounded">Simpan</button>
              </div>
            </form>
          )}

          {/* Logged Food Lists section with beautiful scratch-outs */}
          <div className="flex-1 overflow-y-auto custom-scrollbar max-h-[300px] mb-4 space-y-3">
            <h3 className="font-serif font-bold text-base text-[#3e2723] border-b border-dashed border-gray-300 pb-1 flex items-center gap-1.5">
              <span>🍛</span> Hidangan Buku Harian
            </h3>
            
            {currentLog.meals.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-gray-300/60 rounded bg-amber-50/10">
                <p className="font-handwritten text-xl text-[#8d6e63]">Buku harian makanan masih bersih. Pindai foto piring makan Anda atau tambah menu secara manual.</p>
              </div>
            ) : (
              <div className="space-y-2 pr-1">
                {currentLog.meals.map(meal => (
                  <div 
                    key={meal.id} 
                    className="group flex justify-between items-start bg-white/80 hover:bg-white p-3 rounded-lg border border-stone-200/50 shadow-xs hover:shadow-md transition-all relative overflow-hidden"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase leading-none tracking-wider bg-[#8d6e63]/25 text-[#3e2723]">
                          {meal.category}
                        </span>
                        <span className="text-xs text-gray-400 font-serif italic">{meal.timestamp}</span>
                      </div>
                      <h4 className="font-serif font-bold text-[#2d3748] tracking-tight mt-1 leading-snug">
                        {meal.name}
                      </h4>
                      
                      {/* Macro counters labels tags */}
                      <div className="flex gap-2 text-[10px] font-mono text-slate-500 mt-1">
                        <span className="bg-amber-50 px-1 py-0.2 rounded">K: {meal.carbs || 0}g</span>
                        <span className="bg-rose-50 px-1 py-0.2 rounded">P: {meal.protein || 0}g</span>
                        <span className="bg-blue-50 px-1 py-0.2 rounded">L: {meal.fat || 0}g</span>
                      </div>

                      {meal.journalNote && (
                        <p className="font-handwritten text-lg text-amber-800 leading-none mt-1">
                          "{meal.journalNote}"
                        </p>
                      )}
                    </div>

                    <div className="text-right flex flex-col items-end justify-between min-h-[50px] pl-2">
                      <span className="font-serif font-black text-base text-[#2b3a67] whitespace-nowrap">
                        {meal.calories} <span className="text-[10px] font-normal text-slate-400">kkal</span>
                      </span>
                      
                      <button 
                        onClick={() => handleRemoveMeal(meal.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-all cursor-pointer"
                        title="Hapus Makanan"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Scanner Photo upload and scan interface and feedback widget */}
          <div className="bg-[#f7f5e6] border-2 border-dashed border-[#d7ccc8] p-4 rounded-xl shadow-xs">
            <h3 className="font-serif font-bold text-sm uppercase text-[#3e2723] tracking-wider mb-2 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-[#8d6e63]" />
              Deteksi Makanan AI (Foto / Teks)
            </h3>
            
            <div className="space-y-3">
              
              {/* Media input click triggers */}
              {!aiImageBase64 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-6 bg-white/75 hover:bg-white border border-[#e1dcd0] rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors group"
                >
                  <div className="w-10 h-10 mb-1 rounded-full bg-[#8d6e63] flex items-center justify-center shadow-md group-hover:scale-105 transition-all">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xs text-[#8d6e63] font-bold uppercase tracking-wider">Unggah Foto Piring</span>
                  <p className="text-[10px] text-gray-400 italic">Klik untuk pilih gambar atau pakai kamera HP</p>
                </div>
              ) : (
                <div className="relative w-full h-32 bg-stone-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-300 shadow-inner">
                  <img 
                    src={aiImageBase64} 
                    alt="Scan preview" 
                    className="h-full object-contain"
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      setAiImageBase64(null);
                      setAiImageFile(null);
                    }}
                    className="absolute top-1.5 right-1.5 bg-red-650/80 hover:bg-red-700 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-md uppercase tracking-wider"
                  >
                    Batal
                  </button>
                </div>
              )}

              {/* Secret hidden fallback HTML Input */}
              <input 
                type="file" 
                accept="image/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />

              {/* Extra meal notes field */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#8d6e63] mb-1">Deskripsi &amp; Porsi (Opsional)</label>
                <input 
                  type="text"
                  placeholder="Misal: Nasi putih semangkuk kecil dengan bebek bakar pedas"
                  value={aiDescription}
                  onChange={e => setAiDescription(e.target.value)}
                  className="w-full text-xs bg-white/90 p-2 rounded border border-[#e1dcd0] focus:ring-1 focus:ring-[#8d6e63] focus:outline-hidden"
                />
              </div>

              {/* Category picker for AI Result prior logging */}
              <div className="flex gap-2 items-center justify-between">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] uppercase font-bold text-[#8d6e63] whitespace-nowrap">Jadwal Makan:</span>
                  <select 
                    value={aiResultCategory} 
                    onChange={e => setAiResultCategory(e.target.value as MealCategory)}
                    className="text-xs bg-white/90 p-1 rounded border border-[#e1dcd0] font-bold text-slate-800 focus:outline-hidden"
                  >
                    {mealCategoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={analyzeFoodWithAI}
                  disabled={aiLoading}
                  className="bg-[#3e2723] hover:bg-[#1f1310] disabled:bg-slate-400 text-white text-xs px-4 py-2 rounded-lg font-bold font-serif shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5" />
                  {aiLoading ? "Memindai..." : "Pindai dengan AI"}
                </button>
              </div>

              {aiError && (
                <p className="text-xs text-red-700 font-sans leading-snug border-l-4 border-red-500 pl-2 bg-red-50 py-1 rounded">
                  {aiError}
                </p>
              )}

              {/* Display resulting Stamp component */}
              <AiAnalysisStamp 
                result={aiResult || {}} 
                onLogMeal={handleLogAiMeal} 
                isLoading={aiLoading} 
              />

            </div>
          </div>

          <div className="mt-4 p-3 bg-[#e8e2d4] border border-[#d3cbb6] rounded-lg text-slate-700 text-xs text-center font-sans tracking-wide">
            💡 <span className="font-semibold text-amber-955">Tip Gizi:</span> Asupan serat dari oatmeal atau pepaya membantu menjaga rasa kenyang lebih lama di pagi hari.
          </div>
        </div>

        {/* RIGHT PAGE - Water logs & Notepad memo pad */}
        <div className={`w-full lg:w-1/2 flex flex-col bg-[#fdfcf0] rounded-2xl lg:rounded-l-none relative shadow-inner p-4 md:p-8 ${activeTab === 'weekly' ? 'flex' : 'hidden lg:flex'}`} style={{ background: "linear-gradient(to left, #fdfcf0 96%, #f2efe0 100%)" }}>
          
          {/* Hydration Tracker section with real physical glass indicators */}
          <div className="mb-6 bg-[#ebf3f5]/80 p-4 rounded-xl border border-[#d1e0e3] shadow-xs">
            <h3 className="text-lg font-serif font-bold text-[#1b3d42] mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5">💧 Hidrasi Harian</span>
              <span className="text-xs font-sans font-black bg-[#2d5d62] text-white px-2.5 py-0.5 rounded-full">
                {currentTotals.waterCups} Gelas ({(currentTotals.waterCups * 250 / 1000).toFixed(1)}L)
              </span>
            </h3>

            {/* Grid of beautifully rendering glass objects */}
            <div className="flex flex-wrap gap-4 justify-start py-2">
              {Array.from({ length: Math.max(goals.waterGlasses, currentTotals.waterCups) }).map((_, i) => {
                const isHydrated = i < currentTotals.waterCups;
                return (
                  <div 
                    key={i} 
                    className="relative flex flex-col items-center group cursor-pointer transition-transform duration-300"
                    onClick={isHydrated ? handleRemoveWater : handleAddWater}
                  >
                    {/* Visual 3D style beaker model */}
                    <div className={`w-10 h-14 rounded-b-xl border-2 shadow-inner transition-all duration-300 relative ${isHydrated ? 'border-[#3a838a] bg-[#d1f2f5]' : 'border-gray-300 bg-white/40'}`}>
                      {isHydrated && (
                        <div className="absolute bottom-0 inset-x-0 bg-[#4da6b0] opacity-80 h-[85%] rounded-b-lg animate-pulse">
                          <span className="absolute top-1 left-2 w-1.5 h-1.5 bg-white/50 rounded-full"></span>
                        </div>
                      )}
                      
                      {!isHydrated && (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 text-xs font-bold leading-none select-none opacity-40 group-hover:opacity-100">
                          +
                        </div>
                      )}
                    </div>
                    {/* Glass sequential labels */}
                    <span className="text-[9px] font-bold text-emerald-800 font-sans mt-1">
                      {isHydrated ? `Gelas ${i + 1}` : "+ Air"}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex gap-2 items-center justify-between border-t border-[#d1e0e3] pt-3 mt-2">
              <p className="text-xs font-serif text-[#3e2723] italic leading-tight">
                Target Sehat: {goals.waterGlasses} Gelas Harian (2000 ml). 
                {currentTotals.waterCups >= goals.waterGlasses ? " 🎉 Hidrasi Bagus!" : ` Butuh ${goals.waterGlasses - currentTotals.waterCups} gelas lagi.`}
              </p>
              
              <div className="flex gap-1.5">
                <button 
                  onClick={handleRemoveWater} 
                  className="bg-red-50 hover:bg-red-100 text-red-700 text-[11px] font-bold h-7 px-3 rounded border border-red-200 cursor-pointer active:scale-95 transition-all"
                  title="Kurangi Air"
                >
                  - Kurang
                </button>
                <button 
                  onClick={handleAddWater} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold h-7 px-4 rounded shadow-sm hover:shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                  title="Tambah Gelas Air"
                >
                  <Droplet className="w-3.5 h-3.5 fill-blue-100" />
                  + Minum
                </button>
              </div>
            </div>
          </div>

          {/* Manual Quick Add Custom Food entry form */}
          <div className="mb-6 bg-[#f7f4eb] border border-[#e1dcd0] p-4 rounded-xl shadow-xs">
            <h3 className="font-serif font-black text-sm text-[#3e2723] border-b border-gray-300 pb-1.5 mb-3 flex items-center gap-1">
              <span>✍️</span> Catat Manual (Cepat)
            </h3>

            <form onSubmit={handleAddCustomMeal} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Nama Hidangan</label>
                  <input 
                    type="text" 
                    placeholder="mis: Ketoprak tanpa telur"
                    value={mealName}
                    onChange={e => setMealName(e.target.value)}
                    required
                    className="w-full text-xs bg-white/90 p-2 rounded border border-gray-300 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Kategori Santapan</label>
                  <select 
                    value={mealCategory} 
                    onChange={e => setMealCategory(e.target.value as MealCategory)}
                    className="w-full text-xs bg-white/90 p-2 rounded border border-gray-300 focus:outline-hidden font-bold"
                  >
                    {mealCategoriesList.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-rose-700 mb-1">E (kkal)</label>
                  <input 
                    type="number" 
                    placeholder="kkal"
                    value={mealCalories}
                    onChange={e => setMealCalories(e.target.value)}
                    required
                    min="1"
                    className="w-full text-xs bg-white/90 p-2 rounded border border-gray-300 font-bold focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-amber-700 mb-1">Karb (g)</label>
                  <input 
                    type="number" 
                    placeholder="gram"
                    value={mealCarbs}
                    onChange={e => setMealCarbs(e.target.value)}
                    className="w-full text-xs bg-white/90 p-2 rounded border border-gray-300 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-rose-700 mb-1">Prot (g)</label>
                  <input 
                    type="number" 
                    placeholder="gram"
                    value={mealProtein}
                    onChange={e => setMealProtein(e.target.value)}
                    className="w-full text-xs bg-white/90 p-2 rounded border border-gray-300 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase font-bold text-blue-700 mb-1">Lemak (g)</label>
                  <input 
                    type="number" 
                    placeholder="gram"
                    value={mealFat}
                    onChange={e => setMealFat(e.target.value)}
                    className="w-full text-xs bg-white/90 p-2 rounded border border-gray-300 focus:outline-hidden"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-[#8d6e63] hover:bg-[#5d4037] text-white font-serif py-1.5 rounded text-xs font-bold transition-all active:scale-95 shadow-xs"
              >
                + Tambah Hidangan
              </button>
            </form>
          </div>

          {/* Daily memo handwriting notepad */}
          <div className="flex-1 flex flex-col min-h-[160px] bg-amber-50/10 border-t border-dashed border-gray-300 pt-3">
            <h3 className="font-serif font-black text-sm text-[#3e2723] mb-1 flex items-center gap-1">
              <span>📓</span> Catatan Harian Pribadi
            </h3>
            
            <div className="relative flex-1 rounded-lg overflow-hidden bg-[#faf8eed0] border border-[#e8dfc7] p-3 shadow-inner">
              <div className="absolute top-1 right-1 pointer-events-none text-[#a4917d] select-none text-[8px] font-mono uppercase font-bold">
                MEMENTO MORI
              </div>
              <textarea 
                value={currentLog.notes}
                onChange={e => handleNoteChange(e.target.value)}
                placeholder="Tulis kisah produktivitas Anda, catatan santapan diet Anda, atau tip olahraga pagi hari..."
                className="w-full h-full bg-transparent border-none focus:outline-hidden text-sm leading-relaxed font-handwritten text-amber-955 text-[17px] resize-none focus:ring-0"
                style={{ backgroundImage: "linear-gradient(#cfc3a9 1px, transparent 1px)", backgroundSize: "100% 1.8rem", lineHeight: "1.8rem" }}
              ></textarea>
            </div>
            <p className="text-[10px] text-gray-400 italic text-right mt-1">
              • Diarsip secara lokal &amp; dianalisis otomatis pada tab rangkuman mingguan.
            </p>
          </div>

        </div>

        {/* POLES/TABS FOR SWITCHING SCENES ON THE BINDINGS */}
        <div className="absolute -right-6 md:-right-8 top-16 space-y-4 z-40 select-none">
          <button 
            onClick={() => {
              setActiveTab("daily");
              playBeep(450, 0.1, "sine");
            }}
            className={`flex items-center gap-1 ${activeTab === 'daily' ? 'bg-[#3e2723] text-amber-300 translate-x-1 border-amber-500/50' : 'bg-[#8d6e63] text-amber-100 hover:bg-[#5d4037] opacity-85'} px-3 py-6 rounded-r-xl border shadow-lg cursor-pointer transform transition-all duration-200 hover:translate-x-1`}
          >
            <span className="[writing-mode:vertical-rl] font-bold text-xs uppercase tracking-widest font-serif flex items-center gap-1">
              📕 DAILY SHEET
            </span>
          </button>
          
          <button 
            onClick={() => {
              setActiveTab("weekly");
              playBeep(450, 0.1, "sine");
            }}
            className={`flex items-center gap-1 ${activeTab === 'weekly' ? 'bg-[#3e2723] text-amber-300 translate-x-1 border-amber-500/50' : 'bg-[#8d6e63] text-amber-100 hover:bg-[#5d4037] opacity-85'} px-3 py-6 rounded-r-xl border shadow-lg cursor-pointer transform transition-all duration-200 hover:translate-x-1`}
          >
            <span className="[writing-mode:vertical-rl] font-bold text-xs uppercase tracking-widest font-serif flex items-center gap-1">
              📊 WEEKLY STATS
            </span>
          </button>
        </div>

      </div>

      {/* RAGKUMAN MINGGUAN SCENE (Always displayed as persistent overlay below OR as main tab overlay) */}
      <div className={`w-full max-w-6xl mt-4 ${activeTab === 'weekly' ? 'block' : 'hidden md:block'} mb-24 z-10`}>
        <div className="bg-[#5d4037] rounded-3xl p-6 md:p-8 border-y-8 border-[#3e2723] shadow-2xl relative overflow-visible">
          
          {/* Paper overlay inside leather wrap */}
          <div className="bg-[#faf8f0] rounded-xl p-6 md:p-8 shadow-inner border border-[#dcd6c8] relative">
            
            {/* Paper clip decoration */}
            <div className="absolute -top-3 left-10 w-8 h-16 paper-clip rounded-lg border-2 border-slate-300 opacity-90 rotate-12 flex flex-col items-center justify-between py-2 pointer-events-none shadow-md">
              <div className="w-4 h-1.5 bg-[#cfd8dc] rounded-full"></div>
              <div className="w-5 h-5 border-2 border-slate-400 rounded-full"></div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 border-b-2 border-[#8d6e63]/30 pb-4">
              <div>
                <h2 className="text-2xl font-serif font-black tracking-wide text-[#3e2723] flex items-center gap-2">
                  <span>📊</span> Rangkuman Sehat Mingguan
                </h2>
                <p className="text-xs text-gray-500 font-sans tracking-wide">
                  Dihitung otomatis berdasarkan 7 hari terakhir dari tanggal aktif pilihan Anda ({selectedDate})
                </p>
              </div>

              <div className="flex gap-4">
                <div className="bg-amber-100/50 px-4 py-2 rounded-lg border border-[#e1dcd0] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#8d6e63] block tracking-wider">Rerata Kalori</span>
                  <span className="font-serif font-black text-xl text-[#3e2723]">
                    {weeklyRecap.avgCal} <span className="text-xs font-normal">kkal</span>
                  </span>
                </div>
                <div className="bg-blue-100/40 px-4 py-2 rounded-lg border border-[#cfdbe0] text-center">
                  <span className="text-[10px] uppercase font-bold text-[#2d5d62] block tracking-wider">Rerata Hidrasi</span>
                  <span className="font-serif font-black text-xl text-[#1b3d42]">
                    {weeklyRecap.avgWater} <span className="text-xs font-normal">gelas</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Hand-drawn style Weekly Bar Chart with targets overlay */}
            <div className="mb-8">
              <h3 className="text-xs font-black uppercase text-[#8d6e63] tracking-widest mb-4">Grafik Konsumsi Kalori Mingguan</h3>
              
              <div className="h-44 flex items-end justify-between gap-2.5 borer-b-2 border-slate-300 bg-amber-50/10 p-2 rounded-lg relative">
                
                {/* Horizontal reference threshold target line */}
                <div className="absolute left-0 right-0 border-t border-dashed border-red-500/40 pointer-events-none flex items-center pl-2" style={{ bottom: "60%" }}>
                  <span className="bg-red-100 text-[9px] uppercase font-bold text-red-700 px-1.5 py-0.5 rounded border border-red-200">
                    Target: {goals.calories} kkal
                  </span>
                </div>

                {weeklyRecap.weekLogs.map((wl, idx) => {
                  const dailyTotals = getDailyTotals(wl);
                  const basePercent = goals.calories > 0 ? (dailyTotals.calories / goals.calories) * 100 : 0;
                  const ratio = Math.min(100, Math.max(0, basePercent));

                  return (
                    <div key={wl.date} className="flex-1 flex flex-col items-center">
                      <div className="text-[10px] font-mono text-slate-500 mb-1 font-bold">
                        {dailyTotals.calories > 0 ? `${dailyTotals.calories}` : "-"}
                      </div>
                      
                      {/* Bar body */}
                      <div className="w-full relative group">
                        <div 
                          className={`w-full rounded-t-lg transition-all duration-300 ${
                            dailyTotals.calories === 0 
                              ? 'bg-stone-200/50 h-2' 
                              : dailyTotals.calories > goals.calories 
                                ? 'bg-orange-600 shadow-[0_4px_12px_rgba(220,100,60,0.4)]' 
                                : 'bg-[#8d6e63]'
                          }`}
                          style={{ height: dailyTotals.calories === 0 ? '6px' : `${(ratio / 100) * 120}px` }}
                        ></div>
                        
                        {/* Tooltip on hovering weeks */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] p-2 rounded shadow-md hidden group-hover:block whitespace-nowrap z-30">
                          <p className="font-bold">{formatIndoDate(wl.date)}</p>
                          <p>Hidrasi: {dailyTotals.waterCups} / {goals.waterGlasses} gelas</p>
                          {wl.notes && <p className="italic text-amber-200 font-handwritten text-sm mt-0.5">"{wl.notes}"</p>}
                        </div>
                      </div>

                      {/* Day label */}
                      <span className="text-[10px] mt-2 font-bold text-slate-600">{formatShortDay(wl.date)}</span>
                      <span className="text-[9px] text-[#8d6e63] font-serif font-medium">{wl.date.split("-")[2]}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Polaroids - Scattered physical snapshots layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
              
              {/* Polaroid 1: AI Insight recommendation card style */}
              <div className="bg-white p-4 pb-8 rounded shadow-xl border border-stone-200 transform rotate-[-1deg] relative">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow"></div>
                <h4 className="font-serif font-black text-xs text-[#8d6e63] uppercase tracking-wide border-b border-gray-100 pb-1.5 mb-2 flex items-center gap-1">
                  <span>🦉</span> Nasehat Gizi AI
                </h4>
                <p className="font-handwritten text-xl text-amber-950 leading-relaxed font-semibold">
                  "{weeklyRecap.advice}"
                </p>
                <div className="absolute bottom-1 right-2 text-slate-300 font-serif text-[10px] font-bold">
                  Skeuo Nutritionist AI
                </div>
              </div>

              {/* Polaroid 2: Streak Achievements */}
              <div className="bg-white p-4 pb-8 rounded shadow-xl border border-stone-200 transform rotate-[1.5deg] relative">
                <div className="absolute -top-2 left-1/4 w-4 h-4 bg-yellow-500 rounded-full border-2 border-white shadow"></div>
                <h4 className="font-serif font-black text-xs text-[#8d6e63] uppercase tracking-wide border-b border-gray-100 pb-1.5 mb-2 flex items-center gap-1">
                  <span>🏆</span> Prestasi &amp; Konsistensi
                </h4>
                
                <div className="space-y-2 font-sans py-1">
                  <div className="flex justify-between text-xs border-b border-dashed border-gray-100 pb-1">
                    <span className="text-slate-600">Terbanyak Hidrasi</span>
                    <span className="font-bold text-emerald-700">8 Gelas Terpenuhi</span>
                  </div>
                  <div className="flex justify-between text-xs border-b border-dashed border-gray-100 pb-1">
                    <span className="text-slate-600">Rerata Defisit Harian</span>
                    <span className="font-bold text-[#8d6e63]">
                      {(weeklyRecap.avgCal > 0 && weeklyRecap.avgCal < goals.calories) ? `${goals.calories - weeklyRecap.avgCal} kkal` : "Target Sesuai"}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs pb-1">
                    <span className="text-slate-600">Hari Tercatat</span>
                    <span className="font-bold text-slate-800">
                      {weeklyRecap.weekLogs.filter(wl => wl.meals.length > 0 || wl.water.length > 0).length} Hari Aktif
                    </span>
                  </div>
                </div>

                <div className="absolute bottom-1 right-2 text-slate-300 font-serif text-[10px] font-bold">
                  Log Record Book
                </div>
              </div>

              {/* Polaroid 3: Snapshots Gallery of photo uploaded meals */}
              <div className="bg-white p-4 pb-8 rounded shadow-xl border border-stone-200 transform rotate-[-0.7deg] relative">
                <div className="absolute -top-2 right-1/4 w-4 h-4 bg-teal-500 rounded-full border-2 border-white shadow"></div>
                <h4 className="font-serif font-black text-xs text-[#8d6e63] uppercase tracking-wide border-b border-gray-100 pb-1.5 mb-2 flex items-center gap-1">
                  <span>🖼️</span> Galeri Hidangan Pilihan
                </h4>
                
                {/* Look for existing images or default back to a beautiful placeholder drawing */}
                {weeklyRecap.weekLogs.flatMap(wl => wl.meals).filter(m => m.photoUrl).length > 0 ? (
                  <div className="grid grid-cols-2 gap-1.5 max-h-24 overflow-y-auto">
                    {weeklyRecap.weekLogs.flatMap(wl => wl.meals).filter(m => m.photoUrl).slice(0, 4).map((m, idx) => (
                      <div key={idx} className="relative aspect-square rounded-md overflow-hidden bg-slate-150 border border-stone-250">
                        <img src={m.photoUrl} alt={m.name} className="object-cover w-full h-full" />
                        <span className="absolute bottom-0 text-[8px] bg-black/60 text-white font-bold px-1 block w-full truncate leading-none py-0.5">{m.name}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-3 border border-dashed border-[#8d6e63]/30 rounded-lg h-24 bg-amber-50/20 text-center">
                    <Coffee className="w-6 h-6 text-slate-400 stroke-[1.5]" />
                    <span className="text-[10px] text-gray-400 italic mt-1 leading-tight">Gunakan fitur Camera AI Scan scan piring makan Anda</span>
                  </div>
                )}

                <div className="absolute bottom-1 right-2 text-slate-300 font-serif text-[10px] font-bold">
                  Snapshots Cam Log
                </div>
              </div>

            </div>

          </div>

        </div>
      </div>

    </div>
  );
}
