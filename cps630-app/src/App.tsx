import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthContext, useAuthContext } from "./authContext";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Logout from "./pages/Logout";

export interface AuthContextType {
    username: string;    
    role: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setRole: React.Dispatch<React.SetStateAction<string>>;
} 


function App() {
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('')

    return (
        <>
            <BrowserRouter>
            <AuthContext.Provider value={{username, role, setUsername, setRole}}>
                <Routes>
                    <Route element={<Layout />} path='/'>
                        <Route element={<TempComp />} path='/' />
                        <Route element={<SignIn />} path='/SignIn' />
                        <Route element={<SignUp />} path='/SignUp' />
                        <Route element={<Logout />} path='/Logout' />
                    </Route>
                </Routes>
            </AuthContext.Provider>
            </BrowserRouter>
        
        </>
    );
}

export default App;

function TempComp() {
    const asd = useAuthContext();
    return <h1>username: {asd.username} <br/> role: {asd.role}</h1>
}