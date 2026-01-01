import React from 'react';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  tabs: string[];
}

const Navigation: React.FC<NavigationProps> = ({ currentTab, onTabChange, tabs }) => {
  return (
    <div className="flex"> {/* Simple flex container for buttons */}
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`
            inline-flex items-center px-4 py-2 border-b-2 text-sm font-medium leading-5 focus:outline-none transition duration-150 ease-in-out
            ${currentTab === tab
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }
          `}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default Navigation;