<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// For debugging, display errors
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

    // Get user id to delete
    $user_id = $_POST['User_Id'] ?? '';
    
    if (empty($user_id)) {
        throw new Exception("User ID is required");
    }
    
    // Prevent deleting the current user
    if (isset($_SESSION['user_id']) && $_SESSION['user_id'] == $user_id) {
        throw new Exception("You cannot delete your own account while logged in");
    }
    
    // Start a transaction to ensure data integrity
    $conn->begin_transaction();
    
    // Check if the user has associated orders
    $order_check = $conn->prepare("SELECT COUNT(*) as count FROM Orders WHERE User_Id = ?");
    $order_check->bind_param("i", $user_id);
    $order_check->execute();
    $result = $order_check->get_result();
    $order_count = $result->fetch_assoc()['count'];
    
    if ($order_count > 0) {
        // Delete associated orders first
        $delete_orders = $conn->prepare("DELETE FROM Orders WHERE User_Id = ?");
        $delete_orders->bind_param("i", $user_id);
        
        if (!$delete_orders->execute()) {
            throw new Exception("Failed to delete associated orders: " . $delete_orders->error);
        }
    }

    // Now delete the user
    $stmt = $conn->prepare("DELETE FROM User WHERE User_Id = ?");
    $stmt->bind_param("i", $user_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Failed to delete user: " . $stmt->error);
    }
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("User not found or already deleted");
    }
    
    // Commit the transaction
    $conn->commit();
    
    echo json_encode(["success" => "User deleted successfully"]);
    
} catch (Exception $e) {
    // Rollback the transaction in case of error
    if ($conn && $conn->ping()) {
        $conn->rollback();
    }
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
} finally {
    // Close the connection
    if ($conn) {
        $conn->close();
    }
}
?> 