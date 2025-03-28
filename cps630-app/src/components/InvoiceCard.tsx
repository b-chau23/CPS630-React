import { useEffect, useState } from "react";

interface productItems {
    id: string,
    name: string,
    price: string,
    img: string,
}

function InvoiceCard() {
    const [cartItems, setCartItems] = useState<productItems[]>([]); // what we are going to display
    const [cartTotal, setCartTotal] = useState(0.00);
    const [availableItems, setAvailableItems] = useState<productItems[]>([]); // all items from db

    // get available items from database
    useEffect(() => {
        fetch('http://localhost/proj2/php/itemsData.php')
        .then((response) => response.json())
        .then((data) => setAvailableItems(data))
        .catch((error) => {
            console.log(error);
            setAvailableItems([]);
        })
    }, [])

    // use the stored ids from localStorage to find their corresponding details
    useEffect(() => {
        if (availableItems.length === 0) return;
        const cart: string[] = JSON.parse(localStorage.getItem("cartItems") || "[]")
        let toSetCart: productItems[] = [];
        let total = 0;
        cart.forEach((itemId) => {
            const index = availableItems.findIndex(obj => obj.id === itemId)
            total += Number(availableItems[index].price)
            toSetCart.push(availableItems[index])
            setCartItems(toSetCart)
        })
        setCartTotal(total)
    }, [availableItems])

    return (
        <>
            <h3>Invoice</h3>
            <ul>
                {cartItems.map((item, index) => (
                    <li key={index}>
                        {item.name} - ${item.price}
                    </li>
                ))}
            </ul>
            <strong>Total: ${cartTotal.toFixed(2)}</strong>
        </>
    );
}

export default InvoiceCard;