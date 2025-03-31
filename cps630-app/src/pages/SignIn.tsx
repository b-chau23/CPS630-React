import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuthContext } from "../authContext";

function SignIn() {
    const auth = useAuthContext();
    const [failedSignInAttempt, setFailedSignInAttempt] = useState(false);
    const navigate = useNavigate();

    async function checkPass(formData: FormData) {        
        const response = await fetch("http://localhost/CPS630-React/php/signIn.php", {
            method: "POST",
            credentials: "include",
            body: formData,
        })
        
        const result = await response.json();
        
        if (result['error']) {
            setFailedSignInAttempt(true);
        }
        else {
            setFailedSignInAttempt(false);
            auth.setUsername(result.username);
            auth.setRole(result.role)
            navigate('/');
        }
        
    }

    return (
        <>
            <h1>Sign In</h1>
            <form action={checkPass}>
                <input name="username"/><br/>
<<<<<<< HEAD
                <input name="password"/><br/>
=======
                <input name="password" type="password"/><br/>
>>>>>>> 2458187 (Hopefully fixed it)
                <button type="submit">Submit</button>
            </form>
            {failedSignInAttempt && <p>Incorrect Username or Password</p>} 
        </>
    );

}

export default SignIn;