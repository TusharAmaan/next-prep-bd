export default function InviteModal({ isOpen, onClose, onInvite, email, setEmail, role, setRole, submitting }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl p-6 animate-pop-in">
        <h3 className="text-xl font-black text-slate-900 mb-1">Invite Member</h3>
        <p className="text-xs text-slate-500 mb-6">Send an email invitation to join the team.</p>
        <div className="space-y-4">
          <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Email Address</label>
             <input className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500" placeholder="colleague@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div>
             <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Role</label>
             <select className="w-full border-2 border-slate-100 p-3 rounded-xl text-sm font-bold outline-none focus:border-indigo-500 bg-white" value={role} onChange={e => setRole(e.target.value)}>
                <option value="editor">Editor</option><option value="tutor">Tutor</option><option value="institute">Institute</option><option value="admin">Admin</option>
             </select>
          </div>
          <button onClick={onInvite} disabled={submitting} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-black transition-all disabled:opacity-50 shadow-lg mt-2">
            {submitting ? "Sending..." : "Send Invitation"}
          </button>
          <button onClick={onClose} className="w-full text-xs font-bold text-slate-400 py-2 hover:text-slate-600">Cancel</button>
        </div>
      </div>
    </div>
  );
}