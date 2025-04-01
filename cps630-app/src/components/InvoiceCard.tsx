import { useEffect, useState } from "react";

interface productItems {
    id: string;
    name: string;
    price: string;
    salePrice: string;
    img: string;
}

function InvoiceCard() {
    const [cartItems, setCartItems] = useState<productItems[]>([]); // Items to display in the cart
    const [cartTotal, setCartTotal] = useState(0.00);
    const [availableItems, setAvailableItems] = useState<productItems[]>([]); // All items from the DB

    // Get available items from the database
    useEffect(() => {
        fetch('http://localhost/CPS630-React/php/itemsData.php')
            .then((response) => response.json())
            .then((data) => setAvailableItems(data))
            .catch((error) => {
                console.log(error);
                setAvailableItems([]);
            });
    }, []);

    // Use the stored ids from localStorage to find their corresponding details
    useEffect(() => {
        if (availableItems.length === 0) return;

        const cart: string[] = JSON.parse(localStorage.getItem("cartItems") || "[]");
        let toSetCart: productItems[] = [];
        let total = 0;

        cart.forEach((itemId) => {
            const index = availableItems.findIndex(obj => obj.id === itemId);
            
            // Skip items that aren't found in availableItems
            if (index === -1) {
                console.warn(`Item with ID ${itemId} not found in available items`);
                return;
            }
            
            const item = availableItems[index];

            // Add to cart and calculate total
            total += item.salePrice ? Number(item.salePrice) : Number(item.price); // Use sale price if available
            toSetCart.push(item);
        });

        setCartItems(toSetCart);
        setCartTotal(total);
    }, [availableItems]);

    return (
        <>
            <h3>Invoice</h3>
            <ul>
                {cartItems.map((item, index) => (
                    <li key={index}>
                        <div>
                            <span>{item.name}: </span>
                            {item.salePrice ? (
                                <>
                                    <span style={{ textDecoration: "line-through", marginRight: "10px" }}>
                                        ${item.price}
                                    </span>
                                    <span>
                                        ${item.salePrice}
                                    </span>
                                </>
                            ) : (
                                <span>${item.price}</span>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
            <strong>Total: ${cartTotal.toFixed(2)}</strong>
        </>
    );
}

export default InvoiceCard;
