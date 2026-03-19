'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, IText, FabricImage } from 'fabric';
import { 
  Type, 
  Square, 
  Circle as CircleIcon, 
  Image as ImageIcon, 
  Save, 
  ChevronLeft, 
  Trash2, 
  Bold, 
  Italic, 
  Palette,
  Plus,
  Palette as PaletteIcon
} from 'lucide-react';
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

export default function CertificateDesigner() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState('Untitled Certificate');
  const [view, setView] = useState<'editor' | 'list'>('list');

  // Colors and Fonts
  const colors = ['#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef'];
  const fonts = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Old Standard TT', 'Dancing Script'];

  // Initialize Canvas
  useEffect(() => {
    if (view === 'editor' && canvasRef.current && !canvas) {
      const fbCanvas = new Canvas(canvasRef.current, {
        width: 1056, // Letter Landscape
        height: 816,
        backgroundColor: '#ffffff',
      });

      fbCanvas.on('selection:created', (e: any) => setSelectedObject(e.selected?.[0]));
      fbCanvas.on('selection:updated', (e: any) => setSelectedObject(e.selected?.[0]));
      fbCanvas.on('selection:cleared', () => setSelectedObject(null));

      setCanvas(fbCanvas);
      
      // Scale canvas to fit container if needed (CSS takes care of it mostly)
    }
  }, [view, canvas]);

  // Fetch Designs
  const fetchDesigns = async () => {
    const { data } = await supabase.from('certificate_designs').select('*').order('updated_at', { ascending: false });
    setDesigns(data || []);
  };

  useEffect(() => {
    fetchDesigns();
  }, []);

  // --- ACTIONS ---

  const addText = () => {
    if (!canvas) return;
    const text = new IText('Double click to edit', {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 32,
      fill: '#000000',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const addRect = () => {
    if (!canvas) return;
    const rect = new Rect({
      left: 100,
      top: 100,
      fill: '#3b82f6',
      width: 200,
      height: 150,
      rx: 10,
      ry: 10
    });
    canvas.add(rect);
    canvas.setActiveObject(rect);
  };

  const addCircle = () => {
    if (!canvas) return;
    const circle = new Circle({
      left: 100,
      top: 100,
      fill: '#ef4444',
      radius: 50,
    });
    canvas.add(circle);
    canvas.setActiveObject(circle);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = async (f) => {
      const data = f.target?.result as string;
      const img = await FabricImage.fromURL(data);
      img.scaleToWidth(200);
      canvas.add(img);
      canvas.setActiveObject(img);
    };
    reader.readAsDataURL(file);
  };

  const deleteObject = () => {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    setSelectedObject(null);
  };

  // --- PROPERTY UPDATES ---

  const updateSelected = (props: any) => {
    if (!selectedObject || !canvas) return;
    selectedObject.set(props);
    canvas.renderAll();
  };

  // --- SAVE / LOAD ---

  const saveDesign = async () => {
    if (!canvas) return;
    const json = canvas.toJSON();
    const preview = canvas.toDataURL({ format: 'png', quality: 0.5, multiplier: 1 });

    try {
      const payload = { 
        name: designName, 
        design_json: json, 
        preview_image: preview,
        updated_at: new Date()
      };

      if (currentDesignId) {
        await supabase
          .from('certificate_designs')
          .update(payload)
          .eq('id', currentDesignId);
        toast.success("Design updated");
      } else {
        const { data, error } = await supabase
          .from('certificate_designs')
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        setCurrentDesignId(data.id);
        toast.success("New design saved");
      }
      fetchDesigns();
    } catch (err) {
      toast.error("Failed to save design");
      console.error(err);
    }
  };

  const loadDesign = (design: any) => {
    setView('editor');
    setCurrentDesignId(design.id);
    setDesignName(design.name);
    
    setTimeout(() => {
        if (canvas) {
          canvas.loadFromJSON(design.design_json, () => {
            canvas.renderAll();
          });
        }
    }, 100);
  };

  const createNew = () => {
    setCurrentDesignId(null);
    setDesignName('Untitled Certificate');
    if (canvas) canvas.clear();
    setView('editor');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-50 dark:bg-slate-950 overflow-hidden font-sans">
      
      {/* HEADERBAR */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setView('list')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div>
            {view === 'editor' ? (
                <input 
                    value={designName} 
                    onChange={e => setDesignName(e.target.value)} 
                    className="text-lg font-black bg-transparent outline-none border-b-2 border-transparent focus:border-indigo-600 transition-all dark:text-white"
                />
            ) : (
                <h2 className="text-xl font-black dark:text-white">Certificate Designer</h2>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {view === 'editor' && (
            <button 
                onClick={saveDesign}
                className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg"
            >
                <Save size={18} /> Save Design
            </button>
          )}
          {view === 'list' && (
            <button 
                onClick={createNew}
                className="bg-black text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800"
            >
                <Plus size={18} /> Create New
            </button>
          )}
        </div>
      </div>

      {view === 'list' ? (
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {designs.map(design => (
              <div 
                key={design.id} 
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-4 group hover:border-indigo-500 transition-all cursor-pointer shadow-sm"
                onClick={() => loadDesign(design)}
              >
                <div className="aspect-[4/3] bg-slate-100 dark:bg-slate-800 rounded-2xl mb-4 overflow-hidden border border-slate-100 dark:border-slate-700 relative">
                  {design.preview_image ? (
                    <img src={design.preview_image} alt={design.name} className="w-full h-full object-contain" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400">No Preview</div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <button className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm">Edit Design</button>
                  </div>
                </div>
                <h3 className="font-bold dark:text-white line-clamp-1">{design.name}</h3>
                <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Updated {new Date(design.updated_at).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
          {designs.length === 0 && (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <PaletteIcon size={64} className="mb-4 opacity-20" />
                <p className="font-bold">No certificate designs created yet.</p>
                <button onClick={createNew} className="text-indigo-600 font-bold mt-2 hover:underline">Create your first design</button>
             </div>
          )}
        </div>
      ) : (
        <div className="flex-1 flex overflow-hidden">
          
          {/* TOOLBAR (LEFT) */}
          <div className="w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-6 shrink-0">
             <button onClick={addText} className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all" title="Add Text"><Type size={24}/></button>
             <button onClick={addRect} className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all" title="Add Shape"><Square size={24}/></button>
             <button onClick={addCircle} className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all" title="Add Circle"><CircleIcon size={24}/></button>
             <label className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all cursor-pointer" title="Upload Image">
                <ImageIcon size={24}/>
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
             </label>
             <div className="mt-auto">
               <button onClick={deleteObject} className="p-3 text-slate-300 hover:text-red-600 rounded-2xl transition-all" disabled={!selectedObject} title="Delete Selected">
                 <Trash2 size={24}/>
               </button>
             </div>
          </div>

          {/* CANVAS AREA (CENTER) */}
          <div className="flex-1 flex flex-col overflow-hidden">
             
             {/* PROPERTIES BAR */}
             <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center gap-6 shrink-0 overflow-x-auto no-scrollbar">
                {selectedObject ? (
                  <>
                    {/* Text Properties */}
                    {(selectedObject instanceof IText) && (
                      <div className="flex items-center gap-4">
                        <select 
                          className="bg-slate-100 dark:bg-slate-800 dark:text-white rounded-lg px-2 py-1 text-xs font-bold outline-none"
                          value={selectedObject.fontFamily}
                          onChange={e => updateSelected({ fontFamily: e.target.value })}
                        >
                          {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                        </select>
                        
                        <div className="flex border dark:border-slate-700 rounded-lg overflow-hidden shrink-0">
                          <button onClick={() => updateSelected({ fontWeight: selectedObject.fontWeight === 'bold' ? 'normal' : 'bold' })} className={`p-2 ${selectedObject.fontWeight === 'bold' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Bold size={14}/></button>
                          <button onClick={() => updateSelected({ fontStyle: selectedObject.fontStyle === 'italic' ? 'normal' : 'italic' })} className={`p-2 ${selectedObject.fontStyle === 'italic' ? 'bg-indigo-600 text-white' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}><Italic size={14}/></button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 shrink-0">
                      <Palette size={14} className="text-slate-400" />
                      <div className="flex gap-1">
                        {colors.map(c => (
                          <button key={c} onClick={() => updateSelected({ fill: c })} className="w-5 h-5 rounded-full border border-slate-200" style={{backgroundColor: c}} />
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-slate-400 font-medium">Select an item to edit its properties</div>
                )}
             </div>

             <div className="flex-1 bg-slate-200 dark:bg-slate-800/50 p-10 flex items-center justify-center overflow-auto custom-scrollbar">
                <div className="bg-white shadow-2xl relative">
                   <canvas ref={canvasRef} />
                   <style>{`
                      .canvas-container {
                         box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                         transform: scale(0.6);
                         transform-origin: center center;
                      }
                      @media (min-width: 1536px) {
                        .canvas-container { transform: scale(0.7); }
                      }
                   `}</style>
                </div>
             </div>
          </div>
          
        </div>
      )}
    </div>
  );
}
