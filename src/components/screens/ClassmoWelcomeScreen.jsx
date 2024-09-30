import { ArrowRight, BookOpen, Calendar } from 'lucide-react';
import React, { useState } from 'react';
import GameDashboard from './GameOption'; // Import your GameDashboard component
import SkillGrid from './SkillGrid';
import WordSearchGame from './WordSearchGame';
import AdditionPracticeScreen from './math/AdditionPracticeScreen';

const ClassmoWelcomeScreen = () => {
  const [currentView, setCurrentView] = useState('home'); // Track which view to show

  // Function to switch to the game dashboard
  const onProceedToDashboard = () => {
    setCurrentView('dashboard');
  };

  // Function to switch to Math Quest
  const onMathQuestClick = () => {
    setCurrentView('mathquest');
  };

  // Function to switch to Puzzle Quest
  const onPuzzleQuestClick = () => {
    setCurrentView('puzzlequest');
  };

  // Function to switch to Addition Practice
  const onAdditionClick = () => {
    console.log('====================================');
    console.log("Clicked addition");
    console.log('====================================');
    setCurrentView('addition');
  };

  // Function to return to the home screen
  const goToHome = () => {
    setCurrentView('home');
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-yellow-100 p-4">
      {/* Top Left Corner Navigation with clickable links */}
      <div className="top-4 fixed left-4 text-lg font-semibold text-gray-600">
        <span
          className="cursor-pointer hover:text-black"
          onClick={goToHome}
        >
          Home
        </span>
        {currentView === 'dashboard' && (
          <>
            {' > '}
            <span className="cursor-pointer hover:text-black" onClick={onProceedToDashboard}>
              Games
            </span>
          </>
        )}
        {currentView === 'mathquest' && (
          <>
            {' > '}
            <span className="cursor-pointer hover:text-black" onClick={onProceedToDashboard}>
              Games
            </span>{' > '}
            <span className="cursor-pointer hover:text-black" onClick={onMathQuestClick}>
              Math Quest
            </span>
          </>
        )}
        {currentView === 'puzzlequest' && (
          <>
            {' > '}
            <span className="cursor-pointer hover:text-black" onClick={onProceedToDashboard}>
              Games
            </span>{' > '}
            <span className="cursor-pointer hover:text-black" onClick={onPuzzleQuestClick}>
              Word Puzzle
            </span>
          </>
        )}
        {currentView === 'addition' && (
          <>
            {' > '}
            <span className="cursor-pointer hover:text-black" onClick={onProceedToDashboard}>
              Games
            </span>{' > '}
            <span className="cursor-pointer hover:text-black" onClick={onMathQuestClick}>
              Math Quest
            </span>{' > '}
            <span className="text-gray-600">Addition</span>
          </>
        )}
      </div>

      <div className="max-w-7xl w-full bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Main Welcome Screen */}
        <div className="bg-yellow-300 flex justify-center items-end h-48">
          <div className="relative">
            <div className="absolute -top-28 left-1/2 transform -translate-x-1/2">
              <div className="w-32 h-16 bg-yellow-400 rounded-t-full"></div>
              <div className="w-32 h-20 bg-yellow-500 rounded-b-3xl relative">
                <div className="absolute top-3 left-3 w-6 h-6 bg-white rounded-full"></div>
                <div className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full"></div>
                <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 w-10 h-3 bg-gray-700 rounded-full"></div>
              </div>
              {/* Left green icons */}
              <div className="absolute -left-10 -top-6 w-10 h-20 flex flex-col justify-between">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1 h-5 bg-green-700"></div>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1 h-5 bg-green-700"></div>
                </div>
              </div>
              {/* Right green icons */}
              <div className="absolute -right-10 -top-6 w-10 h-20 flex flex-col justify-between">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1 h-5 bg-green-700"></div>
                </div>
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <div className="w-1 h-5 bg-green-700"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Conditional Rendering based on the current view */}
        {currentView === 'home' && (
          <>
            <div className="p-8 pt-14">
              <h1 className="text-3xl font-bold text-center mb-4">Welcome to Hannah&apos;s Classmo!</h1>
              <p className="text-gray-600 text-center mb-8 text-lg">
                Classmo is your fun math world where numbers are your friends, and learning is an adventure! Let&apos;s play, explore, and learn together!
              </p>
              <div className="space-y-4">
                <button className="w-full py-3 px-6 bg-gray-100 text-gray-800 rounded-md flex items-center justify-between hover:bg-gray-200 transition-colors group">
                  <span className="flex items-center text-lg">
                    <Calendar className="w-6 h-6 mr-3" />
                    See my timetable
                  </span>
                  <ArrowRight className="w-6 h-6 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </button>
                <button className="w-full py-3 px-6 bg-gray-100 text-gray-800 rounded-md flex items-center justify-between hover:bg-gray-200 transition-colors group">
                  <span className="flex items-center text-lg">
                    <BookOpen className="w-6 h-6 mr-3" />
                    See my homework
                  </span>
                  <ArrowRight className="w-6 h-6 transition-transform duration-300 ease-in-out group-hover:translate-x-1" />
                </button>
                <button
                  className="w-full py-3 px-6 bg-emerald-500 text-white text-lg font-semibold rounded-md flex items-center justify-center transition-all duration-300 ease-in-out hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5"
                  onClick={onProceedToDashboard} // Call function to switch to the dashboard
                >
                  Proceed to dashboard
                </button>
              </div>
            </div>
          </>
        )}

        {currentView === 'dashboard' && (
          <GameDashboard
            onMathQuestClick={onMathQuestClick}
            onPuzzleQuestClick={onPuzzleQuestClick}
          />
        )}

        {currentView === 'mathquest' && <SkillGrid onAdditionClick={onAdditionClick} />}

        {currentView === 'puzzlequest' && <WordSearchGame />}

        {currentView === 'addition' && <AdditionPracticeScreen />}
      </div>
    </div>
  );
};

export default ClassmoWelcomeScreen;
