CREATE TABLE User (
    User_Id INT AUTO_INCREMENT PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Phone VARCHAR(15),
    Email VARCHAR(100) UNIQUE NOT NULL,
    Address VARCHAR(255),
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role VARCHAR(50) NOT NULL DEFAULT 'user',
    Salt VARCHAR(50) NOT NULL
);

CREATE TABLE Item (
    Item_Id INT PRIMARY KEY,
    Item_Name VARCHAR(100) NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Made_in CHAR(64) NOT NULL,
    Department_Code CHAR(5) NOT NULL,
    Stock_Quantity INT DEFAULT 0,
    Item_Type VARCHAR(50) NOT NULL,
    Item_Image VARCHAR(255) NOT NULL
);

CREATE TABLE Payment (
    Payment_Code INT AUTO_INCREMENT PRIMARY KEY,
    Payment_Method VARCHAR(50) DEFAULT 'credit' NOT NULL,
    Payment_Status VARCHAR(50) DEFAULT 'accepted' NOT NULL
);

CREATE TABLE Truck (
    Truck_Id INT AUTO_INCREMENT PRIMARY KEY,
    Truck_Code VARCHAR(50) DEFAULT '00001' NOT NULL,
    Availability_Code CHAR(5) DEFAULT '00001' NOT NULL
);

CREATE TABLE Trip (
    Trip_Id INT AUTO_INCREMENT PRIMARY KEY,
    Source VARCHAR(255) NOT NULL,
    Destination VARCHAR(255) NOT NULL,
    Distance_km DECIMAL(10, 2) NOT NULL,
    Truck_Id INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (Truck_Id) REFERENCES Truck(Truck_Id)
);

CREATE TABLE Shopping (
    Receipt_Id INT AUTO_INCREMENT PRIMARY KEY,
    Store_Code CHAR(5) DEFAULT '00001' NOT NULL,
    Total_Price DECIMAL(10, 2) NOT NULL,
    Date_of_Purchase DATE NOT NULL
);

CREATE TABLE Orders (
    Order_Id INT AUTO_INCREMENT PRIMARY KEY,
    Date_Issued DATE NOT NULL,
    Date_Received DATE,
    Total_Price DECIMAL(10, 2) NOT NULL,
    Payment_Code INT NOT NULL,
    User_Id INT NOT NULL,
    Trip_Id INT NOT NULL,
    Receipt_Id INT NOT NULL,
    FOREIGN KEY (Payment_Code) REFERENCES Payment(Payment_Code),
    FOREIGN KEY (User_Id) REFERENCES User(User_Id),
    FOREIGN KEY (Trip_Id) REFERENCES Trip(Trip_Id),
    FOREIGN KEY (Receipt_Id) REFERENCES Shopping(Receipt_Id)
);

-- junction table for order and Item tables as it's a many-to-many relation (many items can be part of many orders)
CREATE TABLE Order_Item (
    Order_Id INT NOT NULL,
    Item_Id INT NOT NULL,
    Quantity INT NOT NULL,
    Price_at_Purchase DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (Order_Id, Item_Id),
    FOREIGN KEY (Order_Id) REFERENCES Orders(Order_Id),
    FOREIGN KEY (Item_Id) REFERENCES Item(Item_Id)
);

INSERT INTO Item (Item_Id, Item_Name, Price, Made_in, Department_Code, Stock_Quantity, Item_Type, Item_Image)
VALUES 
('1', 'maple chair', '100', 'canada', '100', '5', 'chair', 'https://themontessoriroom.com/cdn/shop/products/maple-wood-classroom-chairs-8-sizes-available-made-in-canada-386961_1080x.png?v=1709266743'),
('2', 'silver metal chair', '50', 'canada', '100', '10', 'chair', 'https://m.media-amazon.com/images/I/61UoZAL-zdL.jpg'),
('3', 'brown leather couch', '800', 'canada', '100', '3', 'couch', 'https://m.media-amazon.com/images/I/719mdrIdHtL._AC_UY218_.jpg'),
('4', 'green performance couch', '400', 'canada', '100', '2', 'couch', 'https://m.media-amazon.com/images/I/41ZoSIkSQsL._AC_UY218_.jpg');

