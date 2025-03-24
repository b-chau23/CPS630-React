<?php
header("Access-Control-Allow-Origin: http://localhost:5173");
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
?>