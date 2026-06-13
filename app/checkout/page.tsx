'use client';

import { useState, FormEvent, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import styles from './checkout.module.css';
import { Tag, X } from 'lucide-react';
import AvailableCoupons from '@/components/AvailableCoupons';

export default function CheckoutPage() {
  const { items, user, coupon, removeCoupon, applyCoupon, couponError, refreshCart, setAuthOpen, loading: cartLoading } = useCart();
  const router = useRouter();

  const [couponCode, setCouponCode] = useState('');
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    country: 'Sri Lanka',
    streetAddress: '',
    apartment: '',
    city: '',
    postcode: '',
    phone: '',
    email: '',
    notes: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('cod'); // 'cod', 'payhere', 'bank_transfer'
  const [paymentSlip, setPaymentSlip] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  
  const isSubmittingRef = useRef(false);

  // Require auth to access checkout
  useEffect(() => {
    if (!cartLoading && !user) {
      setAuthOpen(true);
      router.push('/cart'); // Send them back to cart to login
    }
  }, [user, cartLoading, setAuthOpen, router]);

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      const nameParts = user.name.split(' ');
      setForm(prev => ({
        ...prev,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        email: user.email || '',
        phone: user.phone || '',
        streetAddress: user.address || '',
        city: user.city || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      const fetchedSettings = d.settings || {};
      setSettings(fetchedSettings);
      
      // Ensure selected payment method is enabled
      const codEnabled = !fetchedSettings.payment_cod_enabled || fetchedSettings.payment_cod_enabled === '1';
      const bankEnabled = !fetchedSettings.payment_bank_transfer_enabled || fetchedSettings.payment_bank_transfer_enabled === '1';
      const payhereEnabled = !fetchedSettings.payment_payhere_enabled || fetchedSettings.payment_payhere_enabled === '1';

      if (!codEnabled && paymentMethod === 'cod') {
        if (bankEnabled) setPaymentMethod('bank_transfer');
        else if (payhereEnabled) setPaymentMethod('payhere');
        else setPaymentMethod('');
      }
    });
  }, [paymentMethod]);

  // If cart is empty, redirect to shop (unless we just placed an order)
  useEffect(() => {
    if (!loading && items.length === 0 && !isOrderSuccess) {
      router.push('/shop');
    }
  }, [items, router, isOrderSuccess, loading]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percent') discountAmount = (subtotal * coupon.discount_value) / 100;
    else if (coupon.discount_type === 'fixed') discountAmount = coupon.discount_value;
  }

  const discountedSubtotal = Math.max(0, subtotal - discountAmount);

  const shippingFlatRate = parseFloat(settings.shipping_flat_rate || '400');
  const shippingAdditionalKgRate = parseFloat(settings.shipping_additional_kg_rate || '150');
  const freeShippingThreshold = parseFloat(settings.free_shipping_threshold || '5000');

  // Calculate total weight in kg
  const totalWeightKg = items.reduce((sum, item) => {
    let w = item.weight || 1;
    if (item.weight_unit === 'g') w = w / 1000;
    return sum + (w * item.quantity);
  }, 0);

  let baseShipping = discountedSubtotal >= freeShippingThreshold ? 0 : shippingFlatRate;
  let additionalShipping = 0;
  
  if (baseShipping > 0 && totalWeightKg > 1) {
    additionalShipping = Math.max(0, Math.ceil(totalWeightKg - 1)) * shippingAdditionalKgRate;
  }
  
  let shipping = baseShipping + additionalShipping;
  if (coupon && coupon.discount_type === 'free_shipping' && subtotal >= (coupon.min_spend || 0)) {
    shipping = 0;
  }

  const total = discountedSubtotal + shipping;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    const success = await applyCoupon(couponCode.trim());
    if (success) setCouponCode('');
    setIsApplyingCoupon(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentSlip(data.path);
      } else {
        setError(data.error || 'Failed to upload slip');
      }
    } catch {
      setError('Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handlePlaceOrder = async (e: FormEvent) => {
    e.preventDefault();

    if (isSubmittingRef.current) return;

    if (!paymentMethod) {
      setError('Please select a payment method to proceed.');
      return;
    }

    if (paymentMethod === 'bank_transfer' && !paymentSlip) {
      setError('Please upload your bank payment slip to proceed.');
      return;
    }

    isSubmittingRef.current = true;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: form.firstName,
          last_name: form.lastName,
          email: form.email,
          phone: form.phone,
          shipping_address: `${form.streetAddress} ${form.apartment}`.trim(),
          shipping_city: form.city,
          shipping_postal_code: form.postcode,
          notes: form.notes,
          payment_method: paymentMethod,
          coupon_code: coupon ? coupon.code : null,
          payment_slip: paymentSlip,
          cart_items: user ? null : items // Send items if guest
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.type === 'STOCK_INSUFFICIENT') {
          setError(data.error || 'Checkout failed due to insufficient stock');
          await refreshCart();
        } else {
          setError(data.error || 'Checkout failed');
        }
        setLoading(false);
        isSubmittingRef.current = false;
        return;
      }

      setIsOrderSuccess(true);
      if (coupon) removeCoupon();
      await refreshCart();

      if (paymentMethod === 'payhere' && data.payhere) {
        // Trigger PayHere integration
        if (typeof window !== 'undefined' && (window as any).payhere) {
          (window as any).payhere.onCompleted = async function onCompleted(orderId: string) {
            await fetch('/api/checkout/confirm', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ order_id: orderId })
            });
            router.push(`/checkout/success?order=${orderId}`);
          };
          (window as any).payhere.onDismissed = function onDismissed() {
            setLoading(false);
            isSubmittingRef.current = false;
          };
          (window as any).payhere.onError = function onError(errorMsg: string) {
            setError(errorMsg);
            setLoading(false);
            isSubmittingRef.current = false;
          };
          (window as any).payhere.startPayment(data.payhere);
        } else {
          setError('Payment gateway failed to load. Please refresh and try again.');
          setLoading(false);
          isSubmittingRef.current = false;
        }
      } else {
        router.push(`/checkout/success?order=${data.order_number}`);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  if (items.length === 0 && !isOrderSuccess) return null;

  return (
    <div className={styles.checkoutPage}>
      {/* PayHere Script */}
      <script type="text/javascript" src="https://www.payhere.lk/lib/payhere.js" async></script>

      <div className="container">

        {/* Progress Breadcrumbs */}
        <div className={styles.progressNav}>
          <Link href="/cart" className={styles.inactiveStep}>SHOPPING CART</Link>
          <span className={styles.stepArrow}>&gt;</span>
          <span className={styles.activeStep}>CHECKOUT DETAILS</span>
          <span className={styles.stepArrow}>&gt;</span>
          <span className={styles.inactiveStep}>ORDER COMPLETE</span>
        </div>

        {!user && (
          <div className={styles.loginPrompt}>
            Returning customer? <Link href="/account">Click here to login</Link>
          </div>
        )}

        <form onSubmit={handlePlaceOrder} className={styles.checkoutLayout}>

          {/* Left Column: Billing Details */}
          <div className={styles.billingDetails}>
            <h2>BILLING DETAILS</h2>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>First name *</label>
                <input type="text" name="firstName" value={form.firstName} onChange={handleChange} required />
              </div>
              <div className={styles.formGroup}>
                <label>Last name *</label>
                <input type="text" name="lastName" value={form.lastName} onChange={handleChange} required />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Company name (optional)</label>
              <input type="text" name="company" value={form.company} onChange={handleChange} />
            </div>

            <div className={styles.formGroup}>
              <label>Country / Region *</label>
              <select name="country" value={form.country} onChange={handleChange} required>
                <option value="Sri Lanka">Sri Lanka</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Street address *</label>
              <div className={styles.streetInputs}>
                <input type="text" name="streetAddress" placeholder="House number and street name" value={form.streetAddress} onChange={handleChange} required />
                <input type="text" name="apartment" placeholder="Apartment, suite, unit, etc. (optional)" value={form.apartment} onChange={handleChange} />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>Town / City *</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} required />
            </div>

            <div className={styles.formGroup}>
              <label>Postcode / ZIP *</label>
              <input type="text" name="postcode" value={form.postcode} onChange={handleChange} required />
            </div>

            <div className={styles.formGroup}>
              <label>Phone *</label>
              <input type="tel" name="phone" value={form.phone} onChange={handleChange} required />
            </div>

            <div className={styles.formGroup}>
              <label>Email address *</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>

            {!user && (
              <div className={styles.checkboxGroup}>
                <input type="checkbox" id="createAccount" />
                <label htmlFor="createAccount">Create an account?</label>
              </div>
            )}

            <div className={styles.formGroup} style={{ marginTop: '20px' }}>
              <label>Order notes (optional)</label>
              <textarea
                name="notes"
                placeholder="Notes about your order, e.g. special notes for delivery."
                value={form.notes}
                onChange={handleChange}
                rows={4}
              ></textarea>
            </div>

          </div>

          {/* Right Column: Order Summary & Payment */}
          <div className={styles.orderSummaryCol}>
            <div className={styles.orderSummaryBox}>
              <h3>YOUR ORDER</h3>

              <div className={styles.orderItemsHeader}>
                <span>PRODUCT</span>
                <span>SUBTOTAL</span>
              </div>

              <div className={styles.orderItemsList}>
                {items.map(item => (
                  <div key={item.product_id} className={styles.orderItemRow}>
                    <span>{item.name} × {item.quantity}</span>
                    <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className={styles.summaryTotals}>
                <div className={styles.totalRow}>
                  <span>Subtotal</span>
                  <span>Rs.{subtotal.toFixed(2)}</span>
                </div>

                {coupon && (
                  <div className={styles.totalRow}>
                    <span>Discount ({coupon.code})</span>
                    <span style={{ color: '#10b981' }}>- Rs.{discountAmount.toFixed(2)}</span>
                  </div>
                )}

                <div className={styles.totalRow}>
                  <span>Shipment</span>
                  <span>{shipping === 0 ? 'Free Shipping' : `Flat rate: Rs.${shipping.toFixed(2)}`}</span>
                </div>

                <div className={`${styles.totalRow} ${styles.finalTotal}`}>
                  <span>Total</span>
                  <span>Rs.{total.toFixed(2)}</span>
                </div>
              </div>

              {/* Coupon Section */}
              <div style={{ marginTop: '20px', marginBottom: '20px', padding: '15px', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-base)' }}>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Tag size={16} /> Have a coupon?
                </div>
                
                {coupon ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f0fdf4', padding: '10px 14px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                    <div>
                      <span style={{ fontWeight: 700, color: 'var(--primary-green)' }}>{coupon.code}</span>
                      <span style={{ fontSize: '13px', color: '#065f46', marginLeft: '8px' }}>
                        {coupon.discount_type === 'percent' ? `${coupon.discount_value}% off` : 
                         coupon.discount_type === 'fixed' ? `Rs. ${coupon.discount_value} off` : 'Free Shipping'}
                      </span>
                    </div>
                    <button type="button" onClick={removeCoupon} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '12px', fontWeight: 600 }}>Remove</button>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text" 
                        placeholder="Coupon code" 
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                        style={{ flex: 1, padding: '10px', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}
                      />
                      <button 
                        type="button"
                        onClick={handleApplyCoupon} 
                        disabled={!couponCode.trim() || isApplyingCoupon}
                        style={{ background: 'var(--primary-green)', color: '#fff', border: 'none', padding: '0 16px', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', opacity: (!couponCode.trim() || isApplyingCoupon) ? 0.7 : 1 }}
                      >
                        {isApplyingCoupon ? 'Applying...' : 'Apply'}
                      </button>
                    </div>
                    {couponError && <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px' }}>{couponError}</p>}
                  </div>
                )}
                
                <AvailableCoupons />
              </div>

              <div className={styles.paymentMethods}>
                {(!settings.payment_cod_enabled || settings.payment_cod_enabled === '1') && (
                  <>
                    <label className={`${styles.paymentOption} ${paymentMethod === 'cod' ? styles.activePayment : ''}`}>
                      <input type="radio" name="paymentMethod" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                      <span className={styles.paymentLabel}>Cash on delivery</span>
                    </label>
                    {paymentMethod === 'cod' && (
                      <div className={styles.paymentDesc}>Pay with cash upon delivery.</div>
                    )}
                  </>
                )}

                {(!settings.payment_bank_transfer_enabled || settings.payment_bank_transfer_enabled === '1') && (
                  <>
                    <label className={`${styles.paymentOption} ${paymentMethod === 'bank_transfer' ? styles.activePayment : ''}`}>
                      <input type="radio" name="paymentMethod" value="bank_transfer" checked={paymentMethod === 'bank_transfer'} onChange={() => setPaymentMethod('bank_transfer')} />
                      <span className={styles.paymentLabel}>Direct bank transfer</span>
                    </label>
                    {paymentMethod === 'bank_transfer' && (
                      <div className={styles.paymentDesc}>
                        <p>Make your payment directly into our bank account. Please use your Order ID as the payment reference.</p>
                        <div className={styles.bankInfo}>
                          <strong>Bank:</strong> {settings.bank_name || 'Bank of Ceylon'}<br />
                          <strong>Account Name:</strong> {settings.bank_account_name || 'Delight Consumer Products'}<br />
                          <strong>Account Number:</strong> {settings.bank_account_number || '1234567890'}<br />
                          <strong>Branch:</strong> {settings.bank_branch || 'Colombo'}
                        </div>
                        <div className={styles.slipUpload}>
                          <label>Upload Payment Slip *</label>
                          <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} disabled={isUploading} />
                          {isUploading && <p className={styles.uploadingText}>Uploading slip...</p>}
                          {paymentSlip && <p className={styles.uploadSuccess}>✅ Slip uploaded successfully</p>}
                        </div>
                        <p style={{ marginTop: '10px', fontSize: '12px', color: '#6b7280' }}>Your order will not be shipped until the funds have cleared in our account.</p>
                      </div>
                    )}
                  </>
                )}

                {(!settings.payment_payhere_enabled || settings.payment_payhere_enabled === '1') && (
                  <>
                    <label className={`${styles.paymentOption} ${paymentMethod === 'payhere' ? styles.activePayment : ''}`}>
                      <input type="radio" name="paymentMethod" value="payhere" checked={paymentMethod === 'payhere'} onChange={() => setPaymentMethod('payhere')} />
                      <span className={styles.paymentLabel}>PayHere (Visa / Master / AMEX)</span>
                    </label>
                    {paymentMethod === 'payhere' && (
                      <div className={styles.paymentDesc}>
                        Pay securely via PayHere using your Credit/Debit Card, Mobile Wallet, or Internet Banking.
                      </div>
                    )}
                  </>
                )}
              </div>

              {settings.payment_cod_enabled === '0' && settings.payment_bank_transfer_enabled === '0' && settings.payment_payhere_enabled === '0' && (
                <div style={{ padding: '15px', background: '#fee2e2', color: '#b91c1c', borderRadius: '6px', fontSize: '14px', marginBottom: '15px' }}>
                  Currently, no payment methods are available for checkout. Please contact support.
                </div>
              )}

              {error && <div className={styles.checkoutError}>{error}</div>}

              <button type="submit" className={styles.placeOrderBtn} disabled={loading || (settings.payment_cod_enabled === '0' && settings.payment_bank_transfer_enabled === '0' && settings.payment_payhere_enabled === '0')}>
                {loading ? 'PROCESSING...' : 'PLACE ORDER'}
              </button>

              <p className={styles.privacyNotice}>
                Your personal data will be used to process your order, support your experience throughout this website, and for other purposes described in our <Link href="/privacy">privacy policy</Link>.
              </p>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
