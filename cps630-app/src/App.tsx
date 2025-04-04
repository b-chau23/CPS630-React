import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router";
import { AuthContext } from "./authContext";
import { getUserData } from "./utils/getUserData";
import Layout from "./components/Layout";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Logout from "./pages/Logout";
import Payment from "./pages/Payment";
import Home from "./pages/Home";
import About from "./pages/About";
import Search from "./pages/Search";
import DbMaintain from "./pages/DbMaintain";

// type for the auth context -- properties and their setters
// note that this is for display stuff, any actual auth must be verified in backend
export interface AuthContextType {
    username: string;    
    role: string;
    setUsername: React.Dispatch<React.SetStateAction<string>>;
    setRole: React.Dispatch<React.SetStateAction<string>>;
} 

const userData = await getUserData();
function App() {    
    
    // these will be part of our context, used for rendering appropriate content
    // initial value is set to an empty string, value will be set when users signin/up 
    // not for acutal authentication, nothing from client can be trusted on server
    const [username, setUsername] = useState('')
    const [role, setRole] = useState('')

    // if the page was refreshed, make sure that the states are maintained
    if (!userData.error && !username && !role) {
        setUsername(userData.username);
        setRole(userData.role);
    }

    return (
        <>
            <BrowserRouter>
            <AuthContext.Provider value={{username, role, setUsername, setRole}}>
                <Routes>
                    <Route element={<Layout />} path='/'>
                        <Route element={<Home />} path='/' />
                        <Route element={<About />} path='/About' />
                        <Route element={<SignIn />} path='/SignIn' />
                        <Route element={<SignUp />} path='/SignUp' />
                        <Route element={<Logout />} path='/Logout' />
                        <Route element={<Payment />} path='/Payment' />
                        <Route element={<Search />} path='/Search' />
                        <Route element={<DbMaintain />} path='/DbMaintain' />
                    </Route>
                </Routes>
            </AuthContext.Provider>
            </BrowserRouter>
        </>
    );
}

export default App;