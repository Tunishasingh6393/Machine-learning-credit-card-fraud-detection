import React, { useState, useEffect, useMemo } from "react";
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Activity, 
  AlertTriangle, 
  Search, 
  ChevronRight,
  TrendingDown,
  RefreshCcw,
  Bot
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { GoogleGenAI } from "@google/genai";
import { cn } from "./lib/utils";

// --- Types ---
interface Transaction {
  id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  category: string;
  location: string;
  device: string;
  cardType: string;
  isFraud: boolean;
  score: number;
}

// --- Components ---

const StatCard = ({ title, value, subValue, icon: Icon, color }: any) => (
  <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-start justify-between">
    <div>
      <p className="text-slate-400 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
      <p className={cn("text-xs mt-1", color)}>{subValue}</p>
    </div>
    <div className={cn("p-2 rounded-lg bg-opacity-10", color.replace('text-', 'bg-'))}>
      <Icon className={cn("w-5 h-5", color)} />
    </div>
  </div>
);

export default function App() {
  const [data, setData] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulating, setSimulating] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [activeTx, setActiveTx] = useState<Transaction | null>(null);
  const [threshold, setThreshold] = useState(0.65);

  const fetchData = async () => {
    try {
      const res = await fetch("/api/transactions");
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const simulateTx = async (forceFraud = false) => {
    setSimulating(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ forceFraud })
      });
      const newTx = await res.json();
      setData(prev => [newTx, ...prev].slice(0, 100));
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  const runAIAnalysis = async (tx: Transaction) => {
    setActiveTx(tx);
    setAnalysis(null);
    
    if (!process.env.GEMINI_API_KEY) {
      setAnalysis("Forensic Engine Offline: Please configure GEMINI_API_KEY in Secrets.");
      return;
    }

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Act as a senior Banking Fraud Investigator. Analyze this transaction data and provide a concise (2-3 sentences) verdict on why it was flagged or if it looks safe. Data: ${JSON.stringify(tx)}. Use professional banking terminology.`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      
      setAnalysis(response.text || "No analysis provided by engine.");
    } catch (e) {
      console.error(e);
      setAnalysis("Forensic analysis failed. Check console for details.");
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => simulateTx(), 8000);
    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    const total = data.length;
    const fraud = data.filter(d => d.score >= threshold).length;
    const accuracy = 99.4; // Simulated baseline
    return { total, fraud, accuracy };
  }, [data, threshold]);

  const chartData = useMemo(() => {
    return data.slice(0, 20).reverse().map(d => ({
      time: format(new Date(d.timestamp), "HH:mm:ss"),
      score: d.score * 100
    }));
  }, [data]);

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-emerald-500 font-mono text-sm tracking-widest animate-pulse">BOOTING FRAUD DETECTION ENGINE...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500 selection:text-black">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-500/5 blur-[120px]" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <ShieldCheck className="text-black w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight">FRAUD_DETECTOR</h1>
              <p className="text-[10px] text-slate-500 font-mono -mt-1 uppercase tracking-tighter">Credit Card Security Ops</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => simulateTx(true)}
              disabled={simulating}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-full text-xs font-semibold transition-all border border-red-500/20 flex items-center gap-2"
            >
              <AlertTriangle className="w-3 h-3" />
              Force Fraud Event
            </button>
            <div className="h-8 w-px bg-slate-800" />
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-xs font-medium text-slate-400 uppercase tracking-widest">Live Engine</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-12 gap-6 relative">
        
        {/* Left Column: Metrics & Config */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <StatCard 
              title="Recent Throttled" 
              value={stats.fraud} 
              subValue="+12% from last hour" 
              icon={ShieldAlert} 
              color="text-red-500"
            />
            <StatCard 
              title="Model Precision" 
              value={`${stats.accuracy}%`} 
              subValue="Real-time optimized" 
              icon={Activity} 
              color="text-emerald-500"
            />
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-sm font-semibold text-slate-300">Decision Threshold</h4>
              <span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-[10px] font-mono">{(threshold * 100).toFixed(0)}%</span>
            </div>
            <input 
              type="range" 
              min="0.50" 
              max="0.95" 
              step="0.05" 
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer mb-4"
            />
            <p className="text-[11px] text-slate-500 italic">
              "Lower thresholds increase recall but may flag legitimate transactions."
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[300px]">
             <h4 className="text-sm font-semibold text-slate-300 mb-6">Threat Intensity (Score %)</h4>
             <ResponsiveContainer width="100%" height="80%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#10b981" fillOpacity={1} fill="url(#colorScore)" />
                </AreaChart>
             </ResponsiveContainer>
          </div>
        </div>

        {/* Right Column: Transaction Feed */}
        <div className="col-span-12 lg:col-span-8 flex flex-col h-[calc(100vh-200px)]">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-full overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <RefreshCcw className={cn("w-4 h-4 text-slate-500", simulating && "animate-spin")} />
                <h2 className="font-semibold">Live Decision Stream</h2>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-[10px] font-bold">BATCH_SCAVENGER_V2</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-3 custom-scrollbar">
              <AnimatePresence initial={false}>
                {data.map((tx) => {
                  const isFlagged = tx.score >= threshold;
                  return (
                    <motion.div 
                      key={tx.id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      layout
                      className={cn(
                        "group border bg-slate-900/50 rounded-xl p-4 transition-all hover:bg-slate-800/50 cursor-pointer",
                        isFlagged ? "border-red-500/20" : "border-slate-800"
                      )}
                      onClick={() => runAIAnalysis(tx)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            isFlagged ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                          )}>
                            {isFlagged ? <AlertTriangle className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-100">${tx.amount.toLocaleString()}</span>
                              <span className="text-[10px] text-slate-500 font-mono">ID: {tx.id}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <span>{tx.merchant}</span>
                              <span className="text-slate-600">•</span>
                              <span>{tx.location}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={cn(
                             "text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mb-1",
                             isFlagged ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"
                          )}>
                            {(tx.score * 100).toFixed(0)}% THREAT
                          </div>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {format(new Date(tx.timestamp), "HH:mm:ss")}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* AI Forensic Modal */}
      <AnimatePresence>
        {activeTx && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveTx(null)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="relative bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden"
            >
              <div className="h-24 bg-gradient-to-r from-emerald-600/20 to-red-600/20 border-b border-slate-800 flex items-end p-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-700">
                    <Bot className="text-emerald-500 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl uppercase tracking-tight">Forensic Analysis</h3>
                    <p className="text-xs text-slate-400 font-mono">Case ID: {activeTx.id.toUpperCase()}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 space-y-6">
                <div className="grid grid-cols-2 gap-8 py-4 border-b border-slate-800/50">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Entity</p>
                    <p className="text-sm font-semibold">{activeTx.merchant}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1">Risk Score</p>
                    <p className={cn("text-lg font-black", activeTx.score > threshold ? "text-red-500" : "text-emerald-500")}>
                      {(activeTx.score * 100).toFixed(0)}%
                    </p>
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded-2xl p-6 border border-emerald-500/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3">
                    <Zap className="w-4 h-4 text-emerald-500/50" />
                  </div>
                  <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Bot className="w-3 h-3" />
                    Neural Verdict
                  </h4>
                  <div className="text-slate-300 text-sm leading-relaxed min-h-[60px]">
                    {analysis ? (
                      <p>{analysis}</p>
                    ) : (
                      <div className="flex gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" />
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.2s]" />
                        <div className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.4s]" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setActiveTx(null)}
                    className="flex-1 py-3 bg-emerald-500 text-black font-bold rounded-xl hover:bg-emerald-400 transition-colors text-sm"
                  >
                    Confirm & Clearance
                  </button>
                  <button 
                    onClick={() => setActiveTx(null)}
                    className="px-6 py-3 border border-red-500 text-red-500 font-bold rounded-xl hover:bg-red-500/10 transition-colors text-sm"
                  >
                    Block User
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
