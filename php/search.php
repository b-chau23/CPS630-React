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

// Get search parameters
$searchTerm = $_POST['searchTerm'] ?? '';
$searchType = $_POST['searchType'] ?? 'products';
$fetchAll = isset($_POST['fetchAll']) && $_POST['fetchAll'] === 'true';

// Different search based on type
switch ($searchType) {
    case 'products':
        if ($fetchAll) {
            // Fetch all products without filtering
            $sql = "SELECT * FROM Item";
            $stmt = $conn->prepare($sql);
        } else {
            // Search products by name or type
            $sql = "SELECT * FROM Item WHERE Item_Name LIKE ? OR Item_Type LIKE ?";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                echo json_encode(["error" => "Search query preparation failed: " . $conn->error]);
                exit;
            }
            
            $searchPattern = "%{$searchTerm}%";
            $stmt->bind_param("ss", $searchPattern, $searchPattern);
        }
        break;
        
    case 'orders':
        // Only allow order search for logged-in users
        if (!isset($_SESSION['username'])) {
            echo json_encode(["error" => "You must be logged in to search orders"]);
            exit;
        }
        
        // Get user_id from session
        if (!isset($_SESSION['user_id'])) {
            echo json_encode(["error" => "User ID not found in session"]);
            exit;
        }
        
        $user_id = $_SESSION['user_id'];
        $isAdmin = isset($_SESSION['role']) && $_SESSION['role'] === 'admin';
        
        if ($fetchAll) {
            if ($isAdmin) {
                // Admins can see all orders
                $sql = "SELECT * FROM Orders";
                $stmt = $conn->prepare($sql);
            } else {
                // Regular users only see their own orders
                $sql = "SELECT * FROM Orders WHERE User_Id = ?";
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("i", $user_id);
            }
        } else {
            // Filtered search with search term
            if (is_numeric($searchTerm)) {
                // Search by order ID
                if ($isAdmin) {
                    $sql = "SELECT * FROM Orders WHERE Order_Id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("i", $searchTerm);
                } else {
                    $sql = "SELECT * FROM Orders WHERE User_Id = ? AND Order_Id = ?";
                    $stmt = $conn->prepare($sql);
                    $stmt->bind_param("ii", $user_id, $searchTerm);
                }
            } else {
                // Search by dates
                if ($isAdmin) {
                    $sql = "SELECT * FROM Orders WHERE Date_Issued LIKE ? OR Date_Received LIKE ?";
                    $stmt = $conn->prepare($sql);
                    $searchPattern = "%{$searchTerm}%";
                    $stmt->bind_param("ss", $searchPattern, $searchPattern);
                } else {
                    $sql = "SELECT * FROM Orders WHERE User_Id = ? AND 
                            (Date_Issued LIKE ? OR Date_Received LIKE ?)";
                    $stmt = $conn->prepare($sql);
                    $searchPattern = "%{$searchTerm}%";
                    $stmt->bind_param("iss", $user_id, $searchPattern, $searchPattern);
                }
            }
        }
        
        if (!$stmt) {
            echo json_encode(["error" => "Search query preparation failed: " . $conn->error]);
            exit;
        }
        break;
        
    case 'users':
        // Only allow user search for admins
        if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
            echo json_encode(["error" => "Unauthorized access"]);
            exit;
        }
        
        if ($fetchAll) {
            // Fetch all users without filtering
            $sql = "SELECT * FROM User";
            $stmt = $conn->prepare($sql);
        } else {
            // Search users by username, name, or email
            $sql = "SELECT * FROM User WHERE Username LIKE ? OR Name LIKE ? OR Email LIKE ?";
            
            $stmt = $conn->prepare($sql);
            if (!$stmt) {
                echo json_encode(["error" => "Search query preparation failed: " . $conn->error]);
                exit;
            }
            
            $searchPattern = "%{$searchTerm}%";
            $stmt->bind_param("sss", $searchPattern, $searchPattern, $searchPattern);
        }
        break;
        
    default:
        echo json_encode(["error" => "Invalid search type"]);
        exit;
}

// Execute search
if (!$stmt->execute()) {
    echo json_encode(["error" => "Search failed: " . $stmt->error]);
    exit;
}

$result = $stmt->get_result();
$data = [];

while ($row = $result->fetch_assoc()) {
    $data[] = $row;
}

$stmt->close();
$conn->close();

// Return search results
echo json_encode($data);
?> 