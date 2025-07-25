export const VehicleLoadingSpinner = () => (
    <div className="relative flex justify-center items-center">
        {/* Roue arrière */}
        <div className="absolute h-12 w-12 border-4 border-blue-500 rounded-full animate-spin border-t-transparent"></div>

        {/* Châssis du véhicule */}
        <div className="absolute w-24 h-6 bg-gray-300 rounded-sm -mt-4"></div>

        {/* Roue avant */}
        <div className="absolute h-10 w-10 border-3 border-blue-400 rounded-full animate-spin border-t-transparent"
            style={{ animationDirection: 'reverse', left: 'calc(50% + 28px)' }}></div>
    </div>
);