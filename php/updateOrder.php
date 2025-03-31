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

    // Get form data
    $order_id = $_POST['Order_Id'] ?? '';
    $date_issued = $_POST['Date_Issued'] ?? '';
    $date_received = $_POST['Date_Received'] ?? '';
    $total_price = $_POST['Total_Price'] ?? '';
    $payment_code = $_POST['Payment_Code'] ?? '';
    $user_id = $_POST['User_Id'] ?? '';
    $trip_id = $_POST['Trip_Id'] ?? '';
    $receipt_id = $_POST['Receipt_Id'] ?? '';

    // Validate input
    if (empty($order_id) || empty($date_issued) || empty($total_price) || empty($user_id)) {
        throw new Exception("Order ID, Date Issued, Total Price, and User ID are required");
    }

    // Validate user exists
    $check_user = $conn->prepare("SELECT COUNT(*) as count FROM User WHERE User_Id = ?");
    $check_user->bind_param("i", $user_id);
    $check_user->execute();
    $result = $check_user->get_result();
    $user_exists = $result->fetch_assoc()['count'] > 0;
    
    if (!$user_exists) {
        throw new Exception("User ID does not exist");
    }

    // Update the order
    $sql = "UPDATE Orders SET Date_Issued = ?, Date_Received = ?, Total_Price = ?, 
            Payment_Code = ?, User_Id = ?, Trip_Id = ?, Receipt_Id = ? WHERE Order_Id = ?";
            
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("ssdsisii", $date_issued, $date_received, $total_price, $payment_code, $user_id, $trip_id, $receipt_id, $order_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("No changes were made or order not found");
    }
    
    $conn->close();
    echo json_encode(["success" => "Order updated successfully"]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in updateOrder.php: " . $e->getMessage());
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 