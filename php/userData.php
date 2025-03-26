<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

session_start();

// get some basic user data
if (isset($_SESSION['username'])) {
    echo json_encode([
        "username" => $_SESSION["username"],
        "name" => $_SESSION["name"],
        "email" => $_SESSION["email"],
        "address" => $_SESSION["address"],
        "role" => $_SESSION["role"]
    ]);
}
else {
    echo json_encode(["error" => "No user session"]);
}
?>