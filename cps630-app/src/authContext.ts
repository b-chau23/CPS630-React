import { createContext, useContext } from "react";
import { AuthContextType } from "./App";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

//custom hoook for AuthContext. Catches any cases of undefined AuthContext and throws error
export function useAuthContext() {
    const auth = useContext(AuthContext);
    if (auth === undefined) {
        throw new Error('useAuthContext must be used with AuthContext')
    }
    return auth;
}