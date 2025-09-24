export const VehicleLoadingSpinner = () => (
    <div className="fixed inset-0 flex justify-center items-center bg-white bg-opacity-80 z-50">
        <div className="relative">
            {/* Route avec ligne centrale */}
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-gray-400">
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-yellow-300 animate-pulse"></div>
            </div>

            {/* Châssis du véhicule - forme de bus/camion */}
            <div className="relative w-32 h-16 bg-blue-500 rounded-lg">
                {/* Cabine */}
                <div className="absolute left-0 top-0 w-12 h-16 bg-blue-600 rounded-l-lg"></div>

                {/* Fenêtre de la cabine */}
                <div className="absolute left-2 top-2 w-8 h-6 bg-blue-300 rounded-sm"></div>

                {/* Carrosserie arrière */}
                <div className="absolute left-12 top-2 w-16 h-12 bg-blue-400 rounded-r-lg"></div>

                {/* Ligne de décoration */}
                <div className="absolute left-12 top-6 w-16 h-1 bg-blue-300"></div>
            </div>

            {/* Roue arrière - plus grande */}
            <div className="absolute -bottom-4 left-8 w-8 h-8 border-4 border-gray-800 rounded-full animate-spin border-t-transparent"></div>

            {/* Roue avant */}
            <div className="absolute -bottom-3 right-8 w-6 h-6 border-3 border-gray-800 rounded-full animate-spin border-t-transparent"
                style={{ animationDirection: 'reverse' }}></div>

            {/* Fumée d'échappement */}
            <div className="absolute -top-2 -right-2">
                <div className="w-4 h-4 bg-gray-300 rounded-full animate-ping opacity-70"></div>
            </div>
        </div>

        {/* Texte "Chargement..." */}
        <div className="absolute top-60 text-gray-600 font-semibold animate-pulse">
            Chargement...
        </div>
    </div>
);
