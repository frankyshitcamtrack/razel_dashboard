import React, { useRef, useEffect, useState } from 'react';

interface ToursProgressChartProps {
    data: any[];
    title: string;
}

const ToursProgressChart: React.FC<ToursProgressChartProps> = ({ data, title }) => {
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
                totalTours: 0,
                baseName: baseName
            };
        }
        
        acc[baseName][vehicleRef].totalTours += parseInt(item.nombre_tours);
        return acc;
    }, {});

    // Add dummy entries for centering based on count
    Object.keys(processedData).forEach(baseName => {
        const vehicles = Object.values(processedData[baseName]);
        const currentCount = vehicles.length;
        
        if (currentCount === 1) {
            // 3 left, 1 right
            for (let i = 0; i < 3; i++) {
                processedData[baseName][`dummy_left_${i}`] = {
                    reference: '•', totalTours: 0, baseName, isDummy: true, order: -1000 - i
                };
            }
            processedData[baseName][`dummy_right_0`] = {
                reference: '•', totalTours: 0, baseName, isDummy: true, order: 1000
            };
        } else if (currentCount === 2) {
            // 2 left, 1 right
            for (let i = 0; i < 2; i++) {
                processedData[baseName][`dummy_left_${i}`] = {
                    reference: '•', totalTours: 0, baseName, isDummy: true, order: -1000 - i
                };
            }
            processedData[baseName][`dummy_right_0`] = {
                reference: '•', totalTours: 0, baseName, isDummy: true, order: 1000
            };
        } else if (currentCount === 3) {
            // 1 left, 1 right
            processedData[baseName][`dummy_left_0`] = {
                reference: '•', totalTours: 0, baseName, isDummy: true, order: -1000
            };
            processedData[baseName][`dummy_right_0`] = {
                reference: '•', totalTours: 0, baseName, isDummy: true, order: 1000
            };
        } else if (currentCount === 4) {
            // 1 left
            processedData[baseName][`dummy_left_0`] = {
                reference: '•', totalTours: 0, baseName, isDummy: true, order: -1000
            };
        } else if (currentCount > 5) {
            // 1 left, 1 right for groups with more than 5 elements
            processedData[baseName][`dummy_left_0`] = {
                reference: '•', totalTours: 0, baseName, isDummy: true, order: -1000
            };
            processedData[baseName][`dummy_right_0`] = {
                reference: '•', totalTours: 0, baseName, isDummy: true, order: 1000
            };
        }
        
        // Add order to real vehicles
        vehicles.forEach((vehicle: any, index: number) => {
            vehicle.order = index;
        });
    });

    const containerRef = useRef<HTMLDivElement>(null);
    const [containerHeight, setContainerHeight] = useState(300);

    useEffect(() => {
        const updateHeight = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                const availableHeight = Math.max(250, rect.height - 120); // Subtract padding and labels
                setContainerHeight(availableHeight);
            }
        };

        updateHeight();
        window.addEventListener('resize', updateHeight);
        return () => window.removeEventListener('resize', updateHeight);
    }, []);

    // Get max tours and total bars count
    const allTours = Object.values(processedData).flatMap((base: any) => 
        Object.values(base).filter((item: any) => !item.isDummy).map((item: any) => item.totalTours)
    );
    const maxTours = Math.max(...allTours);
    const totalGroups = Object.keys(processedData).length;
    const barWidth = Math.max(12, Math.min(25, (400 / (totalGroups * 5))));
    const chartHeight = containerHeight;

    // Generate tours scale marks for left axis based on container height
    const generateToursMarks = () => {
        const marks = [];
        const maxMarks = Math.max(4, Math.floor(chartHeight / 40)); // Adaptive number of marks
        const step = Math.max(1, Math.ceil(maxTours / maxMarks));
        
        for (let i = maxTours; i >= 0; i -= step) {
            marks.push(i.toString());
        }
        return marks;
    };

    const toursMarks = generateToursMarks();

    return (
        <div ref={containerRef} className="bg-white rounded-lg shadow-sm p-6 h-full">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
            </div>
            
            <div className="flex">
                {/* Left axis - numeric values */}
                <div className="w-12 flex flex-col justify-between flex-shrink-0" style={{ height: `${chartHeight}px` }}>
                    {toursMarks.map((mark, index) => (
                        <span key={index} className="text-xs text-gray-500 text-right">{mark}</span>
                    ))}
                </div>
                
                {/* Chart area */}
                <div className="flex-1 relative" style={{ height: `${chartHeight}px` }}>
                    {/* Horizontal grid lines */}
                    <div className="absolute inset-0">
                        {toursMarks.map((_, index) => {
                            const position = (index / (toursMarks.length - 1)) * 100;
                            return (
                                <div 
                                    key={index}
                                    className="absolute left-0 right-0 border-t border-dashed border-gray-200"
                                    style={{ top: `${position}%` }}
                                />
                            );
                        })}
                    </div>
                    
                    {/* Bars */}
                    <div className="absolute bottom-0 left-0 flex items-end" style={{ paddingLeft: '20px' }}>
                        {Object.entries(processedData).map(([baseName, vehicles]: [string, any]) => {
                            const sortedVehicles = Object.values(vehicles).sort((a: any, b: any) => {
                                if (a.isDummy && b.isDummy) return a.order - b.order;
                                if (a.isDummy) return a.order < 0 ? -1 : 1;
                                if (b.isDummy) return b.order < 0 ? 1 : -1;
                                return b.totalTours - a.totalTours;
                            });
                            const groupWidth = Math.max(5, Object.values(vehicles).length) * (barWidth + 2) - 2;
                            
                            return (
                                <div key={baseName} className="flex items-end" style={{ gap: '2px', width: `${groupWidth}px`, marginRight: '20px' }}>
                                    {sortedVehicles.map((vehicle: any) => {
                                        const percentage = vehicle.isDummy ? 0 : (vehicle.totalTours / maxTours) * 100;
                                        
                                        return (
                                            <div key={`${vehicle.reference}-${vehicle.isDummy ? 'dummy' : 'real'}`} className="flex flex-col items-center" style={{ width: `${barWidth}px` }}>
                                                <div className="relative">
                                                    {!vehicle.isDummy ? (
                                                        <div 
                                                            className="bg-orange-400 relative"
                                                            style={{ 
                                                                width: `${barWidth}px`,
                                                                height: `${Math.max((percentage * chartHeight) / 100, 6)}px` 
                                                            }}
                                                        >
                                                            <span className="absolute -top-5 left-1/2 transform -translate-x-1/2 text-xs font-medium text-black">
                                                                {vehicle.totalTours}
                                                            </span>
                                                        </div>
                                                    ) : (
                                                        <div style={{ width: `${barWidth}px`, height: '6px' }} />
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
            
            {/* Bottom axis - vehicle references and base names */}
            <div className="flex mt-2">
                <div className="w-12 flex-shrink-0"></div>
                <div className="flex" style={{ paddingLeft: '20px' }}>
                    {Object.entries(processedData).map(([baseName, vehicles]: [string, any], groupIndex: number) => {
                        const sortedVehicles = Object.values(vehicles).sort((a: any, b: any) => {
                            if (a.isDummy && b.isDummy) return a.order - b.order;
                            if (a.isDummy) return a.order < 0 ? -1 : 1;
                            if (b.isDummy) return b.order < 0 ? 1 : -1;
                            return b.totalTours - a.totalTours;
                        });
                        const groupWidth = Math.max(5, Object.values(vehicles).length) * (barWidth + 2) - 2;
                        
                        return (
                            <div key={baseName} className="flex flex-col relative" style={{ width: `${groupWidth}px`, marginRight: '20px' }}>
                                {groupIndex > 0 && (
                                    <div className="absolute left-0 top-0 border-l-2 border-gray-400" style={{ left: '-10px', height: '40px' }}></div>
                                )}
                                <div className="flex" style={{ gap: '2px' }}>
                                    {sortedVehicles.map((vehicle: any) => (
                                        <div key={`${vehicle.reference}-${vehicle.isDummy ? 'dummy' : 'real'}`} className="flex flex-col items-center" style={{ width: `${barWidth}px` }}>
                                            {!vehicle.isDummy && (
                                                <span className="text-xs text-gray-600 text-left transform -rotate-45 whitespace-nowrap" style={{ height: '20px', lineHeight: '20px', transformOrigin: 'left bottom', marginTop: '10px' }}>
                                                    {vehicle.reference}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs text-gray-700 font-medium text-center pt-3" 
                                     style={{ 
                                         fontSize: '10px',
                                         lineHeight: '1.2',
                                         wordWrap: 'break-word',
                                         overflowWrap: 'break-word'
                                     }}>
                                    {baseName}
                                </div>
                            </div>
                        );
                    })}
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

export default ToursProgressChart;