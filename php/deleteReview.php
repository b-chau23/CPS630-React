<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For debugging, display
ini_set('display_errors', 1);

// For preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Initialize session
session_start();

// Check if the user is logged in
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['error' => 'You must be logged in to delete a review']);
    exit();
}

// Check if the user is an admin
$isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';

// If not an admin, reject the request
if (!$isAdmin) {
    echo json_encode(['error' => 'Only administrators can delete reviews']);
    exit();
}

// Check if review_id is provided
if (!isset($_POST['review_id'])) {
    echo json_encode(['error' => 'Missing review ID']);
    exit();
}

$review_id = $_POST['review_id'];

// Connect to the database
try {
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "cps630project";
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    
    // First, check if the Review table exists
    $tableCheckSql = "SHOW TABLES LIKE 'Review'";
    $tableCheckResult = $conn->query($tableCheckSql);
    
    if ($tableCheckResult->num_rows == 0) {
        echo json_encode(['error' => 'Review table does not exist']);
        exit();
    }
    
    // Check if the review exists
    $stmt = $conn->prepare("SELECT * FROM Review WHERE Review_Id = ?");
    $stmt->bind_param("i", $review_id);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        echo json_encode(['error' => 'Review not found']);
        exit();
    }
    
    // Delete the review
    $deleteStmt = $conn->prepare("DELETE FROM Review WHERE Review_Id = ?");
    $deleteStmt->bind_param("i", $review_id);
    
    if ($deleteStmt->execute()) {
        echo json_encode(['success' => 'Review deleted successfully']);
    } else {
        echo json_encode(['error' => 'Failed to delete review: ' . $conn->error]);
    }
    
} catch (Exception $e) {
    // Return error message
    echo json_encode(['error' => 'An error occurred: ' . $e->getMessage()]);
} finally {
    // Close the connection
    if (isset($conn)) {
        $conn->close();
    }
}
?> 