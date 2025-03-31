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

// Debug - Log the incoming request
// no debug logging

// Check if product ID is provided
if (!isset($_POST['productId'])) {
    echo json_encode(['error' => 'Product ID is required']);
    exit();
}

$productId = $_POST['productId'];

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
        
        echo json_encode([]);
        exit();
    }
    
    // Get reviews for the specified product
    $stmt = $conn->prepare("SELECT Review_Id as id, User_Id as user_id, Username as username, Rating as rating, Comment as comment, Created_At as created_at
                           FROM Review
                           WHERE Item_Id = ?
                           ORDER BY Created_At DESC");
    $stmt->bind_param("i", $productId);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $reviews = [];
    while ($row = $result->fetch_assoc()) {
        // Handle zero dates by using the current time as a fallback
        $created_at_value = $row['created_at'];
        if ($created_at_value == '0000-00-00 00:00:00' || $created_at_value === null) {
            // Use current time as fallback
            $created_at = date('c');
            
            // Also update the database with this value
            $updateStmt = $conn->prepare("UPDATE Review SET Created_At = ? WHERE Review_Id = ?");
            $currentDate = date('Y-m-d H:i:s');
            $updateStmt->bind_param("si", $currentDate, $row['id']);
            $updateStmt->execute();
        } else {
            // Format the date using ISO 8601 format for better JavaScript compatibility
            $created_at = date('c', strtotime($created_at_value));
        }
        
        $reviews[] = [
            'id' => $row['id'],
            'username' => $row['username'],
            'rating' => $row['rating'],
            'comment' => $row['comment'],
            'created_at' => $created_at,
            'user_id' => $row['user_id']
        ];
    }
    
    echo json_encode($reviews);
    
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