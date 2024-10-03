// AdditionPracticeScreen.jsx

import { Button, Card, CardContent } from '@mui/material';
import Lottie from 'lottie-react';
import { Lock } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import useSound from 'use-sound';
import AdditionWithPictures from './AdditionWithPictures'; // Import your practice components
import ChooseAdditionPictures from './ChooseAdditionPictures';

// Import animations
import mascotAnimation from '../../../animations/mascot.json';

const AdditionPracticeScreen = ({ onCompletion, onBack }) => {
  const [selectedPractice, setSelectedPractice] = useState(null);
  const [practiceStates, setPracticeStates] = useState({});
  const [showIntro, setShowIntro] = useState(true);
  const { width, height } = useWindowSize();

  // Sound file URLs
  const openPracticeSoundUrl = '/sounds/open_practice.mp3';
  const clickSoundUrl = '/sounds/click_sound.mp3';
  const completionSoundUrl = '/sounds/game_completed.mp3';

  // Load sounds
  const [playOpenPractice] = useSound(openPracticeSoundUrl, { volume: 0.5 });
  const [playClickSound] = useSound(clickSoundUrl, { volume: 0.5 });
  const [playCompletionSound] = useSound(completionSoundUrl, { volume: 0.5 });

  // Practices with unique IDs
  const practices = [
    {
      id: 1,
      title: 'Addition with Pictures Up to 5',
      completed: 0,
      total: 5,
      hasApp: true,
      icon: '🖼️',
      description: 'Learn addition using fun pictures!',
      component: AdditionWithPictures,
    },
    {
      id: 2,
      title: 'Choose Addition Pictures Up to 5',
      completed: 0,
      total: 5,
      hasApp: true,
      icon: '🎨',
      description: 'Select the correct picture for the addition!',
      component: ChooseAdditionPictures,
    },
    {
      id: 3,
      title: 'Add Two Numbers Up to 5',
      completed: 0,
      total: 5,
      hasApp: false, // Assuming component not yet implemented
      icon: '➕',
      description: 'Practice adding two numbers up to 5.',
      component: null, // Placeholder
    },
    {
      id: 4,
      title: 'How to Make a Number with Sums Up to 10',
      completed: 0,
      total: 5,
      hasApp: false, // Assuming component not yet implemented
      icon: '🔢',
      description: 'Learn different ways to make numbers up to 10.',
      component: null, // Placeholder
    },
    {
      id: 5,
      title: 'Count Groups of Ten to 10, 50, 100',
      completed: 0,
      total: 5,
      hasApp: false, // Assuming component not yet implemented
      icon: '🔟',
      description: 'Count by tens up to 100.',
      component: null, // Placeholder
    },
  ];

  // Load practice states from localStorage on initial render
  useEffect(() => {
    const storedStates = localStorage.getItem('additionPracticeStates');
    if (storedStates) {
      setPracticeStates(JSON.parse(storedStates));
    }
  }, []);

  // Save practice states to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('additionPracticeStates', JSON.stringify(practiceStates));
  }, [practiceStates]);

  // Check if all practices are completed
  useEffect(() => {
    const allCompleted = practices.every(
      (practice) => practiceStates[practice.id]?.completed === practice.total || !practice.hasApp
    );
    if (allCompleted && onCompletion) {
      // Update overall progress in localStorage
      const overallProgress = JSON.parse(localStorage.getItem('overallProgress')) || {};
      overallProgress.additionCompleted = true;
      localStorage.setItem('overallProgress', JSON.stringify(overallProgress));

      // Play completion sound and navigate back to SkillGrid
      playCompletionSound();
      onCompletion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [practiceStates]);

  const handlePracticeClick = (practice) => {
    if (practice.hasApp) {
      playOpenPractice();
      setSelectedPractice(practice);
    } else {
      playClickSound();
      alert('This practice is coming soon!');
    }
  };

  // Function to update the state of a specific practice
  const updatePracticeState = (practiceId, newState) => {
    setPracticeStates((prevStates) => ({
      ...prevStates,
      [practiceId]: {
        ...prevStates[practiceId],
        ...newState,
      },
    }));
  };

  // Update practices with completed counts based on practiceStates
  const updatedPractices = practices.map((practice) => {
    const state = practiceStates[practice.id];
    return {
      ...practice,
      completed: state ? state.completed || 0 : 0,
    };
  });

  return (
    <div className="py-10 px-4 md:py-14 md:px-5">
      {/* Confetti for Completion */}
      {selectedPractice === null && (
        <Confetti width={width} height={height} recycle={false} numberOfPieces={150} />
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <h1 className="text-2xl md:text-3xl font-bold text-pink-600 text-center flex-grow">
          Interactive Addition Practice
        </h1>
        <div className="w-24"></div> {/* Placeholder to balance the layout */}
      </div>

      {/* Main Content */}
      {showIntro ? (
        // Introduction Section
        <div className="flex flex-col items-center justify-center space-y-6 text-gray-800 mt-8">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-blue-500">
            Welcome to the Addition Adventure!
          </h2>
          <p className="text-center text-base md:text-lg">
            Choose a practice to start your learning journey!
          </p>
          <div className="w-full max-w-md">
            <Lottie
              animationData={mascotAnimation}
              loop={true}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <Button
            onClick={() => setShowIntro(false)}
            variant="contained"
            color="primary"
            className="mt-4 text-base md:text-lg animate-bounce"
            style={{
              backgroundColor: '#ff6f61',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '9999px',
            }}
          >
            Let's Start!
          </Button>
        </div>
      ) : !selectedPractice ? (
        // Practices List
        <div className="flex flex-col mt-8 space-y-4">
          {updatedPractices.map((practice) => (
            <Card
              key={practice.id}
              variant="outlined"
              className={`transition-all duration-300 ease-in-out ${
                practice.hasApp
                  ? 'hover:shadow-lg cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => handlePracticeClick(practice)}
              sx={{
                backgroundColor: '#EBEEF3FF',
                '&:hover': {
                  backgroundColor: practice.hasApp ? '#CDD7E0FF' : '#EBEEF3FF',
                },
                boxShadow: 'none',
                border: '1px solid #CBD5E0',
                padding: '0.5rem',
                borderRadius: '0.5rem',
              }}
            >
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                  {/* Practice Details */}
                  <div className="flex items-center space-x-4 flex-grow">
                    <div className="text-3xl md:text-4xl">{practice.icon}</div>
                    <div className="flex-grow">
                      <div className="text-lg md:text-xl font-bold text-gray-700">
                        {practice.title}
                      </div>
                      <div className="text-gray-500 text-sm md:text-base">
                        {practice.description}
                      </div>
                    </div>
                  </div>

                  {/* Completion Badge or Lock Icon */}
                  {practice.hasApp ? (
                    <div className="flex items-center justify-center space-x-1">
                      {[...Array(practice.total)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-2xl ${
                            i < practice.completed ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        >
                          ⭐
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 flex items-center justify-center">
                      <Lock className="w-6 h-6" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        // Render Selected Practice Component
        React.createElement(selectedPractice.component, {
          onBack: () => setSelectedPractice(null),
          initialState: practiceStates[selectedPractice.id],
          onStateChange: (newState) => {
            updatePracticeState(selectedPractice.id, newState);
          },
        })
      )}
    </div>
  );
};

export default AdditionPracticeScreen;
