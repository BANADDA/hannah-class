// ChooseAdditionPictures.jsx

import { Button } from '@mui/material';
import Lottie from 'lottie-react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import useSound from 'use-sound';

// Import animations
import celebrationAnimation from '../../../animations/celebration.json';
import correctAnimation from '../../../animations/correct.json';
import mascotAnimation from '../../../animations/mascot.json';
import teachingAnimation from '../../../animations/teaching.json';
import wrongAnimation from '../../../animations/wrong.json';

const ChooseAdditionPictures = ({ onBack, initialState = {}, onStateChange }) => {
  const TOTAL_LEVELS = 5;
  const [currentLevel, setCurrentLevel] = useState(initialState.currentLevel || 1);
  const [question, setQuestion] = useState(initialState.question || null);
  const [selectedAnswer, setSelectedAnswer] = useState(initialState.selectedAnswer || null);
  const [stars, setStars] = useState(initialState.stars || 0);
  const [gameCompleted, setGameCompleted] = useState(initialState.gameCompleted || false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isCorrect, setIsCorrect] = useState(null);
  const [showNextButton, setShowNextButton] = useState(false);
  const [correctLevels, setCorrectLevels] = useState(initialState.correctLevels || 0);
  const [showIntro, setShowIntro] = useState(true);
  const [showTeachingPhase, setShowTeachingPhase] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);
  const [collectedBadges, setCollectedBadges] = useState(initialState.collectedBadges || []);
  const { width, height } = useWindowSize();

  // Import sounds
  const correctSoundUrl = '/sounds/correct_answer.wav';
  const wrongSoundUrl = '/sounds/wrong_answer.wav';
  const gameCompletedSoundUrl = '/sounds/game_completed.mp3';
  const clickSoundUrl = '/sounds/click_sound.mp3';

  // Load sounds using useSound
  const [playCorrectSound] = useSound(correctSoundUrl, { volume: 0.5 });
  const [playWrongSound] = useSound(wrongSoundUrl, { volume: 0.5 });
  const [playGameCompletedSound] = useSound(gameCompletedSoundUrl, { volume: 0.5 });
  const [playClickSound] = useSound(clickSoundUrl, { volume: 0.5 });

  const emojis = {
    apple: '🍎',
    orange: '🍊',
    banana: '🍌',
    grape: '🍇',
    strawberry: '🍓',
    watermelon: '🍉',
    pineapple: '🍍',
    cherry: '🍒',
  };

  // Generate a new question ensuring no negative or zero wrong answers
  const generateQuestion = () => {
    const fruitKeys = Object.keys(emojis);
    const a = Math.floor(Math.random() * 4) + 1;
    const b = Math.floor(Math.random() * 4) + 1;
    const correctAnswer = a + b;

    let wrongAnswer;
    do {
      wrongAnswer = correctAnswer + (Math.random() < 0.5 ? 1 : -1);
    } while (wrongAnswer === correctAnswer || wrongAnswer < 1 || wrongAnswer > 8);

    const isCorrectOptionFirst = Math.random() < 0.5;

    const randomFruit1 = fruitKeys[Math.floor(Math.random() * fruitKeys.length)];
    const randomFruit2 = fruitKeys[Math.floor(Math.random() * fruitKeys.length)];

    const correctEmojis = [
      ...Array(a).fill(randomFruit1),
      ...Array(b).fill(randomFruit2),
    ];
    const wrongEmojis = [...Array(wrongAnswer)].map(
      () => fruitKeys[Math.floor(Math.random() * fruitKeys.length)]
    );

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
      a,
      b,
      fruit1: randomFruit1,
      fruit2: randomFruit2,
    };
  };

  // Initialize the first question
  useEffect(() => {
    if (currentLevel <= TOTAL_LEVELS && !showIntro && !showTeachingPhase) {
      setQuestion(generateQuestion());
      setShowNextButton(false);
    } else if (currentLevel > TOTAL_LEVELS) {
      setGameCompleted(true);
      playGameCompletedSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, showIntro, showTeachingPhase]);

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
        collectedBadges,
      });
    }
  }, [
    currentLevel,
    question,
    selectedAnswer,
    stars,
    gameCompleted,
    correctLevels,
    collectedBadges,
    onStateChange,
  ]);

  const handleAnswer = (isCorrectAnswer) => {
    playClickSound();
    setSelectedAnswer(isCorrectAnswer);
    setIsCorrect(isCorrectAnswer);
    setShowFeedback(true);

    if (isCorrectAnswer) {
      setFeedbackMessage('Great job!');
      setStars((prev) => prev + 1);
      setCorrectLevels((prev) => prev + 1);
      setCollectedBadges((prev) => [...prev, '⭐']);
      playCorrectSound();
      setTimeout(() => {
        setShowFeedback(false);
        if (currentLevel < TOTAL_LEVELS) {
          setCurrentLevel((prev) => prev + 1);
        } else {
          setGameCompleted(true);
          playGameCompletedSound();
        }
      }, 2000);
    } else {
      setFeedbackMessage('Oops! Let me show you the correct answer.');
      setShowNextButton(true);
      setShowCorrectAnswer(true);
      playWrongSound();
    }
  };

  const handleNext = () => {
    playClickSound();
    setShowNextButton(false);
    setSelectedAnswer(null);
    setShowFeedback(false);
    setShowCorrectAnswer(false);
    if (currentLevel < TOTAL_LEVELS) {
      setCurrentLevel((prev) => prev + 1);
    } else {
      setGameCompleted(true);
      playGameCompletedSound();
    }
  };

  const handleRetry = () => {
    playClickSound();
    setCurrentLevel(1);
    setStars(0);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setQuestion(generateQuestion());
    setCorrectLevels(0);
    setShowFeedback(false);
    setShowNextButton(false);
    setShowIntro(true);
    setShowTeachingPhase(false);
    setCollectedBadges([]);
  };

  const handleStartTeaching = () => {
    playClickSound();
    setShowIntro(false);
    setShowTeachingPhase(true);
  };

  const handleStartPractice = () => {
    playClickSound();
    setShowTeachingPhase(false);
    setCurrentLevel(1);
    setStars(0);
    setGameCompleted(false);
    setSelectedAnswer(null);
    setQuestion(generateQuestion());
    setCorrectLevels(0);
    setShowFeedback(false);
    setShowNextButton(false);
    setCollectedBadges([]);
  };

  const handleViewBadges = () => {
    alert(`Your Badges: ${collectedBadges.join(' ')}`);
  };

  return (
    <div className="py-14 px-5">
      {/* Confetti for Celebration */}
      {gameCompleted && <Confetti width={width} height={height} />}
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
            <h2 className="text-xl font-bold">Addition Quest</h2>
          </div>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleViewBadges}
            style={{
              backgroundColor: '#fdd835',
              color: '#000',
              borderRadius: '9999px',
            }}
          >
            My Badges
          </Button>
        </div>

        <div className="p-6">
          {showIntro ? (
            // Introduction Phase
            <div className="flex flex-col items-center justify-center space-y-6 text-gray-800">
              <h2 className="text-3xl font-semibold text-center text-blue-500">
                Welcome to the Addition Quest!
              </h2>
              <p className="text-center text-lg">
                Join our adventure and learn how to add fruits together!
              </p>
              <div className="w-full max-w-md">
                <Lottie
                  animationData={mascotAnimation}
                  loop={true}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <Button
                onClick={handleStartTeaching}
                variant="contained"
                color="primary"
                className="mt-4 text-lg animate-bounce"
                style={{
                  backgroundColor: '#ff6f61',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                }}
              >
                Let's Learn!
              </Button>
            </div>
          ) : showTeachingPhase ? (
            // Teaching Phase
            <div className="flex flex-col items-center justify-center space-y-6 text-gray-800">
              <h2 className="text-2xl font-semibold text-center text-blue-500">
                Let's Learn How to Add!
              </h2>
              <p className="text-center text-lg">
                When we add, we put things together to find out how many we have in total.
              </p>
              <div className="w-full max-w-md">
                <Lottie
                  animationData={teachingAnimation}
                  loop={true}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <p className="text-center text-lg">
                For example, if we have 2 apples and 3 bananas, how many fruits do we have?
              </p>
              <div className="flex flex-wrap justify-center items-center space-x-2 mt-4">
                <span className="text-4xl">{emojis.apple}</span>
                <span className="text-4xl">{emojis.apple}</span>
                <span className="text-3xl font-bold text-pink-600 mx-2">+</span>
                <span className="text-4xl">{emojis.banana}</span>
                <span className="text-4xl">{emojis.banana}</span>
                <span className="text-4xl">{emojis.banana}</span>
                <span className="text-3xl font-bold text-pink-600 mx-2">=</span>
                <span className="text-4xl">{emojis.apple}</span>
                <span className="text-4xl">{emojis.apple}</span>
                <span className="text-4xl">{emojis.banana}</span>
                <span className="text-4xl">{emojis.banana}</span>
                <span className="text-4xl">{emojis.banana}</span>
              </div>
              <p className="text-center text-lg mt-4">
                That's right! 2 apples plus 3 bananas equals 5 fruits!
              </p>
              <Button
                onClick={handleStartPractice}
                variant="contained"
                color="primary"
                className="mt-4 text-lg animate-bounce"
                style={{
                  backgroundColor: '#4caf50',
                  color: '#fff',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                }}
              >
                Start the Quest!
              </Button>
            </div>
          ) : !gameCompleted ? (
            // Practice Phase
            <>
              {/* Instructions */}
              <div className="bg-yellow-100 p-4 rounded-lg mb-4 shadow-md">
                <p className="text-lg text-center">
                  Choose the picture that shows the correct total of fruits.
                </p>
              </div>

              <div className="text-center text-2xl text-blue-500 font-bold mb-6">
                What is {question && question.question}?
              </div>

              <div className="flex flex-col md:flex-row justify-around items-center mb-6 space-y-4 md:space-y-0">
                {question &&
                  question.options.map((option, index) => {
                    const isCorrectOption = showFeedback && option.isCorrect;
                    const isSelectedIncorrect =
                      showFeedback && selectedAnswer === false && !option.isCorrect;

                    return (
                      <div
                        key={index}
                        className={`relative w-full max-w-xs bg-pink-100 rounded-full flex flex-wrap justify-center items-center p-4 shadow-md cursor-pointer transition transform hover:scale-105 ${
                          isCorrectOption
                            ? 'border-4 border-green-500'
                            : isSelectedIncorrect
                            ? 'border-4 border-red-500'
                            : 'border-4 border-transparent'
                        }`}
                        onClick={() => !showFeedback && handleAnswer(option.isCorrect)}
                        aria-label={option.isCorrect ? 'Correct Answer' : 'Wrong Answer'}
                      >
                        {option.emojis.map((fruit, i) => (
                          <span key={i} className="text-4xl mx-1 animate-pulse">
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
                      <Lottie
                        animationData={correctAnimation}
                        loop={false}
                        style={{ width: 150, height: 150 }}
                      />
                      <p className="text-3xl font-bold mt-2">{feedbackMessage}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-red-500">
                      <Lottie
                        animationData={wrongAnimation}
                        loop={false}
                        style={{ width: 150, height: 150 }}
                      />
                      <p className="text-3xl font-bold mt-2">{feedbackMessage}</p>
                      {/* Show the correct answer */}
                      {showCorrectAnswer && (
                        <div className="mt-4">
                          <p className="text-lg">
                            The correct answer is {question.correctAnswer} fruits:
                          </p>
                          <div className="flex flex-wrap justify-center mt-2">
                            {question.options
                              .find((opt) => opt.isCorrect)
                              .emojis.map((fruit, i) => (
                                <span key={i} className="text-4xl mx-1">
                                  {emojis[fruit]}
                                </span>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {showNextButton && (
                <div className="text-center mt-4">
                  <Button
                    onClick={handleNext}
                    className="bg-blue-500 text-white px-6 py-3 rounded-full text-lg animate-pulse"
                    aria-label="Next"
                  >
                    Next Challenge
                  </Button>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mt-6">
                <div className="flex justify-center items-center">
                  {[...Array(TOTAL_LEVELS)].map((_, i) => (
                    <div
                      key={i}
                      className={`w-8 h-8 mx-1 rounded-full ${
                        i < currentLevel - 1 ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    ></div>
                  ))}
                </div>
                <p className="text-center text-gray-600 mt-2">
                  Level {currentLevel} of {TOTAL_LEVELS}
                </p>
              </div>
            </>
          ) : (
            // Game Completed Section
            <div className="flex flex-col items-center justify-center text-gray-800">
              <Confetti width={width} height={height} />
              <div className="w-full max-w-md">
                <Lottie
                  animationData={celebrationAnimation}
                  loop={true}
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <h2 className="text-3xl font-bold text-green-600 mb-2">You Did It! 🎉</h2>
              <p className="text-xl mb-4">
                You've completed the quest and earned {collectedBadges.length} badges!
              </p>
              <div className="flex items-center space-x-1 mb-4">
                {collectedBadges.map((badge, index) => (
                  <span key={index} className="text-4xl">
                    {badge}
                  </span>
                ))}
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Button
                  onClick={handleRetry}
                  variant="contained"
                  color="primary"
                  className="flex items-center justify-center space-x-2 text-lg animate-bounce"
                  style={{
                    backgroundColor: '#ff6f61',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '9999px',
                  }}
                >
                  <span>Play Again</span>
                </Button>
                <Button
                  onClick={onBack}
                  variant="contained"
                  color="secondary"
                  className="flex items-center justify-center space-x-2 text-lg"
                  style={{
                    backgroundColor: '#4caf50',
                    color: '#fff',
                    padding: '10px 20px',
                    borderRadius: '9999px',
                  }}
                >
                  <span>Back to Menu</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChooseAdditionPictures;
