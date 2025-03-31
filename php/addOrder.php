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

    // Get required fields
    $date_issued = $_POST['Date_Issued'] ?? '';
    $date_received = $_POST['Date_Received'] ?? '';
    $total_price = $_POST['Total_Price'] ?? '';
    $payment_code = $_POST['Payment_Code'] ?? '';
    $user_id = $_POST['User_Id'] ?? '';
    $trip_id = $_POST['Trip_Id'] ?? '';
    $receipt_id = $_POST['Receipt_Id'] ?? '';

    // Validate required fields
    if (empty($date_issued) || empty($total_price) || empty($user_id)) {
        throw new Exception("Date Issued, Total Price, and User ID are required fields");
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

    // Get the maximum order_id from the table to increment
    $maxIdSql = "SELECT MAX(Order_Id) as max_id FROM Orders";
    $maxIdResult = $conn->query($maxIdSql);
    
    if (!$maxIdResult) {
        throw new Exception("Error getting max ID: " . $conn->error);
    }
    
    $row = $maxIdResult->fetch_assoc();
    $next_id = $row['max_id'] ? intval($row['max_id']) + 1 : 1;

    // Insert the new order with the incremented ID
    $sql = "INSERT INTO Orders (Order_Id, Date_Issued, Date_Received, Total_Price, Payment_Code, User_Id, Trip_Id, Receipt_Id) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("issdsiis", $next_id, $date_issued, $date_received, $total_price, $payment_code, $user_id, $trip_id, $receipt_id);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $conn->close();
    echo json_encode(["success" => "Order added successfully", "order_id" => $next_id]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in addOrder.php: " . $e->getMessage());
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 