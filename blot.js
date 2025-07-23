

// blot.js

// 1. Get a reference to your Blot editor (the textarea)
const blotEditor = document.getElementById('blot-editor');
// 2. Get a reference to your Terminal/Commands area (where you'll show output)
const blotTerminal = document.getElementById('blot-terminal');

// 3. Get references to your menu items
const saveTxtMenuItem = document.getElementById('saveTxtMenuItem');
const uploadMenuItem = document.getElementById('uploadMenuItem');
const loadMenuItem = document.getElementById('loadMenuItem');
const blotFileInput = document.getElementById('blotFileInput'); // Reference to the hidden file input

// A global variable to keep track of what triggered the file input
let fileActionType = ''; // Can be 'upload' or 'load'

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

// Function to process a single Blot command line
function processBlotCommand(line) {
    const originalLine = line.trim();
    const normalizedLine = originalLine.toLowerCase();
    if (!normalizedLine) return; // Skip empty lines

    const commandParts = normalizedLine.split(' ');
    const command = commandParts[0];
    const args = originalLine.substring(command.length).trim(); // Use original line for arguments

    // Always display the input line as it's processed
    appendToTerminal(`> ${originalLine}`, 'input-line');

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
            appendToTerminal(">print-t hello");
            appendToTerminal("Hello there!");
            appendToTerminal("Welcome to slakcodes BLOT editor!");
            appendToTerminal("For your first command, please put 'print-t hi'(without the '') hi as ur first line");
        } else if (command === 'let.this') {
            const originalLineParts = originalLine.split(' ');
            if (originalLineParts.length >= 4 && originalLineParts[2] === '=') {
                const varName = originalLineParts[1];
                const varValue = originalLine.substring(originalLine.indexOf('=') + 1).trim();

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
        } else {
            appendToTerminal(`Error: Unknown command "${originalLine}"`, 'error-message');
        }
    } catch (e) {
        appendToTerminal(`Runtime Error: ${e.message}`, 'error-message');
    }
}

// Function to execute ALL code in the editor
function executeAllCode() {
    appendToTerminal("--- Running Blot Code ---", 'system-message');
    const allCode = blotEditor.value;
    const lines = allCode.split('\n');

    for (const line of lines) {
        processBlotCommand(line);
    }
    appendToTerminal("--- Code Execution Finished ---", 'system-message');
}

// Function to handle "Save txt" (Save As) functionality
function saveAsTxtFile() {
    const codeContent = blotEditor.value; // Get content from the editor
    const blob = new Blob([codeContent], { type: 'text/plain;charset=utf-8' }); // Create a Blob
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    const a = document.createElement('a'); // Create a temporary link element
    a.href = url; // Set the link's href to the Blob URL
    a.download = 'my_blot_code.txt'; // Set the default download filename
    document.body.appendChild(a); // Append the link to the body (needed for Firefox)
    a.click(); // Programmatically click the link to trigger download
    document.body.removeChild(a); // Remove the link
    URL.revokeObjectURL(url); // Clean up the Blob URL

    appendToTerminal("Code saved as 'my_blot_code.txt'.", 'system-message');
}

// NEW FUNCTION: Handles sending the file to the PHP server
async function uploadGameToServer(file, gameName, gameDescription) {
    const formData = new FormData();
    formData.append('gameCodeFile', file); // 'gameCodeFile' is the name PHP expects ($_FILES['gameCodeFile'])
    formData.append('gameName', gameName); // Add game name to form data
    formData.append('gameDescription', gameDescription); // Add game description to form data

    try {
        const response = await fetch('upload.php', { // Ensure this path is correct for your server
            method: 'POST',
            body: formData,
        });

        const result = await response.json(); // PHP returns JSON

        if (response.ok) { // Check if HTTP status is 2xx
            if (result.success) {
                appendToTerminal(`Upload successful! ${result.message}`, 'system-message');
                appendToTerminal(`Your game is at: ${result.fileUrl}`, 'system-message');
                console.log('Uploaded game URL:', result.fileUrl);
            } else {
                appendToTerminal(`Upload failed: ${result.message}`, 'error-message');
                console.error('Upload error:', result.message);
            }
        } else {
            appendToTerminal(`Server error during upload: HTTP ${response.status} ${response.statusText}`, 'error-message');
            console.error('Server error response:', result); // Log the server's response even if not successful
        }

    } catch (error) {
        appendToTerminal(`Network error during upload: ${error.message}`, 'error-message');
        console.error('Network error:', error);
    }
}


// MODIFIED: Function to handle file selection for Upload OR Load
function handleFileSelect(event) {
    const files = event.target.files;
    if (files.length === 0) {
        appendToTerminal("No file selected.", 'system-message');
        event.target.value = ''; // Clear the file input value
        return;
    }

    const file = files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const fileContent = e.target.result;

        if (fileActionType === 'upload') {
            appendToTerminal(`Preparing to upload '${file.name}'...`, 'system-message');

            // Prompt for game name and description
            const gameName = prompt("Please enter a name for your game:");
            if (!gameName) {
                appendToTerminal("Upload cancelled: Game name is required.", 'error-message');
                event.target.value = ''; // Clear input
                return;
            }

            const gameDescription = prompt(`Please enter a short description for '${gameName}':`);
            // Description can be empty, so no check here

            // Call the upload function with the file, name, and description
            uploadGameToServer(file, gameName, gameDescription);
            event.target.value = ''; // Clear the file input value
        } else if (fileActionType === 'load') {
            blotEditor.value = fileContent; // Load content into the editor
            appendToTerminal(`Loaded '${file.name}' into the editor.`, 'system-message');
            event.target.value = ''; // Clear the file input value
        }
    };

    reader.onerror = function(e) {
        appendToTerminal(`Error reading file: ${e.message}`, 'error-message');
        event.target.value = ''; // Clear input on error too
    };

    reader.readAsText(file); // Read the file as plain text
}


// --- Event Listeners ---

// Listen for key presses in the editor (Alt + F)
blotEditor.addEventListener('keydown', function(event) {
    if (event.key === 'f' && event.altKey) {
        event.preventDefault();
        executeAllCode();
    }
});

// Add event listener for "Save txt" menu item
if (saveTxtMenuItem) {
    saveTxtMenuItem.addEventListener('click', saveAsTxtFile);
} else {
    console.error("Save txt menu item not found. Check your HTML structure or selector.");
}

// Add event listener for "Upload" menu item
if (uploadMenuItem) {
    uploadMenuItem.addEventListener('click', () => {
        fileActionType = 'upload'; // Set action type
        blotFileInput.click(); // Programmatically click the hidden file input
    });
} else {
    console.error("Upload menu item not found. Check your HTML structure or selector.");
}

// Add event listener for "Load" menu item
if (loadMenuItem) {
    loadMenuItem.addEventListener('click', () => {
        fileActionType = 'load'; // Set action type
        blotFileInput.click(); // Programmatically click the hidden file input
    });
} else {
    console.error("Load menu item not found. Check your HTML structure or selector.");
}

// Add event listener for when a file is selected in the hidden input
if (blotFileInput) {
    blotFileInput.addEventListener('change', handleFileSelect);
} else {
    console.error("Hidden file input not found. Check your HTML structure or ID.");
}


// Initial message in the terminal
appendToTerminal("Blot IDE ready. Type commands and press ALT + F to execute all code.", 'system-message');
appendToTerminal("Try 'print-t Your Message', 'let.this myVar = 123', or '/dlet myVar'.", 'system-message');
appendToTerminal("You can also try 'clear' or 'link-greet'.", 'system-message');