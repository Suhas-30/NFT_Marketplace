import { Route, Routes } from "react-router-dom";
import NFTmarketPlace from "../components/NFTmarketPlace";
import WalletButton from "../components/WalletButton";
import PinnedImages from "../components/PinnedImages";
import Mint from "../components/Mint";
import Listings from "../components/Listings";
import List from "../components/List";
import Buy from "../components/Buy";
import Withdraw from "../components/Withdraw";
import Transfer from "../components/Transfer";

const AppRouters = ()=>{

    return (
        <Routes>
            <Route path="/" element={<WalletButton></WalletButton>}/>
            <Route path="/nft-market" element={<NFTmarketPlace></NFTmarketPlace>}/>
            <Route path="/mint-nft-art" element={<Mint></Mint>}/>
            <Route path="/pinned-images" element={<PinnedImages></PinnedImages>}></Route>
            <Route path="/listings" element={<Listings/>}/>
            <Route path="/list" element={<List/>}/>
            <Route path="/buy" element = {<Buy/>}/>
            <Route path="/withdraw" element = {<Withdraw/>}/>
            <Route path="/transfer" element = {<Transfer/>}/>
        </Routes>
    )
}

export default AppRouters