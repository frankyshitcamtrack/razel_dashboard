import React from 'react';
import DataTable from '../components/dataTable/dataTable';
import Sidebar from '../components/layout/SideBar';

const Rapport: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Sidebar />
            <div className="w-full">
                <main className="p-6">
                    <h1 className="text-2xl font-bold mb-6">Liste des Rapports</h1>

                    <div className="space-y-8">
                        <section>
                            <h2 className="text-xl font-semibold mb-4">Exceptions</h2>
                            <DataTable dataType="list_exceptions" />
                        </section>

                        <section>
                            <h2 className="text-xl font-semibold mb-4">Heures Moteurs</h2>
                            <DataTable dataType="list_heuremoteur" />
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Rapport;