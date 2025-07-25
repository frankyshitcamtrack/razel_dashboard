import type { User } from "../types/ApiTypes";




export const login = async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch('/api/razel_dashboard/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, pwd: password }),
    });

    if (!response.ok) {
        throw new Error('Échec de la connexion');
    }

    return response.json();
};



export const checkAuth = async (): Promise<{ authenticated: boolean; user?: User }> => {
    const response = await fetch('/api/razel_dashboard/check-auth', {
        credentials: 'include'
    });

    if (!response.ok) {
        return { authenticated: false };
    }

    return response.json();
};


export const logout = async (): Promise<void> => {
    await fetch('/api/razel_dashboard/logout', {
        method: 'POST',
        credentials: 'include'
    });
    localStorage.removeItem('authToken');
};