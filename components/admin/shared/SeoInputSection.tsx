import { memo } from "react";

const SeoInputSection = memo(({ title, setTitle, tags, setTags, desc, setDesc, markDirty }: any) => (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 rounded-xl space-y-4 shadow-sm mt-6">
        <div className="flex items-center justify-between"><h4 className="text-xs font-extrabold text-slate-500 dark:text-slate-400 dark:text-slate-500 uppercase flex items-center gap-2"><span>🔍</span> SEO Settings</h4></div>
        <div className="space-y-4">
            <div><label className="text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 block mb-1.5">Meta Title</label><input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={title} onChange={e => { setTitle(e.target.value); markDirty(); }} /></div>
            <div><label className="text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 block mb-1.5">Tags</label><input className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500" value={tags} onChange={e => { setTags(e.target.value); markDirty(); }} placeholder="comma, separated" /></div>
            <div><label className="text-xs font-bold text-slate-600 dark:text-slate-400 dark:text-slate-500 block mb-1.5">Description</label><textarea className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none" value={desc} onChange={e => { setDesc(e.target.value); markDirty(); }} /></div>
        </div>
    </div>
));
SeoInputSection.displayName = "SeoInputSection";
export default SeoInputSection;