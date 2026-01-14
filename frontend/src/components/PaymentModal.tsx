import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Lock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Course } from '@/types';
import { showSuccess, showError } from '@/utils/toast';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  course: Course;
  onPaymentSuccess: (paymentData: any) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  course,
  onPaymentSuccess
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
    email: '',
    billingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'US'
    }
  });

  const handleInputChange = (field: string, value: string) => {
    if (field.startsWith('billing.')) {
      const billingField = field.split('.')[1];
      setPaymentData(prev => ({
        ...prev,
        billingAddress: {
          ...prev.billingAddress,
          [billingField]: value
        }
      }));
    } else {
      setPaymentData(prev => ({ ...prev, [field]: value }));
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const validatePaymentData = () => {
    if (!paymentData.cardNumber || paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      showError('Please enter a valid card number');
      return false;
    }
    if (!paymentData.expiryDate || paymentData.expiryDate.length < 5) {
      showError('Please enter a valid expiry date');
      return false;
    }
    if (!paymentData.cvv || paymentData.cvv.length < 3) {
      showError('Please enter a valid CVV');
      return false;
    }
    if (!paymentData.cardholderName.trim()) {
      showError('Please enter the cardholder name');
      return false;
    }
    if (!paymentData.email.trim() || !paymentData.email.includes('@')) {
      showError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const processPayment = async () => {
    if (!validatePaymentData()) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock payment success (in real app, this would be Stripe API call)
      const paymentResult = {
        id: `pi_${Date.now()}`,
        amount: course.pricing * 100, // Stripe uses cents
        currency: 'usd',
        status: 'succeeded',
        created: Date.now(),
        payment_method: {
          card: {
            brand: 'visa',
            last4: paymentData.cardNumber.slice(-4).replace(/\s/g, ''),
            exp_month: parseInt(paymentData.expiryDate.split('/')[0]),
            exp_year: parseInt('20' + paymentData.expiryDate.split('/')[1])
          }
        },
        receipt_email: paymentData.email,
        billing_details: {
          name: paymentData.cardholderName,
          email: paymentData.email,
          address: paymentData.billingAddress
        }
      };

      setPaymentStep('success');
      
      // Wait a moment to show success, then call success handler
      setTimeout(() => {
        onPaymentSuccess(paymentResult);
        onClose();
        setPaymentStep('details');
        showSuccess('Payment successful! You now have access to the course.');
      }, 2000);

    } catch (error) {
      showError('Payment failed. Please try again.');
      setPaymentStep('details');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
      setPaymentStep('details');
      setPaymentData({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: '',
        email: '',
        billingAddress: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: 'US'
        }
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="h-5 w-5" />
            <span>Complete Your Purchase</span>
          </DialogTitle>
          <DialogDescription>
            Secure payment powered by Stripe
          </DialogDescription>
        </DialogHeader>

        {paymentStep === 'details' && (
          <div className="space-y-6">
            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{course.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {course.category} • {(course.modules?.length || 0)} modules
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      By {course.instructorName || 'Unknown Instructor'}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold">${course.pricing.toFixed(2)}</div>
                    <p className="text-sm text-gray-500">One-time payment</p>
                  </div>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total</span>
                  <span className="text-xl font-bold">${course.pricing.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center space-x-2">
                  <Shield className="h-4 w-4" />
                  <span>Payment Information</span>
                </CardTitle>
                <CardDescription>
                  Your payment information is secure and encrypted
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={paymentData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      value={paymentData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="expiryDate">Expiry Date</Label>
                      <Input
                        id="expiryDate"
                        value={paymentData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', formatExpiryDate(e.target.value))}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        value={paymentData.cvv}
                        onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength={4}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="cardholderName">Cardholder Name</Label>
                    <Input
                      id="cardholderName"
                      value={paymentData.cardholderName}
                      onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="font-medium">Billing Address</h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <Label htmlFor="street">Street Address</Label>
                      <Input
                        id="street"
                        value={paymentData.billingAddress.street}
                        onChange={(e) => handleInputChange('billing.street', e.target.value)}
                        placeholder="123 Main St"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={paymentData.billingAddress.city}
                          onChange={(e) => handleInputChange('billing.city', e.target.value)}
                          placeholder="New York"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={paymentData.billingAddress.state}
                          onChange={(e) => handleInputChange('billing.state', e.target.value)}
                          placeholder="NY"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={paymentData.billingAddress.zipCode}
                        onChange={(e) => handleInputChange('billing.zipCode', e.target.value)}
                        placeholder="10001"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <Lock className="h-4 w-4" />
                  <span>Your payment information is secure and encrypted</span>
                </div>
              </CardContent>
            </Card>

            <div className="flex space-x-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={processPayment} className="flex-1">
                <CreditCard className="h-4 w-4 mr-2" />
                Pay ${course.pricing.toFixed(2)}
              </Button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="text-center py-12">
            <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-blue-600" />
            <h3 className="text-lg font-medium mb-2">Processing Payment</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we process your payment securely...
            </p>
            <div className="mt-6">
              <Badge variant="outline" className="flex items-center space-x-2 w-fit mx-auto">
                <Shield className="h-3 w-3" />
                <span>Secured by Stripe</span>
              </Badge>
            </div>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="text-center py-12">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
            <h3 className="text-lg font-medium mb-2">Payment Successful!</h3>
            <p className="text-gray-600 dark:text-gray-400">
              You now have full access to the course content.
            </p>
            <div className="mt-6">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Course Unlocked
              </Badge>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;