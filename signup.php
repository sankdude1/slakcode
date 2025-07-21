<?php
// Start a PHP session (MUST be at the very top of the file before any HTML output)
session_start();

// Database connection details
$servername = "localhost"; // Usually "localhost" for XAMPP
$db_username = "root";     // Default XAMPP MySQL username
$db_password = "";         // Default XAMPP MySQL password (usually empty)
$dbname = "slakcode_db";   // Your database name

// Initialize variables for form data
$username = "";
$password = "";
$error_message = "";
$success_message = "";

// Check if the form was submitted using the POST method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the data from the form
    // Use htmlspecialchars to prevent XSS attacks when displaying user input
    $username = htmlspecialchars(trim($_POST['username']));
    $password = htmlspecialchars($_POST['password']);

    // Basic validation
    if (empty($username) || empty($password)) {
        $error_message = "Username and password cannot be empty.";
    } else {
        // Create database connection
        $conn = new mysqli($servername, $db_username, $db_password, $dbname);

        // Check connection
        if ($conn->connect_error) {
            $error_message = "Connection failed: " . $conn->connect_error;
        } else {
            // Check if username already exists
            $stmt_check = $conn->prepare("SELECT id FROM users WHERE username = ?");
            $stmt_check->bind_param("s", $username);
            $stmt_check->execute();
            $stmt_check->store_result();

            if ($stmt_check->num_rows > 0) {
                $error_message = "Username already taken. Please choose another.";
            } else {
                // Hash the password securely
                // PASSWORD_DEFAULT is the recommended algorithm (currently bcrypt)
                $hashed_password = password_hash($password, PASSWORD_DEFAULT);

                // Prepare and bind SQL statement for inserting data
                // Using prepared statements prevents SQL injection
                $stmt = $conn->prepare("INSERT INTO users (username, password) VALUES (?, ?)");
                $stmt->bind_param("ss", $username, $hashed_password); // "ss" means two string parameters

                // Execute the statement
                if ($stmt->execute()) {
                    $success_message = "Registration successful! You can now log in.";
                    // Clear form fields on success
                    $username = "";
                    $password = "";
                } else {
                    $error_message = "Error: " . $stmt->error;
                }
                $stmt->close();
            }
            $stmt_check->close();
            $conn->close(); // Close database connection
        }
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up</title>
    <link rel="stylesheet" href="form.css">
    <style>
        /* Basic styling for messages, you can integrate this into form.css */
        .error-message {
            color: red;
            background-color: #ffe0e0;
            border: 1px solid red;
            padding: 8px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
        .success-message {
            color: green;
            background-color: #e0ffe0;
            border: 1px solid green;
            padding: 8px;
            margin-bottom: 15px;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="signup-container">
        <h2>Sign Up</h2>

        <?php
        // Display messages
        if (!empty($error_message)) {
            echo '<p class="error-message">' . $error_message . '</p>';
        }
        if (!empty($success_message)) {
            echo '<p class="success-message">' . $success_message . '</p>';
        }
        ?>

        <form action="signup.php" method="POST"> <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" value="<?php echo htmlspecialchars($username); ?>" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Register</button>
        </form>
    </div>
</body>
</html>
