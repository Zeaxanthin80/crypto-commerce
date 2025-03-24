const Order = require('../models/order.model');
const CryptoPayment = require('../models/crypto-payment.model');
const Web3 = require('web3');

// USDT ERC-20 token ABI (abbreviated version for transfer events)
const USDT_ABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "name": "to",
        "type": "address"
      },
      {
        "indexed": false,
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  }
];

// Ethereum network provider
const getWeb3 = () => {
  const providerUrl = process.env.ETHEREUM_PROVIDER_URL || 'https://mainnet.infura.io/v3/your-infura-key';
  return new Web3(new Web3.providers.HttpProvider(providerUrl));
};

// Create a new crypto payment
exports.createCryptoPayment = async (req, res) => {
  try {
    const { orderId, walletAddressFrom } = req.body;
    
    // Find order
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Generate wallet address for payment (in a real app, this would use a secure wallet service)
    const walletAddressTo = process.env.PLATFORM_WALLET_ADDRESS || '0x123456789abcdef123456789abcdef123456789';
    
    // Create pending crypto payment
    const payment = await CryptoPayment.create({
      order_id: orderId,
      wallet_address_from: walletAddressFrom,
      wallet_address_to: walletAddressTo,
      amount: order.total_amount,
      currency: 'USDT',
      status: 'pending',
      confirmation_count: 0
    });
    
    // Update order payment status
    await order.update({
      payment_status: 'pending',
      payment_transaction_id: `${payment.id}`
    });
    
    res.status(201).json({
      message: 'Crypto payment initialized',
      payment: {
        id: payment.id,
        amount: payment.amount,
        currency: payment.currency,
        walletAddressTo: payment.wallet_address_to,
        status: payment.status
      }
    });
  } catch (error) {
    console.error('Error initializing crypto payment:', error);
    res.status(500).json({ message: 'Failed to initialize payment', error: error.message });
  }
};

// Update payment with transaction hash
exports.updatePaymentTransaction = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { transactionHash } = req.body;
    
    // Find payment
    const payment = await CryptoPayment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Validate transaction hash format
    if (!transactionHash || !transactionHash.startsWith('0x')) {
      return res.status(400).json({ message: 'Invalid transaction hash format' });
    }
    
    // Update payment with transaction hash
    await payment.update({
      transaction_hash: transactionHash,
      status: 'pending'
    });
    
    // Start monitoring the transaction in the background
    monitorTransaction(payment.id, transactionHash);
    
    res.status(200).json({
      message: 'Transaction hash updated, payment is being processed',
      status: payment.status
    });
  } catch (error) {
    console.error('Error updating payment transaction:', error);
    res.status(500).json({ message: 'Failed to update payment transaction', error: error.message });
  }
};

// Get payment status
exports.getPaymentStatus = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    const payment = await CryptoPayment.findByPk(paymentId);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    res.status(200).json({
      id: payment.id,
      status: payment.status,
      transactionHash: payment.transaction_hash,
      confirmationCount: payment.confirmation_count,
      amount: payment.amount,
      currency: payment.currency
    });
  } catch (error) {
    console.error('Error getting payment status:', error);
    res.status(500).json({ message: 'Failed to get payment status', error: error.message });
  }
};

// Verify USDT payment (webhook for blockchain events)
exports.verifyPayment = async (req, res) => {
  try {
    const { transactionHash, blockNumber } = req.body;
    
    // Find payment by transaction hash
    const payment = await CryptoPayment.findOne({ where: { transaction_hash: transactionHash } });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found for this transaction' });
    }
    
    // Connect to Ethereum node
    const web3 = getWeb3();
    
    // Get transaction receipt to confirm status
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    if (!receipt || !receipt.status) {
      return res.status(400).json({ message: 'Transaction failed or not found' });
    }
    
    // Update payment confirmation
    const currentConfirmations = blockNumber ? web3.eth.blockNumber - blockNumber : 0;
    const isConfirmed = currentConfirmations >= 12; // 12 confirmations is common for higher-value transactions
    
    await payment.update({
      status: isConfirmed ? 'confirmed' : 'pending',
      confirmation_count: currentConfirmations,
      block_number: receipt.blockNumber
    });
    
    // If confirmed, update the order status
    if (isConfirmed) {
      const order = await Order.findByPk(payment.order_id);
      if (order) {
        await order.update({
          payment_status: 'completed',
          order_status: 'processing'
        });
      }
    }
    
    res.status(200).json({
      message: isConfirmed ? 'Payment confirmed' : 'Payment pending more confirmations',
      confirmations: currentConfirmations,
      required: 12,
      status: payment.status
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: 'Failed to verify payment', error: error.message });
  }
};

// Background function to monitor transaction (simplified for this example)
async function monitorTransaction(paymentId, transactionHash) {
  try {
    // In a production app, this would be implemented with a proper job queue system
    // For demonstration purposes, we're just simulating the process
    
    // Fetch payment
    const payment = await CryptoPayment.findByPk(paymentId);
    if (!payment) return;
    
    // Connect to Ethereum node
    const web3 = getWeb3();
    
    // Check transaction receipt
    const receipt = await web3.eth.getTransactionReceipt(transactionHash);
    if (!receipt) {
      // Transaction not yet mined, would retry in production
      console.log(`Transaction ${transactionHash} not yet mined. Would retry in production.`);
      return;
    }
    
    if (receipt.status) {
      // Transaction successful
      // Update payment status
      await payment.update({
        status: 'confirmed',
        confirmation_count: 12, // Simplified for example
        block_number: receipt.blockNumber
      });
      
      // Update order
      const order = await Order.findByPk(payment.order_id);
      if (order) {
        await order.update({
          payment_status: 'completed',
          order_status: 'processing'
        });
      }
      
      console.log(`Payment ${paymentId} confirmed with transaction ${transactionHash}`);
    } else {
      // Transaction failed
      await payment.update({ status: 'failed' });
      
      // Update order
      const order = await Order.findByPk(payment.order_id);
      if (order) {
        await order.update({ payment_status: 'failed' });
      }
      
      console.log(`Payment ${paymentId} failed with transaction ${transactionHash}`);
    }
  } catch (error) {
    console.error(`Error monitoring transaction ${transactionHash}:`, error);
  }
}
