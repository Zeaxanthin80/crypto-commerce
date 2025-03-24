import { ethers } from 'ethers';

// ERC-20 Token ABI (minimal interface for USDT interactions)
const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  "function transfer(address to, uint amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transferFrom(address sender, address recipient, uint256 amount) returns (bool)"
];

// Test USDT token address on Sepolia (replace with a real test token address)
export const TEST_USDT_ADDRESS = "0x7169D38820dfd117C3FA1f22a697dBA58d90BA06";

// Platform wallet address that will receive payments
export const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET_ADDRESS || "0xYourMetaMaskWalletAddress";

// Check if window is defined (browser environment)
const isClient = typeof window !== 'undefined';

// Get the active token contract based on network
export const getTokenContract = async (signer) => {
  // Check if we're on testnet or mainnet
  const network = await signer.provider.getNetwork();
  const isTestnet = network.chainId === 11155111; // Sepolia chain ID
  
  // Use appropriate token address based on network
  const tokenAddress = isTestnet 
    ? TEST_USDT_ADDRESS 
    : process.env.NEXT_PUBLIC_USDT_CONTRACT_ADDRESS;
  
  return new ethers.Contract(tokenAddress, ERC20_ABI, signer);
};

// Connect to MetaMask
export const connectWallet = async () => {
  try {
    // Check if we're in a browser environment
    if (!isClient) {
      throw new Error("Cannot connect to wallet in non-browser environment");
    }
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed. Please install MetaMask to continue.");
    }
    
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Get the provider and signer
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    // Get network information
    const network = await provider.getNetwork();
    
    return {
      address: accounts[0],
      signer,
      network,
      chainId: network.chainId
    };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
};

// Get token balance
export const getTokenBalance = async (address, signer) => {
  try {
    const tokenContract = await getTokenContract(signer);
    const balance = await tokenContract.balanceOf(address);
    const decimals = await tokenContract.decimals();
    const symbol = await tokenContract.symbol();
    
    // Format balance with proper decimals
    const formattedBalance = ethers.utils.formatUnits(balance, decimals);
    
    return {
      balance: formattedBalance,
      symbol,
      raw: balance
    };
  } catch (error) {
    console.error("Error getting token balance:", error);
    throw error;
  }
};

// Process payment
export const processPayment = async (amount, signer) => {
  try {
    const tokenContract = await getTokenContract(signer);
    const userAddress = await signer.getAddress();
    const decimals = await tokenContract.decimals();
    
    // Convert amount to token units
    const amountInTokenUnits = ethers.utils.parseUnits(amount.toString(), decimals);
    
    // Check if user has enough balance
    const balance = await tokenContract.balanceOf(userAddress);
    if (balance.lt(amountInTokenUnits)) {
      throw new Error("Insufficient token balance");
    }
    
    // Check if contract is already approved to spend tokens
    const allowance = await tokenContract.allowance(userAddress, PLATFORM_WALLET);
    
    // If allowance is less than amount, request approval
    if (allowance.lt(amountInTokenUnits)) {
      const approveTx = await tokenContract.approve(PLATFORM_WALLET, amountInTokenUnits);
      const approveReceipt = await approveTx.wait();
      console.log("Approval transaction:", approveReceipt);
    }
    
    // In a real app, the actual transfer would be handled by a backend
    // For demo purposes, we'll simulate a successful payment
    return {
      success: true,
      message: "Payment approved successfully",
      amount,
      txHash: "demo-transaction-hash"
    };
    
    // In a production environment with a backend, you would:
    // 1. Send a request to your backend with the payment details
    // 2. Backend would verify the payment on the blockchain
    // 3. Backend would update the order status
  } catch (error) {
    console.error("Payment processing error:", error);
    return {
      success: false,
      message: error.message || "Payment processing failed",
      error
    };
  }
};

// Switch to the correct network if needed
export const switchToCorrectNetwork = async () => {
  try {
    // Check if we're in a browser environment
    if (!isClient) {
      return false;
    }
    
    // Check if MetaMask is installed
    if (!window.ethereum) {
      throw new Error("MetaMask is not installed");
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    
    // Define the required network (Sepolia for testing)
    const requiredChainId = 11155111; // Sepolia
    
    // If not on the correct network, prompt to switch
    if (network.chainId !== requiredChainId) {
      try {
        // Try to switch to Sepolia
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: ethers.utils.hexValue(requiredChainId) }],
        });
        return true;
      } catch (switchError) {
        // This error code indicates that the chain has not been added to MetaMask
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: ethers.utils.hexValue(requiredChainId),
                  chainName: 'Sepolia Test Network',
                  nativeCurrency: {
                    name: 'Sepolia ETH',
                    symbol: 'SepoliaETH',
                    decimals: 18
                  },
                  rpcUrls: ['https://sepolia.infura.io/v3/'],
                  blockExplorerUrls: ['https://sepolia.etherscan.io'],
                },
              ],
            });
            return true;
          } catch (addError) {
            throw addError;
          }
        }
        throw switchError;
      }
    }
    
    return true;
  } catch (error) {
    console.error("Error switching network:", error);
    throw error;
  }
};
