import React from 'react';

interface MonthYearFilterProps {
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  selectedYear: string;
  onYearChange: (year: string) => void;
  availableYears: number[];
}

const MONTHS = [
  { label: 'Todos los meses', value: '' },
  { label: 'Enero', value: '01' },
  { label: 'Febrero', value: '02' },
  { label: 'Marzo', value: '03' },
  { label: 'Abril', value: '04' },
  { label: 'Mayo', value: '05' },
  { label: 'Junio', value: '06' },
  { label: 'Julio', value: '07' },
  { label: 'Agosto', value: '08' },
  { label: 'Septiembre', value: '09' },
  { label: 'Octubre', value: '10' },
  { label: 'Noviembre', value: '11' },
  { label: 'Diciembre', value: '12' },
];

const MonthYearFilter: React.FC<MonthYearFilterProps> = ({
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  availableYears,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <label htmlFor="month-filter" className="sr-only">Filtrar por Mes</label>
        <select
          id="month-filter"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          aria-label="Filtrar por mes"
        >
          {MONTHS.map((month) => (
            <option key={month.value} value={month.value}>{month.label}</option>
          ))}
        </select>
      </div>
      <div className="relative">
        <label htmlFor="year-filter" className="sr-only">Filtrar por Año</label>
        <select
          id="year-filter"
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          aria-label="Filtrar por año"
        >
          <option value="">Todos los años</option>
          {availableYears.map((year) => (
            <option key={year} value={year.toString()}>{year}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MonthYearFilter;