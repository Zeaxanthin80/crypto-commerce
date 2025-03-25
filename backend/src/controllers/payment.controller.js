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

// Ethereum network provider with retries and error handling
const getWeb3 = () => {
  const maxRetries = 3;
  const retryDelay = 1000; // 1 second

  const provider = new Web3.providers.HttpProvider(
    process.env.ETHEREUM_PROVIDER_URL || 'https://mainnet.infura.io/v3/your-infura-key',
    {
      timeout: 30000, // 30 seconds
      reconnect: {
        auto: true,
        delay: retryDelay,
        maxAttempts: maxRetries,
        onTimeout: true
      }
    }
  );

  const web3 = new Web3(provider);
  
  // Add custom retry logic for API calls
  const originalSend = provider.send;
  provider.send = async function (payload, callback) {
    let attempts = 0;
    
    const tryRequest = async () => {
      try {
        attempts++;
        return await originalSend.call(this, payload, callback);
      } catch (error) {
        if (attempts >= maxRetries) throw error;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return tryRequest();
      }
    };
    
    return tryRequest();
  };

  return web3;
};

// Create a new crypto payment
exports.createCryptoPayment = async (req, res) => {
  try {
    const { orderId, walletAddressFrom } = req.body;
    
    if (!orderId || !walletAddressFrom) {
      return res.status(400).json({ 
        message: 'Missing required fields: orderId and walletAddressFrom' 
      });
    }

    // Validate wallet address format
    if (!Web3.utils.isAddress(walletAddressFrom)) {
      return res.status(400).json({ 
        message: 'Invalid wallet address format' 
      });
    }
    
    // Find order with transaction safety
    const order = await Order.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.payment_status === 'completed') {
      return res.status(400).json({ message: 'Order is already paid' });
    }
    
    const walletAddressTo = process.env.PLATFORM_WALLET_ADDRESS;
    if (!walletAddressTo || !Web3.utils.isAddress(walletAddressTo)) {
      throw new Error('Invalid platform wallet configuration');
    }

    // Create payment in a transaction
    const result = await sequelize.transaction(async (t) => {
      const payment = await CryptoPayment.create({
        order_id: orderId,
        wallet_address_from: walletAddressFrom,
        wallet_address_to: walletAddressTo,
        amount: order.total_amount,
        currency: 'USDT',
        status: 'pending',
        confirmation_count: 0
      }, { transaction: t });

      await order.update({
        payment_status: 'pending',
        payment_transaction_id: `${payment.id}`
      }, { transaction: t });

      return payment;
    });

    res.status(201).json({
      message: 'Crypto payment initialized',
      payment: {
        id: result.id,
        amount: result.amount,
        currency: result.currency,
        walletAddressTo: result.wallet_address_to,
        status: result.status
      }
    });
  } catch (error) {
    console.error('Error initializing crypto payment:', error);
    res.status(error.name === 'SequelizeValidationError' ? 400 : 500)
      .json({ 
        message: 'Failed to initialize payment', 
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error' 
      });
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

// Background function to monitor transaction with enhanced error handling
async function monitorTransaction(paymentId, transactionHash) {
  let attempts = 0;
  const maxAttempts = 3;
  const retryDelay = 5000; // 5 seconds

  const processTransaction = async () => {
    try {
      const payment = await CryptoPayment.findByPk(paymentId);
      if (!payment) return;

      const web3 = getWeb3();
      const receipt = await web3.eth.getTransactionReceipt(transactionHash);

      if (!receipt) {
        if (attempts < maxAttempts) {
          attempts++;
          setTimeout(() => processTransaction(), retryDelay);
          return;
        }
        throw new Error('Transaction not found after maximum attempts');
      }

      await sequelize.transaction(async (t) => {
        if (receipt.status) {
          await payment.update({
            status: 'confirmed',
            confirmation_count: 12,
            block_number: receipt.blockNumber
          }, { transaction: t });

          const order = await Order.findByPk(payment.order_id);
          if (order) {
            await order.update({
              payment_status: 'completed',
              order_status: 'processing'
            }, { transaction: t });
          }
        } else {
          await payment.update({ status: 'failed' }, { transaction: t });
          
          const order = await Order.findByPk(payment.order_id);
          if (order) {
            await order.update({ payment_status: 'failed' }, { transaction: t });
          }
        }
      });

    } catch (error) {
      console.error(`Error monitoring transaction ${transactionHash}:`, error);
      // In production, you would want to send this to an error monitoring service
      if (process.env.NODE_ENV === 'production') {
        // TODO: Implement error reporting service
      }
    }
  };

  await processTransaction();
}
