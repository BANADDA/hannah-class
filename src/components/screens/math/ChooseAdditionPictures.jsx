import { Button } from '@mui/material';
import { ArrowLeft, CheckCircle, Star, XCircle } from 'lucide-react';
import React, { useEffect, useState } from 'react';

const ChooseAdditionPictures = ({ onBack, initialState = {}, onStateChange }) => {
  const TOTAL_LEVELS = 5; // Total number of levels
  const [currentLevel, setCurrentLevel] = useState(initialState.currentLevel || 1);
  const [question, setQuestion] = useState(initialState.question || null);
  const [selectedAnswer, setSelectedAnswer] = useState(initialState.selectedAnswer || null);
  const [stars, setStars] = useState(initialState.stars || 0);
  const [gameCompleted, setGameCompleted] = useState(initialState.gameCompleted || false);
  const [showFeedback, setShowFeedback] = useState(false); // To show feedback message
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false); // To show "Next" button
  const [correctLevels, setCorrectLevels] = useState(initialState.correctLevels || 0); // Tracks number of correct levels

  const emojis = {
    apple: '🍎',
    orange: '🍊',
    banana: '🍌',
    grape: '🍇',
    strawberry: '🍓',
  };

  // Generate a new question ensuring no negative or zero wrong answers
  const generateQuestion = () => {
    const fruitKeys = Object.keys(emojis); // Array of fruit types
    const a = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const b = Math.floor(Math.random() * 4) + 1; // 1 to 4
    const correctAnswer = a + b;

    let wrongAnswer;
    do {
      wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1);
    } while (wrongAnswer === correctAnswer || wrongAnswer < 1 || wrongAnswer > 8);

    const isCorrectOptionFirst = Math.random() < 0.5;

    // Select random fruits for correct and wrong options
    const randomFruit1 = fruitKeys[Math.floor(Math.random() * fruitKeys.length)];
    const randomFruit2 = fruitKeys[Math.floor(Math.random() * fruitKeys.length)];

    const correctEmojis = [...Array(a).fill(randomFruit1), ...Array(b).fill(randomFruit2)];
    const wrongEmojis = [...Array(Math.max(wrongAnswer, 1)).fill(randomFruit1)];

    return {
      question: `${a} + ${b} = ?`,
      correctAnswer,
      wrongAnswer,
      options: isCorrectOptionFirst
        ? [
            { emojis: correctEmojis, isCorrect: true },
            { emojis: wrongEmojis, isCorrect: false },
          ]
        : [
            { emojis: wrongEmojis, isCorrect: false },
            { emojis: correctEmojis, isCorrect: true },
          ],
    };
  };

  // Initialize the first question
  useEffect(() => {
    if (currentLevel <= TOTAL_LEVELS) {
      setQuestion(generateQuestion());
      setShowNextButton(false);
    } else {
      setGameCompleted(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel]);

  // Notify parent of state changes for state preservation
  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        currentLevel,
        question,
        selectedAnswer,
        stars,
        gameCompleted,
        correctLevels,
      });
    }
  }, [currentLevel, question, selectedAnswer, stars, gameCompleted, correctLevels, onStateChange]);

  const handleAnswer = (isCorrectAnswer, selectedOption) => {
    setSelectedAnswer(isCorrectAnswer);
    setIsCorrect(isCorrectAnswer);
    setShowFeedback(true);

    if (isCorrectAnswer) {
      setFeedbackMessage('Super!');
      setStars((prev) => prev + 1);
      setCorrectLevels((prev) => prev + 1); // Increase correct levels count
      // Automatically proceed to next level after a short delay
      setTimeout(() => {
        setShowFeedback(false);
        if (currentLevel < TOTAL_LEVELS) {
          setCurrentLevel((prev) => prev + 1);
        } else {
          setGameCompleted(true);
        }
      }, 1000); // 1-second delay
    } else {
      setFeedbackMessage('Incorrect! Here is the correct answer.');
      // Highlight the correct option and show "Next" button
      setShowNextButton(true);
    }
  };

  const handleNext = () => {
    setShowNextButton(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentLevel < TOTAL_LEVELS) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      setGameCompleted(true);
    }
  };

  const handleRetry = () => {
    setCurrentLevel(1);
    setStars(0);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setQuestion(generateQuestion());
    setCorrectLevels(0); // Reset correct levels
    setShowFeedback(false);
    setShowNextButton(false);
  };

  return (
    <div className="py-14 px-5">
      <div className="w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="flex justify-between items-center bg-blue-600 text-white p-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={onBack}
              className="flex items-center justify-center p-2 rounded-full hover:bg-blue-700"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-xl font-bold">Choose Addition Pictures</h2>
          </div>
        </div>

        <div className="p-6">
          {!gameCompleted ? (
            <>
              <div className="text-center text-2xl text-blue-500 font-bold mb-6">
                Which picture shows {question && question.question}?
              </div>

              <div className="flex justify-around mb-6">
                {question &&
                  question.options.map((option, index) => {
                    // Determine if this option should be highlighted
                    const isCorrectOption = showFeedback && option.isCorrect;
                    const isSelectedIncorrect = showFeedback && selectedAnswer === false && !option.isCorrect;

                    return (
                      <div
                        key={index}
                        className={`relative w-64 h-64 bg-pink-100 rounded-full flex flex-wrap justify-center items-center p-4 shadow-md cursor-pointer transition border-4 ${
                          isCorrectOption
                            ? 'border-4 border-green-500'
                            : isSelectedIncorrect
                            ? 'border-4 border-red-500'
                            : 'border-transparent'
                        }`}
                        onClick={() => !showFeedback && handleAnswer(option.isCorrect, option)}
                        aria-label={option.isCorrect ? 'Correct Answer' : 'Wrong Answer'}
                      >
                        {option.emojis.map((fruit, i) => (
                          <span key={i} className="text-4xl mx-1">
                            {emojis[fruit]}
                          </span>
                        ))}
                      </div>
                    );
                  })}
              </div>

              {showFeedback && (
                <div className="text-center mb-6">
                  {isCorrect ? (
                    <div className="flex flex-col items-center text-green-500">
                      <CheckCircle className="w-16 h-16 mb-2" />
                      <p className="text-3xl font-bold">{feedbackMessage}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-red-500">
                      <XCircle className="w-16 h-16 mb-2" />
                      <p className="text-3xl font-bold">{feedbackMessage}</p>
                    </div>
                  )}
                </div>
              )}

              {showNextButton && (
                <div className="text-center mt-4">
                  <Button
                    onClick={handleNext}
                    className="bg-blue-500 text-white px-4 py-2 rounded"
                    aria-label="Next"
                  >
                    Next
                  </Button>
                </div>
              )}

              <div className="flex justify-between items-center mt-6">
                <div className="text-gray-600">
                  Level {currentLevel} of {TOTAL_LEVELS}
                </div>
                <div className="flex space-x-1">
                  {[...Array(TOTAL_LEVELS)].map((_, i) => (
                    <Star
                      key={i}
                      className={`text-2xl ${
                        i < stars ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
              <h2 className="text-3xl font-bold text-green-600 mb-2">Congratulations! 🎉</h2>
              <p className="text-xl mb-4">
                You completed all {TOTAL_LEVELS} levels with {correctLevels}{' '}
                {correctLevels === 1 ? 'level' : 'levels'} correct out of {TOTAL_LEVELS}.
              </p>
              <Button
                onClick={handleRetry}
                className="bg-blue-500 text-white flex items-center space-x-2 px-4 py-2 rounded"
                aria-label="Try Again"
              >
                <span>Try Again</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChooseAdditionPictures;
