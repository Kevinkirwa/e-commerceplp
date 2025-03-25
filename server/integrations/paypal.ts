import axios from 'axios';
import { log } from '../vite';

// PayPal API configuration
interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  environment: 'sandbox' | 'production';
}

// Initialize with default values (will be overridden with actual values)
const config: PayPalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  environment: (process.env.PAYPAL_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production',
};

// The base URL for PayPal API requests
const BASE_URL = config.environment === 'production'
  ? 'https://api.paypal.com'
  : 'https://api.sandbox.paypal.com';

/**
 * Gets an OAuth token for authenticating with the PayPal API
 */
async function getAccessToken(): Promise<string> {
  try {
    const auth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');
    const response = await axios.post(
      `${BASE_URL}/v1/oauth2/token`,
      'grant_type=client_credentials',
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    
    return response.data.access_token;
  } catch (error) {
    log(`Failed to get PayPal access token: ${error}`, 'paypal');
    throw new Error('Failed to get PayPal access token');
  }
}

/**
 * Creates a PayPal order
 */
export async function createOrder(
  amount: number,
  currency: string = 'USD',
  orderId: string,
  returnUrl: string,
  cancelUrl: string
): Promise<{ id: string; approvalUrl: string }> {
  try {
    const accessToken = await getAccessToken();
    
    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: orderId,
          amount: {
            currency_code: currency,
            value: amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'ShopVerse',
        landing_page: 'BILLING',
        user_action: 'PAY_NOW',
        return_url: returnUrl,
        cancel_url: cancelUrl,
      },
    };
    
    const response = await axios.post(
      `${BASE_URL}/v2/checkout/orders`,
      orderData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Extract the approval URL for redirecting the customer
    const approvalUrl = response.data.links.find((link: any) => link.rel === 'approve').href;
    
    return {
      id: response.data.id,
      approvalUrl,
    };
  } catch (error) {
    log(`Failed to create PayPal order: ${error}`, 'paypal');
    throw new Error('Failed to create PayPal order');
  }
}

/**
 * Captures a payment for an approved PayPal order
 */
export async function capturePayment(orderId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await axios.post(
      `${BASE_URL}/v2/checkout/orders/${orderId}/capture`,
      {},
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    log(`Failed to capture PayPal payment: ${error}`, 'paypal');
    throw new Error('Failed to capture PayPal payment');
  }
}

/**
 * Verifies the status of a PayPal order
 */
export async function getOrderDetails(orderId: string): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    
    const response = await axios.get(
      `${BASE_URL}/v2/checkout/orders/${orderId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    log(`Failed to get PayPal order details: ${error}`, 'paypal');
    throw new Error('Failed to get PayPal order details');
  }
}

/**
 * Processes a PayPal webhook event
 */
export function verifyWebhookEvent(
  body: any,
  headers: any,
  webhookId: string
): Promise<boolean> {
  return new Promise(async (resolve, reject) => {
    try {
      const accessToken = await getAccessToken();
      
      const verificationData = {
        webhook_id: webhookId,
        event_type: body.event_type,
        resource: body.resource,
        webhook_event_id: body.id,
        create_time: body.create_time,
      };
      
      const response = await axios.post(
        `${BASE_URL}/v1/notifications/verify-webhook-signature`,
        {
          auth_algo: headers['paypal-auth-algo'],
          cert_url: headers['paypal-cert-url'],
          transmission_id: headers['paypal-transmission-id'],
          transmission_sig: headers['paypal-transmission-sig'],
          transmission_time: headers['paypal-transmission-time'],
          webhook_id: webhookId,
          webhook_event: verificationData,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      resolve(response.data.verification_status === 'SUCCESS');
    } catch (error) {
      log(`Failed to verify PayPal webhook: ${error}`, 'paypal');
      reject(error);
    }
  });
}

/**
 * Creates a PayPal refund for a capture
 */
export async function createRefund(
  captureId: string,
  amount?: number,
  currency: string = 'USD',
  reason?: string
): Promise<any> {
  try {
    const accessToken = await getAccessToken();
    
    const refundData: any = {};
    
    if (amount) {
      refundData.amount = {
        value: amount.toFixed(2),
        currency_code: currency,
      };
    }
    
    if (reason) {
      refundData.note_to_payer = reason;
    }
    
    const response = await axios.post(
      `${BASE_URL}/v2/payments/captures/${captureId}/refund`,
      refundData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    log(`Failed to create PayPal refund: ${error}`, 'paypal');
    throw new Error('Failed to create PayPal refund');
  }
}