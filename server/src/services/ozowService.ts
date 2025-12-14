// modahaus/server/src/services/ozowService.ts

import crypto from 'crypto';
import axios from 'axios';

const OZOW_PRIVATE_KEY = process.env.OZOW_PRIVATE_KEY || 'your_ozow_private_key';
const OZOW_API_KEY = process.env.OZOW_API_KEY || 'your_ozow_api_key';
const OZOW_MERCHANT_CODE = process.env.OZOW_MERCHANT_ID || 'your_ozow_merchant_id';

// Base URL for Ozow API (this might need to be adjusted based on environment/docs)
const OZOW_API_BASE_URL = 'https://api.ozow.com'; // Placeholder, verify with Ozow docs

export const initiateOzowPayment = async (
  amount: number,
  transactionId: string, // Unique ID for this transaction
  buyerEmail: string,
  successUrl: string,
  cancelUrl: string,
  notifyUrl: string // Webhook URL for Ozow to notify your server
) => {
  try {
    // Generate a unique payment reference if not provided
    const siteCode = OZOW_MERCHANT_CODE; // Merchant ID in Ozow terms
    const countryCode = 'ZA'; // Assuming South Africa, adjust if needed
    const currencyCode = 'ZAR'; // Assuming South African Rand, adjust if needed
    const hashCheck = OZOW_PRIVATE_KEY; // For generating security hash

    const transaction = {
      siteCode: siteCode,
      countryCode: countryCode,
      currencyCode: currencyCode,
      amount: amount.toFixed(2), // Amount must be a string with 2 decimal places
      transactionReference: transactionId,
      // Optional fields
      customerEmail: buyerEmail,
      successUrl: successUrl,
      cancelUrl: cancelUrl,
      notifyUrl: notifyUrl,
      isTest: process.env.NODE_ENV !== 'production' // Use test mode in development
    };

    // Construct the string to hash (refer to Ozow API documentation for exact order and fields)
    // This is a simplified example, you'll need to follow Ozow's specific hashing algorithm
    const hashString = Object.values(transaction).join('&') + hashCheck;
    const ozowHash = crypto.createHash('md5').update(hashString).digest('hex').toUpperCase();

    const response = await axios.post(`${OZOW_API_BASE_URL}/transactions`, {
      ...transaction,
      hash: ozowHash
    }, {
      headers: {
        'ApiKey': OZOW_API_KEY,
        'Content-Type': 'application/json'
      }
    });

    return { success: true, redirectUrl: response.data.url, transactionId: response.data.transactionId };
  } catch (error: any) {
    console.error('Error initiating Ozow payment:', error.response ? error.response.data : error.message);
    return { success: false, error: error.response ? error.response.data : error.message };
  }
};

// Placeholder for handling Ozow payment notifications/webhooks
export const handleOzowNotification = async (notificationData: any) => {
  try {
    // Verify the authenticity of the notification using the private key
    // This typically involves re-hashing the received data and comparing it
    // with the hash provided by Ozow in the notification.
    const receivedHash = notificationData.Hash; // Assuming the hash is sent in 'Hash' field
    const expectedHashString = Object.values(notificationData).filter((key: any) => key !== 'Hash').join('&') + OZOW_PRIVATE_KEY;
    const expectedHash = crypto.createHash('md5').update(expectedHashString).digest('hex').toUpperCase();

    if (receivedHash !== expectedHash) {
      console.warn('Ozow Notification: Invalid hash received.');
      return { success: false, error: 'Invalid hash' };
    }

    // Process the notification based on its status
    if (notificationData.Status === 'Complete') {
      console.log(`Ozow Payment ${notificationData.TransactionId} is Complete.`);
      // Update your order status in the database to 'paid'
      // You'll need to link notificationData.TransactionId to your internal order ID
      return { success: true, message: 'Payment complete' };
    } else if (notificationData.Status === 'Cancelled') {
      console.log(`Ozow Payment ${notificationData.TransactionId} was Cancelled.`);
      // Update order status to 'cancelled'
      return { success: true, message: 'Payment cancelled' };
    } else {
      console.log(`Ozow Payment ${notificationData.TransactionId} status: ${notificationData.Status}`);
      // Handle other statuses like 'Pending', 'Failed', etc.
      return { success: true, message: `Payment status: ${notificationData.Status}` };
    }
  } catch (error: any) {
    console.error('Error handling Ozow notification:', error);
    return { success: false, error: error.message };
  }
};