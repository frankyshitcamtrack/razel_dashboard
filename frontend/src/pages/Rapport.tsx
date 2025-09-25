import React from 'react';
import DataTable from '../components/dataTable/dataTable';
import Sidebar from '../components/layout/SideBar';
import HamburgerButton from "../components/UI/HamburgerButton";
import { useState } from 'react';
const Rapport: React.FC = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="w-full">
                <header className="lg:hidden bg-white shadow-sm border-b border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                        <HamburgerButton
                            isOpen={sidebarOpen}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                        />
                        <span className="text-lg font-semibold text-gray-800">Rapports</span>
                        <div className="w-6"></div> {/* Pour l'équilibrage */}
                    </div>
                </header>
                <main className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Liste des Rapports</h1>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1  gap-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Exceptions</h2>
                            <DataTable dataType="list_exceptions" />
                        </div>

                        <div className="grid grid-cols-1  gap-6 mb-6">
                            <h2 className="text-xl font-semibold mb-4">Heures Moteurs</h2>
                            <DataTable dataType="list_heuremoteur" />
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Rapport;