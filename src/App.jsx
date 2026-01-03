import { useState, useEffect, useRef } from 'react';
import ClauseLibrary from './components/ClauseLibrary';
import DocumentEditor from './components/DocumentEditor';
import AuditLog from './components/AuditLog';
import ChatPanel from './components/ChatPanel';
import UserSwitcher from './components/UserSwitcher'; // Import Switcher
import { Terminal, Activity, Wifi, WifiOff } from 'lucide-react'; // Added icons
import { io } from "socket.io-client";
import { useUser } from './context/UserContext'; // Import Hook
import { Toaster, toast } from 'sonner'; // Import Sonner

// Connect to backend (ensure port matches server)
const socket = io("http://localhost:3001");

function App() {
    const [docContent, setDocContent] = useState("# SYNDICATED FACILITY AGREEMENT\n\n1. DEFINITIONS\n...");
    const [savedContent, setSavedContent] = useState("# SYNDICATED FACILITY AGREEMENT\n\n1. DEFINITIONS\n...");
    const [auditLogs, setAuditLogs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);

    const { currentUser } = useUser(); // Use Context
    const [chatMessages, setChatMessages] = useState([]);

    // Editor imperative handle to control cursor/inserts
    const editorRef = useRef(null);

    useEffect(() => {
        socket.on('connect', () => {
            setIsConnected(true);
            toast.success('Secure Connection Established');
            // Join the room immediately
            socket.emit('join-document', 'main-room');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            toast.error('Connection Lost - Reconnecting...');
        });

        // Initial Sync
        socket.on('load-document', (content) => {
            setDocContent(content);
            setSavedContent(content);
        });

        // Initial Sync
        socket.on('load-audit', (logs) => {
            setAuditLogs(logs);
        });

        // New Block Mined
        socket.on('new-audit-entry', (newBlock) => {
            setAuditLogs(prev => [...prev, newBlock]);
            toast.message('Blockchain Update', {
                description: `Block Verified: ${newBlock.hash.substring(0, 8)}...`,
                action: {
                    label: 'View',
                    onClick: () => console.log('View block')
                },
            });
        });

        // Remote Text Changes
        socket.on('text-change', (data) => {
            setDocContent(data.content);
        });

        // Chat Messages
        socket.on('chat-message', (msg) => {
            setChatMessages(prev => [...prev, msg]);
            if (msg.user !== currentUser.name) {
                toast(`${msg.user}: ${msg.text}`);
            }
        });

        return () => {
            socket.off('connect');
            socket.off('disconnect');
            socket.off('load-document');
            socket.off('load-audit');
            socket.off('new-audit-entry');
            socket.off('text-change');
            socket.off('chat-message');
        };
    }, [currentUser.name]);

    const handleInsertClause = (text) => {
        if (editorRef.current) {
            editorRef.current.insertText(text);
            // The editor will trigger onChange automatically, which emits the socket event
        } else {
            // Fallback if editor not mounted
            const newContent = docContent + "\n\n" + text;
            setDocContent(newContent);
            socket.emit('text-change', {
                docId: 'main-room',
                content: newContent
            });
        }
    };

    const handleEditorChange = (value) => {
        setDocContent(value);
        socket.emit('text-change', {
            docId: 'main-room',
            content: value
        });
    };

    const handleSendMessage = (text) => {
        socket.emit('chat-message', {
            user: currentUser.name,
            text,
            time: new Date()
        });
    };

    const handleSave = () => {
        const loadingToast = toast.loading('Hashing & Verifying...');

        // Simulate slight network delay for dramatic effect
        setTimeout(() => {
            socket.emit('commit-change', {
                docId: 'main-room',
                user: currentUser.name,
                action: `Manual Save by ${currentUser.role}`
            });
            setSavedContent(docContent);
            toast.dismiss(loadingToast);
        }, 800);
    };

    return (
        <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
            <Toaster theme="dark" position="bottom-right" />

            {/* HEADER */}
            <header className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between px-4 shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-1 bg-blue-500/10 rounded border border-blue-500/20">
                        <Terminal className="w-5 h-5 text-blue-500" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-100">DealFlow <span className="text-slate-600 font-normal">| Live Deal Room</span></h1>
                </div>

                <div className="flex items-center gap-4">
                    <UserSwitcher />

                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${isConnected ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-500' : 'bg-rose-950/30 border-rose-500/30 text-rose-500'}`}>
                        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        <span className="text-[10px] font-mono tracking-wide font-semibold">
                            {isConnected ? 'ENCRYPTED_UPLINK' : 'OFFLINE'}
                        </span>
                    </div>

                    {/* Initials Badge */}
                    <div className={`w-8 h-8 rounded-full ${currentUser.color} flex items-center justify-center text-xs font-bold border-2 border-slate-800 ring-2 ring-slate-900 shadow-lg`}>
                        {currentUser.name.substring(0, 2).toUpperCase()}
                    </div>
                </div>
            </header>

            {/* MAIN LAYOUT */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT: CLAUSE LIBRARY */}
                <ClauseLibrary onInsert={handleInsertClause} />

                {/* CENTER: EDITOR */}
                <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 relative z-0">
                    <DocumentEditor
                        ref={editorRef}
                        code={docContent}
                        originalContent={savedContent}
                        onChange={handleEditorChange}
                        onSave={handleSave}
                    />
                </div>

                {/* RIGHT: AUDIT & CHAT */}
                <div className="w-80 flex flex-col shrink-0 bg-slate-950">
                    <AuditLog logs={auditLogs} />
                    <ChatPanel
                        messages={chatMessages}
                        onSendMessage={handleSendMessage}
                        currentUser={currentUser}
                    />
                </div>
            </div>
        </div>
    );
}

export default App;
