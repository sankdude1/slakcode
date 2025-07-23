<?php
// --- 1. Database Connection ---
$servername = "localhost";
$username = "root";       // Your MariaDB username
$password = "";           // Your MariaDB password (empty by default for XAMPP)
$dbname = "blot_games_db"; // The name of the database you created

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// --- 2. Fetch Games from Database ---
$sql = "SELECT id, game_name, description FROM games ORDER BY upload_date DESC"; // Get all games, newest first
$result = $conn->query($sql);

?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HUB Home</title> <link rel="stylesheet" href="home.css">
</head>
<body>
    <div class="navbar">
        <a href="home.php">Home</a>
        <a href="#">Games</a>
        
        <a href="create.html">Create</a> <a href="blot.html">BLOT</a> <a href="signup.php">Sign Up</a>
        <a href="login.php">Login</a>
    </div>

    <div class="hub-header"> <h1>HUB</h1> </div>

    <div class="content-section pink">
        <h2>MAIN PAGE</h2>
        <p>Hello :D</p>
        <p>This is a very early version of this website!</p>
        <p>That's all for now!</p>
    </div>

    <div class="content-section blue">
        <h2>CREATE</h2>
        <p>uh create games? :D like uhm a platformer or an survival game</p>
    </div>

    <div class="content-section green">
        <h2>DESIGN</h2>
        <p>design ur games, and any of the pages you want with coding like css or using our art tools and options!</p>
    </div>

    <div class="content-section red">
        <h2>PLAY</h2>
        <p>Play games made by other users, or explore interactive creations!</p>
    </div>

    <div class="content-section uploaded-games-section orange">
        <h2>Uploaded Blot Games</h2>
        <?php
        if ($result->num_rows > 0) {
            // Output data of each row
            while($row = $result->fetch_assoc()) {
                echo "<div class='game-listing'>";
                echo "<h3>" . htmlspecialchars($row["game_name"]) . "</h3>";
                echo "<p>" . htmlspecialchars($row["description"]) . "</p>";
                // Later, we'll add a link to play the game
                // For now, this just displays the info
                echo "</div>";
            }
        } else {
            echo "<p>No games uploaded yet. Be the first to publish one from the Blot IDE!</p>";
        }
        ?>
    </div>

    <div class="content-section purple">
        <h2>DIFFERENTIATE</h2>
        <p>make games with all sorts of stuff from 3d to 2d, c+++ to block coding and more!</p>
    </div>

    <?php
    // --- Close Database Connection ---
    $conn->close();
    ?>
</body>
</html>