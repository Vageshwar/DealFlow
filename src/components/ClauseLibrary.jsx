import { useState } from 'react';
import { Scroll, Plus } from 'lucide-react';
import clauses from '../data/lma_clauses.json';

export default function ClauseLibrary({ onInsert }) {
    return (
        <div className="h-full flex flex-col bg-slate-950 border-r border-slate-800 w-64">
            <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                <Scroll className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">LMA Library</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {clauses.map((clause) => (
                    <div
                        key={clause.id}
                        className="group p-3 bg-slate-900/50 hover:bg-slate-800 border border-slate-800/50 hover:border-blue-500/30 rounded cursor-pointer transition-all duration-200"
                        onClick={() => onInsert(clause.content)}
                    >
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-300 group-hover:text-blue-300">
                                {clause.title}
                            </span>
                            <Plus className="w-3 h-3 text-slate-500 group-hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">
                            {clause.content}
                        </p>
                    </div>
                ))}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950">
                <div className="text-[10px] text-slate-600 font-mono text-center">
                    LMA Standard Form v8.2
                </div>
            </div>
        </div>
    );
}
