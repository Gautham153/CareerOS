/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface PaymentDetails {
  cardholderName: string;
  cardNumber: string; // 16 digits
  expiry: string; // MM/YY
  cvv: string; // 3 digits
  country: string;
  zipCode: string;
  agreeToTerms: boolean;
}

export interface ProcessPaymentOptions {
  plan: "PRO" | "PREMIUM";
  price: string;
  paymentDetails: PaymentDetails;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  message?: string;
  error?: string;
}

export interface IPaymentService {
  processPayment(options: ProcessPaymentOptions): Promise<PaymentResult>;
}

/**
 * FakePaymentService implements realistic payment processing.
 * Sensitive card details (number, CVV, expiry) are processed purely in memory and NEVER saved or stored.
 */
export class FakePaymentService implements IPaymentService {
  async processPayment(options: ProcessPaymentOptions): Promise<PaymentResult> {
    const { paymentDetails } = options;

    const cleanCard = paymentDetails.cardNumber.replace(/\s+/g, "");
    if (!paymentDetails.cardholderName.trim()) {
      return { success: false, error: "Cardholder name is required." };
    }
    if (!/^\d{16}$/.test(cleanCard)) {
      return { success: false, error: "Please enter a valid 16-digit card number." };
    }
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(paymentDetails.expiry)) {
      return { success: false, error: "Expiry date must be in MM/YY format." };
    }
    if (!/^\d{3,4}$/.test(paymentDetails.cvv)) {
      return { success: false, error: "CVV must be 3 digits." };
    }
    if (!paymentDetails.zipCode.trim()) {
      return { success: false, error: "ZIP / Postal code is required." };
    }
    if (!paymentDetails.agreeToTerms) {
      return { success: false, error: "You must agree to the Terms of Service." };
    }

    // Simulate network processing latency (2.2s)
    await new Promise((resolve) => setTimeout(resolve, 2200));

    const randomTxId = "tx_" + Math.random().toString(36).substring(2, 11).toUpperCase();

    return {
      success: true,
      transactionId: randomTxId,
      message: `Successfully charged ${options.price} for CareerOS ${options.plan}.`,
    };
  }
}

// Export singleton instance for app-wide usage. Swappable with Stripe or Razorpay in the future.
export const paymentService: IPaymentService = new FakePaymentService();
