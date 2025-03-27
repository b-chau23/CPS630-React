import { useEffect, useState } from "react";
import { useAuthContext } from "../authContext";

function Logout() {
    const [errorMsg, setErrorMsg] = useState('');
    const auth = useAuthContext();
    
    useEffect(() => {
        fetch('http://localhost/proj2/php/logout.php', {
            method: 'DELETE',
            credentials: 'include'
        })
        .catch(error => setErrorMsg(error));
        auth.setRole('');
        auth.setUsername('')
    }, [])
    
    if (errorMsg) {
        return <><h1>Something went Wrong :/</h1><p>{errorMsg}</p></>
    }
    else {
        return (
            <h1>You have been successfully logged out</h1>
        );
    }

}

export default Logout;