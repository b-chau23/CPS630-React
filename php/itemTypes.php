<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");

$servername = "localhost";
$username = "root";
$password = "";
$dbname = "cps630project";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

$result = $conn->query("SELECT DISTINCT Item_Type FROM item");
$itemTypes = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $itemTypes[] = $row['Item_Type'];
    }
}
$conn->close();
echo json_encode($itemTypes);
?>