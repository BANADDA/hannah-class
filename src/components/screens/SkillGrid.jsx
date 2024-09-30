import React from 'react';

// Utility function to lighten a hex color
const lightenColor = (color, percent) => {
  const num = parseInt(color.slice(1), 16),
    amt = Math.round(2.55 * percent),
    R = Math.min(255, (num >> 16) + amt),
    G = Math.min(255, ((num >> 8) & 0x00ff) + amt),
    B = Math.min(255, (num & 0x0000ff) + amt);

  return `#${(0x1000000 + (R << 16) + (G << 8) + B).toString(16).slice(1)}`;
};

const skills = [
  { title: 'Addition', icon: '➕', color: '#ff3366' },
  { title: 'Subtraction', icon: '➖', color: '#ff6699' },
  { title: 'Division', icon: '➗', color: '#ff9933' },
  { title: 'Multiplication', icon: '✖️', color: '#00FFFF' },
  { title: 'Counting', icon: '🔢', color: '#FFD700' },
  { title: 'Comparison', icon: '⚖️', color: '#85e085' },
  { title: 'Measurement', icon: '📏', color: '#3399ff' },
];

const SkillTile = ({ title, icon, color, onClick }) => {
  const lighterColor = lightenColor(color, 20); // Adjusted to 20% lighter

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative w-full h-36 rounded-lg shadow-md border-2 overflow-hidden group flex flex-col cursor-pointer"
        style={{
          borderColor: color,
          '--tile-color': color,
          '--tile-hover-color': lighterColor,
        }}
        onClick={handleClick}
      >
        {/* Icon Section */}
        <div
          className="flex justify-center items-center flex-[2]"
          style={{ backgroundColor: color }}
        >
          <div className="text-white text-4xl md:text-5xl">{icon}</div>
        </div>
        {/* Bottom Section */}
        <div
          className="flex justify-center items-center text-center bg-white flex-1 transition-colors duration-300"
          style={{
            backgroundColor: 'white',
          }}
        >
          <span className="text-gray-800 text-lg font-semibold">{title}</span>
        </div>
        {/* Hover Overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ backgroundColor: 'transparent' }}
        >
          <div
            className="absolute bottom-0 w-full h-1/3 flex justify-center items-center"
            style={{ backgroundColor: lighterColor }}
          >
            <span className="text-white text-lg font-semibold">{title}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const SkillGrid = ({ onAdditionClick }) => {
  return (
    <div>
      <header className="bg-white text-black text-center pt-14 text-3xl font-bold">
        Practice Math Skills
      </header>
      <div className="p-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
        {skills.map((skill, index) => {
          if (skill.title === 'Addition') {
            return <SkillTile key={index} {...skill} onClick={onAdditionClick} />;
          }
          return <SkillTile key={index} {...skill} />;
        })}
      </div>
    </div>
  );
};

export default SkillGrid;
