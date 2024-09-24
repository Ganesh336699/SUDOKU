const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(cors({
    origin: 'http://127.0.0.1:3000', // Allow requests from the frontend's origin
}));
app.use(express.json());

// Helper function to check if placing a number is valid
function isValid(grid, row, col, num) {
    for (let i = 0; i < 9; i++) {
        if (grid[row][i] === num || grid[i][col] === num) return false;
        if (grid[3 * Math.floor(row / 3) + Math.floor(i / 3)][3 * Math.floor(col / 3) + (i % 3)] === num) return false;
    }
    return true;
}

// Function to generate a full, valid Sudoku grid
function generateFullSudoku() {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0)); //creating 2d matrix

    // Helper function to fill the grid using backtracking
    function fillGrid(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    const nums = shuffleArray([...Array(9).keys()].map((n) => n + 1));
                    for (let num of nums) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (fillGrid(grid)) return true;
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    // Helper function to shuffle an array (Fisher-Yates algorithm)
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    fillGrid(grid);
    return grid;
}

// Function to remove numbers from the grid based on difficulty
function removeNumbers(grid, difficulty) {
    let attempts;
    switch (difficulty) {
        case 'easy':
            attempts = 30; // Few numbers removed
            break;
        case 'medium':
            attempts = 40; // Moderate numbers removed
            break;
        case 'hard':
            attempts = 50; // Most numbers removed
            break;
        default:
            attempts = 40;
    }

    while (attempts > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (grid[row][col] !== 0) {
            const backup = grid[row][col];
            grid[row][col] = 0;

            if (!hasUniqueSolution(JSON.parse(JSON.stringify(grid)))) {
                grid[row][col] = backup; // Restore if it doesn't have a unique solution
            } else {
                attempts--;
            }
        }
    }
    return grid;
}

// Function to check if a grid has a unique solution
function hasUniqueSolution(grid) {
    let solutionCount = 0;

    function solve(grid) {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (grid[row][col] === 0) {
                    for (let num = 1; num <= 9; num++) {
                        if (isValid(grid, row, col, num)) {
                            grid[row][col] = num;
                            if (solve(grid)) solutionCount++;
                            if (solutionCount > 1) return false; // Stop if more than one solution
                            grid[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve(grid);
    return solutionCount === 1;
}

// Root route for the server
app.get('/', (req, res) => {
    res.send('Welcome to the Sudoku Puzzle Generator API!'); // Message for the root URL
});

// API endpoint to get Sudoku based on difficulty
app.get('/generate', (req, res) => {
    const { difficulty } = req.query;

    if (!['easy', 'medium', 'hard'].includes(difficulty)) {
        return res.status(400).json({ error: 'Invalid difficulty level' });
    }

    try {
        const fullGrid = generateFullSudoku();
        const puzzle = removeNumbers(fullGrid, difficulty);
        res.json(puzzle);
    } catch (error) {
        console.error('Error generating puzzle:', error); // Log error to the console
        res.status(500).json({ error: 'Internal Server Error' }); // Send a response with a 500 status
    }
});

app.listen(port, () => {
    console.log(`Sudoku server running at http://localhost:${port}`);
});
