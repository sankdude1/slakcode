<?php
// Start the PHP session at the very top
session_start();

// Check if the user is NOT logged in, redirect them to the login page
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    header("Location: login.php");
    exit();
}

// If logged in, get the username from the session
$logged_in_username = htmlspecialchars($_SESSION['username']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Home</title>
    <link rel="stylesheet" href="home.css"> <link rel="stylesheet" href="form.css">
</head>
<body>
    <div class="container">
        <nav>
            <ul>
                <li><a href="home.php">Home</a></li>
                <li><a href="#">Games</a></li>
                <li><a href="index.html">Mainpage</a></li>
                <li><a href="create.html">Create</a></li>
                <li><a href="#">art tools</a></li>
                <li><a href="#">Play</a></li>
                <li><a href="#">HUB!</a></li>
                <li><a href="signup.php">Sign Up</a></li>
                <li><a href="login.php">Login</a></li> </ul>
        </nav>

        <h1>Welcome to the Home Page!</h1>
        <p>Hello, **<?php echo $logged_in_username; ?>**! You are logged in.</p>
        
        </div>
</body>
</html>
