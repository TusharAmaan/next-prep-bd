import { Search, Filter } from "lucide-react";

export default function FilterBar({ search, setSearch, roleFilter, setRoleFilter, activeTab }: any) {
  
  // Logic: If the tab is NOT 'invitations', it means we are viewing a list of users (Active, Pending, or Suspended)
  const isUserView = activeTab !== 'invitations';

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      
      {/* Search Input */}
      <div className="relative flex-1 group">
         <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search className="w-4 h-4" />
         </div>
         <input 
           className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm" 
           placeholder={isUserView ? "Search users by name or email..." : "Search invites by email..."} 
           value={search} 
           onChange={(e) => setSearch(e.target.value)} 
         />
      </div>

      {/* Role Filter - Show this for Active, Pending, and Suspended tabs */}
      {isUserView && (
          <div className="relative min-w-[180px]">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                  <Filter className="w-3.5 h-3.5" />
              </div>
              <select 
                className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 uppercase outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 appearance-none cursor-pointer shadow-sm transition-all" 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="tutor">Tutor</option>
                  <option value="institute">Institute</option>
                  <option value="student">Student</option>
              </select>
          </div>
      )}
    </div>
  );
}