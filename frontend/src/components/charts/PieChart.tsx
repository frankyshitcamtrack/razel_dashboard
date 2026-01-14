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

    // Function to create SVG path for pie slice with elliptical perspective
    const createPieSlice = (startAngle: number, endAngle: number, depth = 40) => {
        const centerX = 300;
        const centerY = 200;
        const radiusX = 180; // Horizontal radius
        const radiusY = 100; // Vertical radius (compressed for 3D effect)
        const innerRadiusX = variant === "donut" ? 90 : 0;
        const innerRadiusY = variant === "donut" ? 50 : 0;
        
        const startRad = (startAngle - 90) * Math.PI / 180;
        const endRad = (endAngle - 90) * Math.PI / 180;
        
        // Elliptical coordinates
        const x1 = centerX + radiusX * Math.cos(startRad);
        const y1 = centerY + radiusY * Math.sin(startRad);
        const x2 = centerX + radiusX * Math.cos(endRad);
        const y2 = centerY + radiusY * Math.sin(endRad);
        
        const largeArc = endAngle - startAngle > 180 ? 1 : 0;
        
        // Top surface with elliptical arc
        const topPath = variant === "donut" ? 
            `M ${centerX + innerRadiusX * Math.cos(startRad)} ${centerY + innerRadiusY * Math.sin(startRad)}
             L ${x1} ${y1}
             A ${radiusX} ${radiusY} 0 ${largeArc} 1 ${x2} ${y2}
             L ${centerX + innerRadiusX * Math.cos(endRad)} ${centerY + innerRadiusY * Math.sin(endRad)}
             A ${innerRadiusX} ${innerRadiusY} 0 ${largeArc} 0 ${centerX + innerRadiusX * Math.cos(startRad)} ${centerY + innerRadiusY * Math.sin(startRad)}
             Z` :
            `M ${centerX} ${centerY}
             L ${x1} ${y1}
             A ${radiusX} ${radiusY} 0 ${largeArc} 1 ${x2} ${y2}
             Z`;
        
        // 3D side surfaces - vertical edges
        const sideEdge1 = `M ${x1} ${y1} L ${x1} ${y1 + depth} L ${centerX} ${centerY + depth} L ${centerX} ${centerY} Z`;
        const sideEdge2 = `M ${x2} ${y2} L ${x2} ${y2 + depth} L ${centerX} ${centerY + depth} L ${centerX} ${centerY} Z`;
        
        // Curved side surface
        const sidePath = `
            M ${x1} ${y1}
            L ${x1} ${y1 + depth}
            A ${radiusX} ${radiusY} 0 ${largeArc} 1 ${x2} ${y2 + depth}
            L ${x2} ${y2}
            A ${radiusX} ${radiusY} 0 ${largeArc} 0 ${x1} ${y1}
            Z
        `;
        
        return { topPath, sidePath, sideEdge1, sideEdge2 };
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
                    <svg width="600" height="450" viewBox="0 0 600 450" className="w-full h-auto">
                        {data.length === 1 ? (
                            // Single element - draw complete ellipse
                            <>
                                {/* 3D shadow ellipse */}
                                <ellipse
                                    cx="300"
                                    cy="240"
                                    rx="180"
                                    ry="25"
                                    fill={darkenColor(segments[0].color, 40)}
                                />
                                {/* Main ellipse */}
                                <ellipse
                                    cx="300"
                                    cy="200"
                                    rx="180"
                                    ry="100"
                                    fill={segments[0].color}
                                    stroke="#fff"
                                    strokeWidth="3"
                                    style={{
                                        transform: isAnimated ? 'scale(1)' : 'scale(0)',
                                        transformOrigin: '300px 200px',
                                        transition: 'transform 0.8s ease-out'
                                    }}
                                />
                                {variant === "donut" && (
                                    <ellipse
                                        cx="300"
                                        cy="200"
                                        rx="90"
                                        ry="50"
                                        fill="white"
                                    />
                                )}
                                {/* Label */}
                                <text
                                    x="300"
                                    y="200"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="fill-white font-bold text-2xl"
                                    style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                                >
                                    {segments[0].daylyConsom}{unit}
                                </text>
                            </>
                        ) : (
                            // Multiple elements - draw 3D pie slices
                            <>
                                {/* Draw side surfaces first (3D depth) */}
                                {segments.map((segment, index) => {
                                    const { sidePath, sideEdge1, sideEdge2 } = createPieSlice(
                                        segment.startAngle,
                                        segment.endAngle,
                                        40
                                    );
                                    return (
                                        <g key={`side-${index}`}>
                                            {/* Curved side surface */}
                                            <path
                                                d={sidePath}
                                                fill={darkenColor(segment.color, 35)}
                                                stroke="#fff"
                                                strokeWidth="2"
                                                style={{
                                                    transformOrigin: '300px 200px',
                                                    transform: isAnimated ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: `transform ${0.8 + index * 0.2}s ease-out`
                                                }}
                                            />
                                            {/* Vertical edge surfaces */}
                                            <path
                                                d={sideEdge1}
                                                fill={darkenColor(segment.color, 50)}
                                                stroke="#fff"
                                                strokeWidth="2"
                                                style={{
                                                    transformOrigin: '300px 200px',
                                                    transform: isAnimated ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: `transform ${0.8 + index * 0.2}s ease-out`
                                                }}
                                            />
                                            <path
                                                d={sideEdge2}
                                                fill={darkenColor(segment.color, 50)}
                                                stroke="#fff"
                                                strokeWidth="2"
                                                style={{
                                                    transformOrigin: '300px 200px',
                                                    transform: isAnimated ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    transition: `transform ${0.8 + index * 0.2}s ease-out`
                                                }}
                                            />
                                        </g>
                                    );
                                })}
                                
                                {/* Draw top surfaces */}
                                {segments.map((segment, index) => {
                                    const { topPath } = createPieSlice(
                                        segment.startAngle,
                                        segment.endAngle
                                    );
                                    
                                    // Calculate label position with elliptical coordinates
                                    const midAngle = ((segment.startAngle + segment.endAngle) / 2 - 90) * Math.PI / 180;
                                    const labelRadiusX = variant === "donut" ? 135 : 120;
                                    const labelRadiusY = variant === "donut" ? 75 : 65;
                                    const labelX = 300 + labelRadiusX * Math.cos(midAngle);
                                    const labelY = 200 + labelRadiusY * Math.sin(midAngle);
                                    
                                    return (
                                        <g key={`top-${index}`}>
                                            <path
                                                d={topPath}
                                                fill={segment.color}
                                                stroke="#fff"
                                                strokeWidth="3"
                                                className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                                                style={{
                                                    transformOrigin: '300px 200px',
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
                                                    className="fill-white font-bold text-xl"
                                                    style={{ 
                                                        textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
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
                                    x="300"
                                    y="190"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-3xl font-bold fill-gray-800"
                                >
                                    {total.toFixed(1)}
                                </text>
                                <text
                                    x="300"
                                    y="215"
                                    textAnchor="middle"
                                    dominantBaseline="middle"
                                    className="text-lg fill-gray-600"
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
                                    VE38A {segment.name}: {segment.daylyConsom}{unit}
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