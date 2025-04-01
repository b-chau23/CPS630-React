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

// Initialize variables
$signup_error = '';
$signup_success = false;

// Function to generate salt value
function generateRandomSalt(){
    return base64_encode(random_bytes(12));
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form data
    $fullName = $_POST['fullName'] ?? '';
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $confirmPassword = $_POST['confirmPassword'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $address = $_POST['address'] ?? '';
    $role = $_POST['role'] ?? 'user'; // Default to 'user' if not specified
    
    // Basic validation
    if (empty($username) || empty($password) || empty($confirmPassword) || 
        empty($email) || empty($phone) || empty($address) || empty($fullName)) {
        $signup_error = "All fields are required";
    } 
    // Check if passwords match
    elseif ($password !== $confirmPassword) {
        $signup_error = "Passwords do not match";
    }
    // Check if role is valid
    elseif ($role !== 'user' && $role !== 'admin') {
        $signup_error = "Invalid role selected";
    }
    else {
        // Check if username already exists
        $check_sql = "SELECT username FROM user WHERE username = ?";
        $check_stmt = $conn->prepare($check_sql);
        $check_stmt->bind_param("s", $username);
        $check_stmt->execute();
        $check_result = $check_stmt->get_result();
        
        if ($check_result->num_rows > 0) {
            $signup_error = "Username already exists";
        } else {
            // Check if email already exists
            $check_email_sql = "SELECT email FROM user WHERE email = ?";
            $check_email_stmt = $conn->prepare($check_email_sql);
            $check_email_stmt->bind_param("s", $email);
            $check_email_stmt->execute();
            $check_email_result = $check_email_stmt->get_result();
            
            if ($check_email_result->num_rows > 0) {
                $signup_error = "Email already exists";
            } else {
                // Hash the password
                $salt = generateRandomSalt();
                $hashedPassword = md5($password . $salt);
                
                // Insert new user
                $insert_sql = "INSERT INTO user (username, password, email, phone, address, name, role, salt) 
                              VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                $insert_stmt = $conn->prepare($insert_sql);
                $insert_stmt->bind_param("ssssssss", $username, $hashedPassword, $email, $phone, $address, $fullName, $role, $salt);
                
                if ($insert_stmt->execute()) {
                    $signup_success = true;
                    
                    // Start session and log user in
                    session_start();
                    $_SESSION["username"] = $username;
                    $_SESSION["address"] = $address;
                    $_SESSION["role"] = $role;
                    $_SESSION["userId"] = $conn->insert_id;
                    $_SESSION["name"] = $fullName;
                    $_SESSION["email"] = $email;
                    $_SESSION["last_activity"] = time();
                } else {
                    $signup_error = "Error creating account: " . $insert_stmt->error;
                }
                $insert_stmt->close();
            }
            $check_email_stmt->close();
        }
        $check_stmt->close();
    }
}
$conn->close();

if ($signup_error) {
    echo json_encode(["error" => "$signup_error"]);
}
else {
    echo json_encode(["username" => $username, "role" => $role]);
}
?>