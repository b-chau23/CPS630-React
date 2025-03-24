import { useState, createContext, useContext } from "react";
import { AuthContext } from "./authContext";

export interface AuthContextType {
    username: string;    
    role: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setRole: React.Dispatch<React.SetStateAction<string>>;
} 


function App() {
    const [username, setUsername] = useState('myuser')
    const [role, setRole] = useState('myrole')


    return (
        <>
            <AuthContext.Provider value={{username, role, setUsername, setRole}}>
                <TempComp />
            </AuthContext.Provider>
        
        </>
    );
}

export default App;

function TempComp() {
    const asd = useContext(AuthContext);
    return <h1>username: {asd?.username} <br/> role: {asd?.role}</h1>
}