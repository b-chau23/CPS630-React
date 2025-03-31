<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// For debugging
ini_set('display_errors', 1);

session_start();

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "cps630project";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

try {
    // Check if user is admin
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        echo json_encode(["error" => "Unauthorized access"]);
        exit;
    }

    // Check if Item table exists
    $tableCheckSql = "SHOW TABLES LIKE 'Item'";
    $tableCheckResult = $conn->query($tableCheckSql);
    
    if ($tableCheckResult->num_rows == 0) {
        // Return empty array if table doesn't exist yet
        echo json_encode([]);
        exit;
    }

    $sql = "SELECT Item_Id, Item_Name, Item_Type, Price, Item_Image, Made_In, Department_Code, Stock_Quantity FROM Item";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $items = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $items[] = [
                'Item_Id' => $row['Item_Id'],
                'Item_Name' => $row['Item_Name'],
                'Item_Type' => $row['Item_Type'],
                'Price' => $row['Price'],
                'Item_Image' => $row['Item_Image'],
                'Made_In' => $row['Made_In'] ?? '',
                'Department_Code' => $row['Department_Code'] ?? '',
                'Stock_Quantity' => $row['Stock_Quantity'] ?? '0'
            ];
        }
    }

    $conn->close();
    echo json_encode($items);
} catch (Exception $e) {
    // Log the error
    error_log("Error in getItems.php: " . $e->getMessage());
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 