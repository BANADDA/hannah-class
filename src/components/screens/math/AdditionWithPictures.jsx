import { Button, Input } from '@mui/material';
import { Edit3 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const AdditionWithPictures = () => {
  const TOTAL_LEVELS = 5; // Total number of levels
  const [currentLevel, setCurrentLevel] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [stars, setStars] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);

  const pictures = ['🚗', '🍎', '🐶', '🎈', '🌟']; // Example emojis, replace with actual picture URLs
  const [currentAddition, setCurrentAddition] = useState({ left: 0, right: 0, picture: '' });

  useEffect(() => {
    if (currentLevel <= TOTAL_LEVELS) {
      generateNewAddition();
    }
  }, [currentLevel]);

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
      {!gameCompleted ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Addition with Pictures</h1>
            <div className="flex space-x-2">
              <Button variant="outline"><Edit3 className="w-5 h-5" /></Button>
            </div>
          </div>
          
          <div className="text-center mb-4">
            <h2 className="text-xl text-blue-500">Level {currentLevel}</h2>
          </div>

          <div className="bg-pink-100 p-4 rounded-lg mb-4 flex items-center justify-center space-x-4">
            {[...Array(currentAddition.left)].map((_, i) => (
              <span key={`left-${i}`} className="text-3xl">{currentAddition.picture}</span>
            ))}
            <span className="text-3xl">+</span>
            {[...Array(currentAddition.right)].map((_, i) => (
              <span key={`right-${i}`} className="text-3xl">{currentAddition.picture}</span>
            ))}
            <span className="text-3xl">=</span>
            <Input 
              type="number" 
              value={userAnswer} 
              onChange={(e) => setUserAnswer(e.target.value)}
              className="w-20 text-center"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit();
                }
              }}
            />
          </div>

          {isCorrect !== null && (
            <div className={`text-center mb-4 ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
              {isCorrect ? 'Correct! 🎉' : `Incorrect. The correct answer was ${currentAddition.left + currentAddition.right}.`}
            </div>
          )}

          <div className="text-center">
            <Button 
              onClick={handleSubmit} 
              className="bg-blue-500 text-white"
              disabled={userAnswer.trim() === ''}
            >
              Answer
            </Button>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div>Level {currentLevel} of {TOTAL_LEVELS}</div>
            <div>
              {[...Array(TOTAL_LEVELS)].map((_, i) => (
                <span key={i} className={`text-2xl ${i < stars ? 'text-yellow-400' : 'text-gray-300'}`}>★</span>
              ))}
            </div>
            <div className="w-8 h-8 bg-green-500 rounded-md"></div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-3xl font-bold text-green-600 mb-4">Congratulations! 🎉</h2>
          <p className="text-xl mb-4">You completed all {TOTAL_LEVELS} levels with {stars} {stars === 1 ? 'star' : 'stars'}!</p>
          <Button 
            onClick={handleRetry} 
            className="bg-blue-500 text-white px-6 py-2 rounded"
          >
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdditionWithPictures;
