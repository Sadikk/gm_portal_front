import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/GmPortal.json';
import moment from 'moment';

const App = () => {
   const [currentAccount, setCurrentAccount] = useState("");
   const contractAddress = "0x283626DD71023c3EFCe4d1bb389fF645C8771604";
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

        const waveTxn = await gmPortalContract.gm(nickname, { gasLimit: 300000 });
        console.log("Mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("Mined -- ", waveTxn.hash);

        count = await gmPortalContract.getTotalGms();
        console.log("Retrieved total wave count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
}

  useEffect(() => {
    let gmPortalContract;

    checkIfWalletIsConnected();

    const onNewGm = (from, timestamp, nickname) => {
      console.log('NewGm', from, timestamp, nickname);
      setAllGms(prevState => [
        ...prevState,
        {
          address: from,
          timestamp: new Date(timestamp * 1000),
          nickname: nickname,
        },
      ]);
    };

    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      gmPortalContract.on('NewGm', onNewGm);
    }

    return () => {
      if (gmPortalContract) {
        gmPortalContract.off('NewGm', onNewGm);
      }
    };

  }, [])
  
  return (
    <div className="mainContainer">
      
      <div className="dataContainer">
        <div className="header" class="text-5xl text-center my-4">
        gm 👋
        </div>

        <div class="text-center">
          Say gm, 50% chance to win some ETH
        </div>
        
        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button class="shadow bg-purple-500 hover:bg-purple-400 my-2 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {currentAccount && (
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline my-2" type="text" placeholder="Nickname" onChange={e => setNickname(e.target.value)} />
        )}

        {currentAccount && (
        <button class="shadow bg-purple-500 hover:bg-purple-400 my-2 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded" type="button" onClick={gm}>
          gm
        </button>
        )}

        <div class="text-xl text-gray-800 mt-10 mb-1">
          Previous gmers 👇
        </div>

        {allGms.map((gm, index) => {
          return (
            <div key={index} class="place-self-end text-right my-8 w-full h-10">
                <div class="bg-green-50 text-green-900 p-5 rounded-2xl rounded-tr-none flex flex-row w-full">
                  <div class="flex flex-row relative w-full">
                    <div>gm 👋</div>
                    <div class="ml-auto">
                      <div class="text-gray-600" title={gm.address}>{gm.nickname}</div>
                    <div class="text-gray-400 text-xs">{moment(gm.timestamp).fromNow()}</div>
                    </div>          
                  </div>
                </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

export default App