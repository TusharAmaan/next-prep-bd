"use client";
import { Filter, Calendar, Search } from "lucide-react";

export default function ContentFilterBar({
  activeTab,
  segments, groups, subjects,
  selSeg, setSelSeg, selGrp, setSelGrp, selSub, setSelSub,
  onFetchGroups, onFetchSubjects,
  dateFilter, setDateFilter,
  startDate, setStartDate, endDate, setEndDate,
  typeFilter, setTypeFilter,
  updateTypeFilter, setUpdateTypeFilter,
  catFilter, setCatFilter, categories,
  typeOptions // Now passed correctly from parent
}: any) {

  return (
    <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between animate-fade-in">
      
      {/* LEFT: MAIN FILTERS */}
      <div className="flex flex-col md:flex-row gap-3 w-full xl:w-auto">
         
         {/* 1. DATE FILTER */}
         <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
             <input type="date" className="bg-transparent text-xs font-bold text-slate-600 outline-none px-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
             <span className="text-slate-300 text-[10px]">TO</span>
             <input type="date" className="bg-transparent text-xs font-bold text-slate-600 outline-none px-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
         </div>

         {/* 2. TYPE FILTER (Correctly handles both Materials and Updates) */}
         {(activeTab === 'materials' || activeTab === 'segment_updates') && (
            <div className="relative min-w-[140px]">
               <select 
                  className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-lg py-2.5 px-3 pr-8 outline-none focus:border-indigo-500 cursor-pointer"
                  value={activeTab === 'materials' ? typeFilter : updateTypeFilter}
                  onChange={(e) => activeTab === 'materials' ? setTypeFilter(e.target.value) : setUpdateTypeFilter(e.target.value)}
               >
                  <option value="all">All Types</option>
                  {typeOptions && typeOptions.map((opt: any) => (
                      <option key={opt.val} value={opt.val}>{opt.label}</option>
                  ))}
               </select>
               <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
            </div>
         )}

         {/* 3. CATEGORY FILTER (For eBooks/News) */}
         {(activeTab === 'ebooks' || activeTab === 'news') && (
             <div className="relative min-w-[140px]">
                <select className="w-full appearance-none bg-slate-50 border border-slate-100 text-slate-600 text-xs font-bold rounded-lg py-2.5 px-3 pr-8 outline-none focus:border-indigo-500 cursor-pointer" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                    <option value="all">All Categories</option>
                    {categories.map((c:any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                <Filter className="w-3 h-3 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"/>
             </div>
         )}
      </div>

      {/* RIGHT: HIERARCHY FILTERS (Segment/Group/Subject) */}
      {(['materials', 'courses', 'segment_updates'].includes(activeTab)) && (
         <div className="flex flex-col md:flex-row gap-2 w-full xl:w-auto">
             
             {/* SEGMENT (Always visible for these tabs) */}
             <select 
                className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg py-2.5 px-3 outline-none focus:border-indigo-500 hover:border-indigo-300 transition-colors w-full md:w-40"
                value={selSeg}
                onChange={(e) => {
                    setSelSeg(e.target.value);
                    setSelGrp(""); setSelSub(""); // Reset children
                    onFetchGroups(e.target.value);
                }}
             >
                <option value="">All Segments</option>
                {segments.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
             </select>

             {/* GROUP & SUBJECT (Only if NOT Segment Updates) */}
             {activeTab !== 'segment_updates' && (
                 <>
                    <select 
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg py-2.5 px-3 outline-none focus:border-indigo-500 hover:border-indigo-300 transition-colors w-full md:w-40 disabled:opacity-50 disabled:bg-slate-50"
                        value={selGrp}
                        disabled={!selSeg}
                        onChange={(e) => {
                            setSelGrp(e.target.value);
                            setSelSub("");
                            onFetchSubjects(e.target.value);
                        }}
                    >
                        <option value="">All Groups</option>
                        {groups.map((g:any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                    </select>

                    <select 
                        className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg py-2.5 px-3 outline-none focus:border-indigo-500 hover:border-indigo-300 transition-colors w-full md:w-40 disabled:opacity-50 disabled:bg-slate-50"
                        value={selSub}
                        disabled={!selGrp}
                        onChange={(e) => setSelSub(e.target.value)}
                    >
                        <option value="">All Subjects</option>
                        {subjects.map((s:any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                    </select>
                 </>
             )}
         </div>
      )}

    </div>
  );
}