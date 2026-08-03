import nodemailer from 'nodemailer';

export const smtpUser = 'deekshadeeraglow@gmail.com';
export const smtpPass = 'lauddxepxjtdpiwv';

export const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: smtpUser,
    pass: smtpPass,
  },
});

/**
 * Send Welcome Email for Newsletter Subscribers
 */
export async function sendWelcomeNewsletterEmail(toEmail: string) {
  try {
    const mailOptions = {
      from: `"Deera Glow" <${smtpUser}>`,
      to: toEmail,
      subject: '✨ Welcome to Deera Glow Journal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="font-size: 24px; color: #1a1a1a; letter-spacing: 2px; margin: 0;">DEERA GLOW</h1>
            <p style="font-size: 11px; color: #6d6d6d; text-transform: uppercase; margin-top: 4px;">Premium Fine Artificial Jewellery</p>
          </div>

          <div style="padding: 24px 0; color: #333333; line-height: 1.6;">
            <h2 style="font-size: 18px; color: #2d5c4d; margin-top: 0;">Welcome to the Deera Glow Journal! 🎉</h2>
            <p>Thank you for subscribing to our journal. You are now part of an exclusive circle of fine jewellery lovers.</p>
            <p>As a subscriber, you will receive:</p>
            <ul>
              <li>Monthly jewellery styling updates & care guides</li>
              <li>New collection launch previews</li>
              <li>Exclusive early access to limited edition drops & discounts</li>
            </ul>
            <div style="text-align: center; margin-top: 30px;">
              <a href="https://www.deeraglow.shop/collections" style="background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; font-size: 14px; display: inline-block;">
                EXPLORE COLLECTIONS →
              </a>
            </div>
          </div>

          <div style="border-top: 1px solid #eeeeee; padding-top: 16px; text-align: center; font-size: 11px; color: #888888;">
            <p>© 2026 Deera Glow. All rights reserved.</p>
            <p>If you have any questions, reply directly to this email or visit <a href="https://www.deeraglow.shop" style="color: #2d5c4d;">deeraglow.shop</a>.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Welcome newsletter email successfully sent to ${toEmail}`);
    return true;
  } catch (err) {
    console.error(`[SMTP Error] Failed to send newsletter email to ${toEmail}:`, err);
    return false;
  }
}

/**
 * Send Contact Form Message to Admin
 */
export async function sendContactNotificationEmail(name: string, email: string, phone: string, message: string) {
  try {
    const mailOptions = {
      from: `"Deera Glow Website" <${smtpUser}>`,
      to: smtpUser,
      replyTo: email,
      subject: `📩 New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 12px; background-color: #ffffff;">
          <h2 style="font-size: 18px; color: #1a1a1a; margin-top: 0;">New Contact Form Message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
          <p><strong>Message:</strong></p>
          <div style="background-color: #f9f9f9; padding: 14px; border-radius: 8px; border: 1px solid #eeeeee; font-style: italic;">
            ${message.replace(/\n/g, '<br/>')}
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Contact form notification sent to admin`);
    return true;
  } catch (err) {
    console.error(`[SMTP Error] Failed to send contact email:`, err);
    return false;
  }
}

interface OrderItem {
  name: string;
  quantity: number;
  price: string | number;
  selected_fragrance?: string;
}

interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  paymentMethod?: string;
  subtotal?: string;
  deliveryCharge?: string;
  codFee?: string;
  totalPrice?: string;
  advancePaid?: string;
  remainingCod?: string;
  items?: OrderItem[];
}

/**
 * Send Order Confirmation Email to Customer & Notification to Admin
 */
export async function sendOrderConfirmationEmail(order: OrderEmailData) {
  try {
    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <strong>${item.name}</strong> ${item.selected_fragrance ? `<br/><small style="color: #666;">Variant: ${item.selected_fragrance}</small>` : ''}
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${typeof item.price === 'number' ? `₹${item.price.toFixed(2)}` : item.price}</td>
      </tr>
    `).join('');

    const isCod = order.paymentMethod?.toLowerCase() === 'cod';

    const customerMailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 12px; background-color: #ffffff;">
        <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
          <h1 style="font-size: 24px; color: #1a1a1a; letter-spacing: 2px; margin: 0;">DEERA GLOW</h1>
          <p style="font-size: 11px; color: #6d6d6d; text-transform: uppercase; margin-top: 4px;">Premium Fine Artificial Jewellery</p>
        </div>

        <div style="padding: 24px 0; color: #333333; line-height: 1.6;">
          <div style="background-color: #e2ece9; border: 1px solid #b8d8ce; color: #2d5c4d; padding: 14px; border-radius: 8px; font-weight: bold; text-align: center; margin-bottom: 20px;">
            🎉 Thank you! Your Order ${order.orderNumber} is Confirmed!
          </div>

          <p>Hi <strong>${order.customerName}</strong>,</p>
          <p>We are delighted to confirm your order. We are preparing your exquisite jewellery pieces with extreme care.</p>

          <h3 style="font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-top: 24px;">📦 Order Details</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 20px;">
            <thead>
              <tr style="background-color: #f9f9f9; text-align: left;">
                <th style="padding: 8px;">Item</th>
                <th style="padding: 8px; text-align: center;">Qty</th>
                <th style="padding: 8px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml || '<tr><td colspan="3" style="padding: 10px;">Order items</td></tr>'}
            </tbody>
          </table>

          <div style="background-color: #fafafa; border: 1px solid #eee; border-radius: 8px; padding: 14px; font-size: 13px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Subtotal:</span><strong>${order.subtotal || '₹0.00'}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span>Delivery Charge:</span><strong>${order.deliveryCharge || 'FREE'}</strong>
            </div>
            ${isCod ? `
              <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #856404;">
                <span>COD Handling Fee:</span><strong>${order.codFee || '₹150.00'}</strong>
              </div>
            ` : ''}
            <div style="display: flex; justify-content: space-between; border-top: 1px solid #ddd; padding-top: 8px; font-size: 14px; font-weight: bold;">
              <span>Total Order Value:</span><strong>${order.totalPrice || '₹0.00'}</strong>
            </div>
            ${isCod ? `
              <div style="display: flex; justify-content: space-between; margin-top: 6px; color: #2d5c4d; font-weight: bold;">
                <span>Online Advance Paid:</span><span>${order.advancePaid || '₹200.00'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 4px; color: #856404; font-weight: bold;">
                <span>Payable on Delivery (COD):</span><span>${order.remainingCod || '₹0.00'}</span>
              </div>
            ` : ''}
          </div>

          ${order.shippingAddress ? `
            <h3 style="font-size: 15px; border-bottom: 1px solid #ddd; padding-bottom: 6px; margin-top: 24px;">📍 Shipping Address</h3>
            <p style="font-size: 13px; color: #555; background-color: #f9f9f9; padding: 12px; border-radius: 6px; margin: 0;">
              ${order.customerName}<br/>
              ${order.shippingAddress}<br/>
              ${order.customerPhone ? `Phone: ${order.customerPhone}` : ''}
            </p>
          ` : ''}
        </div>

        <div style="border-top: 1px solid #eeeeee; padding-top: 16px; text-align: center; font-size: 11px; color: #888888;">
          <p>© 2026 Deera Glow. All rights reserved.</p>
          <p>For order status or assistance, reply to this email or visit <a href="https://www.deeraglow.shop" style="color: #2d5c4d;">deeraglow.shop</a>.</p>
        </div>
      </div>
    `;

    // 1. Send to Customer if valid email provided
    if (order.customerEmail && order.customerEmail.includes('@')) {
      await transporter.sendMail({
        from: `"Deera Glow" <${smtpUser}>`,
        to: order.customerEmail,
        subject: `🛍️ Order Confirmed ${order.orderNumber} - Deera Glow`,
        html: customerMailHtml,
      });
      console.log(`[SMTP] Order confirmation email sent to customer: ${order.customerEmail}`);
    }

    // 2. Send Notification Email to Store Admin
    await transporter.sendMail({
      from: `"Deera Glow Orders" <${smtpUser}>`,
      to: smtpUser,
      subject: `🚨 NEW ORDER RECEIVED! ${order.orderNumber} - ${order.customerName} (${order.totalPrice})`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 2px solid #1a1a1a; border-radius: 12px;">
          <h2 style="color: #2d5c4d; margin-top: 0;">🚨 New Order Received (${order.orderNumber})</h2>
          <p><strong>Customer:</strong> ${order.customerName} (${order.customerEmail || 'No Email'})</p>
          <p><strong>Phone:</strong> ${order.customerPhone || 'N/A'}</p>
          <p><strong>Payment Method:</strong> ${isCod ? 'Cash on Delivery (Advance Paid)' : 'Prepaid Online'}</p>
          <p><strong>Total Price:</strong> ${order.totalPrice}</p>
          ${isCod ? `<p style="color: #856404;"><strong>Collect on Delivery:</strong> ${order.remainingCod}</p>` : ''}
          <p><strong>Address:</strong> ${order.shippingAddress || 'N/A'}</p>
          <hr/>
          <a href="https://www.deeraglow.shop/admin/dashboard" style="background-color: #1a1a1a; color: #fff; padding: 10px 18px; border-radius: 6px; text-decoration: none; font-weight: bold; display: inline-block;">View in Admin Dashboard →</a>
        </div>
      `,
    });
    console.log(`[SMTP] Admin order alert notification sent to ${smtpUser}`);

    return true;
  } catch (err) {
    console.error(`[SMTP Error] Failed to send order confirmation email:`, err);
    return false;
  }
}

interface AbandonedCheckoutData {
  checkoutNumber: string;
  customerName: string;
  customerEmail: string;
  totalPrice: string;
  itemsCount: string;
  checkoutItems?: any[];
}

/**
 * Send Abandoned Checkout Recovery Email
 */
export async function sendAbandonedCheckoutRecoveryEmail(checkout: AbandonedCheckoutData) {
  try {
    if (!checkout.customerEmail || !checkout.customerEmail.includes('@')) {
      console.error(`[SMTP Error] Cannot send abandoned email: Invalid recipient address "${checkout.customerEmail}"`);
      return false;
    }

    let itemsListHtml = '';
    if (Array.isArray(checkout.checkoutItems) && checkout.checkoutItems.length > 0) {
      itemsListHtml = checkout.checkoutItems.map(item => `
        <div style="display: flex; align-items: center; gap: 12px; padding: 10px; border-bottom: 1px solid #f0f0f0;">
          ${item.image_url ? `<img src="${item.image_url}" width="60" height="60" style="border-radius: 6px; object-fit: cover;" />` : ''}
          <div>
            <strong style="font-size: 13px; color: #1a1a1a;">${item.name || item.title}</strong><br/>
            <span style="font-size: 12px; color: #666;">Qty: ${item.quantity || 1} • ${item.price || item.total}</span>
          </div>
        </div>
      `).join('');
    }

    const mailOptions = {
      from: `"Deera Glow" <${smtpUser}>`,
      to: checkout.customerEmail,
      subject: `✨ You left something shining in your cart! (Order ${checkout.checkoutNumber})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e3e3e3; border-radius: 12px; background-color: #ffffff;">
          <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #eeeeee;">
            <h1 style="font-size: 24px; color: #1a1a1a; letter-spacing: 2px; margin: 0;">DEERA GLOW</h1>
            <p style="font-size: 11px; color: #6d6d6d; text-transform: uppercase; margin-top: 4px;">Premium Fine Artificial Jewellery</p>
          </div>

          <div style="padding: 24px 0; color: #333333; line-height: 1.6;">
            <h2 style="font-size: 18px; color: #1a1a1a; margin-top: 0;">Hi ${checkout.customerName || 'there'}, your cart is waiting for you! 🛍️</h2>
            <p>We noticed you left some exquisite jewellery pieces in your cart. They are selling out fast, but we've saved your selection!</p>

            ${itemsListHtml ? `
              <div style="background-color: #fafafa; border: 1px solid #eeeeee; border-radius: 10px; padding: 12px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; font-size: 13px; color: #6d6d6d; text-transform: uppercase;">Items Saved In Your Cart:</h4>
                ${itemsListHtml}
                <div style="text-align: right; padding-top: 10px; font-weight: bold; font-size: 14px; color: #1a1a1a;">
                  Total Cart Value: ${checkout.totalPrice}
                </div>
              </div>
            ` : ''}

            <div style="text-align: center; margin: 30px 0;">
              <a href="https://www.deeraglow.shop/collections" style="background-color: #1a1a1a; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: bold; font-size: 14px; display: inline-block; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
                COMPLETE MY ORDER NOW →
              </a>
            </div>

            <p style="font-size: 12px; color: #6d6d6d; text-align: center;">
              Need help completing your order? Feel free to reply directly to this email or call our care team at +91 99714 59984.
            </p>
          </div>

          <div style="border-top: 1px solid #eeeeee; padding-top: 16px; text-align: center; font-size: 11px; color: #888888;">
            <p>© 2026 Deera Glow. All rights reserved.</p>
            <p>Deera Glow Jewellery | <a href="https://www.deeraglow.shop" style="color: #2d5c4d;">www.deeraglow.shop</a></p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Abandoned checkout recovery email sent to ${checkout.customerEmail}`);
    return true;
  } catch (err) {
    console.error(`[SMTP Error] Failed to send abandoned recovery email to ${checkout.customerEmail}:`, err);
    return false;
  }
}
