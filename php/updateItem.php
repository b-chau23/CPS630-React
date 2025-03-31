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

    // Get form data
    $item_id = $_POST['Item_Id'] ?? '';
    $item_name = $_POST['Item_Name'] ?? '';
    $item_type = $_POST['Item_Type'] ?? '';
    $price = $_POST['Price'] ?? '';
    $item_image = $_POST['Item_Image'] ?? '';
    $made_in = $_POST['Made_In'] ?? '';
    $department_code = $_POST['Department_Code'] ?? '';
    $stock_quantity = $_POST['Stock_Quantity'] ?? 0;

    // Validate input
    if (empty($item_id) || empty($item_name) || empty($item_type) || empty($price) || empty($item_image)) {
        throw new Exception("All fields are required");
    }

    // Prepare and execute SQL statement
    $sql = "UPDATE Item SET Item_Name = ?, Item_Type = ?, Price = ?, Item_Image = ?, 
            Made_In = ?, Department_Code = ?, Stock_Quantity = ? WHERE Item_Id = ?";
            
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("ssdsssii", $item_name, $item_type, $price, $item_image, $made_in, $department_code, $stock_quantity, $item_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("No records were updated");
    }
    
    $conn->close();
    echo json_encode(["success" => "Item updated successfully"]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in updateItem.php: " . $e->getMessage());
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 