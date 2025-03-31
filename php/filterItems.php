<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Credentials: true");
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

$itemType = $_POST['itemType'] ?? '';
$minPrice = $_POST['minPrice'] ?? '';
$maxPrice = $_POST['maxPrice'] ?? '';
$saleOnly = $_POST['saleOnly'] ?? '';

$sql = "SELECT * FROM Item WHERE 1"; // WHERE 1 is a placeholder to make adding conditions easier

$types = "";  // Parameter types for bind_param
$params = []; // Array to store parameter values

// Add itemType filter if set
if (!empty($itemType)) {
    $sql .= " AND Item_Type = ?";
    $types .= "s";  
    $params[] = $itemType;
}

// Add minPrice filter if set
if ($minPrice !== '') {
    $sql .= " AND Price >= ?";
    $types .= "d";  
    $params[] = $minPrice;
}

// Add maxPrice filter if set
if ($maxPrice !== '') {
    $sql .= " AND Price <= ?";
    $types .= "d";  
    $params[] = $maxPrice;
}

// Add onSale filter if set
if ($saleOnly !== '') {
    $sql .= " AND Sale_Status = ?";
    $types .= "i";  
    $params[] = $saleOnly;
}

$stmt = $conn->prepare($sql);

if ($params) { // Only bind if there are parameters
    $stmt->bind_param($types, ...$params);
}

$stmt->execute();
$result = $stmt->get_result();

$items = [];
// fetch results and store them in an array
if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        // rename the keys to match the interface in Shopping.tsx
        $items[] = [
            //cast id as it needs to be string for draggableId. not an issue in itemsData.php for some reason
            'id' => (string) $row['Item_Id'], 
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