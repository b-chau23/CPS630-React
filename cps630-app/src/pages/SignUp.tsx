import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../authContext";
import { usePlacesWidget } from "react-google-autocomplete";


function SignUp() {
    const auth = useAuthContext();
    const [failedSignUpAttempt, setFailedSignUpAttempt] = useState('');
    const navigate = useNavigate();

    // location autocomplete for address input
    const { ref } = usePlacesWidget({
        apiKey: import.meta.env.VITE_MAPS_API_KEY,
        options: {types: ["geocode"]}
    });

    async function signUp(formData: FormData) {
        const response = await fetch("http://localhost/proj2/php/signUp.php", {
            method: "POST",
            credentials: "include",
            body: formData,
        })

        const result = await response.json();
        if (result['error']) {
            setFailedSignUpAttempt(result.error);
        }
        else {
            setFailedSignUpAttempt('');
            auth.setUsername(result.username);
            auth.setRole(result.role);
            navigate('/');
        }
        
    } 

    return(
        <>
            <h1>Sign Up</h1>
            <form action={signUp}>
                <div className="form-group">
                    <input type="text" id="fullName" name="fullName" placeholder="Full Name" required />
                </div>
            
                <div className="form-group">
                    <input type="text" id="username" name="username" placeholder="Username" required />
                </div>
            
                <div className="form-group">
                    <input type="password" id="password" name="password" placeholder="Password" required />
                </div>
            
                <div className="form-group">
                    <input type="password" id="confirmPassword" name="confirmPassword" placeholder="Confirm Password" required />
                </div>
            
                <div className="form-group">
                    <input type="email" id="email" name="email" placeholder="Email" required />
                </div>
            
                <div className="form-group">
                    <input type="tel" id="phone" name="phone" placeholder="Phone Number" required />
                </div>
            
                <div className="form-group">
                    <input ref={ref} type="text" id="address" name="address" placeholder="Address" required autoComplete="new-password"/>
                </div>
            
                <div className="form-group">
                    <select id="role" name="role" className="role-select" required>
                        <option value="user">Regular User</option>
                        <option value="admin">Administrator</option>
                    </select>
                </div>
            
                <button type="submit" id="signUpBtn">Sign Up</button>
            </form>
            {failedSignUpAttempt && <p>Error: {failedSignUpAttempt}</p>}
        </>
    );
}

export default SignUp;