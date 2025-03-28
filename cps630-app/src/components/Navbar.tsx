import { NavLink } from "react-router";
import { useAuthContext } from "../authContext";

import '../styles/navbar.css';

function Navbar() {
    const auth = useAuthContext();
    
    return(
        <header>
            <nav>
                <ul>
                    <li><NavLink to='/'>Home</NavLink></li>
                    <li><NavLink to='/About'>About</NavLink></li>
                    {auth.username ? 
                    <>
                    {/* if user is signed in, show these */}
                        <li><NavLink to='/Payment'>Cart</NavLink></li>
                        <li><NavLink to='/Logout'>Log Out</NavLink></li>
                        <li><NavLink to='/Search'>Search</NavLink></li>
                    </> :
                    <>
                    {/* if user is not signed in, show these */}
                        <li><NavLink to='/SignIn'>Sign In</NavLink></li>
                        <li><NavLink to='/SignUp'>Sign Up</NavLink></li>
                    </>
                    }
                    {auth.role === 'admin' && <li><NavLink to='/DbMaintain'>DB Maintain</NavLink></li>}
                    
                    
                    <NavLink to='/'></NavLink>
                </ul>
            </nav>
        </header>
    );
}


export default Navbar;