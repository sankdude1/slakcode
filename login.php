<?php
// Start a PHP session (MUST be at the very top of the file before any HTML output)
session_start();

// Database connection details
$servername = "localhost"; // Usually "localhost" for XAMPP
$db_username = "root";     // Default XAMPP MySQL username
$db_password = "";         // Default XAMPP MySQL password (usually empty)
$dbname = "slakcode_db";   // Your database name

// Initialize variables for form data and messages
$username = "";
$error_message = "";

// Check if the form was submitted using the POST method
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get the data from the form
    $username_input = htmlspecialchars(trim($_POST['username']));
    $password_input = htmlspecialchars($_POST['password']);

    // Basic validation
    if (empty($username_input) || empty($password_input)) {
        $error_message = "Username and password cannot be empty.";
    } else {
        // Create database connection
        $conn = new mysqli($servername, $db_username, $db_password, $dbname);

        // Check connection
        if ($conn->connect_error) {
            $error_message = "Connection failed: " . $conn->connect_error;
        } else {
            // Prepare and bind SQL statement to select user
            $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
            $stmt->bind_param("s", $username_input); // "s" means one string parameter
            $stmt->execute();
            $result = $stmt->get_result(); // Get the result set

            if ($result->num_rows === 1) {
                // User found, fetch the row
                $user = $result->fetch_assoc();

                // Verify the password using password_verify()
                if (password_verify($password_input, $user['password'])) {
                    // Password is correct, set session variables to log in the user
                    $_SESSION['user_id'] = $user['id'];
                    $_SESSION['username'] = $user['username'];
                    $_SESSION['logged_in'] = true;

                    // Redirect to home.php on successful login
                    header("Location: home.php"); // <--- THIS IS SET TO home.php
                    exit();
                } else {
                    // Password does not match
                    $error_message = "Invalid username or password.";
                }
            } else {
                // User not found
                $error_message = "Invalid username or password.";
            }

            $stmt->close();
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
    <title>Login</title>
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
    </style>
</head>
<body>
    <div class="login-container">
        <h2>Login</h2>

        <?php
        // Display error message if set
        if (!empty($error_message)) {
            echo '<p class="error-message">' . $error_message . '</p>';
        }
        ?>

        <form action="login.php" method="POST"> <div class="form-group">
                <label for="username">Username:</label>
                <input type="text" id="username" name="username" value="<?php echo htmlspecialchars($username); ?>" required>
            </div>
            <div class="form-group">
                <label for="password">Password:</label>
                <input type="password" id="password" name="password" required>
            </div>
            <button type="submit">Login</button>
        </form>
        <p>Don't have an account? <a href="signup.php">Sign Up</a></p>
    </div>
</body>
</html>