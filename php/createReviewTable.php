<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// For debugging, display errors
ini_set('display_errors', 1);

// Connect to the database
try {
    // Database connection parameters
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "cps630project";
    
    $conn = new mysqli($servername, $username, $password, $dbname);
    
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    // Check if the Review table already exists
    $tableCheckSql = "SHOW TABLES LIKE 'Review'";
    $tableCheckResult = $conn->query($tableCheckSql);
    
    if ($tableCheckResult->num_rows === 0) {
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
        
        echo json_encode(['success' => 'Review table created successfully']);
    } else {
        echo json_encode(['info' => 'Review table already exists']);
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