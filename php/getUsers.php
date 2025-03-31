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

    $sql = "SELECT User_Id, Username, Name, Email, Role, Phone, Address FROM User";
    $result = $conn->query($sql);

    if (!$result) {
        throw new Exception("Query failed: " . $conn->error);
    }

    $users = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $users[] = [
                'User_Id' => $row['User_Id'],
                'Username' => $row['Username'],
                'Name' => $row['Name'],
                'Email' => $row['Email'],
                'Role' => $row['Role'],
                'Phone' => $row['Phone'],
                'Address' => $row['Address']
            ];
        }
    }

    $conn->close();
    echo json_encode($users);
} catch (Exception $e) {
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 