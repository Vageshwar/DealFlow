import { ChevronDown, ShieldAlert } from 'lucide-react';
import { useUser } from '../context/UserContext';

export default function UserSwitcher() {
    const { currentUser, setCurrentUser, USERS } = useUser();

    return (
        <div className="relative group">
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 hover:border-slate-600 rounded px-3 py-1.5 cursor-pointer transition-colors">
                <div className={`w-2 h-2 rounded-full ${currentUser.color} shadow-[0_0_8px_rgba(0,0,0,0.5)]`}></div>
                <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider leading-none mb-0.5">Operating As</span>
                    <span className="text-xs font-semibold text-slate-200 leading-none">{currentUser.name}</span>
                </div>
                <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-400" />
            </div>

            {/* Dropdown Menu */}
            <div className="absolute top-full right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-md shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 overflow-hidden transform group-hover:translate-y-0 translate-y-[-4px]">
                <div className="px-3 py-2 bg-slate-950 border-b border-slate-800">
                    <div className="flex items-center gap-2 text-amber-500">
                        <ShieldAlert className="w-3 h-3" />
                        <span className="text-[10px] font-mono tracking-tight font-bold">SIMULATION MODE</span>
                    </div>
                </div>
                {USERS.map((user) => (
                    <button
                        key={user.name}
                        onClick={() => setCurrentUser(user)}
                        className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-slate-800 transition-colors ${currentUser.name === user.name ? 'bg-slate-800/50' : ''}`}
                    >
                        <div className={`w-2 h-2 rounded-full ${user.color}`}></div>
                        <div className="flex flex-col">
                            <span className="text-xs font-medium text-slate-200">{user.name}</span>
                            <span className="text-[10px] text-slate-500 uppercase">{user.role}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
