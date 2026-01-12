import { useState, useEffect, useRef } from 'react';
import ClauseLibrary from './components/ClauseLibrary';
import DocumentEditor from './components/DocumentEditor';
import AuditLog from './components/AuditLog';
import ChatPanel from './components/ChatPanel';
import LoginScreen from './components/LoginScreen';
import Dashboard from './components/Dashboard'; // Import Dashboard
import { Terminal, Wifi, WifiOff, LogOut, ChevronLeft } from 'lucide-react';
import { io } from "socket.io-client";
import { useUser } from './context/UserContext';
import { Toaster, toast } from 'sonner';

// Connect to backend (ensure port matches server)
const socket = io("http://localhost:3001", { autoConnect: false });

function App() {
    const [user, setUser] = useState(null);
    const { setCurrentUser } = useUser();

    // Routing State
    const [activeDocId, setActiveDocId] = useState(null);

    const [docContent, setDocContent] = useState("");
    const [savedContent, setSavedContent] = useState("");
    const [auditLogs, setAuditLogs] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);

    const editorRef = useRef(null);

    // 1. Check LocalStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('dealflow_user');
        if (storedUser) {
            loginUser(JSON.parse(storedUser));
        }
    }, []);

    // 2. Login
    const loginUser = (userData) => {
        setUser(userData);
        setCurrentUser(userData);
        localStorage.setItem('dealflow_user', JSON.stringify(userData));

        socket.auth = { userID: userData.name };
        socket.connect();
    };

    // 3. Logout
    const logoutUser = () => {
        setUser(null);
        setActiveDocId(null);
        localStorage.removeItem('dealflow_user');
        socket.disconnect();
        toast("Logged out successfully");
    };

    // 4. Socket & Room Logic
    useEffect(() => {
        if (!user) return;

        socket.on('connect', () => {
            setIsConnected(true);
            toast.success('Secure Connection Established');
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
            toast.error('Connection Lost - Reconnecting...');
        });

        // Document Events
        socket.on('load-document', (content) => {
            setDocContent(content || "");
            setSavedContent(content || "");
        });

        socket.on('load-audit', (logs) => {
            setAuditLogs(logs);
        });

        socket.on('new-audit-entry', (newBlock) => {
            setAuditLogs(prev => [...prev, newBlock]);
            if (newBlock.userName !== user.name) {
                toast.message('Blockchain Update', {
                    description: `Block Verified: ${newBlock.hash.substring(0, 8)}...`,
                });
            }
        });

        socket.on('text-change', (data) => {
            setDocContent(data.content);
        });

        socket.on('load-chat', (history) => {
            setChatMessages(history);
        });

        socket.on('chat-message', (msg) => {
            setChatMessages(prev => [...prev, msg]);
            if (msg.user !== user.name) {
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
            socket.off('load-chat');
        };
    }, [user]);

    // Role Management: Join/Leave Rooms based on activeDocId
    useEffect(() => {
        if (!isConnected || !activeDocId) return;

        console.log(`Joining Room: ${activeDocId}`);
        socket.emit('join-document', activeDocId);

        // Reset state for new doc
        setDocContent("Loading...");
        setAuditLogs([]);
        setChatMessages([]);

    }, [activeDocId, isConnected]);


    const handleInsertClause = (text) => {
        if (editorRef.current) {
            editorRef.current.insertText(text);
        } else {
            const newContent = docContent + "\n\n" + text;
            setDocContent(newContent);
            socket.emit('text-change', { docId: activeDocId, content: newContent });
        }
    };

    const handleEditorChange = (value) => {
        setDocContent(value);
        socket.emit('text-change', { docId: activeDocId, content: value });
    };

    const handleSendMessage = (text) => {
        socket.emit('chat-message', {
            docId: activeDocId, // Include DocID for persistence
            user: user.name,
            text,
            time: new Date()
        });
    };

    const handleSave = () => {
        const loadingToast = toast.loading('Hashing & Verifying...');
        setTimeout(() => {
            socket.emit('commit-change', {
                docId: activeDocId,
                user: user.name,
                action: `Manual Save by ${user.role}`
            });
            setSavedContent(docContent);
            toast.dismiss(loadingToast);
        }, 800);
    };

    // RENDER: LOGIN
    if (!user) {
        return (
            <>
                <Toaster theme="dark" position="bottom-right" />
                <LoginScreen onLogin={loginUser} />
            </>
        );
    }

    return (
        <div className="h-screen w-screen bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
            <Toaster theme="dark" position="bottom-right" />

            {/* HEADER */}
            <header className="h-12 border-b border-slate-800 bg-slate-950 flex items-center justify-between pl-20 pr-4 shrink-0 z-10 select-none" style={{ WebkitAppRegion: "drag" }}>
                <div className="flex items-center gap-3" style={{ WebkitAppRegion: "no-drag" }}>
                    {activeDocId && (
                        <button
                            onClick={() => setActiveDocId(null)}
                            className="mr-2 p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}

                    <div className="p-1 bg-blue-500/10 rounded border border-blue-500/20">
                        <Terminal className="w-5 h-5 text-blue-500" />
                    </div>
                    <h1 className="text-lg font-bold tracking-tight text-slate-100">DealFlow <span className="text-slate-600 font-normal">| Live Deal Room</span></h1>
                </div>

                <div className="flex items-center gap-4" style={{ WebkitAppRegion: "no-drag" }}>
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-colors ${isConnected ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-500' : 'bg-rose-950/30 border-rose-500/30 text-rose-500'}`}>
                        {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        <span className="text-[10px] font-mono tracking-wide font-semibold">
                            {isConnected ? 'ENCRYPTED_UPLINK' : 'OFFLINE'}
                        </span>
                    </div>

                    <div className="h-6 w-px bg-slate-800"></div>

                    {/* User Profile */}
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <div className="text-xs font-bold text-white leading-none">{user.name}</div>
                            <div className="text-[10px] text-slate-500 leading-none mt-1 uppercase tracking-wide">{user.role}</div>
                        </div>
                        <div className={`w-8 h-8 rounded-full ${user.color} flex items-center justify-center text-xs font-bold border-2 border-slate-800 ring-2 ring-slate-900 shadow-lg`}>
                            {user.name.substring(0, 2).toUpperCase()}
                        </div>
                    </div>

                    <button
                        onClick={logoutUser}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-rose-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </header>

            {/* MAIN CONTENT: DASHBOARD vs EDITOR */}
            {!activeDocId ? (
                <Dashboard onSelectDoc={setActiveDocId} currentUser={user} />
            ) : (
                <div className="flex-1 flex overflow-hidden">
                    <ClauseLibrary onInsert={handleInsertClause} />
                    <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800 relative z-0">
                        <DocumentEditor
                            ref={editorRef}
                            code={docContent}
                            originalContent={savedContent}
                            onChange={handleEditorChange}
                            onSave={handleSave}
                        />
                    </div>
                    <div className="w-80 flex flex-col shrink-0 bg-slate-950">
                        <AuditLog logs={auditLogs} />
                        <ChatPanel
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                            currentUser={user}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}

export default App;
