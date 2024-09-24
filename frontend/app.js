document.addEventListener('DOMContentLoaded', () => {
    const gridContainer = document.getElementById('sudoku-grid');

    // Create a 9x9 grid
 

    // Function to handle checkbox selection
    const checking = function () {
        const checkboxes = document.querySelectorAll('.checkbox');
        let lastChecked = null;

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    // If there was a previously checked checkbox, uncheck it
                    if (lastChecked && lastChecked !== checkbox) {
                        lastChecked.checked = false; // Uncheck the last checked checkbox
                    }
                    lastChecked = checkbox; // Update the last checked checkbox
                } else {
                    // If the current checkbox is unchecked, reset lastChecked
                    if (lastChecked === checkbox) {
                        lastChecked = null;
                    }
                }
            });
        });
    };
    checking();

    document.getElementById('gen').addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.checkbox');
        const CheckedCheckBoxes = Array.from(checkboxes).filter(cb => cb.checked);
        
        if (CheckedCheckBoxes.length > 0) {
            const checkedIds = CheckedCheckBoxes.map(cb => cb.nextSibling.textContent.trim()).join(', ');
            console.log(`Checked: ${checkedIds}`);
            fetchPuzzle(checkedIds);
        } else {
            alert('Select the difficulty level!');
        }
    });

    // Fetch the puzzle from the server
    async function fetchPuzzle(difficulty) {
        try {
            const response = await fetch(`http://localhost:5000/generate?difficulty=${difficulty}`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const puzzle = await response.json();
            populateGrid(puzzle);
        } catch (error) {
            console.error('Error fetching puzzle:', error);
        }
    }

    // Populate the Sudoku grid with the fetched puzzle
    function populateGrid(puzzle) {
        gridContainer.innerHTML = ''; // Clear previous grid
        puzzle.forEach((row, rowIndex) => {
            row.forEach((value, colIndex) => {
                const cell = document.createElement('input');
                cell.type = 'text';
                cell.maxLength = 1; // Limit input to one digit
                cell.classList.add('cell');
                if (value) {
                    cell.value = value;
                    cell.disabled = true; // Disable cells that are pre-filled
                }
                gridContainer.appendChild(cell);
            });
        });
    }
});
