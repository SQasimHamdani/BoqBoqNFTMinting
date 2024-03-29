
import { useWeb3React } from '@web3-react/core';
import { metamaskconnect, walletconnect, resetWalletConnector, coinbaseconnect } from './helpers/connectors';
import { getContract, contractAddress } from './helpers/contract';
import { getrunpassContract, runpasscontractAddress } from './helpers/runpassContract';
// import { whitelist } from './helpers/whitelist';
import React from 'react';
// import { ethers } from 'ethers';
// import { Web3Provider } from '@ethersproject/providers';
// import { ConnectorEvent } from '@web3-react/types'
import Axios from 'axios'
import { TripleMaze } from 'react-spinner-animated';

import 'react-spinner-animated/dist/index.css'

import { useState } from 'react';
import { useEffect } from 'react';
import { useRef , Fragment } from "react";
import ReactDom from "react-dom";
import './index.css';
// import { getProofs, whitelist, getHexRootAddress, fetchWhitelists } from './helpers/test';
// import { getProofs, whitelist } from './helpers/merkletree';
// import { getProofs, getHexRootAddress, whitelist } from './helpers/merkletree';
import { IntNumber } from 'walletlink/dist/types';
window.Buffer = window.Buffer || require("buffer").Buffer;

const Web3ReactConnectionComponent = () => {
    const [loading, setloading] = useState(true);

    // const [discord, setdiscord] = useState('https://discord.gg/HEZaQKRsHGs');
    // const [twitter, settwitter] = useState('https://twitter.com/BullRunners');
    // const [instagram, setinstagram] = useState('https://www.instagram.com/BullRunners/');
    // const [opensea, setopensea] = useState('https://opensea.io/');

    const web3reactContext = useWeb3React();
    // const [projectName, setProjectName] = useState('Run Pass');
    // const [tier_level, settier_level] = useState('');
    
    const [claimingNft, setClaimingNft] = useState(false);

    const [newwhitelist, setnewwhitelist] = useState(0);
    const [hexWhitelist, sethexWhitelist] = useState(0);
    const [treeWhitelist, settreeWhitelist] = useState(0);

    const [runpassMember, setrunpassMember] = useState(NaN);
    const [runpassTokens, setrunpassTokens] = useState(0);
    const [runpassUtilized, setrunpassUtilized] = useState(false);

    const { ethereum } = window;
    const [metamaskIsInstalled, setmetamaskIsInstalled] = useState("undefined");
    const [walletConnected, setwalletConnected] = useState(false);
    
    const [dataUpdated, setdataUpdated] = useState(false);
    const [dataUpdating, setdataUpdating] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [showNotRunPassHolderState, setShowNotRunPassHolderState] = useState(false);

    const [errorMessage, setErrorMessage] = useState('');
    const [message, setMessage] = useState('');
    const [mintedNFT, setmintedNFT] = useState('');

    // const [networkId, setnetworkId] = useState(-1)
    const [desiredChain, setDesiredChain] = useState(1)
    // const [desiredChain] = useState(5)
    
    const [predefinedsupply] = useState(10000)
    const [supply, setSupply] = useState({})

    const [mintNumber, setMintNumber] = useState(1)
    const [WLmintNumber, setWLMintNumber] = useState(1)
    const [minimumMintNumber, setminimumMintNumber] = useState(1)
    const [pass_to_mint_state, setpass_to_mint_state] = useState(-1)

    const [manualtokenPrice, setmanualtokenPrice] = useState('0.25');
    const [tokenPrice, setTokenPrice] = useState('0.25');
    const [maxMint, setmaxMint] = useState(3);

    const [showWhitelistButton, setshowWhitelistButton] = useState(false);
    const [isPublicSaleActive, setPublicSaleActive] = useState(false);
    const [isPreSaleActive, setPreSaleActive] = useState(false);
    const [isWhitelisted, setisWhitelisted] = useState(false);

    const [showWalletSection] = useState(true);
    const [wrongNetwork, setwrongNetwork] = useState(true);
    const [saleStarted, setsaleStarted] = useState(false);

    const { ethers } = require("ethers");
    const { MerkleTree } = require("merkletreejs");
    const keccak256 = require('keccak256');

    // Download the whitelisted addresses from Sheet
    // useEffect(() => {
    //     setloading(true);
    //     setdataUpdating(true);
        
    //     fetwhite();
        
    //     // setloading(false)
    //     setdataUpdating(false);
    // }, [])

    useEffect(() => {
        if (web3reactContext.account !== undefined) {            
            setwalletConnected(true);
            checkRunPassHolder();
            fetch_ContractDetails();
            
        }
        else {
            setwalletConnected(false);
        }
    }, [web3reactContext.account, runpassMember])

    // Check if Wallet Connected and whitelisted
    // useEffect(() => {
    //     if (walletConnected) {
            
    //         // console.log("walletConnected", walletConnected)
    //         getMerkleTreeData()
    //         checkWhitelisted();
    //     }
    // }, [newwhitelist])
    
    // If whitelisted, fetch the data from server.
    useEffect(() => {
        if (hexWhitelist.length !== undefined) {
            if (
                String(web3reactContext.account).toUpperCase() === "0X35435F5164B920FA073B745B5264C976C5571855".toUpperCase()
                || 
                String(web3reactContext.account).toUpperCase() === "0x219E04BfCcBFe7eaBCb361CBA80847a0DA5C3bA4".toUpperCase()
            ) {
                console.log("admin - hexroot", hexWhitelist)
            }
            fetch_ContractDetails();
        }
    }, [hexWhitelist, isWhitelisted, runpassMember])
    
    
    


    //  Listen for any change in ethereum
    useEffect(() => {
        var metamaskIsInstalled = ethereum && ethereum.isMetaMask
        setmetamaskIsInstalled(metamaskIsInstalled);
        // console.log("metamaskIsInstalled", metamaskIsInstalled)
        
        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum, "any")
            provider.on("network", (newNetwork, oldNetwork) => {
                // setnetworkId(newNetwork);
                if (oldNetwork) {
                    // console.log("Network Changed")
                    changeNetwork();
                }
            });

            ethereum?.on("accountsChanged", handleAccountChange);
            ethereum?.on("networkChanged", handleChainChange);
        }
        else {
            setErrorMessage("Web3 Wallet not Found, try changing browser")
        }
    }, [])
    
    useEffect(() => {
        init();
        const timer = setTimeout(() => {
            setloading(false);
        }, 10000);
        return () => clearTimeout(timer);
    }, [])
    
    
    useEffect(() => {
        // if (web3reactContext.connector === coinbaseconnect) {

        // }
        // console.log("web 3", web3reactContext)
        // console.log("web 3 connector",  web3reactContext.connector)
        setsaleStarted(isPreSaleActive === true || isPublicSaleActive === true)

        if (web3reactContext.connector !== undefined && web3reactContext.account !== undefined) {
            try {
                verify_network_chain();
                if (dataUpdated === false && dataUpdating === false) {
                    // console.log("5", web3reactContext)
                    // fetch_ContractDetails();
                    setdataUpdating(true);
                }    
            } catch (error) {
                setErrorMessage("Error while Fetching Data from Contract");
            }
        }

        else {
            if (localStorage.getItem("wallet_type")) {
                verify_network_chain();
                // disconnect();
                
            }
            setwrongNetwork(false);
            // setloading(false);
        }

    },);

    
    async function verify_network_chain() {
        if (desiredChain !== web3reactContext.chainId) {
            setwrongNetwork(true);
            if (desiredChain === 1) {
                setErrorMessage("Switch to Mainnet Ethereum");
                changeNetwork();
            } else if (desiredChain === 2) {   
                setErrorMessage("Switch to Rinkbey Testnet");
                changeNetwork();
            }
            else if (desiredChain === 5) {   
                setErrorMessage("Switch to Goerli Testnet");
                changeNetwork();
            }
        }
        else {
            setwrongNetwork(false);
            // if (errorMessage.includes("Switch to ")) {
            //     setErrorMessage("");
            // }
        }
    };
    
    
    const refresh_page = () => {
        window.location.reload();
    };

    const handleAccountChange = (...args) => {
        refresh_page();
    };
    const handleChainChange = (...args) => {
        refresh_page();
    };

    const init = async () => {
        try {
            if (localStorage.getItem("wallet_type") === "metamask") {
                setloading(true);
                await connectMetamaskSimple();
            }
            else if (localStorage.getItem("wallet_type") === "coinbase") {
                connectCoinbaseSimple();
            }
            else if (localStorage.getItem("wallet_type") === "walletconnect") {
                connectWalletConnectSimple();
            }
            else {
                setloading(false);
                localStorage.removeItem("wallet_type");
            }
        } catch (errorMessage) {
            // console.log("errorMessage", errorMessage)
        }
    }

    const fetwhite=async()=>{
        if (newwhitelist.length === undefined) {
            var keys = [
                "AIzaSyDyF24NLFqmmnn915-74nfNjsEckRiM2vc",
                "AIzaSyBWl7ZP-nUGjG1uLbsnGad34I4hPa4zYFk",
                "AIzaSyC5H0eDZ8GL5yLTYFB6nbdjK9igMjPf98M",
            ]
                
            const response = await Axios.get('https://sheets.googleapis.com/v4/spreadsheets/1gmEQhpHINczyKefl4iIIF1h1BTt-dRxEAOUPMqW11mI/values/A2:A?key='+keys[Math.floor(Math.random() * keys.length)]);;
            // console.log("sHEET RESPONSE", response.data.values)

            let data = response.data.values
            // console.log("data", data)
            let data_array = data.flat(1);
            // console.log("data_array", data_array)

            setnewwhitelist(data_array)
            // getMerkleTreeData()
            // setnewwhitelist(JSON.parse(response.text()).values)
            console.log("fetched from Sheets")
        } else {
            console.log("fetched ", newwhitelist.length)
        }
    }

    const getMerkleTreeData = async () => {
        let count = 0

        if (newwhitelist.length !== undefined) {
            // console.log("this is newwhitelist", newwhitelist, newwhitelist.length, typeof(newwhitelist))
            newwhitelist.map((wallet) =>
                {
                    // console.log(wallet);
                    count = count+1
                }
            )
            if (
                String(web3reactContext.account).toUpperCase() === "0X35435F5164B920FA073B745B5264C976C5571855".toUpperCase()
                || 
                String(web3reactContext.account).toUpperCase() === "0x219E04BfCcBFe7eaBCb361CBA80847a0DA5C3bA4".toUpperCase()
            ) {
                console.log("admin - whitelists =", count);
            }

            // for (let i = 300; i < newwhitelist.length; i++)
            // {
            //     console.log(i, newwhitelist[i])
            // }

            const leaves = newwhitelist.map(x => keccak256(x))
            // console.log("newwhitelist", newwhitelist)
            // console.log("leaves", leaves)
            let tree = new MerkleTree(leaves , keccak256 , {sortPairs: true})
            settreeWhitelist(tree);
            // const root = tree.getRoot()
            let hexroot = tree.getHexRoot()
            sethexWhitelist(hexroot);
            
        }
    }

    function getProofs(addresses){
        // console.log(treeWhitelist.getHexProof(ethers.utils.keccak256(address[0].toString('hex'))))
        
        // console.log("treeWhitelist", treeWhitelist)
        let a = addresses.toString('hex')
        let b = ethers.utils.keccak256(a)
        let proofs = treeWhitelist.getHexProof(b)
        // console.log("a-b", a, b)
        // console.log("proofs", proofs)
        
        // let proofs = treeWhitelist.getHexProof(ethers.utils.keccak256(address[0].toString('hex')));
        // console.log("proofs", proofs, )
        return proofs
    };

    // async function checkWhitelisted() {
    //     // console.log("account", web3reactContext.account)
    //     try {    
    //         newwhitelist.map((address) =>{
    //             if (String(address).toLowerCase() === String(web3reactContext.account).toLowerCase()) {
    //                 setisWhitelisted(true)
    //                 // console.log("whitelisted", isWhitelisted)
    //                 console.log("whitelisted")
    //             }
    //         })
    //     } catch (error) {
    //         console.log("Checking Whitelist Error", error)
    //     }
    // };


    async function checkRunPassHolder() {
        setloading(true)

        const contract = getContract(web3reactContext.library, web3reactContext.account);
        let overrides = {
                // gasLimit: 9000000000000000,
                // gasLimit: 9000990111740990, //max
                // gasLimit: 280000000, //200
                gasLimit: 58000000000, //250
            }
        try {
            // let rpWalletPasses = Number(await contract.passUtilized(1, overrides = overrides));
            // console.log("rpWalletPasses", rpWalletPasses)
            let runpass_freemints = await contract.rpchecktokens(web3reactContext.account, overrides = overrides);
            console.log("free mints=", Number(runpass_freemints))
            if (runpass_freemints > 0) {
                setrunpassMember(true)
                setpass_to_mint_state(runpass_freemints)

                setMessage("You can mint " + runpass_freemints + " Bulls for free")
                setloading(false)
                return true
            }
            else {
                setrunpassMember(false)
            }
        } catch (errorMsg) {
            console.log("Error - Connecting to RunPass Contract", errorMsg)
        }
        setloading(false)
        return false
    }
    
    async function fetch_ContractDetails() {
        // setnetworkId(1);
        setloading(true);
        setErrorMessage("");
        changeNetwork();
        // try {
            // console.log("fetch_ContractDet 1",web3reactContext)
            if (web3reactContext.connector === undefined || web3reactContext.account === undefined || web3reactContext.chainId === undefined) {
                return
            }
            verify_network_chain();
            // console.log("Why passed to here")
            const contract = getContract(web3reactContext.library, web3reactContext.account);
            const totalSupply = String(await contract.circulatingSupply());
            // let overrides = {
            //     // gasLimit: 9000000000000000,
            //     // gasLimit: 9000990111740990, //max
            //     // gasLimit: 280000000, //200
            //     gasLimit: 58000000000, //250
            // }

            // console.log(ethers.utils.formatEther(tempPrice))
            const object = {
                "totalSupply": String(totalSupply),
                "percent": String(String((totalSupply / predefinedsupply * 100)).slice(0, 4) + '%')
            }

            setSupply(object);
            
            let premintStatus = Boolean(await contract.premintStatus());
            // console.log("premintStatus", premintStatus);
            let mintStatus = Boolean(await contract.mintStatus());
            // mintStatus = "false";
            // console.log("mintStatus", mintStatus);
        
            let NFTPrice = String(await contract.mintPrice()/1000000000000000000);
            let NFTMaxMint = IntNumber(await contract.MAX_MINT());
            
            setTokenPrice(NFTPrice)
            setmaxMint(NFTMaxMint)
            
            // if (runpassMember) {
            //     // setPreSaleActive(true);
            //     // setPublicSaleActive(false);
            //     // setshowWhitelistButton(true);
                

                
            //     // setMessage("You can mint "+ pass_to_mint_state+" Bulls for free")
            // }
            let runpass_holder = false;
            if (premintStatus) {
                if (runpassMember) {
                    setTokenPrice("0");
                    setmaxMint(10);
                    setErrorMessage("");

                    setPreSaleActive(true);
                    setPublicSaleActive(false);
                    setshowWhitelistButton(true);
                } else {
                    setErrorMessage("You are not a RunPass Holder!");
                    runpass_holder = true
                    
                }
            }
            else if (mintStatus) {
                // console.log("2")
                setPreSaleActive(false);
                setPublicSaleActive(true);
                setshowWhitelistButton(false);
            }
            
            try {
                let ownedTokens_str = String(await contract.tokensOfWallet(web3reactContext.account));
                let ownedTokens = ownedTokens_str.split(",").map(Number);

                if (ownedTokens[0]!==0) {
                    let last_token = ownedTokens[ownedTokens.length - 1]
                    setmintedNFT("https://opensea.io/assets/ethereum/" +contractAddress +"/" +last_token)
                    setMessage("Whoaa there!! You've claimed your " + ownedTokens.length + " BULLRUNNERS with the RUN PASSES in this wallet");
                    if (runpass_holder) {
                        setErrorMessage("")
                    }
                }
                else {
                    // console.log("owned nothing.")
                    // console.log("asad", runpassMember)
                    if (runpassMember){
                        setShowNotRunPassHolderState(false);
                    }else{
                        setShowNotRunPassHolderState(true);
                    }
                }
            }
            catch{
                console.log("Last Token Not found")
            }
        
        setdataUpdated(true);
        setdataUpdating(false);
        setloading(false)
    
    }


    async function take_action(id) {
        
        // console.log("take_action web3reactContext", web3reactContext)
        if (web3reactContext.connector === undefined || web3reactContext.account === undefined) {
            openModal();
            // console.log("Connect Wallet Model Opened")
            return
        }
        else if (web3reactContext.chainId !== desiredChain) {
            verify_network_chain();

            changeNetwork();
            // console.log("error in take_action")
            setMessage("")
            return
        }
        // console.log("Connection Passed")
        // fetch_ContractDetail();
        // console.log('tokenPrice',tokenPrice)
        let total_price;
               
        
        if (id === 1) {
            total_price = String(tokenPrice * mintNumber);
            mint(total_price, "mint")
        }
        else if (id === 2) {
            total_price = String(tokenPrice * WLmintNumber)
            mint(total_price, "premint")
        }
    };

    async function mint(total_price, mintType = 'undefined') {
        if (typeof ethereum !== 'undefined') {
            
            
            setClaimingNft(true);
            const myContractSigner = getContract(web3reactContext.library, web3reactContext.account);
            try {
                
                let transaction;
                if (mintType === 'mint') {
                    // console.log("minting method")
                    transaction = await myContractSigner.mint(mintNumber, { value: ethers.utils.parseEther(total_price), gasLimit: 250000 });
                    await transaction.wait();
                }
                else if (mintType === 'premint') {
                    // let buyerproof = getProofs(web3reactContext.account);
                    // console.log("Buyer proof", buyerproof)

                    // window.ethereum.enable()
                    // const provider = new ethers.providers.Web3Provider(window.ethereum);
                    // const signer = provider.getSigner(web3reactContext.account);

                    // if (runpassUtilized) {
                    //     // console.log("whitelist mint")
                    //     // setMessage("whitelist mint")
                    //     transaction = await myContractSigner.connect(signer).whitelistMint(buyerproof, WLmintNumber, { value: ethers.utils.parseEther(total_price), gasLimit: 250000 });
                    // } else {
                    //     // setMessage("runpass mint")
                    //     transaction = await myContractSigner.runpassMint(WLmintNumber, runpassTokens, { value: ethers.utils.parseEther(total_price), gasLimit: 250000 });
                    // }
                    total_price = "0"
                    console.log("price", ethers.utils.parseEther(total_price))
                    let resGasMethod;
                    try {
                        resGasMethod = await myContractSigner.estimateGas.runpassMint();
                        resGasMethod = Number(resGasMethod);
                        resGasMethod = IntNumber(resGasMethod*1.05);
                    } catch (error) {
                        resGasMethod = 500000
                    }
                    
                    let mint_verify = checkRunPassHolder();
                    if (mint_verify) {
                        
                        console.log("est", resGasMethod)
                        transaction = await myContractSigner.runpassMint({ value: ethers.utils.parseEther(total_price), gasLimit: resGasMethod });
                        await transaction.wait();
                    }
                    else {
                        refresh_page();
                    }
                }
                // }
                else {
                    return
                }

                console.log("Transaction Done",transaction, "https://etherscan.io/tx/" + transaction.hash);
                if (desiredChain === 1) {
                    let totalSupplyNumber = IntNumber(supply.totalSupply) + 1
                    setmintedNFT("https://opensea.io/assets/ethereum/" +contractAddress +"/" +totalSupplyNumber)
                    // console.log("View your NFT at", "opensea.io/assets/ethereum/" +contractAddress +"/" +totalSupplyNumber)
                }else if (desiredChain === 4) {
                    let totalSupplyNumber = IntNumber(supply.totalSupply)+1
                    setmintedNFT("https://testnets.opensea.io/assets/rinkeby/" +contractAddress +"/" +totalSupplyNumber)
                    // console.log("View your NFT at", "testnets.opensea.io/assets/rinkeby/" +contractAddress +"/" +totalSupplyNumber)
                }else if (desiredChain === 5) {
                    let totalSupplyNumber = IntNumber(supply.totalSupply)+1
                    setmintedNFT("https://testnets.opensea.io/assets/goerli/" +contractAddress +"/" +totalSupplyNumber)
                    // console.log("View your NFT at", "testnets.opensea.io/assets/rinkeby/" +contractAddress +"/" +totalSupplyNumber)
                }
                
                setdataUpdated(false);
                setMessage("Bulls Minted Successfully");
                fetch_ContractDetails();
                setErrorMessage("");
                // console.log("Error Message CLeared")
                setClaimingNft(false);
                refresh_page();

            }
            catch (err) {
                // console.log("Error",err?.error.code,"-", err?.error.message)
                console.log("Error2", err)
                
                if (err?.message.includes("DAppBrowser")) {
                    setErrorMessage("Mobile Browser Error");
                }
                // else {
                //     er_mes = er_mes + err +"-";
                //     setErrorMessage("Error"+ er_mes);
                // }
                
                if (err?.code === "INVALID_ARGUMENT") {
                    // console.log("User Declined Payment")
                    setErrorMessage("Whitelist Error");
                    setMessage("Backend Updating! Try Back in a Minute");
                }
                
                if (err?.code === 4001) {
                    // console.log("User Declined Payment")
                    setErrorMessage("User Declined Transaction");
                }

                if (err?.error?.code === -32000) {
                    // console.log("You have Insufficient Balance")
                    setErrorMessage("You have Insufficient Balance");
                }

                if (err?.code === -32002) {
                    // console.log("Transaction In Process")
                    setErrorMessage("Transaction In Process - Open Wallet");
                }

                if (err?.code === -32603) {
                    console.log("Transaction In Process")
                    try {
                        if (err?.message.includes("Cannot set properties of undefined")) {
                            setErrorMessage("Metamask Error");
                        }
                    }
                    catch {
                        setErrorMessage("Error",err?.message );
                    }
                }

                if (err?.error?.code === -32603) {
                    if (err?.error?.message === "execution reverted: Not on whitelist") {
                        setErrorMessage("Address Not Whitelisted");
                        setPublicSaleActive(true);
                        setshowWhitelistButton(false);
                    }
                    else if (err?.error?.message === "execution reverted: No presale for now") {
                        setErrorMessage("Presale Not Started Yet");
                    }
                    else if (err?.error?.message === "execution reverted: Exceeded MAX Token Mint per Address") {
                        setErrorMessage("Sorry You have already utilized Whitelist Spot!");
                        setPublicSaleActive(true);
                        setshowWhitelistButton(false);
                    }
                    else {
                        setErrorMessage("Unexpected Error");
                    }
                }

                // setErrorMessage(err.message);
                setClaimingNft(false);
            }

        }
        else {
            setMessage("Ethereum not Found, Change Browser");
        }
    }
    
    

    //web3react metamask
    const connectMetamaskSimple = async () => {
        try {
            setmetamaskIsInstalled(ethereum && ethereum.isMetaMask);
            if (typeof metamaskIsInstalled === 'undefined') {
                // console.log('web3reactContext',web3reactContext)
                setShowModal(false);
                setErrorMessage("Metamask Not Installed")
                web3reactContext.deactivate();
                // console.log("Metamask not INstalled", web3reactContext)
                
                return
            }

            await ethereum.request({
                method: 'eth_requestAccounts'
            })
            // console.log("accounts", accounts)
            web3reactContext.activate(metamaskconnect, undefined, true);
            

            setShowModal(false);
            setMessage("Metamask Wallet Connected");
            // setwalletConnected(true);
            localStorage.setItem("wallet_type", "metamask");
            // console.log("metamask connect 2", web3reactContext)


        } catch (ex) {
            // console.log("Wallet Connection Error", ex);
            localStorage.setItem("wallet_type", "");
            if (ex?.code === -32002) {
                // console.log("Transaction In Process")
                setErrorMessage("Transaction In Process - Open Metamask");
            }else{
                setErrorMessage("Metamask Connection Error");
            }
        }
        
    };

    // web3react walletconnect
    const connectWalletConnectSimple = async () => {
        try {
            resetWalletConnector(walletconnect);
            web3reactContext.activate(walletconnect);
            setShowModal(false);
            setMessage("Connected using WalletConnect");
            // setwalletConnected(true);
            localStorage.setItem("wallet_type", "walletconnect");
            
            // }
            // console.log("coinbase", web3reactContext.connector,web3reactContext, web3reactContext.account)
        } catch (ex) {
            setErrorMessage("WalletConnect Connection Error")
            // console.log("WalletConnect Connection Error", ex);
        }
    };

    //web3react coinbase
    const connectCoinbaseSimple = async () => {

        try {
            if (typeof window.ethereum !== "undefined") {
                let provider = window.ethereum;

                if (window.ethereum.providers?.length) {
                    window.ethereum.providers.forEach(async (p) => {
                        if (p.isCoinbaseWallet) {
                            provider = p;
                        }
                    });
                }

                await provider.request({
                    method: "eth_requestAccounts",
                    params: [],
                });
            }
            await web3reactContext.activate(coinbaseconnect);

            setShowModal(false);
            setMessage("Coinbase Wallet Connected");
            // setwalletConnected(true);
            localStorage.setItem("wallet_type", "coinbase");
            


        } catch (ex) {
            setErrorMessage("Coinbase Wallet Connection Error")
            // console.log("Coinbase Wallet Connection Error", ex);
        }

    };

    const changeNetwork = async () => {
        try {
            if (ethereum) {

                const networkIdNow = await ethereum.request({
                    method: "net_version",
                });

                if (desiredChain !== parseInt(networkIdNow)) {
                    try {
                        await ethereum.enable();
                        // console.log("Change Network")
                        if (desiredChain === 1) {
                            // setErrorMessage("You are not on Ethereum Mainnet");
                            await ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: '0x1' }],
                            });
                        }
                        else if (desiredChain===4) {
                            // setErrorMessage("You are not on Ethereum Rinkbey Testnet");
                            await ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: '0x4' }],
                            });
                        }
                        else if (desiredChain===5) {
                            // setErrorMessage("You are not on Ethereum Goerli Testnet");
                            await ethereum.request({
                                method: 'wallet_switchEthereumChain',
                                params: [{ chainId: '0x5' }],
                            });
                        }
                        
                        
                        window.location.reload(false);
                    } catch (errorMessage) {
                        // console.log(errorMessage);
                        if (errorMessage.code === 4902) {
                            if (desiredChain === 1) {
                                setErrorMessage("Add Ethereum Mainnet to your wallet");
                            }
                            else if (desiredChain===4) {
                                setErrorMessage("Add Ethereum Rinkbey Testnet to your wallet");
                            }
                            else if (desiredChain===5) {
                                setErrorMessage("Add Ethereum Goerli Testnet to your wallet");
                            }
                            
                        }
                    }
                }
            }
        } catch (error) {
            // console.log("Cannot Switch to Network ", error)
            setErrorMessage("Cannot Switch to Network ", error)
        }
    };

    const disconnect = () => {
        try {
            web3reactContext.deactivate();
            setwalletConnected(false);
            setdataUpdated(false);
            setErrorMessage("");
            setMessage("");
            setmintedNFT("");
            localStorage.removeItem("wallet_type");
            setTokenPrice(manualtokenPrice);

        } catch (ex) {
            // console.log(ex);
        }
    };
    
    const openModal = () => {
        setShowModal(true);
    };

    const Modal = ({ setShowModal }) => {
        // close the modal when clicking outside the modal.
        const modalRef = useRef();
        const closeModal = (e) => {
            if (e.target === modalRef.current) {
                setShowModal(false);
            }
        };
        
        //render the modal JSX in the portal div.
        return ReactDom.createPortal(
            <div className="container" ref={modalRef} onClick={closeModal}>
                <div className="modal cust_modal row text-center">
                    <div className="col-sm-12">

                    { errorMessage && (
                                <>
                                    <div className='text-center mint_under_button'>
                                        <p className="bg-danger text-light">{errorMessage}</p>
                                    </div>
                                </>
                                )}
                        <Fragment>
                            <div className="row text-center">
                                <div className="col-sm-12">
                                    {/* <h2>Connect Wallets</h2> */}
                                    <h2 className="h2head">Connect Wallet</h2>
                                </div>
                            </div>
                            <div className="row text-center mt-3 mb-3 ">
                                <div className="col-sm-12 text-center">
                                    <button onClick={connectMetamaskSimple} className="fourth btn btn_metamask btn_cion ">
                                        <img className="icon_wallets" src="assets/images/metamask.svg" />
                                        <span className="text_icn"> Metamask </span>
                                    </button>
                            
                                </div>
                            </div>
                            <div className="row text-center mt-3 mb-3 ">
                                <div className="col-sm-12">
                                    <button onClick={connectWalletConnectSimple} className="btn_cion btn_connect btn btn-info">
                                        <img className="icon_wallets" src="assets/images/walletconnect.svg" />
                                        <span className="text_icn"> WalletConnect </span>
                                    </button>
                                </div>
                            </div>
                            <div className="row text-center mt-3 mb-3 ">
                                <div className="col-sm-12">
                                    <button onClick={connectCoinbaseSimple} className="btn_cion btn_cb btn_cion_animation btn btn-info">
                                        <img className="icon_wallets" src="assets/images/coinbasewallet.svg" />
                                        <span className="text_icn"> CoinBase </span>
                                    </button>
                                </div>
                            </div>
                        </Fragment>
                    </div>
                    <button className='closemdlbtn' onClick={() => setShowModal(false)}>X</button>

                </div>
            </div>, document.getElementById("portal")
        );
    };

    async function decreaseMintNumber() {
        if (mintNumber > minimumMintNumber)
        {
            setMintNumber(mintNumber - 1);
        }
    };
    async function increaseMintNumber() {
        if (mintNumber < maxMint)
        {
            setMintNumber(mintNumber + 1);
        }
    };
    async function WLdecreaseMintNumber() {
        if (WLmintNumber > minimumMintNumber)
        {
            setWLMintNumber(WLmintNumber - 1);
        }
        console.log(WLmintNumber)
    };
    async function WLincreaseMintNumber() {
        if (WLmintNumber < maxMint)
        {
            console.log(WLmintNumber + 1)
            setWLMintNumber(WLmintNumber + 1);
        }
        console.log(WLmintNumber)

    };

    const showNotRunPassHolderPopup = () => {
        setShowNotRunPassHolderState(true);
    };

    
    const RunPassModal = ({ setShowNotRunPassHolderState }) => {
        // close the modal when clicking outside the modal.
        const modalRef = useRef();
        const closeRunPassModal = (e) => {
            if (e.target === modalRef.current) {
                setShowNotRunPassHolderState(false);
            }
        };
        return ReactDom.createPortal(
            <div className="container" ref={modalRef} onClick={closeRunPassModal}>
                <div className="runpassmodal row">
                    <div className="col-sm-4 bull_sec_image">
                        <img className="image_security" src="assets/images/bulls/security.png" />
                    </div>
                    <div className="col-sm-8 text-center">
                        <div className='row text-center d-block '>
                            <h1 className='text-red textb'>WHOAHH THERE BULL!</h1>
                        </div>
                        <div className='row mt-5'>
                            <p className='text_cust'>Looks like 
                            <span className='text-red'> the wallet you connected doesn't hold an Official RUN PASS. <br /></span>
                            In order to mint a BULLRUNNERS NFT you have to join the club & <br />
                            connect the wallet that holds your RUN PASS NFT.</p>
                        </div>
                        <div className='row row_btn mt-4'>
                            <a href='http://runpass.com/' rel="noreferrer" target="_blank" className='text-center'>
                                <button className='btn btn-dark btn-cust'>CLICK HERE TO JOIN THE CLUB</button>
                            </a>
                        </div>
                    </div>
                    <button className='closemdlbtn' onClick={() => setShowNotRunPassHolderState(false)}>X</button>

                </div>
            </div>, document.getElementById('runpassportal')
        );
    };

    var slideIndex = 1;
    // showDivs(slideIndex);
    
    function plusDivs(n) {
        showDivs(slideIndex += n);
    }
    
    function showDivs(n) {
        var i;
        var x = document.getElementsByClassName("mySlides");
        // console.log("x",x)
        if (n > x.length)
            { slideIndex = 1 }
        if (n < 1)
            { slideIndex = x.length }
        for (i = 0; i < x.length; i++) {
            // console.log("x[i].classList",x[i].classList)
            x[i].classList.add("d-none");
        }
        x[slideIndex-1].classList.remove("d-none");
    }

    return (
        <>
            
    
    {loading || dataUpdating ?
        (<>
            <TripleMaze  text={"Connecting with Blockchain"} bgColor={"#28a745"} color={"#fff"} center={true} width={"150px"} height={"150px"}/>
        </>
        ):(
        <>
            
        <div className="container bg-nav"  id='mint'>  
            <nav className="navbar navbar-expand-lg navbar-light ">
                <a className="navbar-brand " href="/">
                    <img className="logo_s " alt='BULLRUNNERS NFT Collection' src="assets/images/logomain.png"/>
                </a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                </button>
        
                <div className="collapse navbar-collapse" id="navbarText">
                    <ul className="navbar-nav ml-auto">

                        
                        {wrongNetwork ?
                        (<>
                            <li className="nav-item">
                                <a className="nav-link text-red" href="#"><button className='disconnect_wallet fourth'>Wrong Network</button></a>
                            </li>
                        </>
                        ):(
                        <></>
                        )}
                        
                        {walletConnected ?
                        (<>
                            <li className="nav-item">
                                                    <a className="nav-link "><button className='disconnect_wallet fourth' style={{ marginTop:"-20px"}} onClick={() => disconnect()}>Disconnect</button>
                            </a>
                            </li>
                        </>
                        ):(
                        <></>
                        )}

                        { web3reactContext.account &&
                            <li className="nav-item">
                                    <a className="nav-link wallet_address ">{web3reactContext.account.substring(0,5)}....{web3reactContext.account.substring(38,42)}</a>
                            </li>
                        }

                        <li className="nav-item active">
                                <a className="nav-link" href="#mint">Mint</a>
                        </li>
                        <li className="nav-item">
                                <a className="nav-link"  href="#roadmap">Launch Dates</a>
                        </li>
                        <li className="nav-item">
                                <a className="nav-link" target="_blank" rel="noreferrer" href="http://runpass.com/">Get Whitelisted</a>
                        </li>
                                
                    </ul>
                </div>
            </nav>
        </div>
            
        
                
        <div className="container container_banner ">
            <div className="row">
                <div className="col-sm-12 col-md-6 first_div">
                    
                    { showWalletSection && (
                    <>  
                                    
                        {/* {walletConnected ?
                        (<>
                            <button className='disconnect_wallet fourth' onClick={() => disconnect()}>Disconnect</button>
                        </>
                        ):(
                        <></>
                        )} */}

                        
                        <div className="col-sm-12">
                                    
                            <div id="portal">
                                {showModal ? <Modal setShowModal={setShowModal} /> : null}
                            </div>
                            <div id="runpassportal">
                                {showNotRunPassHolderState ? <RunPassModal setShowNotRunPassHolderState={setShowNotRunPassHolderState}/> : ""}
                            </div>
                            <div id="mint" className="herofour">
                                
                                        
                                { errorMessage && (
                                <>
                                    <div className='text-center mint_under_button'>
                                        <p className="bg-danger text-light">{errorMessage}</p>
                                    </div>
                                </>
                                )}
                                       
                                
                                
                                { message &&
                                    <div className='text-center mint_under_button'>
                                        <p className="bg-success text-light">{message}</p>
                                    </div>
                                }
                                { mintedNFT &&
                                    <div className='text-center mint_under_button'>
                                        <a href={mintedNFT} target="_blank" rel="noreferrer"><p className="bg-info text-light">See Latest Bull on Opensea</p></a>
                                    </div>
                                }
                                
                                        
                                { walletConnected ?
                                (<>
                                    {dataUpdated ?
                                    (<>
                                        {supply.totalSupply >= predefinedsupply  ?
                                        (<>
                                            <div className="row">
                                                <div className="col-sm  text-center ">
                                                    <div className="buttons_mint_div">
                                                        <button className=" m-2 btn mintbtn">Sold Out!</button>
                                                    </div>
                                                    
                                                    {/* <div className='text-center mt-4 mint_under_button'>
                                                        <a href='{mintedNFT}' target="_blank" rel="noreferrer" ><p className="bg-info text-light">Trade on Opensea</p></a>
                                                    </div> */}
                                                </div>
                                            </div>
                                        </>)
                                        :
                                        (<>
                                            {isPublicSaleActive ? (
                                            <>
                                                <div className="row">
                                                    <div className="col-sm  text-center ">
                                                        {/* <p className="mintedcounts"  >{supply.totalSupply} / {predefinedsupply} </p> */}
                                                                                                              
                                                        <div className="progress shine" data-width="{supply.percent}" >
                                                            <div className="progress-text">{supply.totalSupply}/{predefinedsupply}</div>
                                                            <div className="progress-bar" style={{ width: supply.percent }}>
                                                                <div className="progress-text">{supply.percent}</div>
                                                            </div>
                                                        </div>

                                                    </div>
                                                </div>
                                                
                                                <div className="row">
                                                    <div className="col-sm  text-center ">
                                                        <div className="buttons_mint_div">
                                                            <button className={`mintbtn m-2 opacity-${mintNumber<2 ? "50" : "100"}`} disabled={mintNumber<2 ? 1 : 0} onClick={decreaseMintNumber}>-</button>
                                                            <button className="mintbtn m-2" disabled={claimingNft ? 1 : 0} onClick={() => take_action(1)}>{claimingNft ? "BUSY" : "Click to MINT"} {mintNumber}</button>

                                                            <button className={`mintbtn m-2 opacity-${mintNumber>=maxMint ? "50" : "100"}`} disabled={mintNumber==maxMint ? 1 : 0} onClick={increaseMintNumber}>+</button>
                                                            
                                                                <span className="d-block text-white text-bold">Price: {tokenPrice}Ξ</span>
                                                            <span className="d-block text-white text-bold">Max Mint {maxMint}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                            ): (
                                            <></>
                                            )}
                                        

                                            {showWhitelistButton ? (
                                            <>
                                                
                                                <div className="row">
                                                    <div className="col-sm  text-center ">
                                                        {/* <p className="mintedcounts"  >{supply.totalSupply} / {predefinedsupply} </p> */}
                                                        <div className="progress shine" data-width="{supply.percent}" >
                                                            <div className="progress-text">{supply.totalSupply}/{predefinedsupply}</div>
                                                            <div className="progress-bar" style={{ width: supply.percent }}>
                                                                <div className="progress-text">{supply.percent}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="row">
                                                    <div className="col-sm  text-center ">
                                                        <div className="buttons_mint_div">
                                                            {/* <button className="mintbtn m-2" onClick={WLdecreaseMintNumber}>-</button> */}
                                                            <button className="mintbtn m-2" disabled={claimingNft ? 1 : 0} onClick={() => take_action(2)}>{claimingNft ? "BUSY" : "Click to MINT Free"}</button>

                                                            {/* <button className="mintbtn m-2" onClick={WLincreaseMintNumber}>+</button> */}
                                                            <span className="d-block text-white text-bold">WL Price: {tokenPrice}Ξ</span>
                                                            <span className="d-block text-white">This one click will mint ALL your Bulls at once</span>
                                                            {/* <span className="d-block text-white text-bold">Max Mint {maxMint}</span> */}
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                            ): (
                                            <></>
                                            )}
                                            
                                            { saleStarted ? (
                                            <>
                                                
                                            </>
                                            ): (
                                            <>
                                                <div className="row">
                                                    <div className="col-sm  text-center ">
                                                        <div className="buttons_mint_div">
                                                            <button ref={el => {
                                                                    if (el) {
                                                                        el.style.setProperty('background-color', '#A10000', 'important');
                                                                        el.style.setProperty('color', 'white', 'important');
                                                                    }
                                                                }}
                                                                className="mintbtn m-2" >PUBLIC MINT HAS NOT STARTED</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </>
                                            )}
                                            
                                        </>
                                        )}
                                    </>) :
                                    (
                                    <>
                                        <div className="row">
                                            <div className="col-sm  text-center ">
                                                <div className="buttons_mint_div">
                                                    <button className="mintbtn m-2" disabled={dataUpdating ? 1 : 0} onClick={() => fetch_ContractDetails()}>{dataUpdating ? "Updating" : "Update"}</button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                    )}
                                </>)
                                :
                                (
                                <>
                                    <div className="main_text">
                                        <h1>BULLRUNNERS</h1>
                                        <h5 className="text_span">GENERAL PUBLIC MINT PRICE: {tokenPrice} ETH</h5>
                                        <h5 className="text_span">RUN PASS HOLDERS: FREE</h5>
                                    </div>
                                    <div className="sperator_line"></div>
                                    {/* <span className="text_line">1,000 rare NFT passes for the Bullrunners Club new token launch.</span> */}
                                    <button className=" text-a wallet_btn fourth" onClick={() => take_action(3)} >CONNECT WALLET{walletConnected ? "" : <span className="span_holder">RUN PASS HOLDERS ONLY</span>}</button>
                                    
                                    
                                </>
                                )}
                                        

                                
                                {/* <div className="row">
                                    <div className="col-sm  text-center ">
                                        {metamaskIsInstalled === false ? (
                                            <button className=" m-2 btn btn-danger">Connect Metamask!</button>
                                        ) : (
                                                <div>
                                                {( -1 == parseInt(networkId) || 1 == parseInt(networkId) ) ? (
                                                        <></>
                                                ) : (
                                                    <button className=" m-2 btn btn-info">Make Sure you are Ether Mainnet</button>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div> */}
                                
                            </div>
                        </div>
                    </>
                    )}
                </div>
                
                <div className="col-sm-12 col-md-6">
                    
                    <div className="w3-content w3-display-container">
                        <img className="mySlides" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/WIP-0106487.png" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/6a569e4e-a813-4241-8459-bd29baa03e38-0107412.JPG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/IMG_5212-0519758.PNG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/IMG_0280_4-3529705.PNG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/IMG_0283_4-3529712.PNG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/IMG_0279_2-3529699.PNG" />
                        
                        
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/7a07c2ac-e71e-45e7-a6d4-801b89a45381-0107983.JPG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/Hugh1080Co2-0106476.png" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/a801de5b-66b0-44a0-be2d-d063b1a312a9-0107984.JPG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/ScreenLeopard2-0106484.png" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/CowHay1080Co-0106475.png" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/1920Tigercomp_-_Copy-0106457.png" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/ScreenGiraffe2-0106482.png" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/PHOTO-2022-04-16-03-15-22-0108994.jpg" />
                        
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/18D4585F-08C3-4E60-87A2-E21C60BEC343-3529718.JPG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/5050CCB2-15DE-4425-97BF-A0D2A70F2DCC-3529718.JPG" />
                        <img className="mySlides d-none" src="https://content.app-sources.com/s/73451616327574183/uploads/BULLS/42FAD2DB-F8A5-401F-A57B-A09A3FF649E5-3529718.JPG" />
                        
                        {/* <img className="mySlides d-none" src="" /> */}
                        {/* <img className="mySlides" src="assets/images/bulls/diamond.png" /> */}
                        {/* <img className="mySlides d-none" src="assets/images/bulls/gold.png" /> */}
                        {/* <img className="mySlides d-none" src="assets/images/bulls/pirate.png" />
                        <img className="mySlides d-none" src="assets/images/bulls/skeles.png" />
                        <img className="mySlides d-none" src="assets/images/bulls/white.png" /> */}
                        <button className="w3-button slide_tbtn w3-black w3-display-left" onClick={() => plusDivs(-1)}>&#10094;</button>
                        <button className="w3-button slide_tbtn w3-black w3-display-right" onClick={() => plusDivs(1)}>&#10095;</button>
                    </div>

                </div>         
            </div>
        </div>
    <div id="sec-two" className="container container_banner">
        <div className="row sec_row"><div className="col-sm-12 head_run"><h1>RUN PASS HOLDERS EXCLUSIVE WHITELIST</h1></div></div>
        <div className="row">
            <div className="col-sm-12 col-md-6 col-lg-3">
                <div className="main_card">
                <img className="card_img" src="assets/images/bronze.png" />
                <span className="green_txt">MINT FOR FREE</span>
                <h3 className="card_title">3 BULLRUNNERS</h3>
                <div className="hr_title"></div>
                <p className="para_txt">For every bronze RUN PASS that you hold you are allowed to mint 3 Bullrunner NFTs for free!
</p>
                </div>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="main_card">
                <img className="card_img" src="assets/images/silver.png" />
                <span className="green_txt">MINT FOR FREE</span>
                <h3 className="card_title">6 BULLRUNNERS</h3>
                <div className="hr_title"></div>
                <p className="para_txt">For every silver RUN PASS that you hold you are allowed to mint 6 Bullrunner NFTs for free!
</p>
                </div>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="main_card">
                <img className="card_img" src="assets/images/gold.png" />
                <span className="green_txt">MINT FOR FREE</span>
                <h3 className="card_title">9 BULLRUNNERS</h3>
                <div className="hr_title"></div>
                <p className="para_txt">For every gold RUN PASS that you hold you are allowed to mint 9 Bullrunner NFTs for free!
</p>
                </div>
            </div>
            <div className="col-sm-12 col-md-6 col-lg-3">
            <div className="main_card">
                <img className="card_img" src="assets/images/diamond.png" />
                <span className="green_txt">MINT FOR FREE</span>
                <h3 className="card_title">12 BULLRUNNERS</h3>
                <div className="hr_title"></div>
                <p className="para_txt">For every diamond RUN PASS that you hold you are allowed to mint 12 Bullrunner NFTs for free!
</p>
                </div>
            </div>
        </div>

    </div>
    <div  id='roadmap' className="container container_banner">
    <div className="row sec_row">
    <div className="col-sm-12 col-md-6 col-lg-6 head_run">
    <h1 className="head_lef">BULLRUNNERS LAUNCH DATES</h1>
    <span className="bull_span">RUN PASS WHITELIST MINT: December 1st - December 31st</span>
    <span className="bull_span">GENERAL PUBLIC MINT & REVEAL: January 1st</span>
    <div className="hr_title line_hr"></div>
    <p className="para_txt txt_run">4,575 Bullrunner NFTs will be available during Pre-Mint for RUN PASS holders only. Each NFT will be random and unique but some are more rare and valuable than others. Every RUN PASS holder gets to mint their Bullrunner NFTs for free starting December 1st and the remaining 5,425 Bullrunner NFTs that aren't minted by RUN PASS holders will be available to the general public for .25 ETH starting January 1st.</p>
    <p className="para_txt txt_run mt-5">RUN PASS holders get first dibs and chance to mint the most rare bulls in the collection. There are a handful of bronze, silver, gold, diamond bulls, and God bulls in the collection all hidden as pre-reveal images until the grand reveal for all holders January 1st. All aboard before we set sail on Opensea.io!</p>
    <div className="btn_hover_red">
    <a href='#mint'> <button className="text-a wallet_btn fourth btn_run" onClick={() => take_action(3)}>{walletConnected ? "MINT NOW" : "CONNECT WALLET"}{walletConnected ? "" : <span className="span_holder">RUN PASS HOLDERS ONLY</span>}</button>
    </a>
    </div>
    </div>

<div className="col-sm-12 col-md-6 col-lg-6 head_run">
<img className="run_img" src="assets/images/run_img.png" />
<p className="para_txt txt_run run_clas">During the pre-mint on December 1st every holder will get a pre-reveal image in their wallet. The grand reveal will take place on January 1st showcasing every bull & their properties.</p>
    </div>
    </div>
    </div>
  
    <div className="container text-center">
        <div className="row">
            <div className="col-sm-12 col-md-12 col-lg-12">
                <div className="_logo">
                    <img className="footer_img" src="assets/images/onlinebusiness_app_store.png" />
                </div>
            </div>
            {/* <div className="col-sm-12 col-md-6 col-lg-3">
                <div className="card_footer">
                    <a className="" href="#mint">Home</a>
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/home">All-in-One Software</a>
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/drag-drop-builder">Website Builder</a>
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/funnel-builder">Sales Funnels</a>
                </div>
            </div>       
            <div className="col-sm-12 col-md-6 col-lg-3">
                <div className="card_footer">
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/membership">Private Memberships</a>
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/crm">Email Autoresponder</a>
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/e-commerce">E-commerce Store</a>
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/crm">CRM</a>
                </div>
            </div>       
            <div className="col-sm-12 col-md-6 col-lg-3">
                <div className="card_footer">
                    <a className="" rel="noreferrer" target="_blank" href="https://onlinebusiness.app/contact-us">Contact us</a>
                    <a className="" rel="noreferrer" target="_blank" href="tel:+1 (877) 777-8157">+1 (877) 777-8157</a>
                </div>
            </div>        */}
        </div>

         <div className="row row_footer">
           <div className="col-sm-12 col-md-12 col-footer pb-4">© 2022 BullRunners.io All Rights Reserved</div> 

            {/* <div className="col-sm-12 col-md-4 card_term"><p><a rel="noreferrer" target="_blank" href="https://onlinebusiness.app/terms-and-conditions">Terms and Conditions</a>   .  <a rel="noreferrer" target="_blank" href="https://onlinebusiness.app/privacy-policy"> Privacy Policy</a>
            </p></div>  */}
            </div>         
        </div>
    </>
    )}
    
    </>
    );
};

export default Web3ReactConnectionComponent;
