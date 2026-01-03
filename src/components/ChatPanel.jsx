import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Maximize2, Minimize2 } from 'lucide-react';
import { USERS } from '../context/UserContext';

export default function ChatPanel({ messages, onSendMessage, currentUser }) {
    const [input, setInput] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages, isExpanded]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        onSendMessage(input);
        setInput('');
    };

    return (
        <div className={`flex flex-col bg-slate-950 border-t border-slate-800 transition-all duration-300 ease-in-out ${isExpanded ? 'fixed inset-0 z-50 shadow-2xl p-6 pb-20' : 'flex-1 min-h-0'}`}>
            <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-zinc-950/50">
                <div className="flex items-center gap-2">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
                    <h2 className="text-xs font-bold text-slate-300 tracking-wider uppercase font-mono">Deal_Chat</h2>
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-slate-500 hover:text-slate-300 transition-colors p-1"
                    title={isExpanded ? "Minimize" : "Expand"}
                >
                    {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-slate-600 text-xs italic mt-10 opacity-50">
                        Encrypted Channel Open...
                    </div>
                )}
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex flex-col gap-1 ${msg.user === currentUser.name ? 'items-end' : 'items-start'}`}>
                        <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold ${msg.user === currentUser.name ? 'text-slate-400' : 'text-slate-400'}`}>
                                {msg.user}
                            </span>
                            <span className="text-[9px] text-slate-600">
                                {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className={`max-w-[85%] px-3 py-2 rounded text-sm ${msg.user === currentUser.name
                                ? 'bg-blue-600/20 text-blue-100 border border-blue-500/30 rounded-tr-none'
                                : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-tl-none'
                            }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} className="h-1" />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-slate-950 border-t border-slate-800">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={`Message as ${currentUser.name}...`}
                        className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded pl-3 pr-10 py-2.5 focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 font-medium"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim()}
                        className="absolute right-1 top-1 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded disabled:opacity-50 disabled:bg-slate-700 transition-colors"
                    >
                        <Send className="w-3.5 h-3.5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
