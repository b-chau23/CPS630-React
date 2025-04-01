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

// Function to generate salt value
function generateRandomSalt() {
    return base64_encode(random_bytes(12));
}

try {
    // Check if user is admin
    if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
        throw new Exception("Unauthorized access");
    }

    // Get required fields
    $username = $_POST['Username'] ?? '';
    $name = $_POST['Name'] ?? '';
    $email = $_POST['Email'] ?? '';
    $role = $_POST['Role'] ?? '';
    $phone = $_POST['Phone'] ?? '';
    $address = $_POST['Address'] ?? '';
    $password = $_POST['Password'] ?? '';

    // Validate required fields
    if (empty($username) || empty($name) || empty($email) || empty($role) || empty($password)) {
        throw new Exception("Username, Name, Email, Role, and Password are required fields");
    }

    // Check if username already exists
    $check_stmt = $conn->prepare("SELECT COUNT(*) as count FROM User WHERE Username = ?");
    $check_stmt->bind_param("s", $username);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $count = $result->fetch_assoc()['count'];
    
    if ($count > 0) {
        throw new Exception("Username already exists");
    }

    // Get the maximum user_id from the table to increment
    $maxIdSql = "SELECT MAX(User_Id) as max_id FROM User";
    $maxIdResult = $conn->query($maxIdSql);
    
    if (!$maxIdResult) {
        throw new Exception("Error getting max ID: " . $conn->error);
    }
    
    $row = $maxIdResult->fetch_assoc();
    $next_id = $row['max_id'] ? intval($row['max_id']) + 1 : 1;
    
    // Hash password using MD5 and salt
    $salt = generateRandomSalt();
    $hashedPassword = md5($password . $salt);

    // Insert the new user with the incremented ID
    $sql = "INSERT INTO User (User_Id, Username, Name, Password, Email, Role, Phone, Address, Salt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
    $stmt = $conn->prepare($sql);
    
    if (!$stmt) {
        throw new Exception("Prepare failed: " . $conn->error);
    }
    
    $stmt->bind_param("issssssss", $next_id, $username, $name, $hashedPassword, $email, $role, $phone, $address, $salt);
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    $conn->close();
    echo json_encode(["success" => "User added successfully", "user_id" => $next_id]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in addUser.php: " . $e->getMessage());
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 