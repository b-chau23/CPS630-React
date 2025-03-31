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

    // Get required fields
    $item_name = $_POST['Item_Name'] ?? '';
    $item_type = $_POST['Item_Type'] ?? '';
    $price = $_POST['Price'] ?? '';
    $item_image = $_POST['Item_Image'] ?? '';
    $made_in = $_POST['Made_In'] ?? '';
    $department_code = $_POST['Department_Code'] ?? '';
    $stock_quantity = $_POST['Stock_Quantity'] ?? 0;

    // Validate required fields
    if (empty($item_name) || empty($item_type) || empty($price) || empty($item_image)) {
        throw new Exception("All fields are required");
    }

    // Get the maximum item_id from the table to increment
    $maxIdSql = "SELECT MAX(Item_Id) as max_id FROM Item";
    $maxIdResult = $conn->query($maxIdSql);
    
    if (!$maxIdResult) {
        throw new Exception("Error getting max ID: " . $conn->error);
    }
    
    $row = $maxIdResult->fetch_assoc();
    $next_id = $row['max_id'] ? intval($row['max_id']) + 1 : 1;

    // Insert the new item with the incremented ID
    $sql = "INSERT INTO Item (Item_Id, Item_Name, Item_Type, Price, Item_Image, Made_In, Department_Code, Stock_Quantity) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("issdsssi", $next_id, $item_name, $item_type, $price, $item_image, $made_in, $department_code, $stock_quantity);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $conn->close();
    echo json_encode(["success" => "Item added successfully", "item_id" => $next_id]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in addItem.php: " . $e->getMessage());
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 