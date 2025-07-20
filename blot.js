// blot.js  <-- Corrected this comment syntax

// 1. Get a reference to your Blot editor (the textarea)
const blotEditor = document.getElementById('blot-editor');

// 2. Get a reference to your Terminal/Commands area (where you'll show output)
const blotTerminal = document.getElementById('blot-terminal');

// Function to add text to the terminal
function appendToTerminal(text, type = 'output') {
    const p = document.createElement('p');
    p.textContent = text;
    p.classList.add(type);
    blotTerminal.appendChild(p);
    blotTerminal.scrollTop = blotTerminal.scrollHeight; // Scroll to the bottom
}

// Function to process a single command line (moved out for reusability)
function processCommand(commandLine) {
    const command = commandLine.toLowerCase().split(' ')[0]; // Get the first word as the command
    const args = commandLine.substring(command.length).trim(); // Get everything after the command

    if (command === 'print-t') {
        if (args.length > 0) {
            appendToTerminal(args);
        } else {
            appendToTerminal("Error: 'print-t' command requires text to print. Usage: print-t Hello World", 'error-message');
        }
    }
    else if (command === 'clear') {
        blotTerminal.innerHTML = ''; // Clears the terminal output
        appendToTerminal("Terminal cleared.", 'system-message');
    }
    else if (command === 'link-greet'){
        appendToTerminal("!filing");
        appendToTerminal(">print-t hello")
        appendToTerminal("Hello there!")
        appendToTerminal("Welcome to slakcodes BLOT editor!")
        appendToTerminal("For your first command, please put 'print-t hi'(without the '') hi as ur first line")
    }
    else {
        // If no recognized command
        appendToTerminal(`Error: Unknown command "${commandLine}"`, 'error-message');
    }
}

// 3. Listen for key presses in the editor
blotEditor.addEventListener('keydown', function(event) {
    // Enter key: Simply adds a new line in the textarea
    if (event.key === 'Enter') {
        // No event.preventDefault() here, so the default Enter behavior (new line) will happen.
        // Command processing is now handled by the Tab key.
    }
    // Tab key: Runs all code in the editor
    else if (event.key === 'Tab') {
        event.preventDefault(); // Prevent default tab behavior (like indenting or changing focus)

        const editorContent = blotEditor.value.trim(); // Get ALL content from the editor
        const lines = editorContent.split('\n'); // Split into individual lines

        appendToTerminal("--- Running Code ---", 'system-message');

        // Process each line as a command
        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (trimmedLine) { // Only process non-empty lines
                appendToTerminal(`> ${trimmedLine}`, 'input-line'); // Show the line being processed in terminal
                processCommand(trimmedLine); // Call the function to process this line as a command
            }
        });

        appendToTerminal("--- Code Finished ---", 'system-message');
    }
});

// Initial message in the terminal
appendToTerminal("Blot IDE ready. Type your commands on separate lines, then press TAB to run.", 'system-message');
appendToTerminal("Try: 'print-t Hello Blot'", 'system-message');
appendToTerminal("Then type 'clear' on a new line, and press TAB again to run both!", 'system-message'); // <-- THIS IS THE CORRECTED LINE
appendToTerminal("New to Blot? Try typing 'link-greet' to get started!", 'system-message'); // Add this line