import Shopping from "../components/Shopping";
import fvLogo from '../assets/logo.png'

function Home() {
return (
    <>
        <div id="welcome">
            <img
                src={fvLogo}
                />
            <p>Shopping, Delivery, and Payment.</p>
        </div>
        <Shopping />
    </>
);
}

export default Home;