import { useEffect, useState } from "react";
import Trip from "../components/Trip";
import { getUserData } from "../utils/getUserData";
import InvoiceCard from "../components/InvoiceCard";
import '../styles/payment.css'

// prop to be drilled to Directions component
// Directions will need to set the delivery distance and origin for payment to store into db
export interface DestinationProp {
    destination: string;
    setDistance: React.Dispatch<React.SetStateAction<number>>;
    setOrigin: React.Dispatch<React.SetStateAction<string>>;
}


// this holds stuff we'll need for some prefilled forms
const userData = await getUserData();

function Payment() {
    // initialize states, defualt origin will be TMU
    const [completedOrderId, setCompletedOrderId] = useState('');
    const [destination, setDestination] = useState(userData.address);
    const [failedPaymentAttempt, setfailedPaymentAttempt] = useState('');
    const [distance, setDistance] = useState(0); // distance of trip
    const [origin, setOrigin] = useState('Toronto Metropolitan University, Victoria Street, Toronto, ON, Canada',)

    async function makePayment(formData: FormData) {
        formData.append("source", origin);
        formData.append("distance", (distance / 1000).toString())
        formData.append("itemIds", localStorage.getItem("cartItems") || "[]");
        const response = await fetch("http://localhost/CPS630-React/php/payment.php", {
            method: "POST",
            credentials: "include",
            body: formData,
        })

        const result = await response.json();
        if (result.error) {
            setfailedPaymentAttempt(result.error);
        }
        else {
            setfailedPaymentAttempt(''); 
            setCompletedOrderId(result.orderNum);
        }
    }

    // force rerender when userData is received in order to fill defaultValues
    useEffect(() => {setfailedPaymentAttempt('')}, [userData])

    if (!completedOrderId) {
        return (
            <>
                <div className="container">

                    <div className="invoice-card-container">
                    <h2>Payment Details</h2>
                        <InvoiceCard />
                    </div> <br/><br/>
                    <div id="invoice" className="invoice"></div>
                    <form id="paymentForm" action={makePayment}>
                        <label htmlFor="name">Name:</label>
                        <input type="text" id="name" name="name" defaultValue={userData.name} required /><br/>

                        <label htmlFor="address">Address:</label>
                        <input type="text" id="address" name="address" defaultValue={userData.address} 
                            onBlur={(e) => {setDestination(e.target.value)}} required />
                        {distance === -1 && <p>Error: We currently do not ship to this location</p>}<br/>

                        <label htmlFor="email">Email:</label>
                        <input type="text" id="email" name="email" defaultValue={userData.email} required /><br/>

                        <label htmlFor="paymentMethod">Payment Method:</label>
                        <select id="paymentMethod" name="paymentMethod" required>
                            <option value="">Select Payment Method</option>
                            <option value="creditCard">Credit Card</option>
                            <option value="debitCard">Debit Card</option>
                            <option value="giftCard">Gift Card</option>
                        </select><br/>

                        <label htmlFor="cardNumber">Card Number:</label>
                        <input type="text" id="cardNumber" name="cardNumber" maxLength={16} required /><br/>

                        <label htmlFor="deliveryDate">Delivery Date:</label>
                        <input type="date" id="deliveryDate" name="deliveryDate" required /><br/>

                        {failedPaymentAttempt && <><span className="error" id="cardError">{failedPaymentAttempt}</span><br/></>}

                        <input type="hidden" name="totalPrice" id="totalPrice" />

                        <button type="submit">Submit Payment</button>
                    </form>
                </div>

                <Trip 
                    destination={destination}
                    setDistance={setDistance}
                    setOrigin={setOrigin}
                />
            </>
        );
    }
    else if (completedOrderId) {
        return (
            <>
                <div className="center"> 
                    <h1>Thank You!</h1>
                    <p>Your Order ID is: {completedOrderId}</p>  
                </div>
                <Trip 
                    destination={destination}
                    setDistance={setDistance}
                    setOrigin={setOrigin}
                />
            </>
        );
    }
}

export default Payment;
