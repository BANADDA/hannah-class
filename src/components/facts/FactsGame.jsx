// MathFactFamilyQuiz.jsx

import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Typography,
} from '@mui/material';
import Lottie from 'lottie-react';
import { Star } from 'lucide-react'; // Using 'Star' from 'lucide-react'
import React, { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';
import useSound from 'use-sound';

// Import your mascot animations
import successMascotAnimation from '../../animations/correct.json';
import wrongMascotAnimation from '../../animations/wrong.json';

const TIME_LIMIT = 20;

// Utility function to generate multiple-choice answers
const generateOptions = (correctAnswer, operation) => {
  const options = new Set();
  options.add(correctAnswer);

  while (options.size < 4) {
    let wrongAnswer;
    switch (operation) {
      case 'addition':
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
        break;
      case 'subtraction':
        wrongAnswer = correctAnswer - (Math.floor(Math.random() * 3) + 1);
        break;
      case 'multiplication':
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
        break;
      default:
        wrongAnswer = correctAnswer + Math.floor(Math.random() * 5) + 1;
    }
    // Ensure no negative answers and uniqueness
    if (wrongAnswer > 0) {
      options.add(wrongAnswer);
    }
  }

  // Shuffle the options
  return Array.from(options).sort(() => Math.random() - 0.5);
};

// Main Component
const MathFactFamilyQuiz = () => {
  // State for managing the selected number and operation
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [selectedOperation, setSelectedOperation] = useState(null);

  // State to control the current step
  const [currentStep, setCurrentStep] = useState('selectNumber'); // 'selectNumber', 'selectOperation', 'lesson', 'quiz', 'gameOver'

  // State for managing questions
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // State for managing quiz progress and feedback
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isCorrect, setIsCorrect] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [gameOver, setGameOver] = useState(false);
  const [timer, setTimer] = useState(null);
  const [attempts, setAttempts] = useState(0); // Tracking attempts (0-based index)
  const [failedOptions, setFailedOptions] = useState([]); // Tracking failed options

  // State to track used combinations
  const [usedCombinations, setUsedCombinations] = useState(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('usedCombinations');
    return stored ? JSON.parse(stored) : [];
  });

  // State for performance tracking
  const [performanceTracker, setPerformanceTracker] = useState(() => {
    const stored = localStorage.getItem('performanceTracker');
    return stored ? JSON.parse(stored) : {};
  });

  // Define currentQuestion at the component level
  const currentQuestion = questions[currentQuestionIndex];

  // Sound file URLs
  const hoverSoundUrl = '/sounds/hover_sound.mp3';
  const clickSoundUrl = '/sounds/click_sound.mp3';
  const completionSoundUrl = '/sounds/game_completed.mp3';
  const correctSoundUrl = '/sounds/correct_answer.wav';
  const incorrectSoundUrl = '/sounds/wrong_answer.wav';
  const startQuizSoundUrl = '/sounds/navigate.wav';
  const confirmSoundUrl = '/sounds/confirm.wav'; // New sound for confirmation

  // Load sounds
  const [playHover] = useSound(hoverSoundUrl, { volume: 0.5 });
  const [playClick] = useSound(clickSoundUrl, { volume: 0.5 });
  const [playCompletion] = useSound(completionSoundUrl, { volume: 0.5 });
  const [playCorrect] = useSound(correctSoundUrl, { volume: 0.5 });
  const [playIncorrect] = useSound(incorrectSoundUrl, { volume: 0.5 });
  const [playStartQuiz] = useSound(startQuizSoundUrl, { volume: 0.5 });
  const [playConfirm] = useSound(confirmSoundUrl, { volume: 0.5 });

  const { width, height } = useWindowSize();

  // Function to handle number selection
  const handleNumberClick = (number) => {
    setSelectedNumber(number);
    playClick(); // Play click sound on number selection
    setCurrentStep('selectOperation'); // Move to operation selection
  };

  // Function to handle operation selection
  const handleOperationClick = (operation) => {
    setSelectedOperation(operation);
    playClick(); // Play click sound on operation selection
    setCurrentStep('lesson'); // Move to lesson step
  };

  // Function to start the quiz
  const startQuiz = () => {
    if (selectedNumber && selectedOperation) {
      playStartQuiz(); // Play start quiz sound

      generateQuestions(selectedNumber, selectedOperation);
      setCurrentStep('quiz'); // Move to quiz step

      // Mark this combination as used
      const updatedUsed = [...usedCombinations, { number: selectedNumber, operation: selectedOperation }];
      setUsedCombinations(updatedUsed);
      localStorage.setItem('usedCombinations', JSON.stringify(updatedUsed));

      // If all combinations are used, reset the tracking
      const totalCombinations = 9 * 3; // 9 numbers * 3 operations
      if (updatedUsed.length === totalCombinations) {
        alert('You have used all possible number and operation combinations. Resetting used combinations.');
        setUsedCombinations([]);
        localStorage.removeItem('usedCombinations');
      }
    }
  };

  // Function to generate questions based on selected number and operation
  const generateQuestions = (number, operation) => {
    const generated = [];

    for (let i = 0; i < 10; i++) { // Generate 10 questions
      const randomNum = Math.floor(Math.random() * 9) + 1; // Random number between 1-9

      let questionText = '';
      let correctAnswer;
      let expression = '';

      switch (operation) {
        case 'addition':
          expression = `${number} + ${randomNum}`;
          correctAnswer = number + randomNum;
          break;
        case 'subtraction':
          // Ensure no negative results
          if (number >= randomNum) {
            expression = `${number} - ${randomNum}`;
            correctAnswer = number - randomNum;
          } else {
            expression = `${randomNum} - ${number}`;
            correctAnswer = randomNum - number;
          }
          break;
        case 'multiplication':
          expression = `${number} × ${randomNum}`;
          correctAnswer = number * randomNum;
          break;
        default:
          expression = `${number} + ${randomNum}`;
          correctAnswer = number + randomNum;
      }

      questionText = `What is ${expression}?`;

      const options = generateOptions(correctAnswer, operation);

      generated.push({
        id: `q_${i + 1}`,
        questionText,
        correctAnswer,
        options,
      });
    }

    setQuestions(generated);
  };

  // Effect to handle the timer for each question
  useEffect(() => {
    if (currentStep !== 'quiz' || gameOver || selectedAnswer !== null) return;

    const countdown = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimer(countdown);
    return () => clearInterval(countdown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, selectedAnswer, gameOver, currentStep]);

  // Function to update performance tracker
  const updatePerformance = (number, operation, passedOnFirstAttempt) => {
    const key = `${number}_${operation}`;
    setPerformanceTracker((prev) => {
      const updated = { ...prev, [key]: passedOnFirstAttempt };
      localStorage.setItem('performanceTracker', JSON.stringify(updated));
      return updated;
    });
  };

  // Function to handle timeout when user doesn't answer in time
  const handleTimeout = () => {
    if (attempts + 1 < 3) { // Allow up to three attempts
      // Allow another attempt
      setAttempts((prev) => prev + 1);
      setScore((prev) => ({ ...prev, total: prev.total + 1 }));
      playIncorrect();
      setTimeLeft(TIME_LIMIT);
      // Restart timer for the next attempt
      const countdown = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(countdown);
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimer(countdown);
    } else {
      // Third timeout attempt - reveal correct answer
      setSelectedAnswer(-1); // Indicate timeout
      setIsCorrect(false);
      setScore((prev) => ({ ...prev, total: prev.total + 1 }));
      updatePerformance(selectedNumber, selectedOperation, false);
      playIncorrect();
    }
  };

  // Function to handle answer selection
  const handleAnswerClick = (index) => {
    if (!currentQuestion) {
      console.error("Current question is undefined.");
      return;
    }

    clearInterval(timer);
    const answer = currentQuestion.options[index];
    const isAnswerCorrect = answer === currentQuestion.correctAnswer;

    if (isAnswerCorrect) {
      setSelectedAnswer(index);
      setIsCorrect(true);
      setScore((prev) => ({
        correct: prev.correct + 1,
        total: prev.total + 1,
      }));
      updatePerformance(selectedNumber, selectedOperation, attempts === 0);
      playCorrect();
    } else {
      if (attempts + 1 < 3) { // Allow up to three attempts
        // Allow another attempt
        setAttempts((prev) => prev + 1);
        setScore((prev) => ({ ...prev, total: prev.total + 1 }));
        setFailedOptions((prev) => [...prev, index]); // Add failed option
        playIncorrect();
        setTimeLeft(TIME_LIMIT);
        // Restart timer for the next attempt
        const countdown = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              handleTimeout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        setTimer(countdown);
      } else {
        // Third failed attempt - reveal correct answer
        setSelectedAnswer(index);
        setIsCorrect(false);
        setScore((prev) => ({ ...prev, total: prev.total + 1 }));
        setFailedOptions((prev) => [...prev, index]); // Add failed option
        updatePerformance(selectedNumber, selectedOperation, false);
        playIncorrect();
      }
    }
  };

  // Function to move to the next question or end the quiz
  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setGameOver(true);
      setCurrentStep('gameOver'); // Move to game over step
      playCompletion(); // Play completion sound
    } else {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(TIME_LIMIT);
      setAttempts(0); // Reset attempts for the new question
      setFailedOptions([]); // Reset failed options for the new question
    }
  };

  // Function to calculate star ratings based on performance
  const calculateStars = () => {
    const totalOperations = 9 * 3; // 9 numbers * 3 operations
    const passedOperations = Object.values(performanceTracker).filter((passed) => passed).length;
    const percentage = (passedOperations / totalOperations) * 100;

    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Function to render star icons
  const renderStars = (count) => {
    return [...Array(3)].map((_, i) => (
      <Star key={i} style={{ color: i < count ? '#FFD700' : '#D3D3D3' }} size={32} />
    ));
  };

  // Function to provide detailed explanations after three failed attempts
  const getDetailedExplanation = (number, operation) => {
    const explanations = {
      addition: [
        `🍎 **Apples**: Imagine you have ${number} apples. If you receive ${currentQuestion.correctAnswer - number} more apples, you now have ${currentQuestion.correctAnswer} apples.`,
        `🚗 **Cars**: Suppose you own ${number} toy cars. Adding ${currentQuestion.correctAnswer - number} more toy cars means you now have ${currentQuestion.correctAnswer} toy cars.`,
        `🎨 **Colors**: If you have ${number} blue crayons and someone gives you ${currentQuestion.correctAnswer - number} more blue crayons, you now have ${currentQuestion.correctAnswer} blue crayons.`,
      ],
      subtraction: [
        `🧱 **Blocks**: Imagine you have ${currentQuestion.correctAnswer + (selectedNumber >= currentQuestion.correctAnswer ? selectedNumber : currentQuestion.correctAnswer)} blocks. If you remove ${selectedNumber >= currentQuestion.correctAnswer ? selectedNumber : currentQuestion.correctAnswer} blocks, you're left with ${currentQuestion.correctAnswer} blocks.`,
        `📚 **Books**: Suppose you have ${currentQuestion.correctAnswer + (selectedNumber >= currentQuestion.correctAnswer ? selectedNumber : currentQuestion.correctAnswer)} books. After giving away ${selectedNumber >= currentQuestion.correctAnswer ? selectedNumber : currentQuestion.correctAnswer} books, you have ${currentQuestion.correctAnswer} books left.`,
        `🍭 **Candies**: If you have ${currentQuestion.correctAnswer + (selectedNumber >= currentQuestion.correctAnswer ? selectedNumber : currentQuestion.correctAnswer)} candies and you eat ${selectedNumber >= currentQuestion.correctAnswer ? selectedNumber : currentQuestion.correctAnswer} candies, you now have ${currentQuestion.correctAnswer} candies remaining.`,
      ],
      multiplication: [
        `🍎 **Apples**: If you have ${selectedNumber} baskets with ${currentQuestion.correctAnswer / selectedNumber} apples each, you have a total of ${currentQuestion.correctAnswer} apples.`,
        `🧸 **Toys**: Imagine you have ${selectedNumber} shelves, each holding ${currentQuestion.correctAnswer / selectedNumber} toys. In total, you have ${currentQuestion.correctAnswer} toys.`,
        `🚗 **Cars**: Suppose you have ${selectedNumber} garages, each storing ${currentQuestion.correctAnswer / selectedNumber} toy cars. This means you have ${currentQuestion.correctAnswer} toy cars in total.`,
      ],
    };

    // Select a random explanation from the available ones for the operation
    const operationExplanations = explanations[operation];
    const randomIndex = Math.floor(Math.random() * operationExplanations.length);
    return operationExplanations[randomIndex];
  };

  // Function to restart the quiz
  const handleRestart = () => {
    setSelectedNumber(null);
    setSelectedOperation(null);
    setCurrentStep('selectNumber');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIME_LIMIT);
    setScore({ correct: 0, total: 0 });
    setGameOver(false);
    setAttempts(0);
    setFailedOptions([]);
    clearInterval(timer);
    setPerformanceTracker({}); // Reset performance tracker
    localStorage.removeItem('performanceTracker'); // Clear from localStorage
  };

  // JSX for Number Selector
  const renderNumberSelector = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    const colors = [
      '#87CEEB', '#90EE90', '#FFA07A', '#DDA0DD', '#FFD700',
      '#5F9EA0', '#8A2BE2', '#FF6347', '#3CB371',
    ];

    return (
      <Box>
        {/* Teacher's Note */}
        <Box
          className="bg-green-100 p-4 pt-2 rounded-lg mb-5 text-center w-full"
          sx={{
            backgroundColor: '#BBF7D0', // bg-green-100 equivalent
            padding: '1rem', // p-4
            paddingTop: '0.5rem', // pt-2
            borderRadius: '0.5rem', // rounded-lg
            marginBottom: '1.25rem', // mb-5
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.25rem' }, // Responsive fontSize
              color: '#2F855A', // Equivalent to text-green-700
            }}
          >
            Math Adventure
          </Typography>
          <Typography
            sx={{
              fontWeight: 500, // Equivalent to font-semibold
              fontSize: { xs: '1rem', sm: '1.2rem' }, // Responsive fontSize
              color: '#4A5568', // Equivalent to text-gray-700
              marginTop: '0.5rem', // Optional spacing
            }}
          >
            When we know one fact, we can use it to solve other facts too! It&apos;s like finding clues to a puzzle.
          </Typography>
        </Box>

        {/* Number Selection Card */}
        <Card
          className="w-full"
          sx={{
            margin: 'auto',
            mt: 5,
            p: 1, // Reduced padding
            boxShadow: 0,
            background: '#F4F3F2FF',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CardContent
            sx={{
              textAlign: 'center',
              width: { xs: '90%', sm: '70%', md: '50%' }, // Responsive width
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontWeight: 500, // Equivalent to font-semibold
                fontSize: { xs: '1rem', sm: '1.2rem' }, // Responsive fontSize
                color: '#4A5568', // Equivalent to text-gray-700
              }}
            >
              Choose Your Math Adventure!
            </Typography>

            <Grid
              container
              columnSpacing={0.5} // Reduced horizontal spacing (4px)
              rowSpacing={2} // Maintain or adjust vertical spacing as needed
              justifyContent="center"
              columns={{ xs: 4, sm: 5 }} // Responsive number of columns
              sx={{ marginBottom: 5, marginTop: 1 }}
            >
              {numbers.map((number, index) => (
                <Grid item xs={2} sm={1} key={number}>
                  <Button
                    variant={selectedNumber === number ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => handleNumberClick(number)}
                    onMouseEnter={() => {
                      if (selectedNumber !== number) {
                        playHover();
                      }
                    }}
                    sx={{
                      width: { xs: 60, sm: 80 }, // Responsive width
                      height: { xs: 60, sm: 80 }, // Responsive height
                      minWidth: 'auto',
                      padding: 0, // Remove internal padding
                      borderRadius: '50%', // Make buttons circular
                      fontSize: { xs: '1rem', sm: '1.5rem' }, // Responsive fontSize
                      backgroundColor: selectedNumber === number ? colors[index] : 'white',
                      color: selectedNumber === number ? '#fff' : colors[index],
                      borderColor: colors[index],
                      margin: 0, // Remove default margin
                      boxSizing: 'border-box', // Include borders in size
                      transition:
                        'background-color 0.3s ease-in-out, color 0.3s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor:
                          selectedNumber === number ? colors[index] : '#F8F4F4FF',
                        color: selectedNumber === number ? '#fff' : colors[index],
                        transform: 'scale(1.05)', // Optional scaling
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)', // Optional shadow
                      },
                    }}
                  >
                    {number}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Operation Selection */}
            {currentStep === 'selectOperation' && (
              <>
                <Typography
                  sx={{
                    fontWeight: 500, // Equivalent to font-semibold
                    fontSize: { xs: '1rem', sm: '1.2rem' }, // Responsive fontSize
                    color: '#4A5568', // Equivalent to text-gray-700
                  }}
                >
                  Choose Your Operation
                </Typography>
                <Grid
                  container
                  spacing={10} // Sets both column and row spacing to 24px
                  justifyContent="center"
                  sx={{ marginBottom: 5, marginTop: 1 }}
                >
                  {['addition', 'subtraction', 'multiplication'].map((op) => (
                    <Grid item xs={12} sm={4} key={op}>
                      <Button
                        variant={selectedOperation === op ? 'contained' : 'outlined'}
                        color="secondary"
                        onClick={() => handleOperationClick(op)}
                        onMouseEnter={() => {
                          if (selectedOperation !== op) {
                            playHover();
                          }
                        }}
                        sx={{
                          width: { xs: '100%', sm: '200px' },
                          height: 50,
                          borderRadius: '100px',
                          fontSize: '1rem',
                          fontWeight: 900,
                          backgroundColor:
                            selectedOperation === op ? '#FFB74D' : 'white',
                          color:
                            selectedOperation === op ? '#fff' : '#71480AFF',
                          borderColor: '#FFB74D',
                          boxSizing: 'border-box',
                          transition:
                            'background-color 0.3s ease-in-out, color 0.3s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                          '&:hover': {
                            backgroundColor:
                              selectedOperation === op ? '#FFA726' : '#FFF3E0',
                            color:
                              selectedOperation === op ? '#fff' : '#815007FF',
                            transform: 'scale(1.05)',
                            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                          },
                        }}
                      >
                        {op.charAt(0).toUpperCase() + op.slice(1)}
                      </Button>
                    </Grid>
                  ))}
                </Grid>
              </>
            )}

            {/* Lesson Step */}
            {currentStep === 'lesson' && (
              <Box>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{
                    fontWeight: 'bold',
                    marginBottom: '1rem',
                  }}
                >
                  Let&apos;s Learn!
                </Typography>
                <Typography variant="body1" gutterBottom>
                  <strong>
                    {selectedNumber} {selectedOperation}{' '}
                    {selectedOperation === 'addition'
                      ? '+'
                      : selectedOperation === 'subtraction'
                      ? '-'
                      : '×'}
                  </strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  {getLessonContent(selectedNumber, selectedOperation)}
                </Typography>
                <Box mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      playConfirm();
                      startQuiz();
                    }}
                  >
                    I Understand, Start Adventure!
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    )};

    // Function to get lesson content based on selected number and operation
    const getLessonContent = (number, operation) => {
      switch (operation) {
        case 'addition':
          return (
            <span>
              Addition is like putting together objects. For example, if you have{' '}
              <strong>{number}</strong> 🍎 and you get <strong>2</strong> more 🍎,
              you now have <strong>{number + 2}</strong> 🍎!
            </span>
          );
        case 'subtraction':
          return (
            <span>
              Subtraction is like taking away objects. For example, if you have{' '}
              <strong>{number + 2}</strong> 🍎 and you eat <strong>2</strong>, you
              now have <strong>{number}</strong> 🍎 left!
            </span>
          );
        case 'multiplication':
          return (
            <span>
              Multiplication is like adding the same number multiple times. For
              example, <strong>{number} × 3</strong> is the same as having{' '}
              <strong>
                {number} + {number} + {number} = {number * 3}
              </strong>{' '}
              🍎!
            </span>
          );
        default:
          return 'Let\'s get started!';
      }
    };

    // JSX for Quiz Interface
    const renderQuiz = () => {
      if (questions.length === 0) {
        return (
          <Typography variant="h6" align="left">
            Loading questions...
          </Typography>
        );
      }

      if (currentStep === 'gameOver') {
        const stars = calculateStars();
        return (
          <Card
            sx={{
              maxWidth: 900,
              height: 'auto',
              margin: 'auto',
              position: 'relative',
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            {/* Confetti Animation */}
            <Confetti
              width={width}
              height={height}
              recycle={false}
              numberOfPieces={300}
            />

            <CardContent sx={{ mt: 8 }}>
              {/* Success Mascot Animation */}
              <Box
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  top: -75,
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                <Lottie
                  animationData={successMascotAnimation}
                  loop={false}
                  style={{ width: '100%', height: '100%' }}
                />
              </Box>
              <Typography
                variant="h5"
                component="div"
                gutterBottom
                align="center"
              >
                Quiz Complete!
              </Typography>
              <Box display="flex" justifyContent="center" mb={2}>
                {renderStars(stars)}
              </Box>
              <Typography variant="h6" align="center" gutterBottom>
                You got {score.correct} out of {score.total} correct!
              </Typography>
              {stars === 3 ? (
                <Typography variant="body1" align="center" color="green">
                  Excellent work! You&apos;re a math facts master! 🌟
                </Typography>
              ) : stars === 2 ? (
                <Typography variant="body1" align="center" color="blue">
                  Good job! Keep practicing to improve! 👍
                </Typography>
              ) : stars === 1 ? (
                <Typography variant="body1" align="center" color="orange">
                  Nice try! More practice will help you improve. 😊
                </Typography>
              ) : (
                <Typography variant="body1" align="center" color="red">
                  Keep practicing! You&apos;ll get better with time. 💪
                </Typography>
              )}

              {/* Performance Summary */}
              <Box mt={4}>
                <Typography
                  variant="h6"
                  gutterBottom
                  align="center"
                >
                  Performance Summary
                </Typography>
                <Grid container spacing={2}>
                  {Object.keys(performanceTracker).map((key) => {
                    const [number, operation] = key.split('_');
                    const passed = performanceTracker[key];
                    return (
                      <Grid item xs={6} sm={4} key={key}>
                        <Box
                          sx={{
                            border: '1px solid',
                            borderColor: passed ? 'green' : 'red',
                            borderRadius: '8px',
                            padding: '8px',
                            textAlign: 'center',
                          }}
                        >
                          <Typography variant="body1">
                            {number} {operation.charAt(0).toUpperCase() + operation.slice(1)}
                          </Typography>
                          <Typography
                            variant="body2"
                            color={passed ? 'green' : 'red'}
                          >
                            {passed ? 'Passed' : 'Failed'}
                          </Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Box>

              <Box textAlign="center" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleRestart}
                >
                  Try Again
                </Button>
              </Box>
            </CardContent>
          </Card>
        );
      }

      // Ensure currentQuestion is defined
      if (!currentQuestion) {
        return (
          <Typography variant="h6" align="left">
            No question available.
          </Typography>
        );
      }

      return (
        <Card sx={{ maxWidth: 900, margin: 'auto' }}>
          <CardContent>
            {/* Timer and Score */}
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">
                Time left: {timeLeft}s
              </Typography>
              <Typography variant="body1">
                Score: {score.correct}/{score.total}
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={(timeLeft / TIME_LIMIT) * 100}
              sx={{ mb: 2 }}
            />

            {/* Question Text */}
            <Typography variant="h6" gutterBottom>
              {currentQuestion.questionText}
            </Typography>

            {/* Display Answer Buttons */}
            <Grid container spacing={2}>
              {currentQuestion.options.map((option, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => handleAnswerClick(index)}
                    disabled={
                      selectedAnswer !== null || failedOptions.includes(index)
                    }
                    sx={{
                      backgroundColor:
                        selectedAnswer === index
                          ? isCorrect
                            ? '#c8e6c9'
                            : '#ffcdd2'
                          : failedOptions.includes(index)
                          ? '#f0f0f0'
                          : 'inherit',
                      borderColor:
                        selectedAnswer === index
                          ? isCorrect
                            ? '#2e7d32'
                            : '#c62828'
                          : failedOptions.includes(index)
                          ? '#bdbdbd'
                          : 'inherit',
                      color:
                        selectedAnswer === index
                          ? isCorrect
                            ? '#2e7d32'
                            : '#c62828'
                          : failedOptions.includes(index)
                          ? '#9e9e9e'
                          : 'inherit',
                      '&:hover': {
                        backgroundColor:
                          selectedAnswer === index
                            ? isCorrect
                              ? '#a5d6a7'
                              : '#ef9a9a'
                            : failedOptions.includes(index)
                            ? '#f0f0f0'
                            : '#f5f5f5',
                      },
                    }}
                  >
                    {option}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {/* Display Mascot and Feedback */}
            {selectedAnswer !== null && (
              <Box mt={2}>
                {/* Conditional Mascot Rendering */}
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    mt: 1,
                    mx: 'auto',
                  }}
                >
                  {selectedAnswer === -1 || !isCorrect ? (
                    <Lottie
                      animationData={wrongMascotAnimation}
                      loop={false}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Lottie
                      animationData={successMascotAnimation}
                      loop={false}
                      style={{ width: '100%', height: '100%' }}
                    />
                  )}
                </Box>
                <Alert severity={isCorrect ? 'success' : 'error'}>
                  <AlertTitle>
                    {isCorrect
                      ? 'Correct! 🎉'
                      : selectedAnswer === -1
                      ? "Time's up! ⏰"
                      : `Wrong answer! 😞 Attempt ${attempts + 1}`}
                  </AlertTitle>
                  <Typography variant="body2">
                    {selectedAnswer === -1 ? (
                      "You didn't select an answer in time."
                    ) : isCorrect ? (
                      <>Great job! You selected the correct answer.</>
                    ) : attempts < 2 ? (
                      <>Wrong answer, try again.</>
                    ) : (
                      <>That's not correct. The correct answer is {currentQuestion.correctAnswer}.</>
                    )}
                  </Typography>
                  {/* Provide Detailed Explanation after three failed attempts */}
                  {!isCorrect && attempts >= 2 && (
                    <Typography variant="body2" mt={1}>
                      {getDetailedExplanation(selectedNumber, selectedOperation)}
                    </Typography>
                  )}
                </Alert>

                {/* Encourage to Try Again if Attempts are Left */}
                {!isCorrect && attempts < 2 && (
                  <Box textAlign="left" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => {
                        setSelectedAnswer(null);
                        setIsCorrect(null);
                        setTimeLeft(TIME_LIMIT);
                        // Keep failed options disabled
                        playClick();
                        // Restart timer for the next attempt
                        const countdown = setInterval(() => {
                          setTimeLeft((prev) => {
                            if (prev <= 1) {
                              clearInterval(countdown);
                              handleTimeout();
                              return 0;
                            }
                            return prev - 1;
                          });
                        }, 1000);
                        setTimer(countdown);
                      }}
                    >
                      Try Again
                    </Button>
                  </Box>
                )}

                {/* Show Next Question or See Results */}
                {isCorrect || (isCorrect === false && attempts >= 2) ? (
                  <Box textAlign="left" mt={2}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleNextQuestion}
                    >
                      {currentQuestionIndex === questions.length - 1
                        ? 'See Results'
                        : 'Next Question'}
                    </Button>
                  </Box>
                ) : null}
              </Box>
            )}
          </CardContent>
        </Card>
      );
    };

    return (
      <Box sx={{ py: 10, px: 4, md: { py: 14, px: 5 }, width: '100%' }}>
        {currentStep === 'selectNumber' ||
        currentStep === 'selectOperation' ||
        currentStep === 'lesson'
          ? renderNumberSelector()
          : renderQuiz()}
      </Box>
    );
  };

  export default MathFactFamilyQuiz;
