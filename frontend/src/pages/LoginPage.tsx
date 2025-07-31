import React, { useState } from 'react';
import { useAuth } from '../store/AuthContext';
import { useNavigate, useLocation } from 'react-router';
import { Truck, Fuel, Lock, Eye, EyeOff } from 'lucide-react';
import LoadingIndicator from '../components/UI/Loader';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const { login, isLoading } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError('');

        try {
            await login(username, password);
            const from = location.state?.from?.pathname || '/dashboard';
            navigate(from, { replace: true });
        } catch (err) {
            setError('Identifiants incorrects ou problème de connexion');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                {/* Header avec icônes thématiques */}
                <div className="text-center">
                    <div className="flex justify-center items-center space-x-3 mb-4">
                        <Truck className="h-10 w-10 text-blue-600" />
                        <Fuel className="h-10 w-10 text-blue-400" />
                        <Lock className="h-10 w-10 text-blue-500" />
                    </div>
                    <h2 className="mt-6 text-3xl font-bold text-gray-900">
                        Razel Fleet Management Dashboard
                    </h2>
                </div>

                {/* Carte de formulaire */}
                <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Identifiant technique
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Votre identifiant"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe
                            </label>
                            <div className="relative rounded-md shadow-sm">
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="block w-full px-4 py-3 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all pr-12"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    onClick={() => setShowPassword(!showPassword)}
                                    aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    ) : (
                                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-500" />
                                    )}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                    Maintenir la session
                                </label>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading || isSubmitting}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all ${isLoading || isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                                    }`}
                            >
                                {isLoading || isSubmitting ? (
                                    <>
                                        <LoadingIndicator />
                                    </>
                                ) : (
                                    'Accéder au dashboard'
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                <div className="text-center text-sm text-gray-500">
                    <p> by Camtrack SAS</p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;