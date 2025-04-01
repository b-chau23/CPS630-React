<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

// For debugging
ini_set('display_errors', 1);

session_start();

// Debug session variables
error_log("SESSION data in userData.php: " . print_r($_SESSION, true));

// Handle session variable inconsistency
if (isset($_SESSION['user_id']) && !isset($_SESSION['userId'])) {
    $_SESSION['userId'] = $_SESSION['user_id'];
    error_log("Session variable synchronized in userData.php: user_id -> userId");
}
if (isset($_SESSION['userId']) && !isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = $_SESSION['userId'];
    error_log("Session variable synchronized in userData.php: userId -> user_id");
}

// get some basic user data
if (isset($_SESSION['username'])) {
    // Use either userId or user_id, prioritizing user_id to maintain compatibility
    $user_id = $_SESSION["user_id"] ?? $_SESSION["userId"] ?? null;
    
    echo json_encode([
        "username" => $_SESSION["username"],
        "name" => $_SESSION["name"],
        "email" => $_SESSION["email"],
        "address" => $_SESSION["address"],
        "role" => $_SESSION["role"],
        "user_id" => $user_id,
        "userId" => $user_id // Include both for cross-compatibility
    ]);
}
else {
    echo json_encode(["error" => "No user session"]);
}
?>