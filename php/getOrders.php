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

    // Check if Orders table exists
    $tableCheckSql = "SHOW TABLES LIKE 'Orders'";
    $tableCheckResult = $conn->query($tableCheckSql);
    
    if ($tableCheckResult->num_rows == 0) {
        // Return empty array if table doesn't exist yet
        echo json_encode([]);
        exit;
    }

    $sql = "SELECT Order_Id, Date_Issued, Date_Received, Total_Price, Payment_Code, User_Id, Trip_Id, Receipt_Id FROM Orders";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $orders = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = [
                'Order_Id' => $row['Order_Id'],
                'Date_Issued' => $row['Date_Issued'],
                'Date_Received' => $row['Date_Received'],
                'Total_Price' => $row['Total_Price'],
                'Payment_Code' => $row['Payment_Code'],
                'User_Id' => $row['User_Id'],
                'Trip_Id' => $row['Trip_Id'],
                'Receipt_Id' => $row['Receipt_Id']
            ];
        }
    }

    $conn->close();
    echo json_encode($orders);
} catch (Exception $e) {
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 