import { useState, useEffect } from 'react';
import { FileText, Clock, Hash, Plus, FolderOpen, Search, ArrowRight } from 'lucide-react';

export default function Dashboard({ onSelectDoc, currentUser }) {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:3001/api/documents')
            .then(res => res.json())
            .then(data => {
                setDocs(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch docs", err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-slate-950 text-slate-500 font-mono text-xs animate-pulse">
                Connect.Financial_Gateway...
            </div>
        );
    }

    return (
        <div className="flex-1 bg-slate-950 p-8 overflow-y-auto">
            <div className="max-w-6xl mx-auto">

                {/* Dashboard Header */}
                <div className="flex items-end justify-between mb-8 border-b border-slate-800 pb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white tracking-tight mb-1">My Deal Room</h2>
                        <p className="text-slate-500 text-sm font-medium">Welcome back, {currentUser.name}</p>
                    </div>

                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg hover:shadow-blue-900/20 transition-all text-sm font-bold group">
                        <Plus className="w-4 h-4" />
                        <span>New Deal</span>
                    </button>
                </div>

                {/* Filters / Search Bar (Visual Only) */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Search by Deal ID, Counterparty, or Hash..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-slate-600 transition-colors"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['All Statuses', 'Live', 'Closing', 'Archived'].map(filter => (
                            <button key={filter} className="px-3 py-1.5 rounded-md border border-slate-800 bg-slate-900/30 text-xs font-medium text-slate-400 hover:text-white hover:border-slate-700 transition-all">
                                {filter}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {docs.map(doc => (
                        <div
                            key={doc.id}
                            onClick={() => onSelectDoc(doc.id)}
                            className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-5 cursor-pointer group hover:bg-slate-900/80 hover:border-slate-700 hover:shadow-2xl hover:shadow-black/50 transition-all relative overflow-hidden"
                        >
                            {/* Hover Highlight */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-slate-800/50 rounded-lg group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors text-slate-500">
                                    <FolderOpen className="w-5 h-5" />
                                </div>
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.id.includes('nda') ? 'bg-indigo-950/50 border-indigo-900 text-indigo-400' :
                                        doc.id.includes('term') ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' :
                                            'bg-blue-950/50 border-blue-900 text-blue-400'
                                    }`}>
                                    LIVE
                                </span>
                            </div>

                            <h3 className="text-white font-bold text-lg mb-1 line-clamp-1 group-hover:text-blue-100 transition-colors">{doc.title}</h3>
                            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono mb-4">
                                <Hash className="w-3 h-3" />
                                <span className="truncate max-w-[150px]">{doc.id}</span>
                            </div>

                            <div className="pt-4 border-t border-slate-800/50 flex items-center justify-between text-xs text-slate-500">
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 font-bold">
                                    Open Deal <ArrowRight className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
