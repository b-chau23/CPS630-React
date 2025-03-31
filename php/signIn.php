<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
<<<<<<< HEAD
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
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

    $username = $_POST['username'] ?? "";
    $password = $_POST['password'] ?? "";

    $sql = "SELECT username, password, address, role, user_id, name, email FROM user WHERE username = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    
    $result = $stmt->get_result();
    if ($result->num_rows == 1) {
        $row = $result->fetch_assoc();
        // Verify password
        if (password_verify($password, $row['password'])) {
            // Password is correct, start a new session
            session_start();
            $_SESSION["username"] = $username;
            $_SESSION["address"] = $row['address'];
            $_SESSION["role"] = $row['role'];
            $_SESSION["userId"] = $row['user_id'];
            $_SESSION["name"] = $row['name'];
            $_SESSION["email"] = $row['email'];
            $_SESSION["last_activity"] = time();

            echo json_encode([
                "username" => $username, 
                "address" => $row['address'],
                "role" => $row['role'],
                "userId" => $row['user_id'],
                "name" => $row['name'],
                "email" => $row['email'],
                "last_activity" => $_SESSION["last_activity"]
            ]);
        } 
    } 
    else {
        echo json_encode(["error" => "Incorrect Username or Password"]);
    }
    $stmt->close();
    $conn->close();


}
else {
    echo json_encode(["message" => "POST Requests only"]);
}
exit;
=======
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
$stmt = $conn->prepare("SELECT User_Id, Username, Name, Password, Email, Address, Role FROM User WHERE Username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    // User exists, check password
    $userInfo = $result->fetch_assoc();
    
    // For debugging only - in production environments NEVER log passwords
    error_log("Login attempt for user: $username - User exists");
    
    if (password_verify($userPassword, $userInfo['Password'])) {
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
} else {
    error_log("Login failed for user: $username - User not found");
    echo json_encode(["error" => "Incorrect username or password"]);
}

$stmt->close();
$conn->close();
>>>>>>> 2458187 (Hopefully fixed it)
?>