import { Router, Request, Response } from 'express';
import { storage } from './storage';
import { initiateSTKPush, processCallback as processMpesaCallback, checkSTKPushStatus } from './integrations/mpesa';
import { createOrder as createPayPalOrder, capturePayment, getOrderDetails } from './integrations/paypal';
import { log } from './vite';

const router = Router();

/**
 * Initiate M-Pesa STK Push
 */
router.post('/mpesa/stkpush', async (req: Request, res: Response) => {
  try {
    const { phoneNumber, amount, orderId } = req.body;
    
    if (!phoneNumber || !amount || !orderId) {
      return res.status(400).json({ error: 'Phone number, amount, and order ID are required' });
    }
    
    // Get order details
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order belongs to the current user
    if (req.user && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }
    
    // Initiate STK Push
    const result = await initiateSTKPush(
      phoneNumber,
      amount,
      `Order #${orderId}`,
      'Payment for order at ShopVerse'
    );
    
    // Store the checkout request ID for future reference
    await storage.updateOrder(parseInt(orderId), {
      paymentDetails: {
        ...order.paymentDetails,
        mpesa: {
          checkoutRequestId: result.CheckoutRequestID,
          merchantRequestId: result.MerchantRequestID,
          responseCode: result.ResponseCode,
          responseDescription: result.ResponseDescription,
          customerMessage: result.CustomerMessage,
        },
      },
    });
    
    res.json({
      success: true,
      message: 'STK Push initiated successfully. Please check your phone.',
      checkoutRequestId: result.CheckoutRequestID,
    });
  } catch (error) {
    log(`M-Pesa STK Push error: ${error}`, 'payments');
    res.status(500).json({ error: 'Failed to initiate M-Pesa payment' });
  }
});

/**
 * Check M-Pesa STK Push status
 */
router.get('/mpesa/status/:checkoutRequestId', async (req: Request, res: Response) => {
  try {
    const { checkoutRequestId } = req.params;
    
    if (!checkoutRequestId) {
      return res.status(400).json({ error: 'Checkout request ID is required' });
    }
    
    const result = await checkSTKPushStatus(checkoutRequestId);
    
    res.json({
      success: true,
      status: result,
    });
  } catch (error) {
    log(`M-Pesa status check error: ${error}`, 'payments');
    res.status(500).json({ error: 'Failed to check M-Pesa payment status' });
  }
});

/**
 * Handle M-Pesa callback
 */
router.post('/mpesa/callback', async (req: Request, res: Response) => {
  try {
    // Process the callback data
    const result = processMpesaCallback(req.body);
    
    if (result.success && result.transactionId) {
      // Find the order with this checkout request ID
      // This would require adding a query method to find orders by checkout request ID
      // For now, we'll just log the success
      log(`M-Pesa payment successful: ${result.transactionId}`, 'payments');
      
      // In a real implementation, update the order status here
      // await storage.updateOrderByCheckoutRequestId(checkoutRequestId, {
      //   paymentStatus: 'completed',
      //   status: 'processing',
      //   paymentDetails: {
      //     ...existingPaymentDetails,
      //     mpesa: {
      //       ...existingMpesaDetails,
      //       transactionId: result.transactionId,
      //       resultCode: result.resultCode,
      //       resultDesc: result.resultDesc,
      //       completed: true,
      //     },
      //   },
      // });
    } else {
      log(`M-Pesa payment failed: ${result.resultDesc}`, 'payments');
      
      // Update order with failed payment status
      // Similar to above, but mark as failed
    }
    
    // Always respond with success to M-Pesa servers
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    log(`M-Pesa callback error: ${error}`, 'payments');
    // Still respond with success to M-Pesa servers
    res.status(200).json({ ResultCode: 0, ResultDesc: 'Success' });
  }
});

/**
 * Create PayPal order
 */
router.post('/paypal/create-order', async (req: Request, res: Response) => {
  try {
    const { orderId, amount } = req.body;
    
    if (!orderId || !amount) {
      return res.status(400).json({ error: 'Order ID and amount are required' });
    }
    
    // Get order details
    const order = await storage.getOrder(parseInt(orderId));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order belongs to the current user
    if (req.user && order.userId !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized access to this order' });
    }
    
    // Create PayPal order
    const returnUrl = `${req.protocol}://${req.get('host')}/api/payments/paypal/capture?orderId=${orderId}`;
    const cancelUrl = `${req.protocol}://${req.get('host')}/checkout?orderId=${orderId}&status=cancelled`;
    
    const paypalOrder = await createPayPalOrder(
      amount,
      'USD',
      orderId.toString(),
      returnUrl,
      cancelUrl
    );
    
    // Update order with PayPal details
    await storage.updateOrder(parseInt(orderId), {
      paymentDetails: {
        ...order.paymentDetails,
        paypal: {
          paypalOrderId: paypalOrder.id,
          status: 'created',
        },
      },
    });
    
    res.json({
      success: true,
      paypalOrderId: paypalOrder.id,
      approvalUrl: paypalOrder.approvalUrl,
    });
  } catch (error) {
    log(`PayPal create order error: ${error}`, 'payments');
    res.status(500).json({ error: 'Failed to create PayPal order' });
  }
});

/**
 * Capture PayPal payment
 */
router.get('/paypal/capture', async (req: Request, res: Response) => {
  try {
    const { paypalOrderId, orderId } = req.query;
    
    if (!paypalOrderId || !orderId) {
      return res.status(400).json({ error: 'PayPal order ID and shop order ID are required' });
    }
    
    // Get order details
    const order = await storage.getOrder(parseInt(orderId as string));
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Capture the payment
    const captureResult = await capturePayment(paypalOrderId as string);
    
    if (captureResult.status === 'COMPLETED') {
      // Update order status
      await storage.updateOrder(parseInt(orderId as string), {
        paymentStatus: 'completed',
        status: 'processing',
        paymentDetails: {
          ...order.paymentDetails,
          paypal: {
            ...order.paymentDetails?.paypal,
            status: 'completed',
            captureId: captureResult.purchase_units[0].payments.captures[0].id,
            captureDetails: captureResult,
          },
        },
      });
      
      // Redirect to success page
      res.redirect(`/checkout/success?orderId=${orderId}`);
    } else {
      // Update order with failed status
      await storage.updateOrder(parseInt(orderId as string), {
        paymentStatus: 'failed',
        paymentDetails: {
          ...order.paymentDetails,
          paypal: {
            ...order.paymentDetails?.paypal,
            status: 'failed',
            captureDetails: captureResult,
          },
        },
      });
      
      // Redirect to failure page
      res.redirect(`/checkout/failure?orderId=${orderId}`);
    }
  } catch (error) {
    log(`PayPal capture error: ${error}`, 'payments');
    res.status(500).json({ error: 'Failed to capture PayPal payment' });
  }
});

/**
 * Get PayPal order details
 */
router.get('/paypal/order/:paypalOrderId', async (req: Request, res: Response) => {
  try {
    const { paypalOrderId } = req.params;
    
    if (!paypalOrderId) {
      return res.status(400).json({ error: 'PayPal order ID is required' });
    }
    
    const orderDetails = await getOrderDetails(paypalOrderId);
    
    res.json({
      success: true,
      orderDetails,
    });
  } catch (error) {
    log(`PayPal get order details error: ${error}`, 'payments');
    res.status(500).json({ error: 'Failed to get PayPal order details' });
  }
});

export default router;