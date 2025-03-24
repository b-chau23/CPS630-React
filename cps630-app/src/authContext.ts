import { createContext, useContext } from "react";
import { AuthContextType } from "./App";

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuthContext() {
    const auth = useContext(AuthContext);
    if (auth === undefined) {
        throw new Error('useAuthContext must be used with AuthContext')
    }
    return auth;
}