import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const USERS = [
    { name: 'J.P. Morgan (Agent)', role: 'Bank', color: 'bg-blue-600' },
    { name: 'Acme Corp (Borrower)', role: 'Borrower', color: 'bg-green-600' },
    { name: 'Linklaters (Counsel)', role: 'Lawyer', color: 'bg-purple-600' }
];

export function UserProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);

    return (
        <UserContext.Provider value={{ currentUser, setCurrentUser, USERS }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}
