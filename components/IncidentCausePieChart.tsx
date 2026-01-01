import React, { useMemo, useState } from 'react';
import { Incident, IncidentCause } from '../types';
import { INCIDENT_CAUSES } from '../constants';

interface IncidentCausePieChartProps {
  incidents: Incident[];
}

interface PieSliceData {
  cause: IncidentCause;
  count: number;
  percentage: number;
  color: string;
  startAngle: number;
  endAngle: number;
  labelX: number;
  labelY: number;
}

const CAUSE_COLORS: { [key in IncidentCause]: string } = {
  [IncidentCause.SELLER]: '#10b981',    // Emerald
  [IncidentCause.INSTALLER]: '#3b82f6', // Blue
  [IncidentCause.LOGISTICS]: '#f59e0b', // Amber
  [IncidentCause.OTHER]: '#9ca3af',     // Grey
};

const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
  const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians)),
  };
};

const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number): string => {
  if (endAngle - startAngle >= 359.9) {
    return [
      "M", x, y - radius,
      "A", radius, radius, 0, 1, 1, x, y + radius,
      "A", radius, radius, 0, 1, 1, x, y - radius,
      "Z"
    ].join(" ");
  }
  const start = polarToCartesian(x, y, radius, endAngle);
  const end = polarToCartesian(x, y, radius, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return [
    'M', start.x, start.y,
    'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y,
    'L', x, y,
    'Z',
  ].join(' ');
};

const IncidentCausePieChart: React.FC<IncidentCausePieChartProps> = ({ incidents }) => {
  const [hoveredSlice, setHoveredSlice] = useState<PieSliceData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);

  const chartData: PieSliceData[] = useMemo(() => {
    const totalIncidents = incidents.length;
    if (totalIncidents === 0) return [];

    const incidentCounts = INCIDENT_CAUSES.reduce((acc, cause) => {
      acc[cause] = incidents.filter((i) => i.cause === cause).length;
      return acc;
    }, {} as Record<IncidentCause, number>);

    let currentAngle = 0;
    const radius = 100;
    const centerX = 150;
    const centerY = 150;

    return INCIDENT_CAUSES.map((cause) => {
      const count = incidentCounts[cause];
      const percentage = (count / totalIncidents) * 100;
      const angle = (percentage / 100) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;

      const midAngle = startAngle + angle / 2;
      const labelRadius = radius * 0.75; 
      const labelX = centerX + labelRadius * Math.cos((midAngle - 90) * Math.PI / 180);
      const labelY = centerY + labelRadius * Math.sin((midAngle - 90) * Math.PI / 180);
      
      currentAngle += angle;

      return {
        cause,
        count,
        percentage,
        color: CAUSE_COLORS[cause],
        startAngle,
        endAngle,
        labelX,
        labelY
      };
    }).filter(s => s.count > 0);
  }, [incidents]);

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>, slice: PieSliceData) => {
    setHoveredSlice(slice);
    setTooltipPosition({ x: e.clientX + 10, y: e.clientY + 10 });
  };

  if (incidents.length === 0) {
    return <div className="text-gray-400 italic py-10">No hay incidencias para mostrar.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-3xl border shadow-sm w-full max-w-lg">
      <h3 className="text-center text-gray-800 font-black mb-6 uppercase tracking-tighter">Origen de Incidencias (%)</h3>
      <div className="relative flex justify-center">
        <svg width="300" height="300" viewBox="0 0 300 300" className="drop-shadow-sm">
          <g transform="translate(150,150)">
            {chartData.map((slice) => (
              <React.Fragment key={slice.cause}>
                <path
                  d={describeArc(0, 0, 110, slice.startAngle, slice.endAngle)}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="3"
                  className="cursor-pointer hover:opacity-90 transition-opacity"
                  onMouseMove={(e) => handleMouseMove(e, slice)}
                  onMouseLeave={() => { setHoveredSlice(null); setTooltipPosition(null); }}
                />
                {slice.percentage > 8 && (
                  <text
                    x={slice.labelX - 150}
                    y={slice.labelY - 150}
                    textAnchor="middle"
                    fill="white"
                    fontSize="10"
                    fontWeight="900"
                    pointerEvents="none"
                    className="drop-shadow-md"
                  >
                    {`${slice.cause}: ${slice.percentage.toFixed(0)}%`}
                  </text>
                )}
              </React.Fragment>
            ))}
          </g>
        </svg>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3">
        {chartData.map((slice) => (
          <div key={slice.cause} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl">
            <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: slice.color }}></span>
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-700 uppercase leading-none">{slice.cause}</span>
              <span className="text-xs text-gray-400 font-bold">{slice.percentage.toFixed(1)}% ({slice.count})</span>
            </div>
          </div>
        ))}
      </div>
      {hoveredSlice && tooltipPosition && (
        <div
          className="fixed bg-gray-900 text-white text-xs font-bold p-2 rounded-lg shadow-2xl z-[100] border border-white/20 pointer-events-none"
          style={{ left: tooltipPosition.x, top: tooltipPosition.y }}
        >
          {hoveredSlice.cause}: {hoveredSlice.count} incidencias
        </div>
      )}
    </div>
  );
};

export default IncidentCausePieChart;