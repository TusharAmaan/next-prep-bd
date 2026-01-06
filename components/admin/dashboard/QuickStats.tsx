"use client";
import { useEffect, useState } from "react";
import { Sun, CloudRain, Cloud, Loader2, MapPin, Calendar, Clock } from "lucide-react";

export default function QuickStats() {
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
  const timeStr = today.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=23.8103&longitude=90.4125&current_weather=true")
      .then(res => res.json())
      .then(data => {
        if (data.current_weather) {
            setWeather({ temp: data.current_weather.temperature, code: data.current_weather.weathercode });
        }
      })
      .catch(err => console.error("Weather error:", err));
  }, []);

  return (
    // Redesigned with a Vibrant Gradient
    <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden flex flex-col justify-between h-full group">
      
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl -ml-10 -mb-10 pointer-events-none"></div>

      <div className="relative z-10 flex justify-between items-start">
        <div>
          <div className="flex items-center gap-1.5 text-indigo-200 text-xs font-bold uppercase tracking-widest mb-2 bg-white/10 w-fit px-2 py-1 rounded-full border border-white/10">
            <Calendar className="w-3 h-3" /> Today
          </div>
          <h2 className="text-3xl font-black tracking-tight">{dateStr}</h2>
          <p className="text-indigo-100 text-lg font-medium mt-1 flex items-center gap-2">
            <Clock className="w-4 h-4 opacity-70"/> {timeStr}
          </p>
        </div>
        
        <div className="text-right flex flex-col items-end">
            {weather ? (
                <>
                    <Sun className="w-10 h-10 text-amber-300 mb-2 animate-spin-slow drop-shadow-lg" />
                    <div className="text-3xl font-black">{Math.round(weather.temp)}°</div>
                    <div className="text-[10px] font-bold text-indigo-200 flex items-center gap-1 bg-black/20 px-2 py-0.5 rounded-md mt-1">
                        <MapPin className="w-3 h-3"/> Dhaka
                    </div>
                </>
            ) : (
                <Loader2 className="w-6 h-6 animate-spin text-white/50" />
            )}
        </div>
      </div>

      <div className="mt-6 relative z-10">
        <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/10 flex items-center justify-between group-hover:bg-white/15 transition-colors">
            <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-900/20">
                 <span className="font-bold text-sm">✓</span>
               </div>
               <div>
                 <p className="text-xs text-indigo-200 font-bold uppercase">System Status</p>
                 <p className="text-sm font-bold text-white">All Systems Operational</p>
               </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}