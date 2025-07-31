import React, { createContext, useContext, useState, useEffect } from 'react';
import { login, checkAuth, logout } from '../api/auth';
import type { User } from '../types/ApiTypes';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<{
        user: User | null;
        isAuthenticated: boolean;
        isLoading: boolean;
    }>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    useEffect(() => {
        const verifyAuth = async () => {
            setAuthState(prev => ({ ...prev, isLoading: true }));

            try {
                const { authenticated, user } = await checkAuth();
                setAuthState({
                    user: authenticated ? user || null : null,
                    isAuthenticated: authenticated,
                    isLoading: false,
                });
            } catch {
                setAuthState({
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                });
            }
        };

        verifyAuth();

        // Vérification périodique (optionnel)
        const interval = setInterval(verifyAuth, 5 * 60 * 1000); // Toutes les 5 minutes
        return () => clearInterval(interval);
    }, []);

    const handleLogin = async (username: string, password: string) => {
        const { user } = await login(username, password);
        setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
        });
    };

    const handleLogout = async () => {
        await logout();
        localStorage.removeItem('authToken');
        setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
        });
    };

    return (
        <AuthContext.Provider
            value={{
                ...authState,
                login: handleLogin,
                logout: handleLogout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};




export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};