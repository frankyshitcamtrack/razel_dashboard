import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { ArrowLeftOnRectangleIcon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
    isDropdownOpen?: boolean;
    setIsDropdownOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}



const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isDropdownOpen: externalDropdownOpen, setIsDropdownOpen: setExternalDropdownOpen }) => {
    const { logout } = useAuth();
    const [internalDropdownOpen, setInternalDropdownOpen] = useState(true);
    
    const isDropdownOpen = externalDropdownOpen !== undefined ? externalDropdownOpen : internalDropdownOpen;
    const setIsDropdownOpen = setExternalDropdownOpen || setInternalDropdownOpen;

    // Auto-open dropdown on mobile when sidebar opens
    useEffect(() => {
        if (isOpen && window.innerWidth < 1024) {
            setIsDropdownOpen(true);
        }
    }, [isOpen]);

    const baseLink =
        "group flex items-center px-4 py-2 rounded-md font-medium transition-colors";

    return (
        <>
            {/* Overlay pour mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 backdrop-blur-sm z-30"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        ${isDropdownOpen ? 'static' : 'fixed lg:static'} lg:mt-4 lg:ml-4 top-0 left-0 z-40
        w-72 bg-white shadow-lg rounded-2xl border border-black
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        h-fit lg:h-fit
      `}>
                {/* Header - Clickable dropdown trigger */}
                <div
                    className="flex items-center justify-between h-16 px-4 lg:cursor-pointer"
                    onClick={() => {
                        if (window.innerWidth >= 1024) {
                            const newOpen = !isDropdownOpen;
                            setIsDropdownOpen(newOpen);
                            if (newOpen && setExternalDropdownOpen) {
                                setExternalDropdownOpen(true);
                            }
                        }
                    }}
                >
                    <span className="text-xl font-bold text-blue-600">Razel Fleet Manager</span>
                    <div className="flex items-center">
                        <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform lg:block hidden ${isDropdownOpen ? 'rotate-180' : ''}`} />
                        {/* Bouton fermer pour mobile */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onClose();
                            }}
                            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 ml-2"
                        >
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Dropdown Menu */}
                {(isDropdownOpen || (isOpen && window.innerWidth < 1024)) && (
                    <div className="p-4 space-y-2">
                        <NavLink
                            to="/dashboard"
                            end
                            onClick={() => {
                                onClose();
                                setIsDropdownOpen(false);
                            }}
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
                            to="/activity_base"
                            onClick={() => {
                                onClose();
                                setIsDropdownOpen(false);
                            }}
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
                            Activite Base
                        </NavLink>

                        <NavLink
                            to="/utilisation_tracteurs"
                            onClick={() => {
                                onClose();
                                setIsDropdownOpen(false);
                            }}
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
                            Utilisation tracteurs
                        </NavLink>

                        <NavLink
                            to="/reports"
                            onClick={() => {
                                onClose();
                                setIsDropdownOpen(false);
                            }}
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

                        <button
                            onClick={() => {
                                logout();
                                onClose();
                                setIsDropdownOpen(false);
                            }}
                            className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <ArrowLeftOnRectangleIcon className="w-5 h-5 mr-3" />
                            Déconnexion
                        </button>
                    </div>
                )}
            </aside>
        </>
    );
};

export default Sidebar;