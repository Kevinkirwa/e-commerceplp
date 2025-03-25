import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

// Load Stripe outside of component tree to avoid recreating it on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY as string);

interface StripeFormProps {
  clientSecret: string;
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
}

const CheckoutForm: React.FC<{
  onPaymentSuccess: () => void;
  onPaymentError: (message: string) => void;
}> = ({ onPaymentSuccess, onPaymentError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);

    try {
      // Confirm payment with Stripe
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Show error to customer
        onPaymentError(error.message || "An error occurred with your payment.");
        toast({
          title: "Payment Failed",
          description: error.message || "An error occurred with your payment.",
          variant: "destructive",
        });
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        // Payment successful
        toast({
          title: "Payment Successful",
          description: "Thank you for your payment!",
        });
        onPaymentSuccess();
      } else {
        // Payment requires additional steps or is processing
        toast({
          title: "Payment Processing",
          description: "Your payment is being processed.",
        });
        onPaymentSuccess();
      }
    } catch (err) {
      console.error("Payment error:", err);
      onPaymentError("An unexpected error occurred.");
      toast({
        title: "Payment Error",
        description: "An unexpected error occurred during payment processing.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <Button
        type="submit"
        className="w-full"
        disabled={!stripe || !elements || isLoading}
      >
        {isLoading ? "Processing..." : "Pay Now"}
      </Button>
    </form>
  );
};

const StripePaymentForm: React.FC<StripeFormProps> = ({
  clientSecret,
  onPaymentSuccess,
  onPaymentError,
}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (clientSecret) {
      setIsReady(true);
    }
  }, [clientSecret]);

  if (!isReady) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="w-6 h-6 border-2 border-t-primary border-primary/30 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: "stripe",
        },
      }}
    >
      <CheckoutForm
        onPaymentSuccess={onPaymentSuccess}
        onPaymentError={onPaymentError}
      />
    </Elements>
  );
};

export default StripePaymentForm;