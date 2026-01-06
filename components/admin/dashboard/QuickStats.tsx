"use client";
import { useEffect, useState } from "react";
import { Sun, CloudRain, Cloud, Loader2 } from "lucide-react";

export default function QuickStats() {
  const [weather, setWeather] = useState<{ temp: number, code: number } | null>(null);
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: 'long', month: 'short', day: 'numeric' });
  const timeStr = today.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });

  // Fetch Dhaka Weather (No API Key needed)
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
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-full">
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -mr-10 -mt-10"></div>
      
      <div className="relative z-10 flex justify-between items-start">
        <div>
          <h4 className="text-indigo-300 font-bold text-xs uppercase tracking-widest mb-1">Today</h4>
          <h2 className="text-2xl font-black">{dateStr}</h2>
          <p className="text-slate-400 text-sm font-medium mt-1">{timeStr}</p>
        </div>
        
        <div className="text-right">
            {weather ? (
                <>
                    <Sun className="w-8 h-8 text-amber-400 mb-1 inline-block animate-pulse-slow" />
                    <div className="text-2xl font-bold">{weather.temp}°C</div>
                    <div className="text-[10px] text-slate-400">Dhaka, BD</div>
                </>
            ) : (
                <Loader2 className="w-6 h-6 animate-spin text-slate-500" />
            )}
        </div>
      </div>

      <div className="mt-4">
        {/* You can connect this to real data later if needed */}
        <div className="flex items-center gap-2 text-xs font-medium text-emerald-400 bg-emerald-400/10 px-3 py-1.5 rounded-lg w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            System Online
        </div>
      </div>
    </div>
  );
}