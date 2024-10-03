// AdditionWithPictures.jsx

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { Button } from '@mui/material';
import Lottie from 'lottie-react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import useSound from 'use-sound';
import animationData from '../../../animations/mascot.json';

const AdditionWithPictures = ({ onBack, initialState = {}, onStateChange }) => {
  const TOTAL_LEVELS = 5;
  const [currentLevel, setCurrentLevel] = useState(initialState.currentLevel || 1);
  const [stars, setStars] = useState(initialState.stars || 0);
  const [gameCompleted, setGameCompleted] = useState(initialState.gameCompleted || false);
  const [showIntro, setShowIntro] = useState(
    initialState.showIntro !== undefined ? initialState.showIntro : true
  );
  const [showTeachingPhase, setShowTeachingPhase] = useState(true);
  const [collectedItems, setCollectedItems] = useState(initialState.collectedItems || []);
  const [basketItems, setBasketItems] = useState([]);
  const [currentAddition, setCurrentAddition] = useState(
    initialState.currentAddition || { left: 0, right: 0, picture: '' }
  );
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [showMascot, setShowMascot] = useState(false);
  const [showCorrectAnswer, setShowCorrectAnswer] = useState(false);

  const pictures = ['🍎', '🍌', '🍇', '🍓', '🍉'];
  const { width, height } = useWindowSize();

  // Sounds
  const correctSoundUrl = '/sounds/correct_answer.wav';
  const incorrectSoundUrl = '/sounds/wrong_answer.wav';
  const completionSoundUrl = '/sounds/game_completed.mp3';
  const dragSoundUrl = '/sounds/drag_sound.mp3';

  const [playCorrectSound] = useSound(correctSoundUrl, { volume: 0.5 });
  const [playIncorrectSound] = useSound(incorrectSoundUrl, { volume: 0.5 });
  const [playCompletionSound] = useSound(completionSoundUrl, { volume: 0.5 });
  const [playDragSound] = useSound(dragSoundUrl, { volume: 0.5 });

  useEffect(() => {
    if (currentLevel <= TOTAL_LEVELS && !showIntro && !showTeachingPhase) {
      // Move generateNewAddition inside useEffect to prevent infinite loop
      const generateNewAddition = () => {
        const left = Math.floor(Math.random() * 3) + 1; // Limit numbers to make it manageable
        const right = Math.floor(Math.random() * 3) + 1;
        const pictureIndex = Math.floor(Math.random() * pictures.length);
        setCurrentAddition({ left, right, picture: pictures[pictureIndex] });
        setBasketItems([]);
        setFeedbackMessage('');
        setShowMascot(false);
        setShowCorrectAnswer(false);
      };

      generateNewAddition();
    } else if (currentLevel > TOTAL_LEVELS) {
      setGameCompleted(true);
      playCompletionSound();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentLevel, showIntro, showTeachingPhase]);

  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        currentLevel,
        stars,
        gameCompleted,
        currentAddition,
        showIntro,
        collectedItems,
      });
    }
  }, [
    currentLevel,
    stars,
    gameCompleted,
    currentAddition,
    showIntro,
    collectedItems,
    onStateChange,
  ]);

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    playDragSound();

    // Add the dragged item to the basketItems state
    const items = Array.from(basketItems);
    items.push(currentAddition.picture);
    setBasketItems(items);
  };

  const checkAnswer = () => {
    const correctAnswer = currentAddition.left + currentAddition.right;
    if (basketItems.length === correctAnswer) {
      setStars((prev) => prev + 1);
      setFeedbackMessage('Great Job!');
      setShowMascot(true);
      playCorrectSound();

      // Collect a virtual sticker
      setCollectedItems((prev) => [...prev, currentAddition.picture]);

      setTimeout(() => {
        if (currentLevel < TOTAL_LEVELS) {
          setCurrentLevel((prev) => prev + 1);
        } else {
          setGameCompleted(true);
          playCompletionSound();
        }
      }, 3000);
    } else {
      setFeedbackMessage('Oops! Let me show you the correct answer.');
      playIncorrectSound();
      setShowCorrectAnswer(true);
      // Prevent moving to next level until they acknowledge
    }
  };

  const handleContinueAfterIncorrect = () => {
    // After showing correct answer, allow moving to next level
    setShowCorrectAnswer(false);
    setFeedbackMessage('');
    setBasketItems([]);
    setCurrentLevel((prev) => prev + 1);
  };

  const handleRetry = () => {
    setCurrentLevel(1);
    setStars(0);
    setGameCompleted(false);
    setCollectedItems([]);
    setShowIntro(true);
    setShowTeachingPhase(true);
    // generateNewAddition(); // No need to call this here as it will be called in useEffect
  };

  const handleStartPractice = () => {
    setShowIntro(false);
    setShowTeachingPhase(true);
    setCurrentLevel(1);
    setStars(0);
    setGameCompleted(false);
    setCollectedItems([]);
    // generateNewAddition(); // No need to call this here as it will be called in useEffect
  };

  const handleEndTeachingPhase = () => {
    setShowTeachingPhase(false);
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      {/* Confetti for Celebration */}
      {gameCompleted && <Confetti width={width} height={height} />}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4">
        <div className="flex items-center space-x-2 mb-4 md:mb-0">
          <Button
            variant="outlined"
            onClick={onBack}
            className="flex items-center justify-center"
            aria-label="Back"
            style={{ borderColor: '#ff6f61', color: '#ff6f61' }}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold text-pink-600">Addition Adventure</h1>
        </div>
        {/* Reward Collection */}
        <Button
          variant="contained"
          color="secondary"
          onClick={() => alert(`Collected items: ${collectedItems.join(' ')}`)}
          style={{
            backgroundColor: '#fdd835',
            color: '#000',
            borderRadius: '9999px',
          }}
        >
          My Stickers
        </Button>
      </div>

      {/* Main Content */}
      {showIntro ? (
        // Introduction Section
        <div className="flex flex-col items-center justify-center space-y-6 text-gray-800">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-blue-500">
            Welcome to the Addition Adventure!
          </h2>
          <p className="text-center text-base md:text-lg">
            Learn how to add fruits together and help our friend collect them!
          </p>
          <div className="w-full max-w-md">
            <Lottie
              animationData={animationData}
              loop={true}
              style={{ width: '100%', height: 'auto' }}
            />
          </div>
          <Button
            onClick={handleStartPractice}
            variant="contained"
            color="primary"
            className="mt-4 text-base md:text-lg"
            style={{
              backgroundColor: '#ff6f61',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '9999px',
            }}
          >
            Start Learning!
          </Button>
        </div>
      ) : showTeachingPhase ? (
        // Teaching Phase
        <div className="flex flex-col items-center justify-center space-y-6 text-gray-800">
          <h2 className="text-xl md:text-2xl font-semibold text-center text-blue-500">
            Let's Learn How to Add!
          </h2>
          <p className="text-center text-base md:text-lg">
            When we add, we combine two groups of things to find out how many we have in total.
          </p>
          <div className="flex flex-wrap justify-center items-center space-x-2 mt-4">
            <span className="text-5xl md:text-6xl">🍎</span>
            <span className="text-4xl md:text-5xl font-bold text-pink-600 mx-2">+</span>
            <span className="text-5xl md:text-6xl">🍎</span>
            <span className="text-4xl md:text-5xl font-bold text-pink-600 mx-2">=</span>
            <span className="text-5xl md:text-6xl">🍎🍎</span>
          </div>
          <p className="text-center text-base md:text-lg">
            1 apple plus 1 apple equals 2 apples!
          </p>
          <Button
            onClick={handleEndTeachingPhase}
            variant="contained"
            color="primary"
            className="mt-4 text-base md:text-lg"
            style={{
              backgroundColor: '#4caf50',
              color: '#fff',
              padding: '12px 24px',
              borderRadius: '9999px',
            }}
          >
            Start Practicing!
          </Button>
        </div>
      ) : !gameCompleted ? (
        // Practice Section
        <>
          <div className="text-center mb-4">
            <h2 className="text-xl md:text-2xl text-blue-500 font-bold">Level {currentLevel}</h2>
          </div>

          {/* Instructions */}
          <div className="bg-yellow-100 p-4 rounded-lg mb-4 shadow-md">
            <p className="text-base md:text-lg text-center">
              Drag the fruits into the basket to find out how many there are in total.
            </p>
          </div>

          <div className="bg-blue-100 p-4 md:p-6 rounded-lg mb-4 shadow-md">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-col items-center space-y-4">
                <DragDropContext onDragEnd={handleDragEnd}>
                  <div className="flex items-center space-x-2 mt-4">
                    {/* Left Fruits */}
                    <Droppable droppableId="leftFruits" isDropDisabled={true}>
                      {(provided) => (
                        <div
                          className="flex space-x-1"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {[...Array(currentAddition.left)].map((_, i) => (
                            <Draggable key={`left-${i}`} draggableId={`left-${i}`} index={i}>
                              {(provided) => (
                                <span
                                  className="text-5xl md:text-6xl"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {currentAddition.picture}
                                </span>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>

                    <span className="text-4xl md:text-5xl font-bold text-pink-600">+</span>

                    {/* Right Fruits */}
                    <Droppable droppableId="rightFruits" isDropDisabled={true}>
                      {(provided) => (
                        <div
                          className="flex space-x-1"
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          {[...Array(currentAddition.right)].map((_, i) => (
                            <Draggable key={`right-${i}`} draggableId={`right-${i}`} index={i}>
                              {(provided) => (
                                <span
                                  className="text-5xl md:text-6xl"
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                >
                                  {currentAddition.picture}
                                </span>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>

                  {/* Basket Area */}
                  <Droppable droppableId="basket">
                    {(provided) => (
                      <div
                        className="bg-yellow-200 p-4 rounded-lg flex flex-wrap justify-center items-center min-h-[100px] mt-6 w-full"
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                      >
                        {basketItems.map((item, index) => (
                          <span key={index} className="text-5xl md:text-6xl m-1">
                            {item}
                          </span>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                <p className="text-center text-base md:text-lg mt-2">Your Basket</p>
              </div>

              {/* Feedback Message */}
              {feedbackMessage && (
                <div className="text-center text-xl md:text-2xl font-bold text-green-600">
                  {feedbackMessage}
                </div>
              )}

              {/* Show Correct Answer if Incorrect */}
              {showCorrectAnswer && (
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                  <p className="text-base md:text-lg">
                    The correct answer is{' '}
                    <span className="font-bold">
                      {currentAddition.left} + {currentAddition.right} ={' '}
                      {currentAddition.left + currentAddition.right}
                    </span>
                  </p>
                  <div className="flex justify-center flex-wrap mt-2">
                    {[...Array(currentAddition.left + currentAddition.right)].map((_, i) => (
                      <span key={i} className="text-5xl md:text-6xl m-1">
                        {currentAddition.picture}
                      </span>
                    ))}
                  </div>
                  <Button
                    onClick={handleContinueAfterIncorrect}
                    variant="contained"
                    color="primary"
                    className="mt-4 text-base md:text-lg"
                    style={{
                      backgroundColor: '#4caf50',
                      color: '#fff',
                      padding: '12px 24px',
                      borderRadius: '9999px',
                    }}
                  >
                    Continue
                  </Button>
                </div>
              )}

              {/* Mascot Animation */}
              {showMascot && (
                <div className="w-full max-w-md">
                  <Lottie
                    animationData={animationData}
                    loop={true}
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              )}

              {/* Check Answer Button */}
              {!showCorrectAnswer && !showMascot && (
                <Button
                  onClick={checkAnswer}
                  variant="contained"
                  color="primary"
                  className="text-base md:text-lg"
                  style={{
                    backgroundColor: '#ff6f61',
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: '9999px',
                  }}
                >
                  Check Answer
                </Button>
              )}
            </div>
          </div>

          {/* Star Ratings Row */}
          <div className="flex justify-between items-center mt-6">
            <div className="text-base md:text-xl font-medium text-pink-600">
              Level {currentLevel} of {TOTAL_LEVELS}
            </div>
            <div className="flex space-x-1">
              {[...Array(TOTAL_LEVELS)].map((_, i) => (
                <span
                  key={i}
                  className={`text-2xl md:text-3xl ${
                    i < stars ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ⭐
                </span>
              ))}
            </div>
          </div>
        </>
      ) : (
        // Success Message
        <div className="flex flex-col items-center justify-center text-gray-800">
          <Confetti width={width} height={height} />
          <h2 className="text-3xl md:text-4xl font-bold text-green-600 mb-2">You Did It!</h2>
          <p className="text-xl md:text-2xl mb-4">
            You've completed the adventure and collected all the fruits!
          </p>
          <div className="flex items-center space-x-1 mb-4">
            {[...Array(TOTAL_LEVELS)].map((_, i) => (
              <span
                key={i}
                className={`text-3xl md:text-4xl ${
                  i < stars ? 'text-yellow-400' : 'text-gray-300'
                }`}
              >
                ⭐
              </span>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={handleRetry}
              variant="contained"
              color="primary"
              className="flex items-center justify-center space-x-2 text-base md:text-lg"
              style={{
                backgroundColor: '#ff6f61',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '9999px',
              }}
            >
              <RefreshCw className="w-5 h-5 md:w-6 md:h-6" />
              <span>Play Again</span>
            </Button>
            <Button
              onClick={onBack}
              variant="contained"
              color="secondary"
              className="flex items-center justify-center space-x-2 text-base md:text-lg"
              style={{
                backgroundColor: '#4caf50',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '9999px',
              }}
            >
              <ArrowLeft className="w-5 h-5 md:w-6 md:h-6" />
              <span>Back to Menu</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionWithPictures;
