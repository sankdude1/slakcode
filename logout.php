<?php
// Start the session (important to access session variables)
session_start();

// Unset all of the session variables
$_SESSION = array();

// Destroy the session (deletes the session file on the server)
session_destroy();

// Redirect to the login page or homepage after logout
header("Location: index.html"); // You can change this to home.php if you prefer
exit();
?>