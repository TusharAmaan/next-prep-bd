"use client";
import { Filter } from "lucide-react";

export default function ContentFilterBar({
    activeTab,
    segments, groups, subjects,
    selSeg, setSelSeg,
    selGrp, setSelGrp,
    selSub, setSelSub,
    onFetchGroups, onFetchSubjects,
    dateFilter, setDateFilter,
    startDate, setStartDate, endDate, setEndDate,
    typeFilter, setTypeFilter,
    updateTypeFilter, setUpdateTypeFilter,
    catFilter, setCatFilter, categories,
    showHierarchy = false, showSegmentOnly = false, showType = false, showUpdateType = false, showCategory = false,
    typeOptions = []
}: any) {

    return (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6 space-y-4">
            
            {/* TOP ROW: Date & Type Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-100 pb-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Filter Content</h3>
                
                <div className="flex flex-wrap gap-2">
                    {/* Date Inputs */}
                    <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border border-slate-100">
                        <input type="date" className="bg-transparent text-xs font-bold text-slate-600 outline-none px-2" value={startDate} onChange={e => setStartDate(e.target.value)} />
                        <span className="text-slate-300 text-[10px] font-bold">TO</span>
                        <input type="date" className="bg-transparent text-xs font-bold text-slate-600 outline-none px-2" value={endDate} onChange={e => setEndDate(e.target.value)} />
                    </div>

                    <select className="bg-slate-50 border border-slate-200 text-xs font-bold rounded-lg px-3 py-2 text-slate-700 outline-none cursor-pointer hover:bg-slate-100" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
                        <option value="all">📅 Any Time</option>
                        <option value="this_month">This Month</option>
                        <option value="last_6_months">Last 6 Months</option>
                    </select>

                    {/* Material Type Filter */}
                    {showType && (
                        <select className="bg-blue-50 border border-blue-100 text-xs font-bold rounded-lg px-3 py-2 text-blue-700 outline-none cursor-pointer" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="all">All Types</option>
                            {typeOptions.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                        </select>
                    )}

                    {/* Segment Update Type Filter (Fixes Image 2 Issue) */}
                    {showUpdateType && (
                        <select className="bg-red-50 border border-red-100 text-xs font-bold rounded-lg px-3 py-2 text-red-700 outline-none cursor-pointer" value={updateTypeFilter} onChange={e => setUpdateTypeFilter(e.target.value)}>
                            <option value="all">All Updates</option>
                            {typeOptions.map((opt: any) => <option key={opt.val} value={opt.val}>{opt.label}</option>)}
                        </select>
                    )}

                    {/* Category Filter */}
                    {showCategory && (
                        <select className="bg-purple-50 border border-purple-100 text-xs font-bold rounded-lg px-3 py-2 text-purple-700 outline-none cursor-pointer" value={catFilter} onChange={e => setCatFilter(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {/* BOTTOM ROW: Hierarchy Filters */}
            {(showHierarchy || showSegmentOnly) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Segment Selector (Always visible if enabled) */}
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Segment</label>
                        <select 
                            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none focus:border-indigo-500 transition-colors" 
                            value={selSeg} 
                            onChange={e => { setSelSeg(e.target.value); onFetchGroups(e.target.value); }}
                        >
                            <option value="">All Segments</option>
                            {segments.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                        </select>
                    </div>

                    {/* Group & Subject (Hidden for Segment Updates) */}
                    {showHierarchy && (
                        <>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Group</label>
                                <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none disabled:opacity-50" value={selGrp} onChange={e => { setSelGrp(e.target.value); onFetchSubjects(e.target.value); }} disabled={!selSeg}>
                                    <option value="">All Groups</option>
                                    {groups.map((g: any) => <option key={g.id} value={g.id}>{g.title}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-400 uppercase">Subject</label>
                                <select className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-sm font-bold outline-none disabled:opacity-50" value={selSub} onChange={e => setSelSub(e.target.value)} disabled={!selGrp}>
                                    <option value="">All Subjects</option>
                                    {subjects.map((s: any) => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}