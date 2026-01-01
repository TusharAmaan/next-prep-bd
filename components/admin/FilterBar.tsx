import { Search, Filter } from "lucide-react";

export default function FilterBar({ search, setSearch, roleFilter, setRoleFilter, activeTab }: any) {
  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="relative flex-1">
         <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
         <input 
           className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" 
           placeholder={activeTab === 'users' ? "Search users..." : "Search invites..."} 
           value={search} 
           onChange={(e) => setSearch(e.target.value)} 
         />
      </div>
      {activeTab === 'users' && (
          <div className="relative min-w-[180px]">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <select 
                className="w-full bg-white border border-slate-200 pl-10 pr-4 py-2.5 rounded-xl text-sm font-bold text-slate-600 outline-none focus:border-indigo-500 appearance-none cursor-pointer" 
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