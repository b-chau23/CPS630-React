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
$items = [];
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // Check if item is on sale
        $saleStatus = (int)($row['Sale_Status'] ?? 0);
        $salePrice = null;
        
        // If item is on sale, use the Sale_Price value
        if ($saleStatus === 1 && !empty($row['Sale_Price'])) {
            $salePrice = $row['Sale_Price'];
        }
        
        // rename the keys to match the interface in Shopping.tsx
        $items[] = [
            'id' => $row['Item_Id'],
            'name' => $row['Item_Name'],
            'price' => $row['Price'],
            'img' => $row['Item_Image'],
            'saleStatus' => $saleStatus,
            'salePrice' => $salePrice
        ];
    }
}

$conn->close();
echo json_encode($items);
?>