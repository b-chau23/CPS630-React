<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// For debugging, display errors
ini_set('display_errors', 1);

session_start();

// Login credentials
$username = $_POST['username'] ?? '';
$userPassword = $_POST['password'] ?? '';

$servername = "localhost";
$dbUsername = "root";
$dbPassword = "";
$dbname = "cps630project";

// Create connection
$conn = new mysqli($servername, $dbUsername, $dbPassword, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Prepare statement
$stmt = $conn->prepare("SELECT User_Id, Username, Name, Password, Email, Address, Role, Salt FROM User WHERE Username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User exists, check password
    $userInfo = $result->fetch_assoc();
    
    // For debugging only - in production environments NEVER log passwords
    error_log("Login attempt for user: $username - User exists");
    
    // Check if the credentials match a user in the system with MD5 hash and salt
    $storedSalt = $userInfo['Salt'];  // Get the stored salt
    $storedHashedPassword = $userInfo['Password'];  // Get the stored hashed password

    // Concatenate the entered password with the stored salt
    $saltedPassword = $userPassword . $storedSalt;

    // Hash the concatenated password and salt
    $hashedPassword = md5($saltedPassword);

    // Compare the entered (hashed) password with the stored hashed password
    if ($hashedPassword === $storedHashedPassword) {
        // Password matches, set session variables
        $_SESSION["user_id"] = $userInfo["User_Id"];
        $_SESSION["username"] = $userInfo["Username"];
        $_SESSION["name"] = $userInfo["Name"];
        $_SESSION["email"] = $userInfo["Email"];
        $_SESSION["address"] = $userInfo["Address"];
        $_SESSION["role"] = $userInfo["Role"];
        
        error_log("Login successful for user: $username (ID: " . $userInfo["User_Id"] . ")");
        echo json_encode(["username" => $username, "role" => $userInfo["Role"], "user_id" => $userInfo["User_Id"]]);
    } else {
        error_log("Login failed for user: $username - Password mismatch");
        echo json_encode(["error" => "Incorrect username or password"]);
    }
}
else {
    error_log("Login failed for user: $username - User not found");
    echo json_encode(["error" => "Incorrect username or password"]);
}

$stmt->close();
$conn->close();
?>