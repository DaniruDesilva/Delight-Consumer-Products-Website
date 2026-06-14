// ─── Email Templates ────────────────────────────────────────────────────────────
// Centralized beautiful email templates for Delight Consumer Products

const BRAND_COLOR = '#3A6B4C';
const BG_COLOR = '#FAF8F5';
const TEXT_COLOR = '#333333';
const ACCENT_COLOR = '#F5F2ED';

const BASE_STYLES = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: ${TEXT_COLOR};
  background-color: ${BG_COLOR};
  padding: 40px 20px;
  line-height: 1.6;
`;

const CONTAINER_STYLES = `
  max-width: 600px;
  margin: 0 auto;
  background: #ffffff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0,0,0,0.05);
`;

const HEADER_STYLES = `
  background-color: ${BRAND_COLOR};
  color: #ffffff;
  padding: 30px 40px;
  text-align: center;
`;

const CONTENT_STYLES = `
  padding: 40px;
`;

const FOOTER_STYLES = `
  text-align: center;
  padding: 30px;
  color: #888888;
  font-size: 13px;
  background: ${ACCENT_COLOR};
`;

const BUTTON_STYLES = `
  display: inline-block;
  padding: 14px 32px;
  background-color: ${BRAND_COLOR};
  color: #ffffff;
  text-decoration: none;
  border-radius: 6px;
  font-weight: bold;
  margin-top: 20px;
  text-align: center;
`;

// Helper to wrap content in the standard layout
function wrapEmail(title: string, content: string) {
  return `
    <div style="${BASE_STYLES}">
      <div style="${CONTAINER_STYLES}">
        <div style="${HEADER_STYLES}">
          <h1 style="margin: 0; font-size: 24px; font-weight: 600; letter-spacing: 1px;">DELIGHT</h1>
          <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">CONSUMER PRODUCTS</p>
        </div>
        <div style="${CONTENT_STYLES}">
          ${content}
        </div>
        <div style="${FOOTER_STYLES}">
          <p style="margin: 0;">&copy; ${new Date().getFullYear()} Delight Consumer Products. All rights reserved.</p>
          <p style="margin: 10px 0 0;">Sri Lanka</p>
        </div>
      </div>
    </div>
  `;
}

export function getWelcomeEmailTemplate(name: string) {
  return wrapEmail(
    'Welcome to Delight!',
    `
      <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">Welcome to the Delight Family, ${name}!</h2>
      <p>Thank you for creating an account with us. We are absolutely thrilled to have you here.</p>
      <p>At Delight Consumer Products, we craft premium aromatic goods inspired by Sri Lanka's rich cultural heritage. You can now explore our curated range of incense sticks, traditional ghee oil lamps, and candles.</p>
      <p>With your new account, you can enjoy faster checkout, track your orders, and easily manage your preferences.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://delightconsumerproducts.lk'}/shop" style="${BUTTON_STYLES}">Explore Our Products</a>
      </div>
      <p>Warm regards,<br/><strong>The Delight Team</strong></p>
    `
  );
}

export function getOrderConfirmationTemplate(orderNumber: string, customerName: string, total: number, paymentMethod: string, itemsListHtml: string = '') {
  const methodMap: Record<string, string> = {
    cod: 'Cash on Delivery',
    payhere: 'PayHere Secure Checkout',
    bank_transfer: 'Bank Transfer'
  };
  const paymentText = methodMap[paymentMethod] || paymentMethod;

  return wrapEmail(
    'Order Confirmation',
    `
      <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">Order Confirmed!</h2>
      <p>Hi ${customerName},</p>
      <p>Thank you for your purchase. We've received your order <strong>${orderNumber}</strong> and are getting it ready for dispatch.</p>
      
      <div style="background: ${ACCENT_COLOR}; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid ${BRAND_COLOR};">
        <h3 style="margin-top: 0; color: ${BRAND_COLOR}; font-size: 16px;">Order Summary</h3>
        ${itemsListHtml ? itemsListHtml : ''}
        <p style="margin-bottom: 5px;"><strong>Total Amount:</strong> LKR ${total.toFixed(2)}</p>
        <p style="margin-top: 0;"><strong>Payment Method:</strong> ${paymentText}</p>
      </div>

      <p>We'll notify you via email as soon as your order ships.</p>
      <p>Warm regards,<br/><strong>The Delight Team</strong></p>
    `
  );
}

export function getNewsletterWelcomeTemplate() {
  return wrapEmail(
    'Welcome to the Newsletter',
    `
      <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">You're on the list!</h2>
      <p>Thank you for subscribing to the Delight Consumer Products newsletter.</p>
      <p>Get ready to receive exclusive offers, new product announcements, and a daily dose of aromatic inspiration delivered straight to your inbox.</p>
      <p>We promise to only send you the good stuff.</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://delightconsumerproducts.lk'}/shop" style="${BUTTON_STYLES}">Shop Now</a>
      </div>
      <p>Warm regards,<br/><strong>The Delight Team</strong></p>
    `
  );
}

export function getContactUserAutoResponderTemplate(name: string) {
  return wrapEmail(
    'We received your message',
    `
      <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">Hello ${name},</h2>
      <p>Thank you for reaching out to Delight Consumer Products! We have successfully received your message.</p>
      <p>Our support team will review your inquiry and get back to you as soon as possible, usually within 24-48 hours during business days.</p>
      <p>We appreciate your patience.</p>
      <p>Warm regards,<br/><strong>The Delight Team</strong></p>
    `
  );
}

export function getContactAdminAlertTemplate(name: string, email: string, subject: string, message: string) {
  return wrapEmail(
    'New Contact Submission',
    `
      <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">New Contact Form Submission</h2>
      <p>You have received a new message from the website contact form:</p>
      
      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee; width: 100px;"><strong>Name:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Email:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <a href="mailto:${email}" style="color: ${BRAND_COLOR}; text-decoration: none;">${email}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;"><strong>Subject:</strong></td>
          <td style="padding: 10px 0; border-bottom: 1px solid #eee;">${subject || 'No Subject'}</td>
        </tr>
      </table>
      
      <h3 style="margin-top: 25px; font-size: 16px; color: ${BRAND_COLOR};">Message:</h3>
      <div style="background: ${ACCENT_COLOR}; padding: 20px; border-radius: 8px; font-style: italic;">
        ${message.replace(/\n/g, '<br/>')}
      </div>
    `
  );
}

export function getReturnRequestUserTemplate(orderNumber: string, name: string) {
  return wrapEmail(
    'Return Request Received',
    `
      <h2 style="color: ${BRAND_COLOR}; margin-top: 0;">Return Request Received</h2>
      <p>Hi ${name},</p>
      <p>We have successfully received your return request for Order <strong>${orderNumber}</strong>.</p>
      <p>Our team is currently reviewing your request. We will inspect the details and get back to you within 1-2 business days with further instructions on how to proceed.</p>
      <p>If your return is approved, we will provide you with a shipping label or instructions on how to send the item back to us.</p>
      <p>We apologize for any inconvenience with your order and appreciate your patience as we make this right.</p>
      <p>Warm regards,<br/><strong>The Delight Support Team</strong></p>
    `
  );
}
