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


$result = $conn->query("SELECT Item_Id, Item_Name, Price, Item_Image, Sale_Status, Sale_Price FROM item");

// fetch results and store them in an array
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // rename the keys to match the interface in Shopping.tsx
        $items[] = [
            'id' => $row['Item_Id'],
            'name' => $row['Item_Name'],
            'price' => $row['Price'],
            'img' => $row['Item_Image'],
            'saleStatus' => $row['Sale_Status'],
            'salePrice' => $row['Sale_Price']
        ];
    }
}

$conn->close();
echo json_encode($items);
?>