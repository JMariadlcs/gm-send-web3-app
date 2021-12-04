import React, { useEffect, useState } from "react";
import './App.css';
import { ethers } from "ethers";
import abi from './utils/gmPortal.json';

const App = () => {
 
  //All gms properties to store all the gms
  const [currentAccount, setCurrentAccount] = useState("");
  const [allGms, setAllGms] = useState([]);
  const [currenttotalGMScounted, settotalGMScounted] = useState("");

  //We declare a state variable to store the message sent by the user
  const [messageValue, setMessageValue] = React.useState("")

  //Create a variable here that holds the contract address after you deploy!
  /*ContractAddress and contractABI must be changed everytime our contract is deployed
  as contract are inmutables (all variables will be reseted)*/
  const contractAddress = "0x6A8b0E9FDFff4b0158D063D8C57249161b53C6f5"; 

  //Contract address we get when deploy our contract on the backend in Rinkeby testnet
  const contractABI = abi.abi; //From the artifacts json generated in backend
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;
      
      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }
      
      /*
      Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: 'eth_accounts' });
      
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)

        //Add a textbox where user can type a message if wallet is connected
      {
          currentAccount ? (<textarea name="messageArea"
            placeholder="Type your message!"
            type="text"
            id="user_message"
            value={messageValue}
            onChange={e => setMessageValue(e.target.value)} />) : null
        }
       

      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  /*
  *Connection Metamask button here
  */
  const connectWallet = async() => {
    
    try {
      const{ethereum} = window;

      if(!ethereum){
        alert("Metamask not found!");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts"});
      
      console.log("Wallet account connected", accounts[0]);
      setCurrentAccount(accounts[0]);

      //We call to our function getAllgms when we know and ethereum account is connected
      getAllgms();

    }catch(error){
      console.log(error)
    }
  }

const gm = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        /*
        * You're using contractABI here
        */
        const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await gmPortalContract.getTotalgms();
        console.log("Retrieved total gm count...", count.toNumber());

        /*
        * Execute the actual gm from your smart contract
        */

        const gmTxn = await gmPortalContract.gm(messageValue,{gasLimit:500000})
        console.log("Mining...", gmTxn.hash);
        console.log(messageValue)

        await gmTxn.wait();
        console.log("Mined -- ", gmTxn.hash);

        count = await gmPortalContract.getTotalgms();
       // totalGMScounted = count;
       settotalGMScounted(count);
        console.log("Retrieved total gm count...", count.toNumber());
       
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  }

  
  const getAllgms = async () => {
  const { ethereum } = window;

  try {
    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const signer = provider.getSigner();
      const gmPortalContract = new ethers.Contract(contractAddress, contractABI, signer);
      const gms = await gmPortalContract.getAllGms();

      const gmsCleaned = gms.map(gm => {
        return {
          address: gm.gmer,
          timestamp: new Date(gm.timestamp * 1000),
          message: gm.message,
        };
      });

      setAllGms(gmsCleaned);
    } else {
      console.log("Ethereum object doesn't exist!");
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Listen in for emitter events!
 */
useEffect(() => {
  let gmPortalContract;

  const onNewGm = (from, timestamp, message) => {
    console.log('NewGm', from, timestamp, message);
    setAllGms(prevState => [
      ...prevState,
      {
        address: from,
        timestamp: new Date(timestamp * 1000),
        message: message,
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
}, []);


useEffect(() => {
    checkIfWalletIsConnected();
  }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
         GM FRENS!
        </div>

        <div className="bio">
        Hello everyone from the crypto space! I am JMaria and I would like to record every 'gm' I receive from a fren and never delete it! 😜. Connect your Ethereum wallet and send me a 'gm'!. Be aware that your 'gm' will be stored FOREVER!'😎
        </div>

        <p className = "Messagetitle">
        YOU CAN SEND ME A MESSAGE WITH YOUR GM!☕️
        </p>

        <p className = "warning">
        ¡Each gm sent has the 50% chance of winning some free ETH!
        </p>

        <input
              type="text"
              value={messageValue}
              onChange={(e) => setMessageValue(e.target.value)}
              placeholder="Type your message here..."
              className="inputText"
            />

        <button className="gmButton" onClick={gm}>
          Send me your 'GM'
        </button>

        {/*
        * If there is no currentAccount render this button
        */}
        {!currentAccount && (
          <button className="gmButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}   

        {allGms.map((gm, index) => {
          return (
            <div className = 'messages' key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {gm.address}</div>
              <div>Time: {gm.timestamp.toString()}</div>
              <div>Message: {gm.message}</div>
            </div>)
        })}

      </div>
    </div>
  );
}

export default App
