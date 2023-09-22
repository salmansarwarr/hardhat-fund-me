import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

const connectBtn = document.getElementById("connectBtn");
const fundBtn = document.getElementById("fundBtn");
const balanceBtn = document.getElementById("balanceBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

const connect = async () => {
    if (typeof window.ethereum !== undefined) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        connectBtn.innerHTML = "Connected";
    } else {
        connectBtn.innerHTML = "Please install metamask";
    }
};

const listenForTransactionMine = (transactionResponse, provider) => {
    console.log(`Mining ${transactionResponse.hash}...`);
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReciept) => {
            console.log(
                `Completed with ${transactionReciept.confirmations} confirmations`
            );
            resolve();
        });
    });
};

const fund = async () => {
    const ethAmount = document.getElementById("ethAmount").value;
    console.log(`Funding with ${ethAmount}`);
    if (typeof window.ethereum !== undefined) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            });
            await listenForTransactionMine(transactionResponse, provider);
            console.log("done")
        } catch (error) {
            console.log(error);
        }
    }
};


const getBalance = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
}

const withdraw = async () => {
    if (typeof window.ethereum !== undefined) {
        console.log("Withdrawing...");
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);
        try {            
            const transactionResponse = await contract.withdraw();
            await listenForTransactionMine(transactionResponse, provider);
        } catch (error) {
            console.log("error");
        }
    }
}

connectBtn.onclick = connect;
fundBtn.onclick = fund;
balanceBtn.onclick = getBalance;
withdrawBtn.onclick = withdraw; 
