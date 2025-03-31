<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST");
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

// Check if user is admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    echo json_encode(["error" => "Unauthorized access"]);
    exit;
}

// Get item ID
$itemId = $_POST['Item_Id'] ?? '';

// Validate input
if (empty($itemId)) {
    echo json_encode(["error" => "Item ID is required"]);
    exit;
}

// Prepare and execute SQL statement
$stmt = $conn->prepare("DELETE FROM Item WHERE Item_Id = ?");
$stmt->bind_param("i", $itemId);

if ($stmt->execute()) {
    echo json_encode(["success" => true, "message" => "Item deleted successfully"]);
} else {
    echo json_encode(["error" => "Error deleting item: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?> 