import { memo } from "react";
import { Search } from "lucide-react"; // Optional: Add an icon if you want

const ListHeader = memo(({ title, onAdd, onSearch, searchVal, showAdd = true, children }: any) => (
    <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 uppercase tracking-tight">{title}</h2>
        <div className="flex items-center gap-3 w-full md:w-auto relative">
            <div className="relative flex-1 md:flex-initial">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                </div>
                <input 
                    className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-all" 
                    placeholder="Search..." 
                    value={searchVal} 
                    onChange={e => onSearch(e.target.value)} 
                />
            </div>
            
            {children}

            {showAdd && (
                <button 
                    onClick={onAdd} 
                    className="bg-black hover:bg-slate-800 text-white px-5 py-2 rounded-lg text-sm font-bold shadow-lg transition-all whitespace-nowrap active:scale-95"
                >
                    + Add New
                </button>
            )}
        </div>
    </div>
));

ListHeader.displayName = "ListHeader";
export default ListHeader;