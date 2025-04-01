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

session_start();

// Debug session variables
error_log("SESSION data in addReview.php: " . print_r($_SESSION, true));

// Handle session variable inconsistency (user_id vs userId)
if (!isset($_SESSION['user_id']) && isset($_SESSION['userId'])) {
    $_SESSION['user_id'] = $_SESSION['userId'];
    error_log("Session variable synchronized: userId -> user_id");
}

// Check if all required fields are present
if (!isset($_POST['productId']) || !isset($_POST['rating']) || !isset($_POST['comment'])) {
    echo json_encode(['error' => 'Missing required fields']);
    exit();
}

$productId = $_POST['productId'];
$userId = $_SESSION['user_id'];
$username = $_SESSION['username'];
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
        // Create the Review table
        $createTableSql = "CREATE TABLE Review (
            Review_Id INT AUTO_INCREMENT PRIMARY KEY,
            Item_Id INT NOT NULL,
            User_Id INT NOT NULL,
            Username VARCHAR(255) NOT NULL,
            Rating INT NOT NULL,
            Comment TEXT NOT NULL,
            Created_At TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (Item_Id) REFERENCES Item(Item_Id) ON DELETE CASCADE,
            FOREIGN KEY (User_Id) REFERENCES User(User_Id) ON DELETE CASCADE
        )";
        
        if (!$conn->query($createTableSql)) {
            throw new Exception("Failed to create Review table: " . $conn->error);
        }
        
        error_log("Review table created");
    }
    
    // Check if product exists
    $checkProductSql = "SELECT * FROM Item WHERE Item_Id = ?";
    $checkProductStmt = $conn->prepare($checkProductSql);
    $checkProductStmt->bind_param("i", $productId);
    $checkProductStmt->execute();
    $productResult = $checkProductStmt->get_result();
    
    if ($productResult->num_rows === 0) {
        throw new Exception("Product not found");
    }
    
    // Check if user has already reviewed this product
    $checkReviewSql = "SELECT * FROM Review WHERE User_Id = ? AND Item_Id = ?";
    $checkReviewStmt = $conn->prepare($checkReviewSql);
    $checkReviewStmt->bind_param("ii", $userId, $productId);
    $checkReviewStmt->execute();
    $reviewResult = $checkReviewStmt->get_result();
    
    if ($reviewResult->num_rows > 0) {
        throw new Exception("You have already reviewed this product");
    }
    
    // Insert the review with an explicit created_at timestamp
    $currentDate = date('Y-m-d H:i:s');
    $insertSql = "INSERT INTO Review (Item_Id, User_Id, Username, Rating, Comment, Created_At) VALUES (?, ?, ?, ?, ?, ?)";
    $insertStmt = $conn->prepare($insertSql);
    $insertStmt->bind_param("iisiss", $productId, $userId, $_SESSION['username'], $rating, $comment, $currentDate);
    
    if (!$insertStmt->execute()) {
        throw new Exception("Failed to add review: " . $conn->error);
    }
    
    // Get the review ID and created_at timestamp
    $review_id = $conn->insert_id;
    $select_stmt = $conn->prepare("SELECT Created_At FROM Review WHERE Review_Id = ?");
    $select_stmt->bind_param("i", $review_id);
    $select_stmt->execute();
    $result = $select_stmt->get_result();
    $row = $result->fetch_assoc();
    $created_at = date('c', strtotime($row['Created_At']));
    
    echo json_encode([
        'success' => 'Review added successfully',
        'review' => [
            'id' => $review_id,
            'username' => $_SESSION['username'],
            'rating' => $rating,
            'comment' => $comment,
            'created_at' => $created_at,
            'user_id' => $userId
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