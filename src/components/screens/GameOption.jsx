import PropTypes from 'prop-types';
import React from 'react';
import useSound from 'use-sound';
import hoverSound from '/sounds/hover_sound.mp3';

const GameOption = ({ title, icon, color, starred, onClick, muted }) => {
  const [playHoverSound] = useSound(hoverSound, { volume: 0.5 });

  const handleInteraction = (e, isEnter) => {
    if (muted) return;
    
    if (isEnter) {
      playHoverSound();
      e.currentTarget.querySelector('.fill-bg').style.transform = 'scale(1)';
      e.currentTarget.querySelector('.title').style.color = 'white';
      e.currentTarget.querySelector('.icon-bg').style.backgroundColor = 'white';
      e.currentTarget.querySelector('.icon').style.color = color;
    } else {
      e.currentTarget.querySelector('.fill-bg').style.transform = 'scale(0)';
      e.currentTarget.querySelector('.title').style.color = color;
      e.currentTarget.querySelector('.icon-bg').style.backgroundColor = color;
      e.currentTarget.querySelector('.icon').style.color = 'white';
    }
  };

  return (
    <div
      className={`relative flex items-center p-4 rounded-lg border-2 transition-all w-full overflow-hidden ${muted ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
      style={{ borderColor: color }}
      onClick={muted ? undefined : onClick}
      onMouseEnter={(e) => handleInteraction(e, true)}
      onMouseLeave={(e) => handleInteraction(e, false)}
      onTouchStart={(e) => handleInteraction(e, true)}
      onTouchEnd={(e) => handleInteraction(e, false)}
    >
      <div
        className="absolute top-0 left-0 w-full h-full transition-transform duration-500 ease-in-out fill-bg"
        style={{
          backgroundColor: color,
          transformOrigin: 'top left',
          transform: 'scale(0)',
          zIndex: 0,
        }}
      ></div>

      <div
        className="relative w-14 h-14 mr-4 rounded-md flex items-center justify-center border-2 icon-bg transition-all duration-500"
        style={{
          backgroundColor: color,
          borderColor: color,
          zIndex: 1,
        }}
      >
        <span className="text-3xl text-white icon transition-all duration-500">{icon}</span>
      </div>

      <span
        className="relative text-xl font-semibold title transition-all duration-500"
        style={{ color, zIndex: 1 }}
      >
        {title}
      </span>

      {starred && (
        <span className="ml-2 text-yellow-400 relative" style={{ zIndex: 1 }}>
          ★
        </span>
      )}

      {muted && (
        <span className="absolute right-4 text-2xl" style={{ zIndex: 1 }}>
          🔒
        </span>
      )}
    </div>
  );
};

GameOption.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  color: PropTypes.string.isRequired,
  starred: PropTypes.bool,
  onClick: PropTypes.func,
  muted: PropTypes.bool,
};

GameOption.defaultProps = {
  starred: false,
  onClick: () => {},
  muted: false,
};

const GameDashboard = ({ onMathFactsClick, onMathQuestClick, onPuzzleQuestClick }) => {
  const games = [
    { title: 'Math Facts', icon: '📚', color: '#cc6699', starred: true, onClick: onMathFactsClick, muted: false },
    { title: 'Math Quest', icon: '🛡️', color: '#C9A253FF', starred: true, onClick: onMathQuestClick, muted: true },
    { title: 'Princess Puzzle', icon: '👸', color: '#ffcc99', starred: true, onClick: onPuzzleQuestClick, muted: true },
    { title: "Writer's Club", icon: '🦅', color: '#ff9966', starred: true, onClick: onMathQuestClick, muted: true },
    { title: 'Homework Helper', icon: '✏️', color: '#99ccff', starred: true, muted: true },
    { title: 'Royal Rankings', icon: '👑', color: '#ff99cc', starred: true, onClick: onMathQuestClick, muted: true },
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