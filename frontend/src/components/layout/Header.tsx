import React from "react";
import { BellIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";

interface HeaderProps {
    title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
    return (
        <header className="bg-white shadow-sm z-10 relative">
            <div className="flex items-center justify-between h-16 px-6">
                <h1 className="text-sm font-semibold text-gray-800">{title}</h1>

                <div className="flex items-center space-x-4">

                    <div className="relative hidden md:block">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-64 pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
                    </div>


                    <button className="p-2 rounded-full hover:bg-gray-100 relative">
                        <BellIcon className="w-6 h-6 text-gray-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;