import { memo } from "react";

const ImageInput = memo(({ label, method, setMethod, file, setFile, link, setLink, markDirty, optional = false }: any) => (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center"><h4 className="text-xs font-bold uppercase text-slate-400">{label} {optional && <span className="text-slate-300">(Optional)</span>}</h4><div className="flex bg-slate-100 rounded-lg p-0.5"><button onClick={() => { setMethod('upload'); markDirty(); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method === 'upload' ? 'bg-white shadow text-black' : 'text-slate-400'}`}>Upload</button><button onClick={() => { setMethod('link'); markDirty(); }} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${method === 'link' ? 'bg-white shadow text-black' : 'text-slate-400'}`}>Link</button></div></div>
        {method === 'upload' ? (<div className="border-2 border-dashed p-6 rounded-lg text-center relative hover:bg-slate-50 transition cursor-pointer"><input type="file" accept="image/*" onChange={e => { setFile(e.target.files?.[0] || null); markDirty(); }} className="absolute inset-0 opacity-0 cursor-pointer"/><span className="text-2xl block mb-2">📸</span><p className="text-xs font-bold text-slate-400">{file ? file.name : "Click to Upload"}</p></div>) : (<input className="w-full border p-2.5 rounded-lg text-xs font-medium" placeholder="https://..." value={link} onChange={e => { setLink(e.target.value); markDirty(); }} />)}
    </div>
));
ImageInput.displayName = "ImageInput";
export default ImageInput;