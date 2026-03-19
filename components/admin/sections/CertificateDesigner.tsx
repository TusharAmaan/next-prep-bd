'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Canvas, Rect, Circle, IText, FabricImage, Shadow } from 'fabric';
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
  Palette as PaletteIcon, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Sun, 
  Layers, 
  FileText, 
  BadgeCheck, 
  Layout, 
  X 
} from 'lucide-react';
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";

export default function CertificateDesigner() {
  const supabase = createClient();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [designs, setDesigns] = useState<any[]>([]);
  const [currentDesignId, setCurrentDesignId] = useState<string | null>(null);
  const [designName, setDesignName] = useState('Untitled Certificate');
  const [view, setView] = useState<'editor' | 'list'>('list');
  const [showTemplates, setShowTemplates] = useState(false);

  // Colors and Fonts
  const colors = [
    '#000000', '#ffffff', '#ef4444', '#f97316', '#f59e0b', 
    '#10b981', '#3b82f6', '#6366f1', '#8b5cf6', '#d946ef',
    '#d4af37', '#c0c0c0', '#b87333', '#2c3e50', '#7f8c8d'
  ];
  const fonts = ['Inter', 'Roboto', 'Playfair Display', 'Montserrat', 'Old Standard TT', 'Dancing Script', 'Libre Baskerville'];

  const placeholders = [
    { label: 'Student Name', tag: '{{student_name}}' },
    { label: 'Course Title', tag: '{{course_title}}' },
    { label: 'Completion Date', tag: '{{completion_date}}' },
    { label: 'Certificate ID', tag: '{{certificate_id}}' },
    { label: 'Duration', tag: '{{duration}}' },
  ];

  const templates = [
    {
      id: 'classic_gold',
      name: 'Classic Gold',
      description: 'Formal gold border with serif fonts',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 20, top: 20, width: 1016, height: 776, fill: 'transparent', stroke: '#d4af37', strokeWidth: 15, rx: 20, ry: 20, selectable: false },
        { type: 'IText', text: 'CERTIFICATE OF COMPLETION', left: 528, top: 150, fontFamily: 'Old Standard TT', fontSize: 60, fill: '#1e293b', originX: 'center', fontWeight: 'bold' },
        { type: 'IText', text: 'This is to certify that', left: 528, top: 250, fontFamily: 'Inter', fontSize: 20, fill: '#64748b', originX: 'center' },
        { type: 'IText', text: '{{student_name}}', left: 528, top: 350, fontFamily: 'Playfair Display', fontSize: 50, fill: '#0f172a', originX: 'center', fontWeight: 'bold' },
        { type: 'IText', text: 'has successfully completed the course', left: 528, top: 430, fontFamily: 'Inter', fontSize: 18, fill: '#64748b', originX: 'center' },
        { type: 'IText', text: '{{course_title}}', left: 528, top: 500, fontFamily: 'Montserrat', fontSize: 32, fill: '#4f46e5', originX: 'center', fontWeight: 'bold' },
        { type: 'IText', text: 'Issued on: {{completion_date}}', left: 250, top: 650, fontFamily: 'Inter', fontSize: 14, fill: '#94a3b8' },
        { type: 'IText', text: 'ID: {{certificate_id}}', left: 250, top: 680, fontFamily: 'Inter', fontSize: 12, fill: '#94a3b8' },
        { type: 'IText', text: 'Director Signature', left: 800, top: 650, fontFamily: 'Dancing Script', fontSize: 24, fill: '#1e293b' },
        { type: 'Rect', left: 750, top: 680, width: 150, height: 1, fill: '#cbd5e1' }
      ]}
    },
    {
      id: 'modern_blue',
      name: 'Modern Blue',
      description: 'Clean design with indigo sidebar',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 0, top: 0, width: 300, height: 816, fill: '#4f46e5', selectable: false },
        { type: 'IText', text: 'CERTIFICATE', left: 350, top: 150, fontFamily: 'Montserrat', fontSize: 70, fill: '#1e293b', fontWeight: 'black' },
        { type: 'IText', text: 'COMPLETION', left: 350, top: 220, fontFamily: 'Montserrat', fontSize: 40, fill: '#6366f1', fontWeight: 'bold' },
        { type: 'IText', text: 'AWARDED TO', left: 350, top: 350, fontFamily: 'Inter', fontSize: 14, fill: '#94a3b8', charSpacing: 200 },
        { type: 'IText', text: '{{student_name}}', left: 350, top: 400, fontFamily: 'Inter', fontSize: 50, fill: '#000000', fontWeight: 'bold' },
        { type: 'IText', text: 'FOR COMPLETING THE COURSE', left: 350, top: 480, fontFamily: 'Inter', fontSize: 14, fill: '#94a3b8' },
        { type: 'IText', text: '{{course_title}}', left: 350, top: 520, fontFamily: 'Inter', fontSize: 24, fill: '#1e293b', fontWeight: 'bold' }
      ]}
    },
    {
      id: 'minimalist',
      name: 'Minimalist Clean',
      description: 'Simple and elegant layout',
      json: { version: '6.0.0', objects: [
        { type: 'IText', text: 'CERTIFICATE', left: 528, top: 200, fontFamily: 'Inter', fontSize: 24, fill: '#94a3b8', originX: 'center', charSpacing: 400 },
        { type: 'IText', text: '{{student_name}}', left: 528, top: 300, fontFamily: 'Playfair Display', fontSize: 56, fill: '#000000', originX: 'center', fontWeight: 'bold' },
        { type: 'Rect', left: 428, top: 380, width: 200, height: 2, fill: '#e2e8f0', originX: 'center' },
        { type: 'IText', text: 'FOR COMPLETING {{course_title}}', left: 528, top: 450, fontFamily: 'Inter', fontSize: 16, fill: '#64748b', originX: 'center' }
      ]}
    },
    {
      id: 'elite_dark',
      name: 'Elite Dark',
      description: 'Premium black and gold theme',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 0, top: 0, width: 1056, height: 816, fill: '#0f172a', selectable: false },
        { type: 'Rect', left: 40, top: 40, width: 976, height: 736, fill: 'transparent', stroke: '#d4af37', strokeWidth: 4, selectable: false },
        { type: 'IText', text: 'ELITE PERFORMANCE AWARD', left: 528, top: 150, fontFamily: 'Montserrat', fontSize: 40, fill: '#d4af37', originX: 'center', fontWeight: 'black', charSpacing: 100 },
        { type: 'IText', text: '{{student_name}}', left: 528, top: 350, fontFamily: 'Libre Baskerville', fontSize: 64, fill: '#ffffff', originX: 'center', fontWeight: 'bold' },
        { type: 'IText', text: '{{course_title}}', left: 528, top: 480, fontFamily: 'Inter', fontSize: 24, fill: '#94a3b8', originX: 'center' }
      ]}
    },
    {
      id: 'vibrant_gradient',
      name: 'Vibrant Modern',
      description: 'Colorful and energetic design',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 0, top: 0, width: 1056, height: 200, fill: '#6366f1', selectable: false },
        { type: 'Circle', left: 900, top: -100, radius: 200, fill: '#d946ef', opacity: 0.5, selectable: false },
        { type: 'IText', text: 'ACHIEVEMENT', left: 60, top: 60, fontFamily: 'Montserrat', fontSize: 80, fill: '#ffffff', fontWeight: 'black' },
        { type: 'IText', text: 'THIS CERTIFIES THAT', left: 60, top: 300, fontFamily: 'Inter', fontSize: 16, fill: '#94a3b8', fontWeight: 'bold' },
        { type: 'IText', text: '{{student_name}}', left: 60, top: 360, fontFamily: 'Inter', fontSize: 60, fill: '#1e293b', fontWeight: 'black' },
        { type: 'IText', text: 'SUCCESSFULLY COMPLETED', left: 60, top: 460, fontFamily: 'Inter', fontSize: 16, fill: '#94a3b8', fontWeight: 'bold' },
        { type: 'IText', text: '{{course_title}}', left: 60, top: 500, fontFamily: 'Inter', fontSize: 32, fill: '#6366f1', fontWeight: 'bold' }
      ]}
    },
    {
      id: 'academic',
      name: 'Academic Excellence',
      description: 'Traditional university-style certificate',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 50, top: 50, width: 956, height: 716, fill: 'transparent', stroke: '#1e293b', strokeWidth: 2, selectable: false },
        { type: 'IText', text: 'NextPrep Academic Institute', left: 528, top: 120, fontFamily: 'Old Standard TT', fontSize: 32, fill: '#1e293b', originX: 'center', fontWeight: 'bold' },
        { type: 'IText', text: 'Upon recommendation of the faculty, be it known that', left: 528, top: 220, fontFamily: 'Libre Baskerville', fontSize: 18, fill: '#475569', originX: 'center', fontStyle: 'italic' },
        { type: 'IText', text: '{{student_name}}', left: 528, top: 320, fontFamily: 'Old Standard TT', fontSize: 50, fill: '#0f172a', originX: 'center', fontWeight: 'bold', borderBottom: 1 },
        { type: 'IText', text: 'has been awarded the specialization in', left: 528, top: 400, fontFamily: 'Libre Baskerville', fontSize: 18, fill: '#475569', originX: 'center', fontStyle: 'italic' },
        { type: 'IText', text: '{{course_title}}', left: 528, top: 460, fontFamily: 'Old Standard TT', fontSize: 36, fill: '#1e293b', originX: 'center', fontWeight: 'bold' }
      ]}
    },
    {
      id: 'corporate_clean',
      name: 'Corporate Professional',
      description: 'Sleek and professional business style',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 0, top: 766, width: 1056, height: 50, fill: '#1e293b', selectable: false },
        { type: 'IText', text: 'OFFICIAL CERTIFICATE', left: 50, top: 50, fontFamily: 'Inter', fontSize: 12, fill: '#94a3b8', fontWeight: 'bold', charSpacing: 200 },
        { type: 'IText', text: 'COURSE COMPLETION', left: 50, top: 80, fontFamily: 'Inter', fontSize: 32, fill: '#1e293b', fontWeight: 'black' },
        { type: 'IText', text: 'Recipient Name', left: 50, top: 250, fontFamily: 'Inter', fontSize: 14, fill: '#94a3b8' },
        { type: 'IText', text: '{{student_name}}', left: 50, top: 280, fontFamily: 'Inter', fontSize: 48, fill: '#1e293b', fontWeight: 'bold' },
        { type: 'IText', text: 'Program Title', left: 50, top: 400, fontFamily: 'Inter', fontSize: 14, fill: '#94a3b8' },
        { type: 'IText', text: '{{course_title}}', left: 50, top: 430, fontFamily: 'Inter', fontSize: 24, fill: '#1e293b', fontWeight: 'bold' }
      ]}
    },
    {
      id: 'creative_badge',
      name: 'Creative Badge',
      description: 'Bold design with achievement badge',
      json: { version: '6.0.0', objects: [
        { type: 'Circle', left: 528, top: 150, radius: 80, fill: '#f59e0b', originX: 'center' },
        { type: 'IText', text: '★', left: 528, top: 150, fontFamily: 'Inter', fontSize: 60, fill: '#ffffff', originX: 'center', originY: 'center' },
        { type: 'IText', text: 'GREAT JOB!', left: 528, top: 260, fontFamily: 'Montserrat', fontSize: 40, fill: '#f59e0b', originX: 'center', fontWeight: 'black' },
        { type: 'IText', text: '{{student_name}}', left: 528, top: 380, fontFamily: 'Inter', fontSize: 56, fill: '#1e293b', originX: 'center', fontWeight: 'black' },
        { type: 'IText', text: 'You completed {{course_title}}', left: 528, top: 480, fontFamily: 'Inter', fontSize: 20, fill: '#64748b', originX: 'center' }
      ]}
    },
    {
      id: 'signature_elite',
      name: 'Signature Elite',
      description: 'Elegant with dedicated signature area',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 30, top: 30, width: 996, height: 756, fill: 'transparent', stroke: '#1e293b', strokeWidth: 1, selectable: false },
        { type: 'IText', text: '{{student_name}}', left: 528, top: 320, fontFamily: 'Dancing Script', fontSize: 80, fill: '#1e293b', originX: 'center' },
        { type: 'Rect', left: 328, top: 410, width: 400, height: 2, fill: '#1e293b', originX: 'center' },
        { type: 'IText', text: 'has demonstrated mastery in', left: 528, top: 450, fontFamily: 'Inter', fontSize: 18, fill: '#64748b', originX: 'center' },
        { type: 'IText', text: '{{course_title}}', left: 528, top: 500, fontFamily: 'Montserrat', fontSize: 32, fill: '#1e293b', originX: 'center', fontWeight: 'bold' },
        { type: 'IText', text: 'Issued By: NextPrep', left: 300, top: 680, fontFamily: 'Inter', fontSize: 14, fill: '#94a3b8', originX: 'center' },
        { type: 'IText', text: 'Director', left: 756, top: 680, fontFamily: 'Inter', fontSize: 14, fill: '#94a3b8', originX: 'center' }
      ]}
    },
    {
      id: 'geometrical',
      name: 'Geometric Tech',
      description: 'Abstract geometric shapes and tech fonts',
      json: { version: '6.0.0', objects: [
        { type: 'Rect', left: 800, top: 0, width: 256, height: 816, fill: '#f8fafc', selectable: false },
        { type: 'Rect', left: 850, top: 100, width: 100, height: 100, fill: '#e2e8f0', angle: 45, selectable: false },
        { type: 'IText', text: 'COMPLETED', left: 100, top: 100, fontFamily: 'Roboto', fontSize: 80, fill: '#0f172a', fontWeight: 'black' },
        { type: 'IText', text: '{{student_name}}', left: 100, top: 300, fontFamily: 'Roboto', fontSize: 56, fill: '#334155', fontWeight: 'bold' },
        { type: 'IText', text: 'Course: {{course_title}}', left: 100, top: 450, fontFamily: 'Roboto', fontSize: 24, fill: '#64748b' },
        { type: 'IText', text: 'VERIFIED CERTIFICATE', left: 100, top: 700, fontFamily: 'Roboto', fontSize: 12, fill: '#94a3b8', charSpacing: 300 }
      ]}
    }
  ];

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

  const addPlaceholder = (tag: string) => {
    if (!canvas) return;
    const text = new IText(tag, {
      left: 100,
      top: 100,
      fontFamily: 'Inter',
      fontSize: 24,
      fill: '#4f46e5',
      fontWeight: 'bold'
    });
    canvas.add(text);
    canvas.setActiveObject(text);
  };

  const applyTemplate = (templateJson: any) => {
    if (!canvas) return;
    canvas.loadFromJSON(templateJson).then(() => {
        canvas.renderAll();
        setShowTemplates(false);
        toast.success("Template applied");
    });
  };

  const alignItem = (dir: 'left' | 'center' | 'right') => {
    if (!canvas || !selectedObject) return;
    const width = canvas.width!;
    if (dir === 'left') selectedObject.set({ left: 50 });
    if (dir === 'center') selectedObject.set({ left: (width - selectedObject.width! * selectedObject.scaleX!) / 2 });
    if (dir === 'right') selectedObject.set({ left: width - selectedObject.width! * selectedObject.scaleX! - 50 });
    canvas.renderAll();
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
        <div className="flex-1 flex overflow-hidden relative">
          
          {/* TEMPLATE SIDEBAR */}
          {showTemplates && (
            <div className="absolute left-20 top-0 bottom-0 w-80 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 shadow-2xl animate-in slide-in-from-left duration-300 overflow-y-auto p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-black text-slate-800 dark:text-white uppercase tracking-tight">Templates</h3>
                    <button onClick={() => setShowTemplates(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                </div>
                <div className="space-y-4">
                    {templates.map(t => (
                        <div key={t.id} onClick={() => applyTemplate(t.json)} className="p-4 border border-slate-100 dark:border-slate-800 rounded-2xl hover:border-indigo-500 cursor-pointer group transition-all">
                            <h4 className="font-bold text-sm dark:text-white">{t.name}</h4>
                            <p className="text-[10px] text-slate-500 mt-1">{t.description}</p>
                        </div>
                    ))}
                </div>
            </div>
          )}

          {/* TOOLBAR (LEFT) */}
          <div className="w-20 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col items-center py-6 gap-6 shrink-0 z-10">
             <button onClick={() => setShowTemplates(!showTemplates)} className={`p-3 rounded-2xl transition-all ${showTemplates ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-indigo-50'}`} title="Templates"><Layout size={24}/></button>
             <div className="w-8 h-px bg-slate-100 dark:bg-slate-800" />
             <button onClick={addText} className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all" title="Add Text"><Type size={24}/></button>
             <button onClick={addRect} className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all" title="Add Shape"><Square size={24}/></button>
             <button onClick={addCircle} className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all" title="Add Circle"><CircleIcon size={24}/></button>
             <label className="p-3 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-2xl transition-all cursor-pointer" title="Upload Image">
                <ImageIcon size={24}/>
                <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
             </label>
             <div className="w-8 h-px bg-slate-100 dark:bg-slate-800" />
             <div className="flex flex-col gap-2">
                {placeholders.map(p => (
                    <button key={p.tag} onClick={() => addPlaceholder(p.tag)} className="p-2 text-[8px] font-black uppercase text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 text-center leading-tight w-12" title={p.label}> {p.label.split(' ')[0]} </button>
                ))}
             </div>
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

                    <div className="flex items-center gap-2 shrink-0 border-l border-slate-100 dark:border-slate-800 pl-4">
                      <Palette size={14} className="text-slate-400" />
                      <div className="flex gap-1">
                        {colors.map(c => (
                          <button key={c} onClick={() => updateSelected({ fill: c })} className="w-5 h-5 rounded-full border border-slate-200" style={{backgroundColor: c}} />
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 border-l border-slate-100 dark:border-slate-800 pl-4">
                        <div className="flex items-center gap-2">
                           <Sun size={14} className="text-slate-400" />
                           <input type="range" min="0" max="1" step="0.1" value={selectedObject.opacity || 1} onChange={e => updateSelected({ opacity: parseFloat(e.target.value) })} className="w-20 accent-indigo-600" />
                        </div>
                        <div className="flex border dark:border-slate-700 rounded-lg overflow-hidden">
                           <button onClick={() => alignItem('left')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><AlignLeft size={14}/></button>
                           <button onClick={() => alignItem('center')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><AlignCenter size={14}/></button>
                           <button onClick={() => alignItem('right')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800"><AlignRight size={14}/></button>
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
                         transform: scale(0.65);
                         transform-origin: center center;
                      }
                      @media (min-width: 1536px) {
                        .canvas-container { transform: scale(0.75); }
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
