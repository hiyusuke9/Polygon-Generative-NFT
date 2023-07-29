import './App.css';
import React, { useEffect, useState } from "react";
import squirrelImg from './assets/rinkeby_squirrels.gif';
import { ethers } from 'ethers';
import contract from './contracts/NFTCollectible.json';
import Footer from './components/Footer';
import Header from './components/Header';


const OPENSEA_LINK = 'https://testnets.opensea.io/collection/rinkeby-squirrels';
const contractAddress = "0x84615654f62ca38EF49C223461a8bdb8Afcb6201";
const abi = contract.abi;


function App() {

  const [currentAccount, setCurrentAccount] = useState(null);
  const [metamaskError, setMetamaskError] = useState(null);
  const [mineStatus, setMineStatus] = useState(null);

  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask installed!");
      return;
    } else {
      console.log("WALLET EXISTS! WE'RE READY TO GO!");
    }

    const accounts = await ethereum.request({ method: "eth_accounts" });
    const network = await ethereum.request({ method: 'eth_chainId'});

    if (accounts.length !== 0 && network.toString() === '0x13881') {
      const account = accounts[0];
      console.log("found an authorized account: ", account);
      setMetamaskError(false);
      setCurrentAccount(account);
    } else {
      setMetamaskError(true);
      console.log("no authorized account found");
    }
  };

  const connectWalletHandler = async() => {
    const { ethereum } = window;

    if (!ethereum) {
      alert("please install metamask!");
    }

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      console.log("found an account! address: ", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (err) {
      console.log(err);
    }
  };

  const mintNftHandler = async () => {
    try {

      setMineStatus('mining');

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const nftContract = new ethers.Contract(contractAddress, abi, signer);

        console.log("initialize payment");
        let nftTxn = await nftContract.mintNFTs(1, {
          value: ethers.utils.parseEther("0.01"),
        });

        console.log("Mining... please wait");
        await nftTxn.wait();

        console.log(`Minted, see transaction: ${nftTxn.hash}`);
        setMineStatus('success');

      } else {
        setMineStatus('error');
        console.log("Ethereum object does not exist");
      }
    } catch (err) {
      setMineStatus('error');
      console.log(err);
    }
  };

  useEffect(() => {
    checkWalletIsConnected();

    if (window.ethereum) {
      window.ethereum.on('chainChanged', (_chainId) => window.location.reload());
    }
  }, [])

  const connectWalletButton = () => {
    return (
      <button
        onClick={connectWalletHandler}
        className='cta-button connect-wallet-button'
      >
        Connect Wallet
      </button>
    );
  };

  const mintNftButton = () => {
    return (
      <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
        Mint NFT
      </button>
    );
  };

  return (
    
      <div className="App">
          <div className="container">
            <Header opensea={OPENSEA_LINK} />
            <div className="header-container">
                <div className='banner-img'>
                  <img src={squirrelImg} alt="Polygon Squirrels" />
                </div>
              {currentAccount && mineStatus !== 'mining' && mintNftButton()}
              {!currentAccount && !mineStatus && connectWalletButton()}
              <div className='mine-submission'>
                {mineStatus === 'sucess' && <div className={mineStatus}>
                  <p>NFT minting successful!</p>
                  <p className='success-link'>
                    <a href={`https://testnets.opensea.io/${currentAccount}/`} target='_blank' rel='noreferrer'>Click here</a>
                    <span>to view your NFT on OpenSea</span>
                  </p>
                </div>}
                {mineStatus === 'error' && <div className={mineStatus}>
                  <div className='loader' />
                  <span>Transaction failed. Make sure you have at least 0.01matic in your wallet.</span>
                </div>}
              </div>
            </div>
            {currentAccount && <div className='show-user-address'>
            <p>
              Your address being connected: &nbsp;
              <br/>
                <span>
                  <a className='user-address' target='_blank' rel='noreferrer'>
                    {currentAccount}
                  </a>
                </span>
            </p>  
            </div>}
            <Footer address={contractAddress} />
          </div>
        </div>
  );
};
export default App;
