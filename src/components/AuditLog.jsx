import { useRef, useEffect } from 'react';
import { ShieldCheck, Link as LinkIcon, Terminal } from 'lucide-react';
import { USERS } from '../context/UserContext';

export default function AuditLog({ logs }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    // Helper to get color
    const getUserColor = (userName) => {
        // Basic fuzzy match or direct lookup
        const user = USERS.find(u => u.name === userName);
        return user ? user.color : 'bg-slate-700';
    };

    return (
        <div className="h-2/3 flex flex-col bg-slate-950 border-b border-slate-800">
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-500" />
                    <h2 className="text-xs font-bold text-slate-300 tracking-wider uppercase font-mono">Immutable_Ledger</h2>
                </div>
                <div className="flex items-center gap-1.5 opacity-80">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-[9px] text-emerald-500 font-mono tracking-widest">LIVE</span>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-0 font-mono text-[10px] relative">
                {logs.map((log, index) => (
                    <div key={log.hash} className="relative pl-6 pb-6 last:pb-0 group">
                        {/* Vertical Chain Line */}
                        {index !== logs.length - 1 && (
                            <div className="absolute left-[11px] top-6 bottom-0 w-[1px] bg-slate-800 group-hover:bg-slate-700 transition-colors"></div>
                        )}

                        {/* Chain Link Icon */}
                        <div className="absolute left-0 top-1 p-1 bg-slate-950 z-10">
                            <LinkIcon className="w-3 h-3 text-slate-600" />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {/* Header: Action & Time */}
                            <div className="flex items-start justify-between">
                                <span className="text-slate-100 font-bold leading-tight max-w-[180px]">
                                    {log.action}
                                </span>
                                <span className="text-slate-600 shrink-0">
                                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                </span>
                            </div>

                            {/* User Badge */}
                            <div className="flex items-center gap-2">
                                <div className={`px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${getUserColor(log.user)} bg-opacity-90`}>
                                    {log.user}
                                </div>
                            </div>

                            {/* Hash Display */}
                            <div className="mt-1 bg-black/40 border border-slate-800/80 rounded p-1.5 font-mono text-[9px] text-slate-500 truncate group-hover:text-slate-400 transition-colors flex items-center gap-2">
                                <span className="text-slate-600 select-none">SHA256:</span>
                                <span>
                                    {log.hash.substring(0, 8)}
                                    <span className="opacity-30">...</span>
                                    {log.hash.substring(log.hash.length - 8)}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} className="h-2" />
            </div>
        </div>
    );
}
