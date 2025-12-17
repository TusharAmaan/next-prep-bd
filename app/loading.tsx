export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white z-50 relative">
      {/* Spinner */}
      <div className="w-12 h-12 border-[5px] border-slate-100 border-t-blue-600 rounded-full animate-spin mb-6"></div>
      
      {/* Text */}
      <div className="text-center space-y-2 animate-pulse">
        <h3 className="text-slate-800 font-bold text-lg tracking-tight">Preparing study materials...</h3>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Please wait</p>
      </div>
    </div>
  );
}