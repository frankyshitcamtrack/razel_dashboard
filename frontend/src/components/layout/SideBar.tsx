// Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { ArrowLeftOnRectangleIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}



const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
    const { logout } = useAuth();

    const baseLink =
        "group flex items-center px-4 py-2 rounded-md font-medium transition-colors";

    return (
        <>
            {/* Overlay pour mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
                    onClick={onClose}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-64 bg-white shadow-lg flex flex-col border-r
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
                {/* En-tête avec bouton fermer pour mobile */}
                <div className="flex items-center justify-between h-16 border-b border-gray-200 px-4">
                    <span className="text-xl font-bold text-blue-600">Razel Fleet Manager</span>

                    {/* Bouton fermer pour mobile */}
                    <button
                        onClick={onClose}
                        className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
                    >
                        <XMarkIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    <NavLink
                        to="/dashboard"
                        end
                        onClick={() => window.innerWidth < 1024 && onClose()}
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
                        onClick={() => window.innerWidth < 1024 && onClose()}
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
                        onClick={() => window.innerWidth < 1024 && onClose()}
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
                        onClick={() => window.innerWidth < 1024 && onClose()}
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

                    {/* Section déconnexion */}
                    <div className="pt-7 border-t border-gray-200">
                        <div className="flex items-center justify-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                                <button
                                    onClick={() => {
                                        logout();
                                        window.innerWidth < 1024 && onClose();
                                    }}
                                    className="p-2 text-red-600 transition-colors duration-200 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    title="Déconnexion"
                                >
                                    <ArrowLeftOnRectangleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </nav>
            </aside>
        </>
    );
};

export default Sidebar;