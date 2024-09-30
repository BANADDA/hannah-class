import React from 'react';

const GameOption = ({ title, icon, color, starred, onClick }) => (
  <div
    className="relative flex items-center p-4 rounded-lg border-2 transition-all cursor-pointer w-full overflow-hidden"
    style={{ borderColor: color }} // Set initial border color
    onClick={onClick} // Handle click events
    onMouseEnter={(e) => {
      e.currentTarget.querySelector('.fill-bg').style.transform = 'scale(1)'; // Start fill effect
      e.currentTarget.querySelector('.title').style.color = 'white'; // Change text to white
      e.currentTarget.querySelector('.icon-bg').style.backgroundColor = 'white'; // Change icon background to white
      e.currentTarget.querySelector('.icon').style.color = color; // Change icon color to the original color
    }}
    onMouseLeave={(e) => {
      e.currentTarget.querySelector('.fill-bg').style.transform = 'scale(0)'; // Reset fill effect
      e.currentTarget.querySelector('.title').style.color = color; // Reset text color to original color
      e.currentTarget.querySelector('.icon-bg').style.backgroundColor = color; // Reset icon background to original color
      e.currentTarget.querySelector('.icon').style.color = 'white'; // Reset icon color to white
    }}
  >
    {/* Special Background Fill Effect */}
    <div
      className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out fill-bg"
      style={{
        backgroundColor: color, // Use the unique color for each game
        transformOrigin: 'top left', // Start fill from the top-left corner
        transform: 'scale(0)', // Start with a scale of 0
        zIndex: 0, // Keep the background behind the text and icon
      }}
    ></div>

    {/* Icon Section */}
    <div className="relative w-14 h-14 mr-4 rounded-md flex items-center justify-center border-2 icon-bg transition-all duration-500" style={{ backgroundColor: color, borderColor: color, zIndex: 1 }}>
      <span className="text-3xl text-white icon transition-all duration-500">{icon}</span>
    </div>

    {/* Title Section */}
    <span className="relative text-xl font-semibold title transition-all duration-500" style={{ color, zIndex: 1 }}>
      {title}
    </span>

    {starred && (
      <span className="ml-2 text-yellow-400 relative" style={{ zIndex: 1 }}>
        ★
      </span>
    )}
  </div>
);

const GameDashboard = ({ onMathQuestClick, onPuzzleQuestClick }) => {
  const games = [
    { title: 'Princess Puzzle', icon: '👸', color: '#ffcc99', starred: true, onClick: onPuzzleQuestClick }, // Word Search -> Princess Puzzle
    { title: 'Story Time', icon: '📚', color: '#ffcc66', starred: true, onClick: onMathQuestClick }, // Reading -> Story Time
    { title: "Writer's Club", icon: '🦅', color: '#ff9966', starred: true, onClick: onMathQuestClick }, // Counting -> Count the Critters
    { title: 'Math Quest', icon: '🛡️', color: '#cc6699', starred: true, onClick: onMathQuestClick }, // Quick Maths -> Math Quest
    { title: 'Homework Helper', icon: '✏️', color: '#99ccff', starred: true }, // Homework & Assessment -> Homework Helper
    { title: 'Royal Rankings', icon: '👑', color: '#ff99cc', starred: true, onClick: onMathQuestClick}, // Leader Board -> Royal Rankings (with a crown)
  ];

  return (
    <div className="pb-14">
      <header className="bg-white text-black text-center py-3 pt-14 text-3xl font-bold">
        Hannah's Study Quest
      </header>
      <main className="p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {games.map((game, index) => (
            <GameOption key={index} {...game} />
          ))}
        </div>
      </main>
    </div>
  );
};

export default GameDashboard;
