'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus, Trash2, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function CreateOrderPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [retailers, setRetailers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  
  const [selectedRetailer, setSelectedRetailer] = useState('');
  const [cart, setCart] = useState<any[]>([]);
  const [discountTotal, setDiscountTotal] = useState<number>(0);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    // Fetch retailers
    fetch('/api/sales/retailers')
      .then(r => r.json())
      .then(d => { if (d.retailers) setRetailers(d.retailers); });
      
    // Fetch products
    setProductsLoading(true);
    fetch('/api/sales/products')
      .then(r => r.json())
      .then(d => { 
        if (d.products) setProducts(d.products); 
        setProductsLoading(false);
      })
      .catch(() => setProductsLoading(false));
  }, []);

  const getPriceForQuantity = (product: any, quantity: number) => {
    let basePrice = product.retailer_price || product.price;
    try {
      if (product.bulk_pricing_json) {
        const tiers = JSON.parse(product.bulk_pricing_json).sort((a: any, b: any) => b.min_qty - a.min_qty); // descending
        for (const tier of tiers) {
          if (quantity >= tier.min_qty) {
            return tier.price;
          }
        }
      }
    } catch (e) {}
    return basePrice;
  };

  const addToCart = (product: any) => {
    const existing = cart.find(item => item.product_id === product.id);
    if (existing) {
      const newQty = existing.quantity + 1;
      const newPrice = getPriceForQuantity(product, newQty);
      setCart(cart.map(item => item.product_id === product.id ? { ...item, quantity: newQty, price: newPrice } : item));
    } else {
      setCart([...cart, { 
        product_id: product.id, 
        name: product.name,
        pack_size: product.pack_size || 1,
        original_product: product,
        price: getPriceForQuantity(product, 1), 
        quantity: 1,
        sku: product.sku
      }]);
    }
  };

  const updateQuantity = (productId: number, newQty: number) => {
    const qty = Math.max(1, isNaN(newQty) ? 1 : newQty);
    setCart(cart.map(item => {
      if (item.product_id === productId) {
        const newPrice = getPriceForQuantity(item.original_product, qty);
        return { ...item, quantity: qty, price: newPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.product_id !== productId));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const total = subtotal - discountTotal;

  const handleSubmit = async () => {
    if (!selectedRetailer) {
      setError('Please select a retailer');
      return;
    }
    if (cart.length === 0) {
      setError('Please add at least one product to the order');
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sales/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          retailer_id: parseInt(selectedRetailer),
          items: cart,
          subtotal,
          discount_total: discountTotal,
          total,
          notes,
          payment_method: 'credit' // Standard for B2B orders
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      
      router.push('/sales/orders');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/sales/orders" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '8px', background: 'white', color: '#64748b', textDecoration: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>Create Sales Order</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Draft a new wholesale B2B order for a retailer.</p>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fef2f2', color: '#b91c1c', padding: '16px', borderRadius: '8px', fontSize: '14px', border: '1px solid #fecaca' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'flex-start' }}>
        {/* Left Column: Retailer & Products */}
        <div style={{ flex: '1 1 500px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Retailer Selection */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>1. Select Retailer</h2>
            <select 
              value={selectedRetailer} 
              onChange={e => setSelectedRetailer(e.target.value)}
              style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '15px', background: 'white' }}
            >
              <option value="">-- Choose Retailer --</option>
              {retailers.map(r => (
                <option key={r.id} value={r.id}>{r.shop_name} ({r.city})</option>
              ))}
            </select>
          </div>

          {/* Product Selection */}
          <div style={{ background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>2. Add Products (Wholesale Packs)</h2>
            
            {productsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', gap: '12px', color: '#64748b' }}>
                <Loader2 size={24} className="spin" />
                <span>Loading products...</span>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                {products.map(p => (
                  <div key={p.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', cursor: 'pointer', transition: 'border 0.2s', background: 'white' }} onClick={() => addToCart(p)}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginBottom: '4px' }}>
                        {p.sku ? `${p.sku} • ` : ''}Pack of {p.pack_size || 1}
                      </div>
                      <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f172a', lineHeight: '1.4' }}>{p.name}</h3>
                    </div>
                    <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: '#2563eb' }}>
                        LKR {(p.retailer_price || p.price).toLocaleString()}
                      </span>
                      <button style={{ background: '#eff6ff', border: 'none', width: '28px', height: '28px', borderRadius: '6px', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Cart & Summary */}
        <div style={{ flex: '1 1 320px', background: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '100px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>Order Summary</h2>
          
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '14px' }}>
              No products added yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
              {cart.map(item => (
                <div key={item.product_id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', display: 'block' }}>{item.name}</span>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Pack of {item.pack_size}</span>
                    </div>
                    <button onClick={() => removeFromCart(item.product_id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={16} /></button>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#64748b' }}>Qty:</span>
                      <input 
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.product_id, parseInt(e.target.value))}
                        style={{ width: '60px', padding: '6px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '14px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                      <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                        LKR {(item.price * item.quantity).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: '#10b981' }}>{item.price.toLocaleString()} / pack</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#64748b' }}>
              <span>Subtotal</span>
              <span>LKR {subtotal.toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px' }}>
              <span style={{ color: '#64748b' }}>Discount</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: '#64748b' }}>LKR</span>
                <input 
                  type="number" 
                  min="0"
                  max={subtotal}
                  value={discountTotal || ''} 
                  onChange={e => setDiscountTotal(Number(e.target.value))}
                  style={{ width: '80px', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', textAlign: 'right' }}
                />
              </div>
            </div>

            <div style={{ paddingTop: '16px', borderTop: '2px dashed #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 600, color: '#0f172a' }}>Total</span>
              <span style={{ fontSize: '20px', fontWeight: 700, color: '#2563eb' }}>LKR {Math.max(0, total).toLocaleString()}</span>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '13px', fontWeight: 500, color: '#64748b' }}>Order Notes (Optional)</label>
              <textarea 
                value={notes}
                onChange={e => setNotes(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', resize: 'vertical', minHeight: '60px' }}
                placeholder="Any special instructions..."
              />
            </div>

            <button 
              onClick={handleSubmit}
              disabled={loading || cart.length === 0 || !selectedRetailer}
              style={{ 
                marginTop: '8px',
                display: 'flex', 
                justifyContent: 'center',
                alignItems: 'center', 
                gap: '8px', 
                background: '#2563eb', 
                color: 'white', 
                padding: '14px 24px', 
                borderRadius: '8px', 
                fontWeight: 600, 
                fontSize: '16px',
                border: 'none',
                cursor: (loading || cart.length === 0 || !selectedRetailer) ? 'not-allowed' : 'pointer',
                opacity: (loading || cart.length === 0 || !selectedRetailer) ? 0.7 : 1
              }}
            >
              <Save size={20} />
              {loading ? 'Processing...' : 'Confirm Order'}
            </button>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}} />
    </div>
  );
}
