import { memo } from "react";

const CategorySelector = memo(({ label, value, onChange, context, categories, openModal, markDirty }: any) => {
    const filtered = categories.filter((c: any) => c.type === context || c.type === 'general' || !c.type || (context === 'question' && c.type === 'question'));
    return (
        <div className="space-y-1.5"><label className="text-xs font-bold text-slate-600 block uppercase">{label}</label><div className="flex gap-2"><select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm outline-none cursor-pointer hover:border-slate-300 transition-colors" value={value} onChange={e => { onChange(e.target.value); markDirty(); }}><option value="">Select Category</option>{filtered.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}</select><button onClick={() => openModal(context)} className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-md hover:bg-black transition-all">New</button></div></div>
    );
});
CategorySelector.displayName = "CategorySelector";
export default CategorySelector;