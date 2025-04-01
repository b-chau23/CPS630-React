<?php 
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Credentials: true");
header("Access-Control-Allow-Headers: Content-Type");

session_start();

// Debug session variables
error_log("SESSION data in payment.php: " . print_r($_SESSION, true));

// Handle session variable inconsistency (user_id vs userId)
if (!isset($_SESSION['userId']) && isset($_SESSION['user_id'])) {
    $_SESSION['userId'] = $_SESSION['user_id'];
    error_log("Session variable synchronized: user_id -> userId");
}

// Check if user is logged in
if (!isset($_SESSION['userId']) && !isset($_SESSION['user_id'])) {
    echo json_encode(["error" => "You must be logged in to make a payment"]);
    exit();
}

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    try {
        $servername = "localhost";
        $username = "root";
        $password = "";
        $dbname = "cps630project";
        
        // Create connection
        $conn = new mysqli($servername, $username, $password, $dbname);
        // Check connection
        if ($conn->connect_error) {
            throw new Exception("Connection failed: " . $conn->connect_error);
        }

        // Get the form data
        $name = $_POST['name'] ?? '';
        $address = $_POST['address'] ?? '';
        $email = $_POST['email'] ?? '';
        $cardNumber = $_POST['cardNumber'] ?? '';
        $source = $_POST['source'] ?? '';
        $distanceKm = $_POST['distance'] ?? 0;
        $deliveryDate = $_POST['deliveryDate'] ?? '';
        $itemIdsJson = $_POST['itemIds'] ?? '[]';
        $paymentMethod = $_POST['paymentMethod'] ?? '';
        
        // Validate required fields
        if (empty($name) || empty($address) || empty($email) || empty($cardNumber) || 
            empty($source) || empty($deliveryDate) || empty($paymentMethod)) {
            throw new Exception("All fields are required");
        }
        
        $itemIds = json_decode($itemIdsJson, true); // list of ids
        
        // Check if cart is empty
        if (empty($itemIds)) {
            throw new Exception("Your cart is empty");
        }
        
        // Make sure userId is set
        if (!isset($_SESSION['userId']) && !isset($_SESSION['user_id'])) {
            throw new Exception("You must be logged in to complete checkout");
        }
        
        // some other stuff needed
        $currentDate = date('Y-m-d');
        $userId = isset($_SESSION['userId']) ? $_SESSION['userId'] : $_SESSION['user_id'];
        
        $itemPrices = []; // we will fill this later

        // from the list of ids, we need the list of their corresponding prices
        // we query the database to do this
        $placeholders = implode(',', array_fill(0, count($itemIds), '?'));
        $query = "SELECT item_id, price, Sale_Status, Sale_Price FROM item WHERE item_id IN ($placeholders)";
        $stmt = $conn->prepare($query);
        // Bind parameters dynamically
        $types = str_repeat('i', count($itemIds));
        $stmt->bind_param($types, ...$itemIds);
        // Execute
        $stmt->execute();
        $result = $stmt->get_result();
        // fill itemPrices array with result. format is "id=>price"
        while ($row = $result->fetch_assoc()) {
            // Use sale price if item is on sale
            if ($row['Sale_Status'] == 1 && $row['Sale_Price'] > 0) {
                $itemPrices[$row['item_id']] = $row['Sale_Price'];
            } else {
                $itemPrices[$row['item_id']] = $row['price'];
            }
        }
        // get quantity of each item. format of the assoc array is "id=>quantity"
        $itemQuantity = array_count_values($itemIds); 
        // Get total price of items
        $totalPrice = 0; 
        foreach ($itemQuantity as $itemId => $quantity) {
            $totalPrice += ($itemPrices[$itemId] * $quantity);
        }

        // SQL query to insert a new row into the Payment table
        // Prepare
        $paymentQuery = $conn->prepare("INSERT INTO Payment (Payment_Method) VALUES (?)");
        $paymentQuery->bind_param("s", $paymentMethod); // "s" stands for the string type

        // Execute the statement
        if ($paymentQuery->execute()) {
            // echo "New payment record inserted successfully.";
        } else {
            echo json_encode(["error" => $paymentQuery->error, "message" => $paymentQuery->error]);
        }
        // Get the Payment_Code of the newly inserted Payment row
        $paymentCode = mysqli_insert_id($conn);


        // SQL query to insert a new row into the Truck table
        $truckQuery = "INSERT INTO Truck () VALUES ()"; // Empty because defaults will handle the fields
        // Execute the truckQuery
        if (mysqli_query($conn, $truckQuery)) {
            // echo "New truck record inserted successfully. ";
        } else {
            echo json_encode(["error" => $truckQuery, "message " => mysqli_error($conn)]);
        }
        // Get the Truck_Id of the newly inserted truck row
        $truckId = mysqli_insert_id($conn);


        // SQL query to insert a new row into the Trip table
        $tripQuery = "INSERT INTO Trip (Source, Destination, Distance_km, Truck_Id, Price)
                    VALUES (?, ?, ?, ?, ?)";
        // Prepare the statement
        if ($stmt = mysqli_prepare($conn, $tripQuery)) {
            // Bind parameters to the prepared statement
            mysqli_stmt_bind_param($stmt, 'ssdid', $source, $address, $distanceKm, $truckId, $totalPrice);
            // Execute the prepared statement
            if (mysqli_stmt_execute($stmt)) {
                // echo "New trip record inserted successfully. ";
            } 
            else {
                echo json_encode(["error" => $tripQuery, "message " => mysqli_error($stmt)]);
            }
            mysqli_stmt_close($stmt);
        } 
        else {
            echo json_encode(["error" => $tripQuery, "message " => mysqli_error($conn)]);
        }
        // Get the Trip_Id of the newly inserted truck row
        $tripId = mysqli_insert_id($conn);


        // SQL query to insert a new row into the Shopping table
        $shoppingQuery = "INSERT INTO Shopping (Total_Price, Date_of_Purchase) VALUES (?, ?)";
        // Execute the shoppingQuery
        if ($stmt = mysqli_prepare($conn, $shoppingQuery)) {
            mysqli_stmt_bind_param($stmt, 'ds', $totalPrice, $currentDate);
            if (mysqli_stmt_execute($stmt)) {
                // echo "New shopping record inserted successfully. ";
            } else {
                echo json_encode(["error" => $shoppingQuery, "message " => mysqli_error($stmt)]);
            }
            mysqli_stmt_close($stmt);
        } else {
            echo json_encode(["error" => $shoppingQuery, "message " => mysqli_error($conn)]);
        }
        $receiptId = mysqli_insert_id($conn);


        // SQL query to insert a new row into the Orders table
        $orderQuery = "INSERT INTO Orders (Date_Issued, Date_Received, Total_Price, Payment_Code, User_Id, Trip_Id, Receipt_Id) 
        VALUES (?, ?, ?, ?, ?, ?, ?)";
        // prepare
        if ($stmt = mysqli_prepare($conn,  $orderQuery)) {
            //bind
            mysqli_stmt_bind_param($stmt, 'ssdiiii', $currentDate, $deliveryDate, $totalPrice, $paymentCode, $userId, $tripId, $receiptId);
            if (mysqli_stmt_execute($stmt)) {
                 // echo "New order record inserted successfully. ";
            } else {
                echo json_encode(["error" => $orderQuery, "message " => mysqli_error($stmt)]);
            }
            mysqli_stmt_close($stmt);
        } else {
            echo json_encode(["error" => $orderQuery, "message " => mysqli_error($conn)]);
        }
        $orderId = mysqli_insert_id($conn);


        // SQL query to insert a new row into the Order_Item table
        if (!empty($itemIds) && !empty($itemPrices)) {
            foreach ($itemQuantity as $itemId => $quantity) {
                $itemPrice = $itemPrices[$itemId]; // Single item price (already accounts for sales)
                $itemTotalPrice = $quantity * $itemPrice; // Total price for this item with quantity
                // Insert each item into Order_Item
                $orderItemQuery = "INSERT INTO Order_Item (Order_Id, Item_Id, Quantity, Price_at_Purchase) 
                                    VALUES (?, ?, ?, ?)";
                // prepare
                if ($stmt = mysqli_prepare($conn, $orderItemQuery)) {
                    //bind
                    mysqli_stmt_bind_param($stmt, 'iiii', $orderId, $itemId, $quantity, $itemTotalPrice);
                    //execute
                    if (mysqli_stmt_execute($stmt)) {
                        // echo "New order item record inserted successfully for item ID: $itemId. ";
                    } else {
                        echo json_encode(["error" => $orderQuery, "message " => mysqli_error($stmt)]);
                    }
                    mysqli_stmt_close($stmt);
                }
            }
        }

        // Close connections
        echo json_encode(["status" => "ok", "orderNum" => $orderId]);
        $conn->close();
    } catch (Exception $e) {
        error_log("Payment Error: " . $e->getMessage());
        echo json_encode(["error" => $e->getMessage()]);
        exit();
    }
}
else {
    echo json_encode(["error" => "POST requests only"]);
}
?>