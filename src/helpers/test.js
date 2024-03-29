const { ethers } = require("ethers");
const { MerkleTree } = require("merkletreejs");
const keccak256 = require('keccak256');
var whitelists_static = [
'0xA7B565A32A3DaDe500A206aA1A37244676d10516',
'0xD4EE8bf6f5ea2626C88CFd6Fc4442eD6E2BaEAe8',
'0x219E04BfCcBFe7eaBCb361CBA80847a0DA5C3bA4',
'0x35435F5164B920Fa073B745b5264c976C5571855', // Run Guys
'0x5275E0c2C2225b7fE6b425dcc140Fb6bC65e6656', // Vincent
'0xDb26c85eDac6482fe125F28Ec90EC6F562795ea9', // Syed Trust Wallet

];

var whitelists = NaN;
var tree = NaN;
var hexroot = NaN;

const reqHeader = new Headers();
reqHeader.append("Accept", "application/json");
const requestOptions = {
    method: 'GET',
};

let sheets_wallets = NaN
let fetching=false
async function fetchWhitelistsFromSheet() {
    
        
        await fetch('https://sheets.googleapis.com/v4/spreadsheets/1Z5tKm10PJ07zyHkNOnJa0lGPMhHnOyv_goVEgpKnUqQ/values/C4:C?key=AIzaSyDyF24NLFqmmnn915-74nfNjsEckRiM2vc', requestOptions)
        .then(response => response.text())
        .then(result => {
            sheets_wallets = (JSON.parse(result)).values;
            let count=0
            if (sheets_wallets != NaN) {
                console.log("fetched from Sheets")
                whitelists = sheets_wallets;
            }
            whitelists.map((wallet) =>
                {
                    // console.log(wallet);
                    count = count+1
                }
            )
            console.log(count);
        })
        .catch(error => console.log('error', error));
        
        
    
    return whitelists;
}
export const fetchWhitelists = fetchWhitelistsFromSheet();

async function asyncCall2() {
    // console.log("whitelist length ", whitelists.length)
    
    // if (whitelists !== undefined) {
    //     return whitelists
    // }
    if (!fetching) {
        fetching = true

        if (whitelists === NaN || whitelists.length === undefined) {
            await fetchWhitelistsFromSheet();
            
            
            console.log("merkle total address", whitelists.length, typeof whitelists)
            const leaves = whitelists.map(x => keccak256(x))
            tree = new MerkleTree(leaves , keccak256 , {sortPairs: true})
            // const root = tree.getRoot()
            hexroot = tree.getHexRoot()
            fetching = false
        }
        return whitelists
    }

    setTimeout(function(){
        return asyncCall2();
    }, 1000); 
    
    // console.log("Hex root", hexroot)
    // return whitelists
}
// asyncCall2();
// export const whitelist = whitelists;

export function whitelist() {
    if (whitelists === NaN || whitelists.length === undefined) {
        // console.log('sheets data', whitelists)
        asyncCall2();
        
    }
    return whitelists;
    // if (whitelists !== NaN && whitelists.length !== undefined) {
    //     // console.log("return this list", whitelists)
    // }
    //     return whitelists
    
}
    
export function getHexRootAddress(address) {
    return hexroot;
}
    
export function getProofs  (address) {
    return tree.getHexProof(ethers.utils.keccak256(address.toString('hex')));
}


