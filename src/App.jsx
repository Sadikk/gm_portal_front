import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/GmPortal.json';

const App = () => {
   const [currentAccount, setCurrentAccount] = useState("");
   const contractAddress = "0x32795750392e9F56E09d1b685B5D4db972EB9Fb5";
   const contractABI = abi.abi;
   const [allGms, setAllGms] = useState([]);
   const [nickname, setNickname] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
        getAllGms();
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
  * Implement your connectWallet method here
  */
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]); 
    } catch (error) {
      console.log(error)
    }
  }

   /*
   * Create a method that gets all waves from your contract
   */
  const getAllGms = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const gms = await gmPortalContract.getAllGms();
        

        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let gmsCleaned = [];
        gms.forEach(gm => {
          gmsCleaned.push({
            address: gm.gmer,
            timestamp: new Date(gm.timestamp * 1000),
            nickname: gm.nickname
          });
        });

        /*
         * Store our data in React State
         */
        setAllGms(gmsCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const gm = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await gmPortalContract.getTotalGms();
        console.log("Retrieved total gm count...", count.toNumber());

        const waveTxn = await gmPortalContract.gm(nickname);
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await gmPortalContract.getTotalGms();
        console.log("Retrieved total wave count...", count.toNumber());

        await getAllGms();
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      
      <div className="dataContainer">
        <div className="header">
        gm
        </div>

        <button className="waveButton" onClick={gm}>
          Say gm
        </button>
        
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="waveButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        <input type="text" placeholder="Nickname" onChange={e => setNickname(e.target.value)} />

        {allGms.map((gm, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {gm.address}</div>
              <div>Time: {gm.timestamp.toString()}</div>
              <div>From: {gm.nickname}</div>
            </div>)
        })}
      </div>
    </div>
  );
}

export default App