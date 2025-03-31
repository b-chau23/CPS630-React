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

    // Get form data
    $user_id = $_POST['User_Id'] ?? '';
    $username = $_POST['Username'] ?? '';
    $name = $_POST['Name'] ?? '';
    $email = $_POST['Email'] ?? '';
    $role = $_POST['Role'] ?? '';
    $phone = $_POST['Phone'] ?? '';
    $address = $_POST['Address'] ?? '';
    $password = $_POST['Password'] ?? '';

    // Validate input
    if (empty($user_id) || empty($username) || empty($name) || empty($email) || empty($role)) {
        throw new Exception("User ID, Username, Name, Email, and Role are required");
    }

    // Check if username exists for a different user
    $check_stmt = $conn->prepare("SELECT COUNT(*) as count FROM User WHERE Username = ? AND User_Id != ?");
    $check_stmt->bind_param("si", $username, $user_id);
    $check_stmt->execute();
    $result = $check_stmt->get_result();
    $count = $result->fetch_assoc()['count'];
    
    if ($count > 0) {
        throw new Exception("Username already exists for another user");
    }

    // If password is provided, hash it and update it
    if (!empty($password)) {
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);
        
        $sql = "UPDATE User SET Username = ?, Name = ?, Password = ?, Email = ?, Role = ?, Phone = ?, Address = ? WHERE User_Id = ?";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("ssssssi", $username, $name, $hashed_password, $email, $role, $phone, $address, $user_id);
    } else {
        // If no password is provided, update without changing password
        $sql = "UPDATE User SET Username = ?, Name = ?, Email = ?, Role = ?, Phone = ?, Address = ? WHERE User_Id = ?";
        $stmt = $conn->prepare($sql);
        
        if (!$stmt) {
            throw new Exception("Prepare failed: " . $conn->error);
        }
        
        $stmt->bind_param("sssssi", $username, $name, $email, $role, $phone, $address, $user_id);
    }
    
    if (!$stmt->execute()) {
        throw new Exception("Execute failed: " . $stmt->error);
    }
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("No changes were made or user not found");
    }
    
    $conn->close();
    echo json_encode(["success" => "User updated successfully"]);
    
} catch (Exception $e) {
    // Log the error
    error_log("Error in updateUser.php: " . $e->getMessage());
    
    // Return error message
    echo json_encode(["error" => $e->getMessage()]);
}
?> 