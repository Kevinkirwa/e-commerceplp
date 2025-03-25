import axios from 'axios';
import { log } from '../vite';

// M-Pesa API configuration
interface MPesaConfig {
  consumerKey: string;
  consumerSecret: string;
  passkey: string;
  shortCode: string;
  callbackUrl: string;
  environment: 'sandbox' | 'production';
}

// Initialize with default values (will be overridden with actual values)
const config: MPesaConfig = {
  consumerKey: process.env.MPESA_CONSUMER_KEY || '',
  consumerSecret: process.env.MPESA_CONSUMER_SECRET || '',
  passkey: process.env.MPESA_PASSKEY || '',
  shortCode: process.env.MPESA_SHORT_CODE || '',
  callbackUrl: process.env.MPESA_CALLBACK_URL || 'https://yourdomain.com/api/payments/mpesa/callback',
  environment: (process.env.MPESA_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
};

// The base URL for M-Pesa API requests
const BASE_URL = config.environment === 'production'
  ? 'https://api.safaricom.co.ke'
  : 'https://sandbox.safaricom.co.ke';

/**
 * Gets an OAuth token for authenticating with the M-Pesa API
 */
async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${config.consumerKey}:${config.consumerSecret}`).toString('base64');
    const response = await axios.get(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
      headers: {
        Authorization: `Basic ${auth}`,
      },
    });
    
    return response.data.access_token;
  } catch (error) {
    log(`Failed to get M-Pesa access token: ${error}`, 'mpesa');
    throw new Error('Failed to get M-Pesa access token');
  }
}

/**
 * Formats the date for M-Pesa API requests
 */
function getTimestamp(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = ("0" + (date.getMonth() + 1)).slice(-2);
  const day = ("0" + date.getDate()).slice(-2);
  const hour = ("0" + date.getHours()).slice(-2);
  const minute = ("0" + date.getMinutes()).slice(-2);
  const second = ("0" + date.getSeconds()).slice(-2);

  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Generates a password for the STK Push request
 */
function getPassword(timestamp: string): string {
  const data = `${config.shortCode}${config.passkey}${timestamp}`;
  return Buffer.from(data).toString('base64');
}

/**
 * Initiates an STK Push request to a customer's phone
 */
export async function initiateSTKPush(
  phoneNumber: string, 
  amount: number, 
  accountReference: string, 
  transactionDesc: string
): Promise<any> {
  try {
    // Validate parameters
    if (!phoneNumber || !amount) {
      throw new Error('Phone number and amount are required');
    }
    
    // Format phone number (remove leading 0 or +254)
    const formattedPhone = phoneNumber.replace(/^(0|\+254)/, '254');
    
    // Get access token
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);
    
    // Prepare STK Push request data
    const data = {
      BusinessShortCode: config.shortCode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: Math.round(amount),
      PartyA: formattedPhone,
      PartyB: config.shortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: config.callbackUrl,
      AccountReference: accountReference,
      TransactionDesc: transactionDesc
    };
    
    // Make the request
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpush/v1/processrequest`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    log(`STK Push failed: ${error}`, 'mpesa');
    throw new Error('Failed to initiate M-Pesa payment');
  }
}

/**
 * Verifies the status of an STK Push request
 */
export async function checkSTKPushStatus(checkoutRequestId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    const timestamp = getTimestamp();
    const password = getPassword(timestamp);
    
    const data = {
      BusinessShortCode: config.shortCode,
      Password: password,
      Timestamp: timestamp,
      CheckoutRequestID: checkoutRequestId
    };
    
    const response = await axios.post(
      `${BASE_URL}/mpesa/stkpushquery/v1/query`,
      data,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    log(`STK Push status check failed: ${error}`, 'mpesa');
    throw new Error('Failed to check M-Pesa payment status');
  }
}

/**
 * Processes the callback from M-Pesa
 */
export function processCallback(callbackData: any): { 
  success: boolean;
  transactionId?: string;
  resultCode?: number;
  resultDesc?: string;
} {
  try {
    // Extract the relevant parts from the callback data
    const { Body } = callbackData;
    
    if (!Body || !Body.stkCallback) {
      throw new Error('Invalid callback data');
    }
    
    const { ResultCode, ResultDesc, CallbackMetadata } = Body.stkCallback;
    
    // Check if payment was successful (ResultCode 0 means success)
    const success = ResultCode === 0;
    
    // Extract transaction ID if available
    let transactionId;
    if (success && CallbackMetadata && CallbackMetadata.Item) {
      const txIdItem = CallbackMetadata.Item.find((item: any) => item.Name === 'MpesaReceiptNumber');
      if (txIdItem) {
        transactionId = txIdItem.Value;
      }
    }
    
    return {
      success,
      transactionId,
      resultCode: ResultCode,
      resultDesc: ResultDesc
    };
  } catch (error) {
    log(`Failed to process M-Pesa callback: ${error}`, 'mpesa');
    return { success: false };
  }
}