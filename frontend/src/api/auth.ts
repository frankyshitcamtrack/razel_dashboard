interface User {
    id: number;
    username: string;
}


export const login = async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await fetch('/auth/secure/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, pwd: password }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Échec de la connexion');
    }

    const data = await response.json();


    if (data.token) {
        localStorage.setItem('authToken', data.token);
    }

    return data;
};


export const checkAuth = async (): Promise<{ authenticated: boolean; user?: User }> => {
    try {
        const response = await fetch('/auth/secure/check-auth', {
            credentials: 'include',
            headers: {

                ...(localStorage.getItem('authToken') && {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                })
            }
        });

        if (!response.ok) {
            return { authenticated: false };
        }

        return await response.json();
    } catch (error) {
        console.error('Check auth error:', error);
        return { authenticated: false };
    }
};



export const logout = async (): Promise<void> => {
    await fetch('/api/razel_dashboard/logout', {
        method: 'POST',
        credentials: 'include'
    });
    localStorage.removeItem('authToken');
};