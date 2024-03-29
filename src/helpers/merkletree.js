const { ethers } = require("ethers");

const { MerkleTree } = require("merkletreejs");

const {getWhitelists} = require('./whitelist');
const keccak256 = require('keccak256');

// const {Buffer} = require('buffer');
const whitelist = getWhitelists();
console.log("merkle total address", whitelist.length, typeof whitelist)
const leaves = whitelist.map(x => keccak256(x))
const tree = new MerkleTree(leaves , keccak256 , {sortPairs: true})
// const root = tree.getRoot()
const hexroot = tree.getHexRoot()

// console.log("tree", tree.toString('hex'));
// console.log("proof root hex", root.toString("hex"))

// To be placed in the contract
// console.log("proof root", hexroot)

    
export function getHexRootAddress(address) {
    return hexroot;
}
    
export function getProofs  (address) {
    // console.log(0);
    // let tree, leaves;
    // try {
    //      leaves =  whitelist.map(x => keccak256(x));
    // }
    // catch(err){
    //     console.log(err)
    // }
    // try {
    //     tree = new MerkleTree(leaves , keccak256 , {sortPairs: true});
    //     //  console.log(tree);
    // }
    // catch(err){
    //     console.log(err)
    // }
    
    
    return tree.getHexProof(ethers.utils.keccak256(address.toString('hex')));
}


