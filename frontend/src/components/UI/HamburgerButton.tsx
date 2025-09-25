import React from "react";

interface HamburgerProps {
    isOpen: boolean;
    onClick: () => void;
}

const HamburgerButton: React.FC<HamburgerProps> = ({ isOpen, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="lg:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Toggle menu"
        >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                    className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isOpen ? "rotate-45 translate-y-0.5" : "-translate-y-1"
                        }`}
                />
                <span
                    className={`block h-0.5 w-6 bg-current transition duration-300 ease-in-out ${isOpen ? "opacity-0" : "opacity-100"
                        }`}
                />
                <span
                    className={`block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${isOpen ? "-rotate-45 -translate-y-0.5" : "translate-y-1"
                        }`}
                />
            </div>
        </button>
    );
};

export default HamburgerButton;