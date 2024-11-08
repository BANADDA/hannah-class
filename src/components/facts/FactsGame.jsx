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
import { Star } from 'lucide-react';
import { useEffect, useState } from 'react';
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
  const [currentStep, setCurrentStep] = useState('selectNumber'); // 'selectNumber', 'selectOperation', 'lesson', 'quiz', 'setComplete', 'gameOver'

  // State for managing questions
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // New State to track repetitions
  const [questionRepetition, setQuestionRepetition] = useState(0); // 0, 1, 2

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

  // State for managing sets of three numbers
  const [numberSets, setNumberSets] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [currentSetPassed, setCurrentSetPassed] = useState(false);

  // State to control fact display
  const [showFact, setShowFact] = useState(true); // New state variable

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

  // Function to generate sets of three numbers paired with the selected number
  const generateNumberSets = (selectedNumber) => {
    const availableNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      (n) => n !== selectedNumber
    );

    // Shuffle the available numbers
    for (let i = availableNumbers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [availableNumbers[i], availableNumbers[j]] = [
        availableNumbers[j],
        availableNumbers[i],
      ];
    }

    // Split into sets of 3
    const sets = [];
    for (let i = 0; i < availableNumbers.length; i += 3) {
      sets.push(availableNumbers.slice(i, i + 3));
    }

    return sets;
  };

  // Function to generate a single question
  const generateQuestion = (selectedNumber, pairedNumber, operation) => {
    let expression = "";
    let correctAnswer;

    switch (operation) {
      case "addition":
        expression = `${selectedNumber} + ${pairedNumber}`;
        correctAnswer = selectedNumber + pairedNumber;
        break;
      case "subtraction":
        if (selectedNumber >= pairedNumber) {
          expression = `${selectedNumber} - ${pairedNumber}`;
          correctAnswer = selectedNumber - pairedNumber;
        } else {
          expression = `${pairedNumber} - ${selectedNumber}`;
          correctAnswer = pairedNumber - selectedNumber;
        }
        break;
      case "multiplication":
        expression = `${selectedNumber} × ${pairedNumber}`;
        correctAnswer = selectedNumber * pairedNumber;
        break;
      default:
        expression = `${selectedNumber} + ${pairedNumber}`;
        correctAnswer = selectedNumber + pairedNumber;
    }

    const options = generateOptions(correctAnswer, operation);

    return {
      id: `q_${selectedNumber}_${pairedNumber}_${Math.random()}`,
      questionText: `What is ${expression}?`,
      correctAnswer,
      options,
    };
  };

  // **Modified Function to Generate Questions with Repetitions**
  const generateQuestionsForSet = (currentSet) => {
    const generated = [];

    currentSet.forEach((pairedNumber) => {
      // Generate one question per paired number
      const question = generateQuestion(
        selectedNumber,
        pairedNumber,
        selectedOperation
      );

      // Repeat the same question three times with shuffled options
      for (let i = 0; i < 3; i++) {
        // Create a deep copy to shuffle options differently
        const repeatedQuestion = {
          ...question,
          id: `${question.id}_rep_${i + 1}`, // Unique ID for each repetition
          options: generateOptions(question.correctAnswer, selectedOperation),
        };
        generated.push(repeatedQuestion);
      }
    });

    setQuestions(generated);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIME_LIMIT);
    setAttempts(0);
    setFailedOptions([]);
    setShowFact(true); // Show fact for the first question
    setQuestionRepetition(0); // Reset repetition counter
  };

  // Function to start the quiz
  const startQuiz = () => {
    if (selectedNumber && selectedOperation) {
      playStartQuiz(); // Play start quiz sound

      const sets = generateNumberSets(selectedNumber);
      setNumberSets(sets);
      setCurrentSetIndex(0);
      setCurrentSetPassed(false);
      generateQuestionsForSet(sets[0]); // Generate questions for the first set
      setCurrentStep("quiz"); // Move to quiz step

      // Mark this combination as used
      const updatedUsed = [
        ...usedCombinations,
        { number: selectedNumber, operation: selectedOperation },
      ];
      setUsedCombinations(updatedUsed);
      localStorage.setItem("usedCombinations", JSON.stringify(updatedUsed));

      // If all combinations are used, reset the tracking
      const totalCombinations = 9 * 3; // 9 numbers * 3 operations
      if (updatedUsed.length === totalCombinations) {
        alert(
          "You have used all possible number and operation combinations. Resetting used combinations."
        );
        setUsedCombinations([]);
        localStorage.removeItem("usedCombinations");
      }
    }
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

  // Function to update performance tracker
  const updatePerformance = (number, operation, passedOnFirstAttempt) => {
    const key = `${number}_${operation}`;
    setPerformanceTracker((prev) => {
      const updated = { ...prev, [key]: passedOnFirstAttempt };
      localStorage.setItem("performanceTracker", JSON.stringify(updated));
      return updated;
    });
  };

  // Effect to handle the timer for each question
  useEffect(() => {
    if (currentStep !== 'quiz' || gameOver || selectedAnswer !== null || showFact) return;

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
  }, [currentQuestionIndex, selectedAnswer, gameOver, currentStep, showFact]);

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

  // Function to move to the next question or end the set
  const handleNextQuestion = () => {
    if (questionRepetition < 2) { // Allow three repetitions (0,1,2)
      setQuestionRepetition((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(TIME_LIMIT);
      setAttempts(0); // Reset attempts for the new repetition
      setFailedOptions([]); // Reset failed options for the new repetition
      setShowFact(false); // Do not show fact again
    } else {
      if (currentQuestionIndex === questions.length - 1) {
        // Current set completed
        setCurrentSetPassed(true);
        setCurrentStep("setComplete"); // New step to handle set completion
        playCompletion(); // Play completion sound
      } else {
        // Move to next question
        setCurrentQuestionIndex((prev) => prev + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(TIME_LIMIT);
        setAttempts(0); // Reset attempts for the new question
        setFailedOptions([]); // Reset failed options for the new question
        setShowFact(true); // Show fact for the next question
        setQuestionRepetition(0); // Reset repetition counter
      }
    }
  };

  // Function to provide detailed explanations after three failed attempts
  const getDetailedExplanation = (number, operation) => {
    const facts = {
      addition: `${number} + 1 = ${number + 1}`,
      subtraction: `${number} - 1 = ${number - 1}`,
      multiplication: `${number} × 1 = ${number}`,
    };

    return facts[operation] || 'Let\'s get started!';
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

  // Function to proceed to the next set or end the quiz
  const proceedToNextSet = () => {
    const nextSetIndex = currentSetIndex + 1;
    if (nextSetIndex < numberSets.length) {
      setCurrentSetIndex(nextSetIndex);
      setCurrentSetPassed(false);
      generateQuestionsForSet(numberSets[nextSetIndex]);
      setCurrentStep("quiz");
    } else {
      // All sets completed
      setGameOver(true);
      setCurrentStep("gameOver");
      playCompletion(); // Play completion sound
    }
  };

  // Function to get fact based on selected number and operation
  const getFact = (number, operation, pairedNumber) => {
    switch (operation) {
      case 'addition':
        return `${number} + ${pairedNumber} = ${number + pairedNumber}`;
      case 'subtraction':
        return `${number} - ${pairedNumber} = ${number - pairedNumber}`;
      case 'multiplication':
        return `${number} × ${pairedNumber} = ${number * pairedNumber}`;
      default:
        return '';
    }
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
            backgroundColor: '#BBF7D0',
            padding: '1rem',
            paddingTop: '0.5rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            textAlign: 'center',
            width: '100%',
          }}
        >
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              fontSize: { xs: '1rem', sm: '1.25rem' },
              color: '#2F855A',
            }}
          >
            Math Adventure
          </Typography>
          <Typography
            sx={{
              fontWeight: 500,
              fontSize: { xs: '1rem', sm: '1.2rem' },
              color: '#4A5568',
              marginTop: '0.5rem',
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
            p: 1,
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
              width: { xs: '90%', sm: '70%', md: '50%' },
              height: 'auto',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography
              sx={{
                fontWeight: 500,
                fontSize: { xs: '1rem', sm: '1.2rem' },
                color: '#4A5568',
              }}
            >
              Choose Your Math Adventure!
            </Typography>

            <Grid
              container
              columnSpacing={0.5}
              rowSpacing={2}
              justifyContent="center"
              columns={{ xs: 4, sm: 5 }}
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
                      width: { xs: 60, sm: 80 },
                      height: { xs: 60, sm: 80 },
                      minWidth: 'auto',
                      padding: 0,
                      borderRadius: '50%',
                      fontSize: { xs: '1rem', sm: '1.5rem' },
                      backgroundColor: selectedNumber === number ? colors[index] : 'white',
                      color: selectedNumber === number ? '#fff' : colors[index],
                      borderColor: colors[index],
                      margin: 0,
                      boxSizing: 'border-box',
                      transition:
                        'background-color 0.3s ease-in-out, color 0.3s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        backgroundColor:
                          selectedNumber === number ? colors[index] : '#F8F4F4FF',
                        color: selectedNumber === number ? '#fff' : colors[index],
                        transform: 'scale(1.05)',
                        boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    {number}
                  </Button>
                </Grid>
              ))}
            </Grid>

            {currentStep === 'selectOperation' && (
              <>
                <Typography
                  sx={{
                    fontWeight: 500,
                    fontSize: { xs: '1rem', sm: '1.2rem' },
                    color: '#4A5568',
                  }}
                >
                  Choose Your Operation
                </Typography>
                <Grid
                  container
                  spacing={10}
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
                        // Remove or adjust this line to unlock all operations
                        disabled={false} // Allow all operations to be selected
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
                            color: selectedOperation === op ? '#fff' : '#815007FF',
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
                <Box mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      playConfirm();
                      startQuiz();
                    }}
                  >
                    Start Adventure
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    )
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

    // Handle set completion notification
    if (currentStep === "setComplete") {
      return (
        <Card
          sx={{
            maxWidth: 900,
            height: "auto",
            margin: "auto",
            p: 4,
            textAlign: "center",
          }}
        >
          {/* Success Mascot Animation */}
          <Box
            sx={{
              width: 150,
              height: 150,
              margin: "auto",
            }}
          >
            <Lottie
              animationData={successMascotAnimation}
              loop={false}
              style={{ width: "100%", height: "100%" }}
            />
          </Box>
          <Typography variant="h5" gutterBottom>
            Well Done!
          </Typography>
          <Typography variant="body1" gutterBottom>
            You&apos;ve mastered this set of numbers!
          </Typography>
          <Box mt={3}>
            <Button
              variant="contained"
              color="primary"
              onClick={proceedToNextSet}
            >
              Proceed to Next Set
            </Button>
          </Box>
        </Card>
      );
    }

    // Handle game over
    if (currentStep === "gameOver") {
      const stars = calculateStars();
      return (
        <Card
          sx={{
            maxWidth: 900,
            height: "auto",
            margin: "auto",
            position: "relative",
            justifyContent: "center",
            alignContent: "center",
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
                position: "relative",
                width: 100,
                height: 100,
                top: -75,
                left: "50%",
                transform: "translateX(-50%)",
              }}
            >
              <Lottie
                animationData={successMascotAnimation}
                loop={false}
                style={{ width: "100%", height: "100%" }}
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
          {!showFact && (
            <Box display="flex" justifyContent="space-between" mb={2}>
              <Typography variant="body1">
                Time left: {timeLeft}s
              </Typography>
              <Typography variant="body1">
                Score: {score.correct}/{score.total}
              </Typography>
            </Box>
          )}
          {!showFact && (
            <LinearProgress
              variant="determinate"
              value={(timeLeft / TIME_LIMIT) * 100}
              sx={{ mb: 2 }}
            />
          )}

          {/* Fact Display */}
          {showFact && questionRepetition === 0 && (
            <Box textAlign="center">
              <Typography textAlign="center" variant="h3" gutterBottom>
                Learn Fact:
              </Typography>
              <Typography alignSelf="start" variant="h5" gutterBottom>
                <strong>
                  {getFact(selectedNumber, selectedOperation, getRandomPairedNumber())}
                </strong>
              </Typography>
              <Box textAlign="center" mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setShowFact(false)}
                >
                  Start Quiz
                </Button>
              </Box>
            </Box>
          )}

          {/* Display Answer Buttons */}
          {!showFact && (
            <>
              <Typography variant="h6" gutterBottom>
                {currentQuestion.questionText}
              </Typography>

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
                        <>That&apos;s not correct. The correct answer is {currentQuestion.correctAnswer}.</>
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
                        {currentQuestionIndex === questions.length - 1 &&
                          questionRepetition === 2
                          ? 'See Results'
                          : 'Next Question'}
                      </Button>
                    </Box>
                  ) : null}
                </Box>
              )}
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  // Function to calculate stars based on performance
  const calculateStars = () => {
    const totalSets = numberSets.length;
    const passedSets = numberSets.reduce((acc, set, index) => {
      const key = `${selectedNumber}_${selectedOperation}`;
      return performanceTracker[key] ? acc + 1 : acc;
    }, 0);
    const percentage = (passedSets / totalSets) * 100;

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

  // JSX for Final Completion
  const renderGameOver = () => {
    const stars = calculateStars();
    return (
      <Card
        sx={{
          maxWidth: 900,
          height: "auto",
          margin: "auto",
          position: "relative",
          justifyContent: "center",
          alignContent: "center",
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
              position: "relative",
              width: 100,
              height: 100,
              top: -75,
              left: "50%",
              transform: "translateX(-50%)",
            }}
          >
            <Lottie
              animationData={successMascotAnimation}
              loop={false}
              style={{ width: "100%", height: "100%" }}
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
  };

  // Function to get a random paired number from the current set
  const getRandomPairedNumber = () => {
    if (numberSets.length === 0) return 1; // Default paired number
    const currentSet = numberSets[currentSetIndex];
    const randomIndex = Math.floor(Math.random() * currentSet.length);
    return currentSet[randomIndex];
  };

  // JSX to render different steps
  return (
    <Box sx={{ py: 10, px: 4, md: { py: 14, px: 5 }, width: '100%' }}>
      {currentStep === 'selectNumber' ||
        currentStep === 'selectOperation' ||
        currentStep === 'lesson'
        ? renderNumberSelector()
        : currentStep === 'quiz'
          ? renderQuiz()
          : currentStep === 'setComplete'
            ? (
              <Card
                sx={{
                  maxWidth: 900,
                  height: "auto",
                  margin: "auto",
                  p: 4,
                  textAlign: "center",
                }}
              >
                {/* Success Mascot Animation */}
                <Box
                  sx={{
                    width: 150,
                    height: 150,
                    margin: "auto",
                  }}
                >
                  <Lottie
                    animationData={successMascotAnimation}
                    loop={false}
                    style={{ width: "100%", height: "100%" }}
                  />
                </Box>
                <Typography variant="h5" gutterBottom>
                  Well Done!
                </Typography>
                <Typography variant="body1" gutterBottom>
                  You&apos;ve mastered this set of numbers!
                </Typography>
                <Box mt={3}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={proceedToNextSet}
                  >
                    Proceed to Next Set
                  </Button>
                </Box>
              </Card>
            )
            : currentStep === 'gameOver'
              ? renderGameOver()
              : null}
    </Box>
  );
};

export default MathFactFamilyQuiz;
