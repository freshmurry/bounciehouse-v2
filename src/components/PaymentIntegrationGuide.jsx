import React from 'react';
import { Code, CreditCard, Smartphone, Banknote, Shield } from 'lucide-react';

export default function PaymentIntegrationGuide() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 flex items-center">
          <CreditCard className="w-8 h-8 mr-3 text-blue-600" />
          BouncieHouse Payment Integration Guide
        </h1>

        <div className="prose max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Overview</h2>
            <p className="text-gray-600 mb-4">
              BouncieHouse uses a multi-processor approach to handle payments and payouts:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Stripe:</strong> Primary payment processor for credit cards and ACH</li>
              <li><strong>PayPal:</strong> Alternative payment method</li>
              <li><strong>Klarna:</strong> Buy now, pay later option</li>
              <li><strong>Afterpay:</strong> Another BNPL option</li>
              <li><strong>Bank Transfer (ACH):</strong> Direct bank transfers</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Code className="w-6 h-6 mr-2 text-green-600" />
              1. Stripe Integration
            </h2>
            
            <h3 className="text-xl font-medium text-gray-700 mb-3">Setup</h3>
            <ol className="list-decimal pl-6 mb-4 space-y-1">
              <li>Create a Stripe account at https://stripe.com</li>
              <li>Get your API keys from the Dashboard</li>
              <li>Install Stripe SDK in your backend</li>
            </ol>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Environment Variables:</h4>
              <pre className="text-sm text-gray-800">
{`STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...`}
              </pre>
            </div>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Frontend Integration:</h4>
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY);

const handlePayment = async (reservationData) => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: reservationData.total_amount * 100,
      reservation_id: reservationData.id
    })
  });
  
  const { client_secret } = await response.json();
  const stripe = await stripePromise;
  
  const { error } = await stripe.confirmCardPayment(client_secret, {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: { 
        name: user.full_name, 
        email: user.email 
      }
    }
  });
};`}
              </pre>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Smartphone className="w-6 h-6 mr-2 text-blue-600" />
              2. PayPal Integration
            </h2>
            
            <h3 className="text-xl font-medium text-gray-700 mb-3">Setup</h3>
            <ol className="list-decimal pl-6 mb-4 space-y-1">
              <li>Create PayPal Developer account</li>
              <li>Create an app in PayPal Developer Dashboard</li>
              <li>Get Client ID and Secret</li>
            </ol>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Frontend Integration:</h4>
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

const PayPalCheckout = ({ amount, onSuccess }) => {
  return (
    <PayPalScriptProvider options={{ "client-id": process.env.PAYPAL_CLIENT_ID }}>
      <PayPalButtons
        createOrder={(data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: { value: amount.toString() }
            }]
          });
        }}
        onApprove={(data, actions) => {
          return actions.order.capture().then(onSuccess);
        }}
      />
    </PayPalScriptProvider>
  );
};`}
              </pre>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Banknote className="w-6 h-6 mr-2 text-purple-600" />
              3. ACH Bank Transfer Integration
            </h2>
            
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Using Stripe ACH:</h4>
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`const paymentMethod = await stripe.paymentMethods.create({
  type: 'us_bank_account',
  us_bank_account: {
    routing_number: '110000000',
    account_number: '000123456789',
    account_holder_type: 'individual',
    account_type: 'checking',
  },
  billing_details: {
    name: user.full_name,
    email: user.email,
  },
});`}
              </pre>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. Implementation Strategy</h2>
            
            <h3 className="text-xl font-medium text-gray-700 mb-3">Payment Flow</h3>
            <ol className="list-decimal pl-6 mb-4 space-y-2">
              <li><strong>Guest selects dates</strong> → Calculate total amount</li>
              <li><strong>Guest chooses payment method</strong> → Initialize payment processor</li>
              <li><strong>Pre-authorization</strong> → Hold funds without capturing</li>
              <li><strong>Host confirmation</strong> → Capture payment and create payout</li>
              <li><strong>Automatic payout</strong> → Transfer 90% to host, keep 10% commission</li>
            </ol>

            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Database Schema Updates:</h4>
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`-- Add payment processor info to reservations
ALTER TABLE reservations ADD COLUMN payment_processor VARCHAR(50);
ALTER TABLE reservations ADD COLUMN payment_method_id VARCHAR(255);
ALTER TABLE reservations ADD COLUMN payment_status VARCHAR(50);

-- Add payout info to users
ALTER TABLE users ADD COLUMN stripe_account_id VARCHAR(255);
ALTER TABLE users ADD COLUMN paypal_email VARCHAR(255);
ALTER TABLE users ADD COLUMN bank_account_verified BOOLEAN DEFAULT FALSE;`}
              </pre>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-red-600" />
              5. Security Best Practices
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Never store card details</strong> - Use tokenization</li>
              <li><strong>Validate on server</strong> - Never trust client-side validation</li>
              <li><strong>Use HTTPS</strong> - All payment endpoints must be secure</li>
              <li><strong>Implement rate limiting</strong> - Prevent abuse</li>
              <li><strong>Log transactions</strong> - For auditing and debugging</li>
              <li><strong>PCI compliance</strong> - If handling card data directly</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Error Handling</h2>
            <div className="bg-gray-100 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-800 overflow-x-auto">
{`const processPayment = async (paymentData) => {
  try {
    const result = await paymentProcessor.process(paymentData);
    return { success: true, data: result };
  } catch (error) {
    console.error('Payment failed:', error);
    
    // Send notification to user
    await sendNotification(user.id, {
      type: 'payment_failed',
      message: 'Your payment could not be processed. Please try again.'
    });
    
    return { success: false, error: error.message };
  }
};`}
              </pre>
            </div>
          </section>

          <section className="mb-8 bg-blue-50 rounded-lg p-6">
            <h2 className="text-2xl font-semibold text-blue-800 mb-4">Testing Checklist</h2>
            <ul className="list-disc pl-6 space-y-2 text-blue-700">
              <li>Use test credentials for all processors</li>
              <li>Test failed payments and edge cases</li>
              <li>Verify webhook handling</li>
              <li>Test payout functionality</li>
              <li>Ensure proper error messages</li>
            </ul>
          </section>

          <div className="bg-green-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-2">Ready for Production</h3>
            <p className="text-green-700">
              This integration provides a robust, multi-processor payment system that handles both customer payments and host payouts efficiently, ready for immediate monetization.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}