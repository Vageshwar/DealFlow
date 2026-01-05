import { useState, useEffect } from 'react';
import { Lock, User, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginScreen({ onLogin }) {
    const [username, setUsername] = useState('J.P. Morgan (Agent)');
    const [password, setPassword] = useState('password123');
    const [loading, setLoading] = useState(false);
    const [availableUsers, setAvailableUsers] = useState([]);

    useEffect(() => {
        // Fetch available users for easier demo
        fetch('http://localhost:3001/api/users')
            .then(res => res.json())
            .then(data => setAvailableUsers(data))
            .catch(() => toast.error("Failed to connect to DealFlow Server"));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await res.json();

            if (data.success) {
                toast.success(`Welcome back, ${data.user.name}`);
                onLogin(data.user);
            } else {
                toast.error(data.message);
            }
        } catch (err) {
            toast.error("Network Error: Is the server running?");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen w-screen bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-slate-950 to-slate-950"></div>
            <div className="absolute top-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>
            <div className="absolute bottom-0 w-full h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent opacity-20"></div>

            <div className="z-10 w-full max-w-md p-8">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl mb-6 group">
                        <Terminal className="w-8 h-8 text-blue-500 group-hover:text-blue-400 transition-colors" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight mb-2">DealFlow</h1>
                    <p className="text-slate-400 font-medium">Intelligent Verification Platform</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Identity</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <select
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" disabled>Select Persona</option>
                                {availableUsers.map(u => (
                                    <option key={u.name} value={u.name}>{u.name}</option>
                                ))}
                            </select>
                            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                                <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-500"></div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">Credentials</label>
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-4 w-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                            </div>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                                placeholder="Enter password"
                            />
                        </div>
                        <p className="text-[10px] text-slate-600 text-right italic px-1">Default: password123</p>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold shadow-lg shadow-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6 group"
                    >
                        {loading ? 'Authenticating...' : 'Enter Deal Room'}
                        {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                </form>

                {/* Footer Security Badge */}
                <div className="mt-12 flex items-center justify-center gap-2 text-slate-600 opacity-60">
                    <ShieldCheck className="w-3 h-3" />
                    <span className="text-[10px] uppercase tracking-widest font-mono">Secured by DealRegistry Protocol</span>
                </div>
            </div>
        </div>
    );
}
