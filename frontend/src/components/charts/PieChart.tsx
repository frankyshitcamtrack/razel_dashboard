import React, { useEffect, useState } from "react";

interface DailyConsommationData {
    name: string;
    daylyConsom: number;
}

interface PieChartProps {
    data?: DailyConsommationData[];
    title: string;
    unit?: string;
    className?: string;
    variant?: "pie" | "donut";
}

const COLORS = [
    "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6",
    "#ef4444", "#ec4899", "#14b8a6", "#64748b"
];

const PieChartComponent: React.FC<PieChartProps> = ({
    data = [],
    title,
    unit = "",
    className = "",
    variant = "donut"
}) => {
    const [isAnimated, setIsAnimated] = useState(false);
    
    useEffect(() => {
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    const total = data.reduce((sum, item) => sum + item.daylyConsom, 0);
    
    // Calculate angles for each segment
    let currentAngle = 0;
    const segments = data.map((item, index) => {
        const percentage = (item.daylyConsom / total) * 100;
        // For single element, use 359.9 degrees to avoid full circle rendering issues
        const angle = data.length === 1 ? 359.9 : (item.daylyConsom / total) * 360;
        const segment = {
            ...item,
            percentage,
            startAngle: currentAngle,
            endAngle: currentAngle + angle,
            color: COLORS[index % COLORS.length]
        };
        currentAngle += angle;
        return segment;
    });

    // Function to create SVG path for pie slice
    const createPieSlice = (startAngle: number, endAngle: number, depth = 20) => {
        const centerX = 140;
        const centerY = 100;
        const radius = variant === "donut" ? 80 : 80;
        const innerRadius = variant === "donut" ? 40 : 0;
        
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        const x1 = centerX + radius * Math.cos(startRad);
        const y1 = centerY + radius * Math.sin(startRad);
        const x2 = centerX + radius * Math.cos(endRad);
        const y2 = centerY + radius * Math.sin(endRad);
        
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        
        // Top surface
        const topPath = variant === "donut" ? 
            `M ${centerX + innerRadius * Math.cos(startRad)} ${centerY + innerRadius * Math.sin(startRad)}
             L ${x1} ${y1}
             A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
             L ${centerX + innerRadius * Math.cos(endRad)} ${centerY + innerRadius * Math.sin(endRad)}
             A ${innerRadius} ${innerRadius} 0 ${largeArc} 0 ${centerX + innerRadius * Math.cos(startRad)} ${centerY + innerRadius * Math.sin(startRad)}
             Z` :
            `M ${centerX} ${centerY}
             L ${x1} ${y1}
             A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}
             Z`;
        
        // Side surface (3D effect)
        const sidePath = `
            M ${x1} ${y1}
            L ${x1} ${y1 + depth}
            A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2 + depth}
            L ${x2} ${y2}
            A ${radius} ${radius} 0 ${largeArc} 0 ${x1} ${y1}
        `;
        
        return { topPath, sidePath };
    };

    // Darken color for 3D effect
    const darkenColor = (color: string, percent: number) => {
        const num = parseInt(color.replace("#",""), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) - amt;
        const G = (num >> 8 & 0x00FF) - amt;
        const B = (num & 0x0000FF) - amt;
        return "#" + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
    };

    return (
        <div className={`bg-white rounded-xl shadow-lg p-4 flex flex-col ${className}`}>
            <h3 className="text-lg font-semibold text-gray-800 mb-1 text-center">{title}</h3>

            <div className="flex-grow flex flex-col lg:flex-row items-center justify-center relative min-h-[300px]">
                {/* 3D Pie Chart */}
                <div className="lg:flex-1">
                    <svg width="280" height="220" viewBox="0 0 280 220" className="w-full h-auto">
                        {data.length === 1 ? (
                            // Single element - draw complete circles
                            <>
                                {/* 3D shadow circle */}
                                <ellipse
                                    cx="140"
                                    cy="120"
                                    rx={variant === "donut" ? "80" : "80"}
                                    ry="15"
                                    fill={darkenColor(segments[0].color, 30)}
                                />
                                {variant === "donut" && (
                                    <ellipse
                                        cx="140"
                                        cy="120"
                                        rx="40"
                                        ry="8"
                                        fill="white"
                                    />
                                )}
                                {/* Main circle */}
                                <circle
                                    cx="140"
                                    cy="100"
                                    r={variant === "donut" ? "80" : "80"}
                                    fill={segments[0].color}
                                    stroke="#fff"
                                    strokeWidth="2"
                                    style={{
                                        transform: isAnimated ? 'scale(1)' : 'scale(0)',
                                        transformOrigin: '140px 100px',
                                        transition: 'transform 0.8s ease-out'
                                    }}
                                />
                                {variant === "donut" && (
                                    <circle
                                        cx="140"
                                        cy="100"
                                        r="40"
                                        fill="white"
                                    />
                                )}
                                {/* Label */}
                                <text
                                    x="140"
                                    y="100"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="fill-white font-bold text-sm"
                                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
                                >
                                    {segments[0].daylyConsom}{unit}
                                </text>
                            </>
                        ) : (
                            // Multiple elements - draw pie slices
                            <>
                                {/* Draw side surfaces first (3D depth) */}
                                {segments.map((segment, index) => {
                                    const { sidePath } = createPieSlice(
                                        segment.startAngle,
                                        segment.endAngle
                                    );
                                    return (
                                        <path
                                            key={`side-${index}`}
                                            d={sidePath}
                                            fill={darkenColor(segment.color, 30)}
                                            stroke="#fff"
                                            strokeWidth="1"
                                            style={{
                                                transformOrigin: '140px 100px',
                                                transform: isAnimated ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                transition: `transform ${0.8 + index * 0.2}s ease-out`
                                            }}
                                        />
                                    );
                                })}
                                
                                {/* Draw top surfaces */}
                                {segments.map((segment, index) => {
                                    const { topPath } = createPieSlice(
                                        segment.startAngle,
                                        segment.endAngle
                                    );
                                    
                                    // Calculate label position
                                    const midAngle = ((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180;
                                    const labelRadius = variant === "donut" ? 60 : 50;
                                    const labelX = 140 + labelRadius * Math.cos(midAngle);
                                    const labelY = 100 + labelRadius * Math.sin(midAngle);
                                    
                                    return (
                                        <g key={`top-${index}`}>
                                            <path
                                                d={topPath}
                                                fill={segment.color}
                                                stroke="#fff"
                                                strokeWidth="2"
                                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                                style={{
                                                    transformOrigin: '140px 100px',
                                                    transform: isAnimated ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: `transform ${0.8 + index * 0.2}s ease-out`
                                                }}
                                            />
                                            {segment.percentage > 5 && (
                                                <text
                                                    x={labelX}
                                                    y={labelY}
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    className="fill-white font-bold text-sm"
                                                    style={{ 
                                                        textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                                                        opacity: isAnimated ? 1 : 0,
                                                        transition: `opacity ${1.2 + index * 0.2}s ease-out`
                                                    }}
                                                >
                                                    {segment.daylyConsom}{unit}
                                                </text>
                                            )}
                                        </g>
                                    );
                                })}
                            </>
                        )}
                        
                        {/* Center text for donut */}
                        {variant === "donut" && total > 0 && (
                            <g>
                                <text
                                    x="140"
                                    y="95"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-lg font-bold fill-gray-800"
                                >
                                    {total.toFixed(1)}
                                </text>
                                <text
                                    x="140"
                                    y="110"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-xs fill-gray-600"
                                >
                                    {unit}
                                </text>
                            </g>
                        )}
                    </svg>
                </div>

                {/* Legend */}
                <div className="w-full lg:w-auto lg:flex-1 mt-4 lg:mt-0 lg:pl-4">
                    <div className="flex flex-wrap justify-center lg:justify-start gap-2 lg:block">
                        {segments.map((segment, index) => (
                            <div key={index} className="flex items-center text-xs mb-1">
                                <div
                                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0"
                                    style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-gray-700 truncate max-w-[120px] lg:max-w-none">
                                    {segment.name}: {segment.daylyConsom}{unit}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PieChartComponent;