// AdditionWithPictures.jsx

import { Button, Input } from '@mui/material';
import { ArrowLeft, CheckCircle, Edit3, RefreshCw, Star } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const AdditionWithPictures = ({ onBack, initialState = {}, onStateChange }) => {
  const TOTAL_LEVELS = 5; // Total number of levels
  const [currentLevel, setCurrentLevel] = useState(initialState.currentLevel || 1);
  const [userAnswer, setUserAnswer] = useState(initialState.userAnswer || '');
  const [isCorrect, setIsCorrect] = useState(initialState.isCorrect || null);
  const [stars, setStars] = useState(initialState.stars || 0);
  const [gameCompleted, setGameCompleted] = useState(initialState.gameCompleted || false);

  const pictures = ['🚗', '🍎', '🐶', '🎈', '🌟']; // Example emojis, replace with actual picture URLs
  const [currentAddition, setCurrentAddition] = useState(
    initialState.currentAddition || { left: 0, right: 0, picture: '' }
  );

  useEffect(() => {
    if (currentLevel <= TOTAL_LEVELS) {
      generateNewAddition();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  useEffect(() => {
    // Notify parent of state changes
    if (onStateChange) {
      onStateChange({
        currentLevel,
        userAnswer,
        isCorrect,
        stars,
        gameCompleted,
        currentAddition,
      });
    }
  }, [currentLevel, userAnswer, isCorrect, stars, gameCompleted, currentAddition, onStateChange]);

  const generateNewAddition = () => {
    const left = Math.floor(Math.random() * 5) + 1;
    const right = Math.floor(Math.random() * (6 - left)) + 1;
    const pictureIndex = Math.floor(Math.random() * pictures.length);
    setCurrentAddition({ left, right, picture: pictures[pictureIndex] });
    setIsCorrect(null); // Reset correctness indicator for new question
  };

  const handleSubmit = () => {
    const correctAnswer = currentAddition.left + currentAddition.right;
    const correct = parseInt(userAnswer, 10) === correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      setStars(prev => prev + 1);
      if (currentLevel < TOTAL_LEVELS) {
        setCurrentLevel(prev => prev + 1);
      } else {
        setGameCompleted(true);
      }
    }

    setUserAnswer('');
  };

  const handleRetry = () => {
    setCurrentLevel(1);
    setStars(0);
    setGameCompleted(false);
    setUserAnswer('');
    setIsCorrect(null);
    generateNewAddition();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Button
            variant="outlined"
            onClick={onBack}
            className="flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold">Addition with Pictures</h1>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outlined"
            className="flex items-center justify-center"
            aria-label="Edit"
          >
            <Edit3 className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      {!gameCompleted ? (
        <>
          <div className="text-center mb-4">
            <h2 className="text-xl text-blue-500">Level {currentLevel}</h2>
          </div>

          <div className="bg-pink-100 p-4 rounded-lg mb-4 flex items-center justify-center space-x-4">
            {[...Array(currentAddition.left)].map((_, i) => (
              <span key={`left-${i}`} className="text-3xl">
                {currentAddition.picture}
              </span>
            ))}
            <span className="text-3xl">+</span>
            {[...Array(currentAddition.right)].map((_, i) => (
              <span key={`right-${i}`} className="text-3xl">
                {currentAddition.picture}
              </span>
            ))}
            <span className="text-3xl">=</span>
            <Input
              type="number"
              value={userAnswer}
              onChange={e => setUserAnswer(e.target.value)}
              className="w-20 text-center"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
              aria-label="Your Answer"
            />
          </div>

          {isCorrect !== null && (
            <div
              className={`text-center mb-4 ${
                isCorrect ? 'text-green-500' : 'text-red-500'
              }`}
            >
              {isCorrect
                ? 'Correct! 🎉'
                : `Incorrect. The correct answer was ${
                    currentAddition.left + currentAddition.right
                  }.`}
            </div>
          )}

          <div className="text-center">
            <Button
              onClick={handleSubmit}
              variant="contained"
              color="primary"
              disabled={userAnswer.trim() === ''}
            >
              Answer
            </Button>
          </div>

          {/* Star Ratings Row */}
          <div className="flex justify-between items-center mt-4">
            <div>Level {currentLevel} of {TOTAL_LEVELS}</div>
            <div className="flex space-x-1"> {/* Ensures stars are in a single row with spacing */}
              {[...Array(TOTAL_LEVELS)].map((_, i) => (
                <Star
                  key={i}
                  className={`text-2xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-md"></div>
          </div>
        </>
      ) : (
        // Success Message
        <div className="flex flex-col items-center justify-center h-64">
          <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-3xl font-bold text-green-600 mb-2">Congratulations! 🎉</h2>
          <p className="text-xl mb-4">
            You completed all {TOTAL_LEVELS} levels with {stars}{' '}
            {stars === 1 ? 'star' : 'stars'}!
          </p>
          <div className="flex items-center space-x-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-6 h-6 ${
                  i < stars ? 'text-yellow-400' : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <Button
            onClick={handleRetry}
            variant="contained"
            color="primary"
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Try Again</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdditionWithPictures;
