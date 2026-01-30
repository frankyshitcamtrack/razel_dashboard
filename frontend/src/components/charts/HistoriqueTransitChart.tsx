import React from 'react';

interface HistoriqueTransitChartProps {
  data: any[];
  height?: number;
}

const HistoriqueTransitChart: React.FC<HistoriqueTransitChartProps> = ({ 
  data,
  height = 400 
}) => {
  const timeToSeconds = (timeStr: string): number => {
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  const addTimes = (time1: string, time2: string): string => {
    const seconds1 = timeToSeconds(time1);
    const seconds2 = timeToSeconds(time2);
    const totalSeconds = seconds1 + seconds2;
    
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Group and sum data by base name and vehicle reference (same as ToursProgressChart)
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
        duree_base_depart: '00:00:00',
        duree_transit: '00:00:00',
        baseName: baseName,
        date_depart: item.date_depart,
        date_arrivee: item.date_arrivee
      };
    }
    
    acc[baseName][vehicleRef].duree_base_depart = addTimes(
      acc[baseName][vehicleRef].duree_base_depart, 
      item.duree_base_depart
    );
    acc[baseName][vehicleRef].duree_transit = addTimes(
      acc[baseName][vehicleRef].duree_transit, 
      item.duree_transit
    );
    
    return acc;
  }, {});

  if (!data || data.length === 0) {
    return (
      <div 
        className="w-full flex items-center justify-center bg-gray-50 rounded-lg border"
        style={{ height: `${height}px` }}
      >
        <div className="text-gray-500 text-center">
          <div className="text-lg font-medium mb-2">Historique Transit</div>
          <div className="text-sm">Aucune donnée disponible</div>
        </div>
      </div>
    );
  }

  // Calculate max total duration for scaling
  const allDurations = Object.values(processedData).flatMap((base: any) => 
    Object.values(base).map((item: any) => 
      timeToSeconds(item.duree_base_depart) + timeToSeconds(item.duree_transit)
    )
  );
  const maxTotalSeconds = Math.max(...allDurations);
  const maxScaleSeconds = Math.max(maxTotalSeconds, 20 * 3600);

  const totalGroups = Object.keys(processedData).length;
  const totalVehicles = Object.values(processedData).reduce((sum: number, vehicles: any) => sum + Object.keys(vehicles).length, 0);
  const availableWidth = 600; // Fixed available width for chart area
  const barWidth = totalVehicles > 0 ? Math.max(15, Math.min(60, (availableWidth - (totalGroups * 15)) / totalVehicles)) : 50;
  const groupSpacing = totalGroups > 0 ? Math.max(10, Math.min(25, availableWidth / (totalGroups * 8))) : 20;
  const chartHeight = height - 120;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Historique Transit</h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-orange-400 rounded"></div>
            <span className="text-gray-600">Durée base départ</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-800 rounded"></div>
            <span className="text-gray-600">Durée transit</span>
          </div>
        </div>
      </div>
      
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis with time labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
          <div>20:00:00</div>
          <div>15:00:00</div>
          <div>10:00:00</div>
          <div>05:00:00</div>
          <div>00:00:00</div>
        </div>
        
        {/* Chart area */}
        <div className="ml-16 h-full relative overflow-hidden">
          {/* Horizontal grid lines */}
          <div className="absolute inset-0">
            {[0, 1, 2, 3, 4].map((index) => (
              <div 
                key={index}
                className="absolute w-full border-t border-gray-200"
                style={{ top: `${(index / 4) * chartHeight}px` }}
              />
            ))}
          </div>
          
          {/* Bars grouped by base name */}
          <div className="absolute bottom-0 left-0 flex items-end w-full" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
            {Object.entries(processedData).map(([baseName, vehicles]: [string, any], groupIndex: number) => {
              const sortedVehicles = Object.values(vehicles).sort((a: any, b: any) => {
                const totalA = timeToSeconds(a.duree_base_depart) + timeToSeconds(a.duree_transit);
                const totalB = timeToSeconds(b.duree_base_depart) + timeToSeconds(b.duree_transit);
                return totalB - totalA;
              });
              const groupWidth = Object.values(vehicles).length * barWidth;
              
              return (
                <div key={baseName} className="flex items-end relative" style={{ gap: '2px', width: `${groupWidth}px`, marginRight: `${groupSpacing}px` }}>
                  {/* Group separator line */}
                  {groupIndex > 0 && (
                    <div className="absolute -left-3 top-0 w-px bg-gray-300" style={{ height: `${chartHeight + 40}px` }} />
                  )}
                  
                  {sortedVehicles.map((vehicle: any) => {
                    const baseDepartSeconds = timeToSeconds(vehicle.duree_base_depart);
                    const transitSeconds = timeToSeconds(vehicle.duree_transit);
                    
                    const baseDepartHeight = (baseDepartSeconds / maxScaleSeconds) * chartHeight;
                    const transitHeight = (transitSeconds / maxScaleSeconds) * chartHeight;
                    
                    return (
                      <div key={vehicle.reference} className="flex flex-col items-center group relative" style={{ width: `${barWidth}px` }}>
                        {/* Bar container */}
                        <div 
                          className="relative flex flex-col justify-end"
                          style={{ 
                            width: `${barWidth}px`,
                            height: `${chartHeight}px`
                          }}
                        >
                          {(baseDepartHeight + transitHeight) > 0 && (
                            <div className="relative">
                              {/* Transit duration (blue, top) */}
                              {transitSeconds > 0 && (
                                <div 
                                  className="bg-blue-800 flex items-center justify-center text-white text-xs font-bold"
                                  style={{ height: `${transitHeight}px` }}
                                >
                                  {transitSeconds > 0 && (
                                    <span className="text-black text-xs">
                                      {vehicle.duree_transit}
                                    </span>
                                  )}
                                </div>
                              )}
                              {/* Base depart duration (orange, bottom) */}
                              {baseDepartSeconds > 0 && (
                                <div 
                                  className="bg-orange-400 flex items-center justify-center text-white text-xs font-bold"
                                  style={{ height: `${baseDepartHeight}px` }}
                                >
                                  {baseDepartSeconds > 0 && (
                                    <span className="text-black text-xs">
                                      {vehicle.duree_base_depart}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          <div>Base: {vehicle.duree_base_depart}</div>
                          <div>Transit: {vehicle.duree_transit}</div>
                          <div className="text-gray-300">{vehicle.reference}</div>
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
        <div className="w-16 flex-shrink-0"></div>
        <div className="flex overflow-hidden" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
          {Object.entries(processedData).map(([baseName, vehicles]: [string, any], groupIndex: number) => {
            const sortedVehicles = Object.values(vehicles).sort((a: any, b: any) => {
              const totalA = timeToSeconds(a.duree_base_depart) + timeToSeconds(a.duree_transit);
              const totalB = timeToSeconds(b.duree_base_depart) + timeToSeconds(b.duree_transit);
              return totalB - totalA;
            });
            const groupWidth = Object.values(vehicles).length * barWidth;
            
            return (
              <div key={baseName} className="flex flex-col relative" style={{ width: `${groupWidth}px`, marginRight: `${groupSpacing}px` }}>
                {groupIndex > 0 && (
                  <div className="absolute left-0 top-0 border-l-2 border-gray-400" style={{ left: '-10px', height: '40px' }}></div>
                )}
                <div className="flex" style={{ gap: '2px' }}>
                  {sortedVehicles.map((vehicle: any) => {
                    const departTime = new Date(vehicle.date_depart).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    const arriveeTime = new Date(vehicle.date_arrivee).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
                    
                    return (
                      <div key={vehicle.reference} className="flex flex-col items-center" style={{ width: `${barWidth}px` }}>
                        <span className="text-xs text-gray-600 text-left transform -rotate-45 whitespace-nowrap" style={{ height: '20px', lineHeight: '20px', transformOrigin: 'left bottom', marginTop: '10px' }}>
                          {vehicle.reference}
                        </span>
                        <div className="text-xs text-gray-500 text-center mt-1" style={{ fontSize: '9px' }}>
                          {departTime} à {arriveeTime}
                        </div>
                      </div>
                    );
                  })}
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
    </div>
  );
};

export default HistoriqueTransitChart;