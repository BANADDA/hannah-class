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
  Typography
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

// Utility function to generate all unique two-number combinations (unordered)
const generateAllCombinations = (numbers) => {
  const combinations = [];
  for (let i = 0; i < numbers.length; i++) {
    for (let j = i + 1; j < numbers.length; j++) {
      combinations.push([numbers[i], numbers[j]]);
    }
  }
  return combinations;
};

// Main Component
const MathFactFamilyQuiz = () => {
  // State for managing the selected numbers
  const [selectedNumbers, setSelectedNumbers] = useState([]);

  // State to control whether the quiz has started
  const [quizStarted, setQuizStarted] = useState(false);

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

  // State to track used two-number combinations
  const [usedCombinations, setUsedCombinations] = useState(() => {
    // Initialize from localStorage if available
    const stored = localStorage.getItem('usedCombinations');
    return stored ? JSON.parse(stored) : [];
  });

  // Define currentQuestion at the component level to make it accessible in all functions
  const currentQuestion = questions[currentQuestionIndex];

  // All possible two-number combinations (1-10, unordered)
  const allCombinations = generateAllCombinations([1,2,3,4,5,6,7,8,9,10]);

  // Sound file URLs
  const hoverSoundUrl = '/sounds/hover_sound.mp3';
  const clickSoundUrl = '/sounds/hover_sound.mp3';
  const completionSoundUrl = '/sounds/game_completed.mp3';
  const correctSoundUrl = '/sounds/correct_answer.wav';
  const incorrectSoundUrl = '/sounds/wrong_answer.wav';
  const startQuizSoundUrl = '/sounds/navigate.wav';

  // Load sounds
  const [playHover] = useSound(hoverSoundUrl, { volume: 0.5 });
  const [playClick] = useSound(clickSoundUrl, { volume: 0.5 });
  const [playCompletion] = useSound(completionSoundUrl, { volume: 0.5 });
  const [playCorrect] = useSound(correctSoundUrl, { volume: 0.5 });
  const [playIncorrect] = useSound(incorrectSoundUrl, { volume: 0.5 });
  const [playStartQuiz] = useSound(startQuizSoundUrl, { volume: 0.5 });

  const { width, height } = useWindowSize();

  // Function to handle number selection
  const handleNumberClick = (number) => {
    setSelectedNumbers(prev => {
      let newSelected;
      if (prev.includes(number)) {
        // Deselect the number if already selected
        newSelected = prev.filter(n => n !== number);
      } else if (prev.length < 2) {
        // Select the number if less than two are selected
        newSelected = [...prev, number];
      } else {
        // Replace the first selected number if two are already selected
        newSelected = [prev[1], number];
      }

      return newSelected;
    });
  };

  // Function to start the quiz
  const startQuiz = () => {
    if (selectedNumbers.length === 2) {
      playStartQuiz(); // Play start quiz sound

      generateQuestions(selectedNumbers);
      setQuizStarted(true);

      // Mark this combination as used
      const updatedUsed = [...usedCombinations, selectedNumbers];
      setUsedCombinations(updatedUsed);
      localStorage.setItem('usedCombinations', JSON.stringify(updatedUsed));

      // If all combinations are used, reset the tracking
      if (updatedUsed.length === allCombinations.length) {
        alert('You have used all possible number combinations. Resetting used combinations.');
        setUsedCombinations([]);
        localStorage.removeItem('usedCombinations');
      }
    }
  };

  // Function to generate questions based on selected numbers
  const generateQuestions = ([num1, num2]) => {
    const generated = [];

    // Helper variables
    const addition = num1 + num2;
    const subtraction1 = num1 - num2;
    const subtraction2 = num2 - num1;
    const multiplication = num1 * num2;
    const division1 = num1 !== 0 ? (num2 / num1).toFixed(2) : null;
    const division2 = num2 !== 0 ? (num1 / num2).toFixed(2) : null;

    // 1. Missing Relation
    generated.push({
      id: 'missing_relation',
      type: 'missing_relation',
      questionText: "What's the missing relation?",
      relations: [
        `${num1} + ${num2} = ${addition}`,
        `${num2} + ${num1} = ${addition}`,
        `${addition} - ${num2} = ${num1}`
      ],
      answers: [
        { text: `${addition} - ${num1} = ${num2}`, isCorrect: true },
        { text: `${num1} - ${addition} = -${num2}`, isCorrect: false },
        { text: `${num2} - ${num1} = ${subtraction2}`, isCorrect: false },
        { text: `${num1} - ${num2} = ${subtraction1}`, isCorrect: false }
      ],
      explanation: "This completes the addition and subtraction fact family."
    });

    // 2. Non-Belonging Operation
    generated.push({
      id: 'non_belonging_operation',
      type: 'non_belonging_operation',
      questionText: "Which math operation does NOT belong in the family of math facts you can create from these numbers?",
      numbersGiven: `Numbers: ${num1}, ${num2}, ${multiplication}`,
      relations: [
        `${num1} × ${num2} = ${multiplication}`,
        `${num2} × ${num1} = ${multiplication}`,
        `${multiplication} ÷ ${num1} = ${num2}`,
        `${multiplication} ÷ ${num2} = ${num1}`
      ],
      answers: [
        { text: `${multiplication} - ${num2} = ${multiplication - num2}`, isCorrect: true },
        { text: `${multiplication} ÷ ${num1} = ${num2}`, isCorrect: false },
        { text: `${num1} × ${num2} = ${multiplication}`, isCorrect: false },
        { text: `${multiplication} ÷ ${num2} = ${num1}`, isCorrect: false }
      ],
      explanation: `The numbers ${num1}, ${num2}, and ${multiplication} form a multiplication/division fact family. The subtraction operation introduces a new number that isn't part of the original fact family.`
    });

    // 3. Missing Number in Multiplication
    if (num2 !== 0) { // Prevent division by zero
      generated.push({
        id: 'missing_number_multiplication',
        type: 'missing_number_multiplication',
        questionText: "Find the missing number in the multiplication/division fact family:",
        relations: [
          `${num1} × ? = ${multiplication}`,
          `? × ${num1} = ${multiplication}`,
          `${multiplication} ÷ ${num1} = ?`
        ],
        answers: [
          { text: `${num2}`, isCorrect: true },
          { text: `${num1}`, isCorrect: false },
          { text: `${multiplication}`, isCorrect: false },
          { text: `${subtraction1}`, isCorrect: false }
        ],
        explanation: `In this multiplication/division fact family, the missing number is ${num2} because ${num1} × ${num2} = ${multiplication}, ${num2} × ${num1} = ${multiplication}, and ${multiplication} ÷ ${num1} = ${num2}.`
      });
    }

    // 4. Missing Number in Addition
    generated.push({
      id: 'missing_number_addition',
      type: 'missing_number_addition',
      questionText: "Find the missing number in the addition/subtraction fact family:",
      relations: [
        `? + ${num2} = ${addition}`,
        `${num1} + ? = ${addition}`,
        `${addition} - ${num2} = ?`
      ],
      answers: [
        { text: `${num1}`, isCorrect: true },
        { text: `${num2}`, isCorrect: false },
        { text: `${addition}`, isCorrect: false },
        { text: `${subtraction1}`, isCorrect: false }
      ],
      explanation: `In this addition/subtraction fact family, the missing number is ${num1} because ${num1} + ${num2} = ${addition}, ${num2} + ${num1} = ${addition}, and ${addition} - ${num2} = ${num1}.`
    });

    // Shuffle the questions to ensure randomness
    const shuffled = generated.sort(() => Math.random() - 0.5);
    setQuestions(shuffled);
  };

  // Effect to handle the timer for each question
  useEffect(() => {
    if (!quizStarted || gameOver || selectedAnswer !== null) return;

    const countdown = setInterval(() => {
      setTimeLeft(prev => {
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
  }, [currentQuestionIndex, selectedAnswer, gameOver, quizStarted]);

  // Function to handle timeout when user doesn't answer in time
  const handleTimeout = () => {
    setSelectedAnswer(-1); // Indicate timeout
    setIsCorrect(false);
    setScore(prev => ({ ...prev, total: prev.total + 1 }));
    playIncorrect(); // Play wrong sound
  };

  // Function to handle answer selection
  const handleAnswerClick = (index) => {
    if (!currentQuestion) {
      console.error("Current question is undefined.");
      return;
    }

    clearInterval(timer);
    const answer = currentQuestion.answers[index];
    setSelectedAnswer(index);
    setIsCorrect(answer.isCorrect);
    setScore(prev => ({
      correct: prev.correct + (answer.isCorrect ? 1 : 0),
      total: prev.total + 1
    }));

    // Play corresponding sound
    if (answer.isCorrect) {
      playCorrect();
    } else {
      playIncorrect();
    }
  };

  // Function to move to the next question or end the quiz
  const handleNextQuestion = () => {
    if (currentQuestionIndex === questions.length - 1) {
      setGameOver(true);
      playCompletion(); // Play completion sound
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setIsCorrect(null);
      setTimeLeft(TIME_LIMIT);
    }
  };

  // Function to calculate star ratings based on score
  const calculateStars = () => {
    if (score.total === 0) return 0;
    const percentage = (score.correct / score.total) * 100;
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    if (percentage >= 50) return 1;
    return 0;
  };

  // Function to render star icons
  const renderStars = (count) => {
    return [...Array(3)].map((_, i) => (
      <Star 
        key={i} 
        style={{ color: i < count ? '#FFD700' : '#D3D3D3' }} 
        size={32} 
      />
    ));
  };

  // Function to restart the quiz
  const handleRestart = () => {
    setSelectedNumbers([]);
    setQuizStarted(false);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setTimeLeft(TIME_LIMIT);
    setScore({ correct: 0, total: 0 });
    setGameOver(false);
    clearInterval(timer);
  };

  // JSX for Number Selector
  const renderNumberSelector = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const colors = [
      '#87CEEB', '#90EE90', '#FFA07A', '#DDA0DD', '#FFD700',
      '#5F9EA0', '#8A2BE2', '#FF6347', '#3CB371', '#BDB76B'
    ];

    return (
      <Card
        className='w-full'
        sx={{
          margin: 'auto',
          mt: 5,
          p: 1, // Reduced padding
          // borderRadius: '50%', // Make the card circular (commented out)
          boxShadow: 0,
          background: "#FBF5F3FF",
          overflow: 'hidden', // Hide overflow to maintain circular shape
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CardContent
          sx={{
            textAlign: 'center',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Opening Screen Mascot */}
          {/* <Box sx={{ width: 200, height: 200, mb: 2 }}>
            <Lottie
              animationData={openingMascotAnimation}
              loop={true}
              style={{ width: '100%', height: '100%' }}
            />
          </Box> */}

          <Typography variant="h6" component="div" gutterBottom>
            Select Two to Explore Math Facts
          </Typography>

          <Grid
            container
            spacing={1} // Reduced spacing from 2 to 1
            justifyContent="center"
            columns={5} // Five items per row
            sx={{ marginBottom: 5, marginTop: 5 }}
          >
            {numbers.map((number, index) => (
              <Grid item xs={1} key={number}>
                <Button
                  variant={selectedNumbers.includes(number) ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => {
                    handleNumberClick(number);
                    playHover(); // Play hover sound on click
                  }}
                  onMouseEnter={() => {
                    if (!selectedNumbers.includes(number)) {
                      playHover();
                    }
                  }}
                  sx={{
                    width: 80, // Fixed width for buttons
                    height: 80, // Fixed height for buttons
                    minWidth: 'auto',
                    padding: 5,
                    borderRadius: '80%', // Make buttons circular
                    fontSize: '1.5rem',
                    backgroundColor: selectedNumbers.includes(number) ? colors[index] : 'white',
                    color: selectedNumbers.includes(number) ? '#fff' : colors[index],
                    borderColor: colors[index],
                    transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out, transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                    '&:hover': {
                      backgroundColor: selectedNumbers.includes(number) ? colors[index] : '#F8F4F4FF',
                      color: selectedNumbers.includes(number) ? '#fff' : colors[index],
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

          <Typography variant="body2" gutterBottom>
            Selected: {selectedNumbers.join(', ') || 'None'}
          </Typography>

          <Box>
            <Button
              variant="contained"
              color="secondary"
              onClick={startQuiz}
              disabled={selectedNumbers.length !== 2}
              sx={{
                fontSize: '0.8rem',
                padding: '6px 12px',
                transition: 'background-color 0.3s ease-in-out, color 0.3s ease-in-out',
                '&:hover': {
                  backgroundColor: '#d32f2f', // Example hover color
                  color: '#fff',
                },
              }}
            >
              Start Quiz
            </Button>
          </Box>
        </CardContent>
      </Card>
    )};

  // JSX for Quiz Interface
  const renderQuiz = () => {
    if (questions.length === 0) {
      return (
        <Typography variant="h6" align="left">
          Loading questions...
        </Typography>
      );
    }

    if (gameOver) {
      const stars = calculateStars();
      return (
        <Card sx={{ maxWidth: 900, height: 500, margin: 'auto', position: 'relative', justifyContent: "center", alignContent: "center" }}>
          {/* Confetti Animation */}
          <Confetti width={width} height={height} recycle={false} numberOfPieces={300} />

          <CardContent sx={{ mt: 8 }}>

          {/* Success Mascot Animation */}
          <Box sx={{ position: "relative", width: 100, height: 100, top: -75, left: '50%', transform: 'translateX(-50%)' }}>
            <Lottie
              animationData={successMascotAnimation}
              loop={false}
              style={{ width: '100%', height: '100%' }}
            />
          </Box>
            <Typography variant="h5" component="div" gutterBottom align="center">
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
                Excellent work! You&apos;re a math facts master!
              </Typography>
            ) : stars === 2 ? (
              <Typography variant="body1" align="center" color="blue">
                Good job! Keep practicing to improve!
              </Typography>
            ) : stars === 1 ? (
              <Typography variant="body1" align="center" color="orange">
                Nice try! More practice will help you improve.
              </Typography>
            ) : (
              <Typography variant="body1" align="center" color="red">
                Keep practicing! You&apos;ll get better with time.
              </Typography>
            )}
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
          <LinearProgress variant="determinate" value={(timeLeft / TIME_LIMIT) * 100} sx={{ mb: 2 }} />
          
          {/* Question Text */}
          <Typography variant="h6" gutterBottom>
            {currentQuestion.questionText}
          </Typography>

          {/* Additional Information for Non-Belonging Operation */}
          {currentQuestion.type === 'non_belonging_operation' && (
            <>
              <Typography variant="body1" gutterBottom>
                {currentQuestion.numbersGiven}
              </Typography>
              <Box mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  These operations use the numbers:
                </Typography>
                {currentQuestion.relations.map((relation, index) => (
                  <Typography variant="body2" key={index}>
                    {relation}
                  </Typography>
                ))}
              </Box>
            </>
          )}

          {/* Display Relations for Other Question Types */}
          {currentQuestion.type !== 'non_belonging_operation' && (
            <Box mb={2} textAlign="left">
              {currentQuestion.relations.map((relation, index) => (
                <Typography variant="body2" key={index}>
                  {relation}
                </Typography>
              ))}
            </Box>
          )}

          {/* Arrange answer buttons in two rows with two columns each */}
          <Grid container spacing={2}>
            {currentQuestion.answers.map((answer, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => handleAnswerClick(index)}
                  disabled={selectedAnswer !== null}
                  /* Removed the onMouseEnter handler to eliminate hover sounds */
                  sx={{
                    backgroundColor: selectedAnswer === index 
                      ? (isCorrect ? '#c8e6c9' : '#ffcdd2') 
                      : 'inherit',
                    borderColor: selectedAnswer === index 
                      ? (isCorrect ? '#2e7d32' : '#c62828') 
                      : 'inherit',
                    color: selectedAnswer === index ? (isCorrect ? '#2e7d32' : '#c62828') : 'inherit',
                    '&:hover': {
                      backgroundColor: selectedAnswer === index 
                        ? (isCorrect ? '#a5d6a7' : '#ef9a9a') 
                        : '#f5f5f5',
                    }
                  }}
                >
                  {answer.text}
                </Button>
              </Grid>
            ))}
          </Grid>

          {/* Display Mascot for Correct or Incorrect Answer */}
          {selectedAnswer !== null && (
            <Box mt={2}>
              {/* Conditional Mascot Rendering */}
              <Box sx={{ width: 80, height: 80, mt: 1, mx: 'auto' }}>
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
              <Alert severity={isCorrect ? "success" : "error"}>
                <AlertTitle>{isCorrect ? "Correct!" : selectedAnswer === -1 ? "Time's up!" : "Incorrect"}</AlertTitle>
                <Typography variant="body2">
                  {selectedAnswer === -1 ? (
                    "You didn't select an answer in time."
                  ) : (
                    <>Correct answer: {currentQuestion.answers.find(a => a.isCorrect).text}</>
                  )}
                </Typography>
                <Typography variant="body2">
                  {currentQuestion.explanation}
                </Typography>
              </Alert>

              <Box textAlign="left" mt={2}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={handleNextQuestion}
                >
                  {currentQuestionIndex === questions.length - 1 ? 'See Results' : 'Next Question'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ py: 10, px: 4, md: { py: 14, px: 5 }, width: '100%' }}>
      {!quizStarted ? renderNumberSelector() : renderQuiz()}
    </Box>
  );
};

export default MathFactFamilyQuiz;
