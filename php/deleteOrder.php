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
        throw new Exception("Unauthorized access");
    }

    // Get order id to delete
    $order_id = $_POST['Order_Id'] ?? '';
    
    if (empty($order_id)) {
        throw new Exception("Order ID is required");
    }
    
    // Start a transaction to ensure data integrity
    $conn->begin_transaction();
    
    // Delete the order
    $stmt = $conn->prepare("DELETE FROM Orders WHERE Order_Id = ?");
    $stmt->bind_param("i", $order_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to delete order: " . $stmt->error);
    }
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("Order not found or already deleted");
    }
    
    // Commit the transaction
    $conn->commit();
    
    echo json_encode(["success" => "Order deleted successfully"]);
    
} catch (Exception $e) {
    // Rollback the transaction in case of error
    if ($conn && $conn->ping()) {
        $conn->rollback();
    }
    
    // Log the error and return it
    error_log("Error in deleteOrder.php: " . $e->getMessage());
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    // Close the connection
    if ($conn) {
        $conn->close();
    }
}
?> 