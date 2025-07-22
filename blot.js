// blot.js

// 1. Get a reference to your Blot editor (the textarea)
const blotEditor = document.getElementById('blot-editor');

// 2. Get a reference to your Terminal/Commands area (where you'll show output)
const blotTerminal = document.getElementById('blot-terminal');

// Get a reference to the canvas and its 2D context
const blotCanvas = document.getElementById('blot-canvas');
const ctx = blotCanvas.getContext('2d');

// Set initial canvas dimensions
function resizeCanvas() {
    blotCanvas.width = blotCanvas.offsetWidth;
    blotCanvas.height = blotCanvas.offsetHeight; // CORRECTED: Now uses offsetHeight for height
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas(); // Initial call to set size

// Object to store Blot variables
const blotVariables = {};

// Function to add text to the terminal
function appendToTerminal(text, type = 'output') {
    const p = document.createElement('p');
    p.textContent = text;
    p.classList.add(type);
    blotTerminal.appendChild(p);
    blotTerminal.scrollTop = blotTerminal.scrollHeight; // Scroll to the bottom
}

// --- NEW: Helper function to create a delay (Promise-based) ---
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
// ---------------------------------------------------------------

// --- NEW: Asynchronous function to process a single Blot command line ---
async function processBlotCommand(line) {
    const originalLine = line.trim(); // Keep original line for display and specific parsing
    const normalizedLine = originalLine.toLowerCase(); // Use normalized for command matching
    if (!normalizedLine) return; // Skip empty lines

    const commandParts = normalizedLine.split(' ');
    const command = commandParts[0];
    const args = originalLine.substring(command.length).trim(); // Use original line for arguments

    // Only display input line if it's not the "run" command itself
    if (command !== 'run') {
        appendToTerminal(`> ${originalLine}`, 'input-line');
    }


    try {
        if (command === 'print-t') {
            if (args.length > 0) {
                appendToTerminal(args);
            } else {
                appendToTerminal("Error: 'print-t' command requires text to print. Usage: print-t Hello World", 'error-message');
            }
        } else if (command === 'clear') {
            blotTerminal.innerHTML = '';
            appendToTerminal("Terminal cleared.", 'system-message');
        } else if (command === 'link-greet') {
            appendToTerminal("!filing");
            appendToTerminal(">print-t hello"); // This specific line has print-t already
            appendToTerminal("Hello there!");
            appendToTerminal("Welcome to slakcodes BLOT editor!");
            appendToTerminal("For your first command, please put 'print-t hi'(without the '') hi as ur first line");
        } else if (command === 'let.this') {
            // Original line is needed for proper value extraction if it has mixed case or special chars
            const originalLineParts = originalLine.split(' ');
            if (originalLineParts.length >= 4 && originalLineParts[2] === '=') {
                const varName = originalLineParts[1];
                const varValue = originalLine.substring(originalLine.indexOf('=') + 1).trim(); // Use original line for value

                if (varName && varValue) {
                    blotVariables[varName] = varValue;
                    appendToTerminal(`Variable '${varName}' set to '${varValue}'.`);
                } else {
                    appendToTerminal("Error: 'let.this' command requires a variable name and a value. Usage: let.this myVar = value", 'error-message');
                }
            } else {
                appendToTerminal("Error: Invalid 'let.this' command syntax. Usage: let.this myVar = value", 'error-message');
            }
        } else if (command === '/dlet') {
            const varToDisplay = commandParts[1];
            if (varToDisplay) {
                if (blotVariables.hasOwnProperty(varToDisplay)) {
                    appendToTerminal(`Value of '${varToDisplay}': ${blotVariables[varToDisplay]}`);
                } else {
                    appendToTerminal(`Error: Variable '${varToDisplay}' not found.`, 'error-message');
                }
            } else {
                appendToTerminal("Error: '/dlet' command requires a variable name. Usage: /dlet myVar", 'error-message');
            }
        } else if (command === 'frame-fillwhole2d') {
            const colorArg = commandParts[1];
            if (colorArg) {
                ctx.fillStyle = colorArg;
                ctx.fillRect(0, 0, blotCanvas.width, blotCanvas.height);
                appendToTerminal(`Screen filled with color: ${colorArg}`);
            } else {
                appendToTerminal("Error: 'frame-fillwhole2d' requires a color. Usage: frame-fillwhole2d red OR frame-fillwhole2d #FF0000", 'error-message');
            }
        } else if (command === 'wait') {
            const delaySeconds = parseFloat(commandParts[1]);

            if (!isNaN(delaySeconds) && delaySeconds >= 0) {
                const delayMs = delaySeconds * 1000;
                appendToTerminal(`Waiting for ${delaySeconds} seconds...`, 'system-message');
                await delay(delayMs); // AWAITING THE DELAY HERE!
                appendToTerminal("Done waiting.", 'system-message');
            } else {
                appendToTerminal("Error: 'wait' command requires a positive number (in seconds). Usage: wait 2 OR wait 0.5", 'error-message');
            }
        } else if (command === 'run') {
            // The 'run' command itself doesn't do anything here directly,
            // its execution is handled by the keydown listener's decision logic.
            // This 'else if' block is primarily to prevent it from falling into 'Unknown command'.
        }
        else {
            appendToTerminal(`Error: Unknown command "${originalLine}"`, 'error-message'); // Use original 'line' for unknown
        }
    } catch (e) {
        appendToTerminal(`Runtime Error: ${e.message}`, 'error-message');
    }
}
// -------------------------------------------------------------------------

// --- NEW: Asynchronous function to execute ALL code in the editor ---
async function executeAllCode() {
    appendToTerminal("--- Running Blot Code ---", 'system-message');
    const allCode = blotEditor.value;
    const lines = allCode.split('\n');

    for (const line of lines) {
        await processBlotCommand(line); // AWAIT EACH COMMAND
    }
    appendToTerminal("--- Code Execution Finished ---", 'system-message');
}
// -----------------------------------------------------------------

// Listen for key presses in the editor
blotEditor.addEventListener('keydown', async function(event) { // ADD 'async' HERE
    // Check if Alt key is pressed AND the 'f' key is pressed
    if (event.key === 'f' && event.altKey) {
        event.preventDefault();

        const inputValue = blotEditor.value.trim();
        const lines = inputValue.split('\n');
        const lastLineContent = lines[lines.length - 1].trim(); // Get the last line content (trimmed)
        const lastLineCommand = lastLineContent.toLowerCase(); // Convert to lowercase for comparison

        if (lastLineCommand === 'run') { // If the last line is "run", execute all code
            await executeAllCode(); // AWAIT THE ENTIRE CODE EXECUTION
        } else { // Otherwise, just execute the last command typed
            await processBlotCommand(lastLineContent); // Execute the last line
        }
    }
});

// Initial message in the terminal
appendToTerminal("Blot IDE ready. Type commands and press ALT + F to execute the last line.", 'system-message');
appendToTerminal("Type 'run' on a new line and press ALT + F to execute ALL code.", 'system-message');
appendToTerminal("Try 'print-t Your Message', 'let.this myVar = 123', '/dlet myVar', 'frame-fillwhole2d blue', or 'wait 2'.", 'system-message');
appendToTerminal("You can also try 'clear' or 'link-greet'.", 'system-message');