<?php
header('Content-Type: application/json'); // Respond with JSON

// --- 1. Database Connection ---
$servername = "localhost";
$username = "root";       // Your MariaDB username, usually 'root' for XAMPP
$password = "";           // Your MariaDB password, usually empty for XAMPP
$dbname = "blot_games_db"; // The name of the database you created

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
    exit;
}

// --- 2. Define Upload Directory ---
$uploadDir = __DIR__ . '/uploaded_games/';

// Check if the directory exists, if not, try to create it
if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0777, true)) { // 0777 for full permissions, true for recursive
        echo json_encode(['success' => false, 'message' => 'Failed to create upload directory. Check permissions.']);
        $conn->close();
        exit;
    }
}

// --- 3. Get Game Metadata from POST Request ---
$gameName = $_POST['gameName'] ?? '';
$gameDescription = $_POST['gameDescription'] ?? '';

// Basic validation for gameName
if (empty($gameName)) {
    echo json_encode(['success' => false, 'message' => 'Game name is required.']);
    $conn->close();
    exit;
}
// Santize inputs using real_escape_string for basic protection (prepared statements below add more)
$gameName = $conn->real_escape_string($gameName);
$gameDescription = $conn->real_escape_string($gameDescription);


// --- 4. Handle File Upload ---
if (!isset($_FILES['gameCodeFile']) || $_FILES['gameCodeFile']['error'] !== UPLOAD_ERR_OK) {
    $phpFileUploadErrors = array(
        UPLOAD_ERR_OK         => 'There is no error, the file uploaded with success.',
        UPLOAD_ERR_INI_SIZE   => 'The uploaded file exceeds the upload_max_filesize directive in php.ini.',
        UPLOAD_ERR_FORM_SIZE  => 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form.',
        UPLOAD_ERR_PARTIAL    => 'The uploaded file was only partially uploaded.',
        UPLOAD_ERR_NO_FILE    => 'No file was uploaded.',
        UPLOAD_ERR_NO_TMP_DIR => 'Missing a temporary folder.',
        UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk.',
        UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload.',
    );
    $errorMessage = 'Upload error: ' . ($phpFileUploadErrors[$_FILES['gameCodeFile']['error']] ?? 'Unknown error');
    echo json_encode(['success' => false, 'message' => $errorMessage]);
    $conn->close();
    exit;
}

$file = $_FILES['gameCodeFile'];
$fileName = basename($file['name']); // Get original filename
$fileTmpPath = $file['tmp_name'];
$fileSize = $file['size'];

if ($fileSize > 5000000) { // Max 5MB, adjust as needed
    echo json_encode(['success' => false, 'message' => 'File size exceeds limit (5MB).']);
    $conn->close();
    exit;
}

// Generate a unique filename
$uniqueFileName = uniqid('blot_game_', true) . '_' . preg_replace('/[^a-zA-Z0-9_\-\.]/', '', $fileName);
$destPath = $uploadDir . $uniqueFileName;

if (move_uploaded_file($fileTmpPath, $destPath)) {
    // File successfully moved
    $protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? 'https' : 'http';
    $host = $_SERVER['HTTP_HOST'];
    $scriptDir = dirname($_SERVER['PHP_SELF']);
    $fileUrl = $protocol . '://' . $host . $scriptDir . '/uploaded_games/' . $uniqueFileName;

    // --- 5. Insert Game Data into Database ---
    // Placeholder for uploader_id (will be 0 for now as we don't have user sessions here)
    $uploader_id = 0; // Default to 0, or NULL, or a specific anonymous ID

    $sql = "INSERT INTO games (game_name, file_name, description, uploader_id) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);

    // Check if prepare() succeeded
    if ($stmt === false) {
        // If preparing the statement fails, output error and close connection
        echo json_encode(['success' => false, 'message' => 'SQL prepare failed: ' . $conn->error]);
        // Consider deleting the file if database operation failed
        unlink($destPath); // Remove the uploaded file if DB insert won't happen
        $conn->close();
        exit;
    }

    $stmt->bind_param("sssi", $gameName, $uniqueFileName, $gameDescription, $uploader_id); // 'sssi' for string, string, string, integer

    if ($stmt->execute()) {
        echo json_encode([
            'success' => true,
            'message' => 'Game uploaded and saved to database successfully!',
            'fileName' => $uniqueFileName,
            'fileUrl' => $fileUrl
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to save game data to database: ' . $stmt->error]);
        // Delete the file if database insert failed
        unlink($destPath);
    }

    $stmt->close();

} else {
    // Failed to move file
    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file. Check directory permissions or file system space.']);
}

$conn->close(); // Close database connection
?>