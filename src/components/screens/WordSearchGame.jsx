import { Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import HannahsStats from '../Stats/HannahsStats'; // Ensure correct import path

// Define word lists for each level
const wordLists = [
    // Level 1: Simple words
    [
        'CAT', 'DOG', 'SUN', 'MOON', 'STAR', 'TREE', 'BOOK', 'CAR', 'HOUSE', 'BIRD', 'FISH', 'RAIN'
    ],
    // Level 2: U.S. States
    [
        'TENNESSEE', 'NEBRASKA', 'ALABAMA', 'FLORIDA', 'VERMONT',
        'NEVADA', 'ALASKA', 'HAWAII', 'KANSAS', 'TEXAS', 'MAINE', 'OHIO'
    ],
    // Level 3: U.S. Presidents
    [
        'WASHINGTON', 'ADAMS', 'JEFFERSON', 'LINCOLN', 'ROOSEVELT',
        'TRUMAN', 'KENNEDY', 'NIXON', 'FORD', 'REAGAN', 'CLINTON', 'OBAMA'
    ],
    // Level 4: Languages
    [
        'ENGLISH', 'SPANISH', 'FRENCH', 'GERMAN', 'CHINESE',
        'JAPANESE', 'RUSSIAN', 'ITALIAN', 'PORTUGUESE', 'ARABIC', 'KOREAN', 'HINDI'
    ],
    // Level 5: Countries
    [
        'CANADA', 'BRAZIL', 'GERMANY', 'FRANCE', 'INDIA',
        'CHINA', 'JAPAN', 'KENYA', 'EGYPT', 'AUSTRALIA', 'ITALY', 'NORWAY'
    ],
    // Level 6: Outer Space
    [
        'ASTEROID', 'BLACKHOLE', 'NEBULA', 'GALAXY', 'COMET',
        'COSMOS', 'ECLIPSE', 'METEOR', 'SATELLITE', 'PLANET', 'ORBIT', 'SOLAR'
    ]
];

// Define category names for each level
const categories = [
    "Simple Words",
    "U.S. States",
    "U.S. Presidents",
    "Languages",
    "Countries",
    "Outer Space"
];

// Function to generate the grid with placed words
const generateGrid = (size, words) => {
    const grid = Array(size).fill().map(() => Array(size).fill(''));
    const placedWords = [];

    // Place each word in the grid
    words.forEach(word => {
        let placed = false;
        let attempts = 0;

        while (!placed && attempts < 100) {
            // Randomly choose direction: horizontal, vertical, or diagonal
            const direction = Math.random() < 0.33 ? 'horizontal' : Math.random() < 0.5 ? 'vertical' : 'diagonal';
            const row = Math.floor(Math.random() * size);
            const col = Math.floor(Math.random() * size);

            if (canPlaceWord(grid, word, row, col, direction)) {
                placeWord(grid, word, row, col, direction);
                placed = true;
                placedWords.push(word);
            }
            attempts++;
        }
    });

    // Fill remaining empty cells with random letters
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            if (grid[i][j] === '') {
                grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
            }
        }
    }

    return grid;
};

// Function to check if a word can be placed at a given position and direction
const canPlaceWord = (grid, word, row, col, direction) => {
    const size = grid.length;
    const len = word.length;

    // Define movement based on direction
    let deltaRow = 0, deltaCol = 0;
    if (direction === 'horizontal') {
        deltaRow = 0;
        deltaCol = 1;
    } else if (direction === 'vertical') {
        deltaRow = 1;
        deltaCol = 0;
    } else if (direction === 'diagonal') {
        deltaRow = 1;
        deltaCol = 1;
    }

    // Calculate ending position
    const endRow = row + deltaRow * (len - 1);
    const endCol = col + deltaCol * (len - 1);

    // Check if the word fits within the grid boundaries
    if (endRow >= size || endCol >= size || endRow < 0 || endCol < 0) return false;

    // Check for overlapping letters
    for (let i = 0; i < len; i++) {
        const currentRow = row + deltaRow * i;
        const currentCol = col + deltaCol * i;
        if (grid[currentRow][currentCol] !== '' && grid[currentRow][currentCol] !== word[i]) {
            return false;
        }
    }

    return true;
};

// Function to place a word in the grid
const placeWord = (grid, word, row, col, direction) => {
    const len = word.length;

    // Define movement based on direction
    let deltaRow = 0, deltaCol = 0;
    if (direction === 'horizontal') {
        deltaRow = 0;
        deltaCol = 1;
    } else if (direction === 'vertical') {
        deltaRow = 1;
        deltaCol = 0;
    } else if (direction === 'diagonal') {
        deltaRow = 1;
        deltaCol = 1;
    }

    // Place each letter of the word in the grid
    for (let i = 0; i < len; i++) {
        const currentRow = row + deltaRow * i;
        const currentCol = col + deltaCol * i;
        grid[currentRow][currentCol] = word[i];
    }
};

const WordSearchGame = () => {
    const [grid, setGrid] = useState([]);
    const [selection, setSelection] = useState({ start: null, end: null });
    const [foundWords, setFoundWords] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(60); // 60-second timer
    const [submitted, setSubmitted] = useState(false);
    const [starsEarned, setStarsEarned] = useState([0, 0, 0, 0, 0, 0]); // Stars for each level
    const [currentLevel, setCurrentLevel] = useState(1); // Levels 1 to 6
    const [gameOver, setGameOver] = useState(false); // Track game completion
    const [gameStarted, setGameStarted] = useState(false); // Track if the game has started
    const [paused, setPaused] = useState(false); // Track if the game is paused
    const totalLevels = 6;

    // Get current word list and category based on level
    const currentWordList = wordLists[currentLevel - 1];
    const currentCategory = categories[currentLevel - 1];

    // Initialize grid and reset states when level changes
    useEffect(() => {
        if (gameStarted && currentLevel <= totalLevels) {
            setGrid(generateGrid(10, currentWordList));
            setFoundWords([]); // Reset found words
            setTimeLeft(60); // Reset timer
            setSubmitted(false); // Reset submission state
            setSelection({ start: null, end: null }); // Reset selection
            setPaused(false); // Ensure game is not paused
        }
    }, [currentLevel, currentWordList, gameStarted]);

    // Timer logic
    useEffect(() => {
        if (gameStarted && timeLeft > 0 && !submitted && currentLevel <= totalLevels && !gameOver && !paused) {
            const timerId = setTimeout(() => {
                setTimeLeft(timeLeft - 1);
            }, 1000);
            return () => clearTimeout(timerId);
        } else if (timeLeft === 0 && !submitted && currentLevel <= totalLevels && !gameOver && gameStarted) {
            handleSubmit();
        }
    }, [timeLeft, submitted, currentLevel, totalLevels, gameOver, paused, gameStarted]);

    // Handle mouse down event
    const handleMouseDown = (row, col) => {
        if (submitted || currentLevel > totalLevels || gameOver || paused || !gameStarted) return;
        setIsSelecting(true);
        setSelection({ start: { row, col }, end: { row, col } });
    };

    // Handle mouse enter event
    const handleMouseEnter = (row, col) => {
        if (isSelecting && !submitted && currentLevel <= totalLevels && !gameOver && !paused && gameStarted) {
            setSelection(prev => ({ ...prev, end: { row, col } }));
        }
    };

    // Handle mouse up event
    const handleMouseUp = () => {
        if (submitted || currentLevel > totalLevels || gameOver || paused || !gameStarted) return;
        setIsSelecting(false);
        checkSelection();
    };

    // Check the selected word
    const checkSelection = () => {
        const { start, end } = selection;
        if (!start || !end) return;

        let word = '';
        let positions = [];

        // Determine direction based on start and end points
        const deltaRow = end.row - start.row;
        const deltaCol = end.col - start.col;

        const absDeltaRow = Math.abs(deltaRow);
        const absDeltaCol = Math.abs(deltaCol);

        // Determine the direction
        let direction = null;
        if (deltaRow === 0 && deltaCol !== 0) {
            direction = 'horizontal';
        } else if (deltaCol === 0 && deltaRow !== 0) {
            direction = 'vertical';
        } else if (absDeltaRow === absDeltaCol && deltaRow !== 0 && deltaCol !== 0) {
            direction = 'diagonal';
        } else {
            // Invalid direction
            setSelection({ start: null, end: null });
            return;
        }

        const len = Math.max(absDeltaRow, absDeltaCol) + 1;

        // Extract the word from grid
        word = '';
        positions = [];
        for (let i = 0; i < len; i++) {
            const currentRow = start.row + (direction === 'vertical' || direction === 'diagonal' ? (deltaRow > 0 ? i : -i) : 0);
            const currentCol = start.col + (direction === 'horizontal' || direction === 'diagonal' ? (deltaCol > 0 ? i : -i) : 0);
            if (currentRow < 0 || currentRow >= grid.length || currentCol < 0 || currentCol >= grid.length) {
                // Out of bounds
                setSelection({ start: null, end: null });
                return;
            }
            word += grid[currentRow][currentCol];
            positions.push({ row: currentRow, col: currentCol });
        }

        // Check for reverse word
        const reverseWord = word.split('').reverse().join('');

        let actualWord = word;
        let actualPositions = [...positions];

        if (currentWordList.includes(word)) {
            // Word is found as is
        } else if (currentWordList.includes(reverseWord)) {
            // Reverse positions and word
            actualWord = reverseWord;
            actualPositions = actualPositions.reverse();
        } else {
            // Not a valid word
            setSelection({ start: null, end: null });
            return;
        }

        // Check if already found
        const alreadyFound = foundWords.some(foundWord => foundWord.word === actualWord);
        if (!alreadyFound) {
            setFoundWords(prev => [...prev, { word: actualWord, positions: actualPositions }]);
        }

        setSelection({ start: null, end: null });

        // Auto-submit if all words are found
        if (foundWords.length + 1 >= currentWordList.length) {
            handleSubmit();
        }
    };

    // Determine if a cell is currently selected
    const isCurrentlySelected = (row, col) => {
        const { start, end } = selection;
        if (!start || !end) return false;

        const deltaRow = end.row - start.row;
        const deltaCol = end.col - start.col;

        const absDeltaRow = Math.abs(deltaRow);
        const absDeltaCol = Math.abs(deltaCol);

        let direction = null;
        if (deltaRow === 0 && deltaCol !== 0) {
            direction = 'horizontal';
        } else if (deltaCol === 0 && deltaRow !== 0) {
            direction = 'vertical';
        } else if (absDeltaRow === absDeltaCol && deltaRow !== 0 && deltaCol !== 0) {
            direction = 'diagonal';
        } else {
            return false;
        }

        const len = Math.max(absDeltaRow, absDeltaCol) + 1;

        for (let i = 0; i < len; i++) {
            const currentRow = start.row + (direction === 'vertical' || direction === 'diagonal' ? (deltaRow > 0 ? i : -i) : 0);
            const currentCol = start.col + (direction === 'horizontal' || direction === 'diagonal' ? (deltaCol > 0 ? i : -i) : 0);
            if (currentRow === row && currentCol === col) {
                return true;
            }
        }

        return false;
    };

    // Determine if a cell is part of any found word
    const isFound = (row, col) => {
        return foundWords.some(foundWord =>
            foundWord.positions &&
            foundWord.positions.some(pos => pos.row === row && pos.col === col)
        );
    };

    // Calculate average stars earned across all levels
    const calculateAverageStars = () => {
        const totalStars = starsEarned.reduce((acc, star) => acc + star, 0);
        const average = starsEarned.length > 0 ? (totalStars / starsEarned.length) : 0;
        return average.toFixed(1); // One decimal place
    };

    // Handle submission of the current level
    const handleSubmit = () => {
        let stars = 0;
        const totalWords = currentWordList.length;

        if (foundWords.length === 0) {
            stars = 0;
        } else if (foundWords.length >= 1 && foundWords.length < 3) {
            stars = 1;
        } else if (foundWords.length >= 3 && foundWords.length < 5) {
            stars = 2;
        } else if (foundWords.length >= 5 && foundWords.length < 7) {
            stars = 3;
        } else if (foundWords.length >= 7 && foundWords.length < totalWords) {
            stars = 4;
        } else if (foundWords.length === totalWords) {
            stars = 5;
        }

        const updatedStarsEarned = [...starsEarned];
        updatedStarsEarned[currentLevel - 1] = stars;
        setStarsEarned(updatedStarsEarned);
        setSubmitted(true);

        // Advance to the next level or end the game after a short delay
        setTimeout(() => {
            if (currentLevel < totalLevels) {
                setCurrentLevel(currentLevel + 1);
            } else {
                setGameOver(true);
            }
        }, 2000); // 2-second delay before moving to next level or ending the game
    };

    // Handle game restart
    const handleRestart = () => {
        setStarsEarned([0, 0, 0, 0, 0, 0]);
        setCurrentLevel(1);
        setGameOver(false);
        setGameStarted(false);
        setFoundWords([]);
    };

    // Handle game start
    const handleStartGame = () => {
        setGameStarted(true);
    };

    // Handle pause and resume
    const togglePause = () => {
        setPaused(!paused);
    };

    return (
        <div className='py-8'>
            <header className="bg-white text-black text-center text-3xl font-bold">
                Princess Puzzle
            </header>
            <div className="flex flex-col items-center justify-center mt-4">
                {!gameStarted && !gameOver && (
                    <div className="flex flex-col items-center">
                        <Typography variant="h5" className="mb-4 underline pb-3">
                            Welcome to the Word Search Game!
                        </Typography>
                        <button
                            onClick={handleStartGame}
                            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                        >
                            Start Game
                        </button>
                    </div>
                )}
                {gameStarted && !gameOver && (
                    <>
                        <Typography variant="body3" className="mb-2 py-5 italic font-semibold text-center max-w-lg">
                            Hi Hannah 👋 words appear UP, DOWN, BACKWARDS, and DIAGONALLY. Use your cursor to highlight the search word in the puzzle.
                        </Typography>
                        {/* Dynamic Title Based on Current Category */}
                        <Typography variant="h5" className="mb-4 underline pb-3">
                            {currentCategory} Word Search
                        </Typography>
                        <div className="flex w-full max-w-6xl">
                            {/* Left Column: Word Search Grid and Words List */}
                            <div className="flex flex-col items-center w-1/2">
                                {/* Header for Level and Words Found */}
                                <div className="w-full flex justify-between mb-2">
                                    <Typography variant="h6">Level {currentLevel}</Typography>
                                    <Typography variant="h6">Words Found: {foundWords.length} / {currentWordList.length}</Typography>
                                </div>
                                {/* Container for Grid and Words List */}
                                <div className="flex flex-row mt-4">
                                    {/* Word Search Grid */}
                                    <div className="grid grid-cols-10 gap-1">
                                        {grid.map((row, rowIndex) =>
                                            row.map((cell, colIndex) => (
                                                <div
                                                    key={`${rowIndex}-${colIndex}`}
                                                    className={`w-8 h-8 p-0 text-sm font-bold flex items-center justify-center cursor-pointer select-none border border-gray-300 ${
                                                        isFound(rowIndex, colIndex)
                                                            ? 'bg-green-300'
                                                            : isCurrentlySelected(rowIndex, colIndex)
                                                                ? 'bg-yellow-300'
                                                                : 'bg-gray-100'
                                                    }`}
                                                    onMouseDown={() => handleMouseDown(rowIndex, colIndex)}
                                                    onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                                                    onMouseUp={handleMouseUp}
                                                >
                                                    {cell}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                    {/* Words List */}
                                    <div className="ml-6">
                                        {currentWordList.map((word, index) => (
                                            <p
                                                key={index}
                                                className={`text-lg ${foundWords.some(fw => fw.word === word) ? 'line-through text-green-500' : ''}`}
                                            >
                                                {word}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Right Column: Hannah's Stats */}
                            <div className="w-1/2 flex justify-center">
                                <HannahsStats starsEarned={starsEarned} />
                            </div>
                        </div>
                        {/* Controls: Submit, Pause/Resume */}
                        <div className="mt-4 flex flex-col items-center">
                            <div className="flex space-x-4">
                                <button
                                    onClick={handleSubmit}
                                    disabled={submitted || currentLevel > totalLevels}
                                    className={`px-6 py-2 text-white rounded ${submitted || currentLevel > totalLevels
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-500 hover:bg-blue-600'
                                        }`}
                                >
                                    Submit
                                </button>
                                <button
                                    onClick={togglePause}
                                    disabled={currentLevel > totalLevels}
                                    className={`px-6 py-2 text-white rounded ${currentLevel > totalLevels
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : paused
                                            ? 'bg-green-500 hover:bg-green-600'
                                            : 'bg-yellow-500 hover:bg-yellow-600'
                                        }`}
                                >
                                    {paused ? 'Resume' : 'Pause'}
                                </button>
                            </div>
                            <div className="mt-2 text-lg">
                                Time Left: {timeLeft} second{timeLeft !== 1 ? 's' : ''}
                            </div>
                            {submitted && currentLevel <= totalLevels && (
                                <div className="mt-2 text-xl font-semibold text-green-600">
                                    Level {currentLevel} Submitted!
                                </div>
                            )}
                        </div>
                    </>
                )}
                {/* Final Completion Message */}
                {gameOver && (
                    <div className="mt-4 flex flex-col items-center">
                        <div className="text-xl font-semibold text-purple-600">
                            Awesome work! Continue working on a new skill.
                        </div>
                        {/* Average Rating */}
                        <div className="mt-2 flex items-center">
                            <Typography variant="h6" className="mr-2">
                                Average Rating:
                            </Typography>
                            <div className="flex">
                                {[...Array(5)].map((_, i) => {
                                    const average = parseFloat(calculateAverageStars());
                                    if (i < Math.round(average)) {
                                        return (
                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.372 2.45a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.372-2.45a1 1 0 00-1.175 0l-3.372 2.45c-.785.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.44 9.397c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.97z" />
                                            </svg>
                                        );
                                    } else {
                                        return (
                                            <svg key={i} xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.372 2.45a1 1 0 00-.364 1.118l1.286 3.97c.3.921-.755 1.688-1.54 1.118l-3.372-2.45a1 1 0 00-1.175 0l-3.372 2.45c-.785.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.44 9.397c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.97z" />
                                            </svg>
                                        );
                                    }
                                })}
                            </div>
                            <span className="ml-2 text-lg">{calculateAverageStars()} / 5</span>
                        </div>
                        {/* Restart Button */}
                        <button
                            onClick={handleRestart}
                            className="mt-4 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded"
                        >
                            Restart Game
                        </button>
                    </div>
                )}
            </div>
            {/* Optional Image or Additional Content */}
            <div className="flex flex-col items-center justify-center">
                <img
                    src="https://static.tildacdn.com/tild3139-6533-4334-a264-363537326339/city-1252643_640.jpg"
                    alt="Colorful cityscape illustration"
                    className="mt-4 max-w-full h-auto w-6xl"
                />
            </div>
        </div>
    );
};

export default WordSearchGame;
