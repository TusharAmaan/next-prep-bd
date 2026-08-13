const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'components', 'admin', 'sections', 'CategoryManager.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const newReturn = `    return (
        <section className="section space-y-4 animate-in fade-in duration-300">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                    <h2 className="font-display font-bold text-[16px]">Class categories</h2>
                    <p className="text-[12px] text-ink-3 mt-0.5">Tag and organize content across the library</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                    <button onClick={() => { fetchCategories(); fetchCounts(); }} className="icon-btn flex items-center justify-center w-9 h-9 rounded-lg border border-line text-ink-3 hover:text-ink-1 hover:bg-surf-2 transition-colors" title="Refresh Data">
                        <RefreshCw className={\`w-[14px] h-[14px] \${loadingCounts ? 'animate-spin' : ''}\`} />
                    </button>
                    <button onClick={() => setIsCreateModalOpen(true)} className="flex items-center gap-1.5 h-9 px-3.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[12px] font-medium transition-colors">
                        <Plus className="w-[14px] h-[14px]" /> New category
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-1.5">
                {tabs.map(t => (
                    <button 
                        key={t}
                        onClick={() => setActiveFilter(t)}
                        className={\`px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-colors \${activeFilter === t ? 'bg-surf-2 border-line-strong text-ink-1' : 'bg-surf-1 border-line text-ink-2 hover:bg-surf-2'}\`}
                    >
                        {t === 'resource' ? 'Materials' : (t === 'blog' ? 'Blogs' : (t === 'pdf' ? 'PDFs' : (t === 'video' ? 'Videos' : (t === 'question' ? 'Questions' : t))))}
                    </button>
                ))}
            </div>

            {filteredList.length === 0 ? (
                <div className="text-center py-20 bg-surf-1 rounded-xl border border-dashed border-line">
                    <Filter className="w-8 h-8 text-ink-3 mx-auto mb-3" />
                    <p className="text-[12.5px] text-ink-2 font-medium">No categories found for this type.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredList.map((cat: any) => {
                        const count = loadingCounts ? '...' : (localCounts[cat.id] || 0);
                        const ctype = (cat.type || 'general').toLowerCase();
                        let Icon = Tag;
                        let iconColor = 'text-ink-2';
                        let cLabel = ctype;
                        if(ctype==='question') { Icon = HelpCircle; iconColor = 'text-bronze-400'; cLabel='Question'; }
                        if(ctype==='ebook') { Icon = BookOpen; iconColor = 'text-indigo-400'; cLabel='eBook'; }
                        if(ctype==='news') { Icon = Newspaper; iconColor = 'text-rose-400'; cLabel='News'; }
                        if(ctype==='blog') { Icon = FileText; iconColor = 'text-ink-2'; cLabel='Blog'; }
                        if(ctype==='course') { Icon = Briefcase; iconColor = 'text-emerald-400'; cLabel='Course'; }
                        
                        return (
                            <div key={cat.id} className="bg-surf-1 border border-line rounded-xl p-3.5 flex flex-col justify-between hover:border-line-strong transition-colors group relative cursor-pointer" onClick={() => openCategoryDetails(cat)}>
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-surf-2 flex items-center justify-center shrink-0">
                                            <Icon className={\`w-[14px] h-[14px] \${iconColor}\`} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[12.5px] font-medium truncate text-ink-1" title={cat.name}>{cat.name}</p>
                                            <p className="text-[11px] text-ink-3 mt-0.5">{count} items linked · {cLabel}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-3.5 right-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={(e) => handleDelete(e, cat.id)} 
                                        disabled={isDeleting === cat.id}
                                        className="icon-btn p-1.5 rounded-md hover:bg-rose-500/10 text-ink-3 hover:text-rose-400 disabled:opacity-50"
                                        title="Delete"
                                    >
                                        {isDeleting === cat.id ? <RefreshCw className="w-[13px] h-[13px] animate-spin"/> : <Trash2 className="w-[13px] h-[13px]" />}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Modals remain structurally similar, just updated classes */}
            {isCreateModalOpen && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-base/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-surf-1 border border-line rounded-[1.5rem] shadow-2xl w-full max-w-sm overflow-hidden">
                        <div className="p-5 border-b border-line bg-surf-2/50 flex justify-between items-center">
                            <h3 className="font-bold text-[14px] text-ink-1">Add Category</h3>
                            <button onClick={() => setIsCreateModalOpen(false)} className="text-ink-3 hover:text-ink-1">✕</button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-[11px] font-bold text-ink-3 uppercase block mb-1">Category Type</label>
                                <select 
                                    className="w-full bg-surf-1 border border-line p-2.5 rounded-lg text-[12.5px] text-ink-1 outline-none focus:border-indigo-600 transition-all" 
                                    value={newCatType} 
                                    onChange={e => setNewCatType(e.target.value)}
                                >
                                    <option value="resource">All Material types (Fallback)</option>
                                    <option value="blog">✍️ Blog / Article</option>
                                    <option value="pdf">📄 PDF Document</option>
                                    <option value="video">🎬 Video Lesson</option>
                                    <option value="question">❓ Question Bank</option>
                                    <option value="ebook">📖 eBook</option>
                                    <option value="course">🎓 Course</option>
                                    <option value="news">📰 News</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold text-ink-3 uppercase block mb-1">Name</label>
                                <input 
                                    className="w-full bg-surf-1 border border-line p-2.5 rounded-lg text-[12.5px] text-ink-1 outline-none focus:border-indigo-600 transition-all" 
                                    placeholder="e.g. Mathematics" 
                                    value={newCatName} 
                                    onChange={e => setNewCatName(e.target.value)} 
                                />
                            </div>
                            <button onClick={handleAdd} className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium text-[12.5px] shadow-lg hover:bg-indigo-500 transition-colors">
                                Create Category
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {viewingCategory && (
                <div className="fixed inset-0 z-[3000] flex items-center justify-center bg-base/80 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-surf-1 border border-line rounded-[1.5rem] shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        
                        <div className="p-6 border-b border-line flex justify-between items-center bg-surf-2/50">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[10px] font-bold uppercase bg-indigo-600/15 text-indigo-400 px-2 py-0.5 rounded">{viewingCategory.type}</span>
                                    <span className="text-[11px] text-ink-3 font-medium">ID: {viewingCategory.id}</span>
                                </div>
                                <h3 className="text-[20px] font-display font-bold text-ink-1">{viewingCategory.name}</h3>
                            </div>
                            <button onClick={() => setViewingCategory(null)} className="icon-btn p-2 border border-line rounded-lg text-ink-3 hover:text-ink-1 hover:bg-surf-2 transition-colors">
                                <X className="w-4 h-4"/>
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                            <h4 className="font-bold text-[13px] text-ink-1 mb-2">Linked Posts ({totalLinked})</h4>
                            {postsLoading ? (
                                <div className="py-10 text-center"><RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" /></div>
                            ) : linkedPosts.length === 0 ? (
                                <div className="text-center py-10 bg-surf-2/50 rounded-xl border border-dashed border-line">
                                    <p className="text-[12.5px] text-ink-3 font-medium">No posts linked to this category yet.</p>
                                </div>
                            ) : (
                                linkedPosts.map((post: any) => (
                                    <div key={post.id} className="p-4 rounded-xl border border-line bg-surf-1 hover:bg-surf-2 transition-colors flex justify-between items-start gap-4">
                                        <div>
                                            <a href={\`/\${getTableForType(viewingCategory.type)}/\${post.slug || post.id}\`} target="_blank" rel="noreferrer" className="font-bold text-[14px] text-indigo-400 hover:underline">{post.title}</a>
                                            <p className="text-[11px] text-ink-3 mt-1.5 line-clamp-1">{post.excerpt || post.description || "No description available."}</p>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <span className={\`text-[10px] font-bold px-2 py-0.5 rounded \${post.status === 'published' || post.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}\`}>{post.status}</span>
                                            <p className="text-[10px] text-ink-3 mt-1">{new Date(post.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {totalLinked > POSTS_PER_PAGE && (
                            <div className="p-4 border-t border-line bg-surf-2/50 flex justify-between items-center">
                                <span className="text-[11.5px] text-ink-3 font-medium">Showing {postPage * POSTS_PER_PAGE + 1} to {Math.min((postPage + 1) * POSTS_PER_PAGE, totalLinked)} of {totalLinked}</span>
                                <div className="flex gap-2">
                                    <button onClick={() => handlePageChange(postPage - 1)} disabled={postPage === 0} className="px-3 py-1.5 rounded-lg border border-line text-ink-2 bg-surf-1 disabled:opacity-50 text-[12px] font-medium"><ChevronLeft className="w-4 h-4"/></button>
                                    <button onClick={() => handlePageChange(postPage + 1)} disabled={(postPage + 1) * POSTS_PER_PAGE >= totalLinked} className="px-3 py-1.5 rounded-lg border border-line text-ink-2 bg-surf-1 disabled:opacity-50 text-[12px] font-medium"><ChevronRight className="w-4 h-4"/></button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </section>
    );
`;

const returnIndex = content.indexOf('return (');
if (returnIndex !== -1) {
    const endFunctionIndex = content.lastIndexOf('}');
    let newContent = content.substring(0, returnIndex) + newReturn + '\n}\n\n' + content.substring(endFunctionIndex + 1);
    
    // add missing icons
    if (!newContent.includes('HelpCircle')) {
        newContent = newContent.replace('BookOpen, Briefcase, Bell', 'BookOpen, Briefcase, Bell, HelpCircle, Newspaper');
    }

    fs.writeFileSync(filePath, newContent);
    console.log("Updated CategoryManager.tsx layout!");
} else {
    console.log("Could not find return statement in CategoryManager.tsx");
}