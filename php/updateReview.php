<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For debugging, display errors
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
    echo json_encode(['error' => 'You must be logged in to update a review']);
    exit();
}

// Check if the user is an admin
$isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';

// Check if all required fields are present
if (!isset($_POST['review_id']) || !isset($_POST['rating']) || !isset($_POST['comment'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$review_id = $_POST['review_id'];
$rating = $_POST['rating'];
$comment = $_POST['comment'];

// Validate rating
if (!is_numeric($rating) || $rating < 1 || $rating > 5) {
    echo json_encode(['error' => 'Rating must be between 1 and 5']);
    exit();
}

// Validate comment
if (empty(trim($comment))) {
    echo json_encode(['error' => 'Comment cannot be empty']);
    exit();
}

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
    
    $review = $result->fetch_assoc();
    
    // Check if the current user is authorized to update this review
    // Allow admins to update any review
    if (!$isAdmin && $review['User_Id'] != $_SESSION['user_id']) {
        echo json_encode(['error' => 'You are not authorized to update this review']);
        exit();
    }
    
    // Update the review
    $updateStmt = $conn->prepare("UPDATE Review SET Rating = ?, Comment = ? WHERE Review_Id = ?");
    $updateStmt->bind_param("isi", $rating, $comment, $review_id);
    
    if (!$updateStmt->execute()) {
        throw new Exception("Failed to update review: " . $updateStmt->error);
    }
    
    // Check if the review has a valid date
    $checkDateSql = "SELECT Created_At FROM Review WHERE Review_Id = ? AND (Created_At = '0000-00-00 00:00:00' OR Created_At IS NULL)";
    $checkDateStmt = $conn->prepare($checkDateSql);
    $checkDateStmt->bind_param("i", $review_id);
    $checkDateStmt->execute();
    $dateResult = $checkDateStmt->get_result();
    
    // If the date is invalid (zero or null), update it with the current timestamp
    if ($dateResult->num_rows > 0) {
        $currentDate = date('Y-m-d H:i:s');
        $updateDateSql = "UPDATE Review SET Created_At = ? WHERE Review_Id = ?";
        $updateDateStmt = $conn->prepare($updateDateSql);
        $updateDateStmt->bind_param("si", $currentDate, $review_id);
        $updateDateStmt->execute();
    }
    
    // Get the updated review's created_at timestamp
    $select_stmt = $conn->prepare("SELECT Created_At FROM Review WHERE Review_Id = ?");
    $select_stmt->bind_param("i", $review_id);
    $select_stmt->execute();
    $result = $select_stmt->get_result();
    $row = $result->fetch_assoc();
    $created_at = date('c', strtotime($row['Created_At']));
    
    echo json_encode([
        'success' => 'Review updated successfully',
        'review' => [
            'id' => $review_id,
            'username' => $review['Username'],
            'rating' => $rating,
            'comment' => $comment,
            'created_at' => $created_at,
            'user_id' => $review['User_Id']
        ]
    ]);
    
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