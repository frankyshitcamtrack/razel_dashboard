import React from "react";
import { NavLink } from "react-router-dom";

const Sidebar: React.FC = () => {
    const baseLink =
        "group flex items-center px-4 py-2 rounded-md font-medium transition-colors";

    return (
        <aside className="w-64 bg-white shadow-lg z-20 flex flex-col border-r">
            {/* Logo */}
            <div className="flex items-center justify-center h-16 border-b border-gray-200">
                <span className="text-xl font-bold text-blue-600">Razel Fleet Manager</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
                <NavLink
                    to="/dashboard"
                    end
                    className={({ isActive }) =>
                        isActive
                            ? `${baseLink} active-menu bg-blue-600 text-white`
                            : `${baseLink} text-gray-700 hover:bg-gray-100`
                    }
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    Tableau de bord
                </NavLink>

                <NavLink
                    to="/reports"
                    className={({ isActive }) =>
                        isActive
                            ? `${baseLink} active-menu bg-blue-600 text-white`
                            : `${baseLink} text-gray-700 hover:bg-gray-100`
                    }
                >
                    <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Rapports
                </NavLink>
            </nav>
        </aside>
    );
};

export default Sidebar;
