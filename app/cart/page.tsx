'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Tag, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import styles from './cart.module.css';
import AvailableCoupons from '@/components/AvailableCoupons';

export default function CartPage() {
  const { items, user, updateQuantity, removeItem, coupon, couponError, applyCoupon, removeCoupon, setAuthOpen } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => setSettings(d.settings || {}));
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  let discountAmount = 0;
  if (coupon) {
    if (coupon.discount_type === 'percent') {
      discountAmount = (subtotal * coupon.discount_value) / 100;
    } else if (coupon.discount_type === 'fixed') {
      discountAmount = coupon.discount_value;
    }
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
    setIsApplying(true);
    const success = await applyCoupon(couponCode.trim());
    if (success) setCouponCode('');
    setIsApplying(false);
  };

  const handleCheckout = () => {
    if (!user) {
      setAuthOpen(true);
    } else {
      router.push('/checkout');
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.cartPage}>
        <div className={`container ${styles.emptyCart}`}>
          <ShoppingBag size={64} strokeWidth={1} color="#d1d5db" />
          <h2>Your cart is empty</h2>
          <p>Add some products to get started</p>
          <Link href="/shop" className={styles.continueBtn}>Browse Products</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartPage}>
      <div className="container">
        
        {/* Progress Breadcrumbs */}
        <div className={styles.progressNav}>
          <span className={styles.activeStep}>SHOPPING CART</span>
          <span className={styles.stepArrow}>&gt;</span>
          <span className={styles.inactiveStep}>CHECKOUT DETAILS</span>
          <span className={styles.stepArrow}>&gt;</span>
          <span className={styles.inactiveStep}>ORDER COMPLETE</span>
        </div>

        <div className={styles.cartLayout}>
          {/* Left Column: Cart Items */}
          <div className={styles.itemsCol}>
            <div className={styles.tableHeader}>
              <div className={styles.colProduct}>PRODUCT</div>
              <div className={styles.colPrice}>PRICE</div>
              <div className={styles.colQty}>QUANTITY</div>
              <div className={styles.colSubtotal}>SUBTOTAL</div>
            </div>

            <div className={styles.itemsList}>
              {items.map(item => (
                <div key={item.product_id} className={styles.cartItem}>
                  <div className={styles.colProduct}>
                    <button className={styles.removeBtn} onClick={() => removeItem(item.product_id)}>
                      <X size={14} />
                    </button>
                    <div className={styles.itemImage}>
                      <Image src={item.image} alt={item.name} fill style={{ objectFit: 'cover' }} sizes="80px" />
                    </div>
                    <Link href={`/shop/${item.product_id}`} className={styles.itemName}>{item.name}</Link>
                  </div>
                  <div className={styles.colPrice}>
                    <span>Rs.{item.price.toFixed(2)}</span>
                  </div>
                  <div className={styles.colQty}>
                    <div className={styles.qtyControl}>
                      <button onClick={() => updateQuantity(item.product_id, Math.max(item.min_order_quantity || 1, item.quantity - 1))}>
                        <Minus size={12} />
                      </button>
                      <input type="number" value={item.quantity} readOnly />
                      <button onClick={() => updateQuantity(item.product_id, Math.min(item.stock, item.quantity + 1))}>
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <div className={styles.colSubtotal}>
                    <span>Rs.{(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.cartActions}>
              <Link href="/shop" className={styles.continueShoppingBtn}>
                <ArrowLeft size={14} /> CONTINUE SHOPPING
              </Link>
              {/* <button className={styles.updateCartBtn}>UPDATE CART</button> // Automatically updated via state */}
            </div>
          </div>

          {/* Right Column: Summary & Coupon */}
          <div className={styles.summaryCol}>
            <div className={styles.summaryCard}>
              <h3>CART TOTALS</h3>
              
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>Rs.{subtotal.toFixed(2)}</span>
              </div>
              
              {coupon && (
                <div className={styles.summaryRow}>
                  <span>Discount ({coupon.code})</span>
                  <span className={styles.discountValue}>- Rs.{discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className={styles.summaryRow}>
                <span>Shipment</span>
                <div className={styles.shippingDetails}>
                  {shipping === 0 ? (
                    <span>Free Shipping</span>
                  ) : (
                    <span>Flat rate: Rs.{shipping.toFixed(2)}</span>
                  )}
                  <p className={styles.shippingHint}>Shipping options will be updated during checkout.</p>
                </div>
              </div>
              
              <div className={`${styles.summaryRow} ${styles.totalRow}`}>
                <span>Total</span>
                <span>Rs.{total.toFixed(2)}</span>
              </div>
              
              <button className={styles.checkoutBtn} onClick={handleCheckout}>
                PROCEED TO CHECKOUT
              </button>
            </div>

            {/* Coupon Section */}
            <div className={styles.couponSection}>
              <div className={styles.couponHeader}>
                <Tag size={16} /> Coupon
              </div>
              
              {coupon ? (
                <div className={styles.appliedCoupon}>
                  <div className={styles.appliedCouponInfo}>
                    <span className={styles.appliedCode}>{coupon.code}</span>
                    <span className={styles.appliedDesc}>
                      {coupon.discount_type === 'percent' ? `${coupon.discount_value}% off` : 
                       coupon.discount_type === 'fixed' ? `Rs. ${coupon.discount_value} off` : 'Free Shipping'}
                    </span>
                  </div>
                  <button onClick={removeCoupon} className={styles.removeCouponBtn}>Remove</button>
                </div>
              ) : (
                <div className={styles.couponForm}>
                  <input 
                    type="text" 
                    placeholder="Coupon code" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                  />
                  <button onClick={handleApplyCoupon} disabled={!couponCode.trim() || isApplying}>
                    {isApplying ? 'Applying...' : 'Apply coupon'}
                  </button>
                  {couponError && <p className={styles.couponError}>{couponError}</p>}
                </div>
              )}
              
              <AvailableCoupons />
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
