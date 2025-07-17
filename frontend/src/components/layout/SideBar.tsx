import React from "react";
import { Link } from "react-router-dom";

const Sidebar: React.FC = () => {
    return (
        <aside className="w-64 bg-white shadow-lg z-20 flex flex-col border-r">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <span className="text-xl font-bold text-blue-600">FleetManager</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <Link
                    to="/dashboard"
                    className="flex items-center px-4 py-2 text-gray-700 bg-blue-50 rounded-md font-medium hover:bg-blue-100 transition-colors"
                >
                    <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Tableau de bord
                </Link>

                <Link
                    to="/reports"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Rapports
                </Link>

                <Link
                    to="/vehicles"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Véhicules
                </Link>

                <Link
                    to="/settings"
                    className="flex items-center px-4 py-2 text-gray-700 rounded-md font-medium hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5 mr-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Paramètres
                </Link>
            </nav>

            {/* Footer / Profil */}
            <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        JD
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800">Jean Dupont</p>
                        <p className="text-xs text-gray-500">Administrateur</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;