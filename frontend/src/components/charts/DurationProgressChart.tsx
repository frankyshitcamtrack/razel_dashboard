import React from 'react';

interface DurationProgressChartProps {
    data: any[];
    title: string;
}

const DurationProgressChart: React.FC<DurationProgressChartProps> = ({ data, title }) => {
    // Convert time string (HH:MM:SS) to total seconds for calculation
    const timeToSeconds = (timeStr: string): number => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return hours * 3600 + minutes * 60 + seconds;
    };

    // Convert seconds back to HH:MM:SS format
    const secondsToTime = (totalSeconds: number): string => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return `${hours.toString().padStart(3, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Group and sum data by base name and vehicle reference
    const processedData = data.reduce((acc: any, item) => {
        const parts = item.name.split(' - ');
        const vehicleRef = parts[1]?.split('-')[0] || 'REF';
        const baseName = parts[2] || 'BASE';
        
        if (!acc[baseName]) {
            acc[baseName] = {};
        }
        
        if (!acc[baseName][vehicleRef]) {
            acc[baseName][vehicleRef] = {
                reference: vehicleRef,
                totalSeconds: 0,
                baseName: baseName
            };
        }
        
        acc[baseName][vehicleRef].totalSeconds += timeToSeconds(item.duree_totale);
        return acc;
    }, {});

    // Ensure minimum 4 references per group by adding dummy entries
    Object.keys(processedData).forEach(baseName => {
        const vehicles = Object.values(processedData[baseName]);
        const currentCount = vehicles.length;
        
        if (currentCount < 4) {
            const neededDummies = 4 - currentCount;
            for (let i = 0; i < neededDummies; i++) {
                const dummyKey = `dummy_${i}`;
                processedData[baseName][dummyKey] = {
                    reference: '•',
                    totalSeconds: 0,
                    baseName: baseName,
                    isDummy: true
                };
            }
        }
    });

    // Get max duration for percentage calculation (excluding dummy entries)
    const allDurations = Object.values(processedData).flatMap((base: any) => 
        Object.values(base).filter((item: any) => !item.isDummy).map((item: any) => item.totalSeconds)
    );
    const maxDuration = Math.max(...allDurations);

    // Generate time scale marks
    const generateTimeMarks = () => {
        const marks = [];
        const maxHours = Math.ceil(maxDuration / 3600);
        const step = Math.max(1, Math.floor(maxHours / 8));
        
        for (let i = 0; i <= maxHours; i += step) {
            marks.push(`${i}:00:00`);
        }
        return marks;
    };

    const timeMarks = generateTimeMarks();

    return (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            
            <div className="relative">
                {/* Vertical grid lines */}
                <div className="absolute inset-0 flex">
                    <div className="w-24"></div>
                    <div className="w-12"></div>
                    <div className="flex-1 relative">
                        {timeMarks.map((_, index) => {
                            const position = (index / (timeMarks.length - 1)) * 100;
                            return (
                                <div 
                                    key={index}
                                    className="absolute top-0 bottom-0 border-l border-dashed border-gray-300"
                                    style={{ left: `${position}%` }}
                                />
                            );
                        })}
                    </div>
                </div>
                
                <div className="space-y-0 relative z-10">
                    {Object.entries(processedData).map(([baseName, vehicles]: [string, any], groupIndex: number) => {
                        const sortedVehicles = Object.values(vehicles).sort((a: any, b: any) => b.totalSeconds - a.totalSeconds);
                        const groupHeight = sortedVehicles.length * 24;
                        
                        return (
                            <div key={baseName}>
                                {groupIndex > 0 && (
                                    <div className="flex">
                                        <div className="w-24 border-t-2 border-gray-400"></div>
                                        <div className="w-12 border-t-2 border-gray-400"></div>
                                        <div className="flex-1"></div>
                                    </div>
                                )}
                                <div className="flex">
                                    <div className="w-24 flex items-center justify-center" style={{ height: `${groupHeight}px` }}>
                                        <div className="text-xs text-gray-700 font-medium transform -rotate-90 text-center leading-tight" 
                                             style={{ 
                                                 maxWidth: `${groupHeight - 10}px`,
                                                 wordBreak: 'break-word',
                                                 whiteSpace: 'normal'
                                             }}>
                                            {baseName}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        {sortedVehicles.map((vehicle: any) => {
                                            const percentage = vehicle.isDummy ? 0 : (vehicle.totalSeconds / maxDuration) * 100;
                                            const durationStr = vehicle.isDummy ? '00:00:00' : secondsToTime(vehicle.totalSeconds);
                                            
                                            return (
                                                <div key={`${vehicle.reference}-${vehicle.isDummy ? 'dummy' : 'real'}`} className="flex items-center h-6">
                                                    <div className="w-12 text-xs text-gray-600 text-right pr-2 truncate">
                                                        {vehicle.reference}
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <div className="h-5 bg-gray-100 relative">
                                                            {!vehicle.isDummy && (
                                                                <div 
                                                                    className="h-full bg-orange-400 relative flex items-center"
                                                                    style={{ width: `${Math.max(percentage, 2)}%` }}
                                                                >
                                                                    {percentage > 15 ? (
                                                                        <span className="text-black text-xs font-medium ml-auto pr-2">
                                                                            {durationStr}
                                                                        </span>
                                                                    ) : null}
                                                                </div>
                                                            )}
                                                            {!vehicle.isDummy && percentage <= 15 && (
                                                                <span 
                                                                    className="absolute top-0 text-black text-xs font-medium h-5 flex items-center pl-1"
                                                                    style={{ left: `${Math.max(percentage, 2)}%` }}
                                                                >
                                                                    {durationStr}
                                                                </span>
                                                            )}
                                                            {vehicle.isDummy && (
                                                                <span className="absolute top-0 left-2 text-gray-400 text-xs font-medium h-5 flex items-center">
                                                                    {durationStr}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            
            {/* Time scale */}
            <div className="flex items-center mt-2">
                <div className="w-24"></div>
                <div className="w-12"></div>
                <div className="flex-1 flex justify-between text-xs text-gray-500">
                    {timeMarks.map((mark, index) => (
                        <span key={index}>{mark}</span>
                    ))}
                </div>
            </div>
            
            {data.length === 0 && (
                <div className="flex justify-center items-center h-64 text-gray-500">
                    Aucune donnée disponible
                </div>
            )}
        </div>
    );
};

export default DurationProgressChart;