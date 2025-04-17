import React, {createContext, useState, useContext, Children} from "react";

const WalletContext = createContext();

export const WalletProvider = ({children}) => {
    const [currentAccount, setCurrentAccount] = useState("");

    return(
        <>
            <WalletContext.Provider value={{currentAccount, setCurrentAccount}}>
                {children}
            </WalletContext.Provider>
            
        </>
    )
}

export const useWallet = ()=> useContext(WalletContext)