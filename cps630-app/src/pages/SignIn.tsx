import { useState } from "react";
import { useAuthContext } from "../authContext";

function SignIn() {
    const auth = useAuthContext();
    const [failedSignInAttempt, setFailedSignInAttempt] = useState(false);

    async function checkPass(formData: FormData) {        
        const response = await fetch("http://localhost/proj2/php/signIn.php", {
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
        }
        
    }

    return (
        <>
            <h1>SignIn Component</h1>
            <form action={checkPass}>
                <input name="username"/><br/>
                <input name="password"/><br/>
                <button type="submit">Submit</button>
            </form>
            {failedSignInAttempt && <p>Incorrect Username or Password</p>} 
        </>
    );

}

export default SignIn;