"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { 
  Award, 
  Plus, 
  Trash2, 
  Edit3, 
  Search, 
  UserPlus, 
  Trophy, 
  Star, 
  ShieldCheck,
  Zap,
  Loader2,
  X
} from "lucide-react";

export default function BadgeManager({ darkMode = false }: { darkMode?: boolean }) {
  const supabase = createClient();
  const [badges, setBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<any>(null);

  const fetchBadges = async () => {
    setLoading(true);
    const { data } = await supabase.from('badges').select('*').order('name');
    if (data) setBadges(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  const handleSaveBadge = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const badgeData = {
      name: formData.get('name'),
      description: formData.get('description'),
      icon_key: formData.get('icon_key'),
      criteria_type: formData.get('criteria_type'),
      criteria_value: parseInt(formData.get('criteria_value') as string) || 0
    };

    if (editingBadge) {
      await supabase.from('badges').update(badgeData).eq('id', editingBadge.id);
    } else {
      await supabase.from('badges').insert(badgeData);
    }

    setIsEditorOpen(false);
    setEditingBadge(null);
    fetchBadges();
  };

  const deleteBadge = async (id: number) => {
    if (!confirm("Delete this badge? This will remove it from all users.")) return;
    await supabase.from('badges').delete().eq('id', id);
    fetchBadges();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            <Award className="w-8 h-8 text-indigo-600" />
            Gamification Registry
          </h2>
          <p className="text-slate-500 font-bold mt-1">Manage platform-wide achievements and student rewards.</p>
        </div>
        <button 
          onClick={() => { setEditingBadge(null); setIsEditorOpen(true); }}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all flex items-center gap-3 active:scale-95"
        >
          <Plus size={20} /> CREATE NEW BADGE
        </button>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4">
        {loading ? (
          <div className="col-span-3 py-24 flex justify-center"><Loader2 className="animate-spin text-indigo-600 w-10 h-10" /></div>
        ) : badges.map((badge) => (
          <div key={badge.id} className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-700 shadow-xl p-8 flex flex-col group hover:-translate-y-1 transition-all">
            <div className="flex justify-between items-start mb-6">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-indigo-600">
                <Trophy size={32} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={() => { setEditingBadge(badge); setIsEditorOpen(true); }}
                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"
                >
                    <Edit3 size={18} />
                </button>
                <button 
                    onClick={() => deleteBadge(badge.id)}
                    className="p-2 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                >
                    <Trash2 size={18} />
                </button>
              </div>
            </div>
            
            <h3 className="text-xl font-black text-slate-900 dark:text-white">{badge.name}</h3>
            <p className="text-sm text-slate-500 font-bold mt-2 leading-relaxed flex-1">{badge.description || "No description provided."}</p>
            
            <div className="mt-8 pt-6 border-t dark:border-slate-800 flex justify-between items-center">
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">criteria</p>
                   <p className="text-xs font-black text-indigo-600">{badge.criteria_value} {badge.criteria_type?.replace('_', ' ')}</p>
                </div>
                <div className="flex items-center gap-2 text-slate-300">
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                    <Star size={14} className="fill-current" />
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Dialog */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-[48px] shadow-2xl overflow-hidden border border-white/20">
            <form onSubmit={handleSaveBadge} className="p-12">
              <div className="flex justify-between items-center mb-10">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white">{editingBadge ? 'Refine Badge' : 'Forge Badge'}</h3>
                <button type="button" onClick={() => setIsEditorOpen(false)} className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-rose-600 transition-all">
                  <X size={28} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Badge Name</label>
                  <input 
                    name="name"
                    defaultValue={editingBadge?.name}
                    required
                    placeholder="e.g. Master Archer"
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white outline-none transition-all"
                  />
                </div>

                <div>
                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Icon Key</label>
                    <div className="grid grid-cols-5 gap-3">
                        {['Trophy', 'Star', 'Shield', 'Zap', 'Target'].map((icon) => (
                            <button type="button" key={icon} className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl flex items-center justify-center text-slate-400 hover:text-indigo-600 border-2 border-transparent hover:border-indigo-600 transition-all">
                                <Star size={20} />
                            </button>
                        ))}
                        <input type="hidden" name="icon_key" value="Trophy" />
                    </div>
                </div>

                <div>
                  <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Reward Description</label>
                  <textarea 
                    name="description"
                    defaultValue={editingBadge?.description}
                    placeholder="Describe how to earn this..."
                    className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-indigo-600 rounded-2xl py-4 px-6 font-bold text-slate-800 dark:text-white outline-none transition-all h-24 resize-none"
                  />
                </div>

                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Criteria Type</label>
                        <select name="criteria_type" defaultValue={editingBadge?.criteria_type || 'exam_count'} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl py-4 px-6 font-bold outline-none">
                            <option value="exam_count">Exams taken</option>
                            <option value="avg_score">Avg Score</option>
                            <option value="total_points">Total Points</option>
                        </select>
                    </div>
                    <div className="w-1/3">
                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Value</label>
                        <input name="criteria_value" type="number" defaultValue={editingBadge?.criteria_value} className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-transparent rounded-2xl py-4 px-6 font-bold outline-none"/>
                    </div>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-5 rounded-[20px] font-black text-sm shadow-xl shadow-indigo-100 dark:shadow-none hover:bg-indigo-700 transition-all active:scale-95"
                >
                  {editingBadge ? 'UPDATE REGISTRY' : 'LEGALIZE BADGE'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
