import nodemailer from 'nodemailer';
import mongoose from 'mongoose';
import EmailLog from '../models/EmailLog.js';

let transporter = null;

export const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false, // TLS
      auth: {
        user: process.env.SMTP_USER || 'kasanimanikanta2005@gmail.com',
        pass: process.env.SMTP_PASS || 'cnkpuijxcodvtaar',
      },
      tls: {
        rejectUnauthorized: false,
      },
    });
  }
  return transporter;
};

// Safe DB logging helper - never throws or blocks email dispatch
const safeLog = async (data) => {
  if (mongoose.connection.readyState === 1) {
    try {
      await EmailLog.create(data);
    } catch (e) {
      console.warn('[EMAIL LOG] DB log skipped:', e.message);
    }
  }
};

// 1. Send OTP Email
export const sendOtpEmail = async (email, otp) => {
  const mailSubject = 'Your AgriTrade Hub AI Verification Code';
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; color: #1e293b; }
        .container { max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 30px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 24px; letter-spacing: 0.5px; }
        .header p { margin: 6px 0 0; opacity: 0.9; font-size: 14px; }
        .body { padding: 32px 24px; }
        .otp-box { background: #f0fdf4; border: 2px dashed #059669; border-radius: 8px; text-align: center; padding: 18px; margin: 24px 0; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #065f46; margin: 0; }
        .notice { font-size: 13px; color: #64748b; line-height: 1.6; }
        .footer { background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AgriTrade Hub AI</h1>
          <p>From Farm to Market. One Intelligent Platform.</p>
        </div>
        <div class="body">
          <h2 style="font-size: 18px; margin-top: 0; color: #0f172a;">Password Reset Verification</h2>
          <p style="font-size: 14px; line-height: 1.5; color: #334155;">
            We received a request to reset your password for AgriTrade Hub AI. Use the verification code below. This code expires in <strong>5 minutes</strong>.
          </p>
          <div class="otp-box">
            <div class="otp-code">${otp}</div>
          </div>
          <p class="notice">
            If you did not request this verification code, please ignore this email. Never share your OTP with anyone.
          </p>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} AgriTrade Hub AI &bull; SIH 2026 Innovation Platform (SIH26033)
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"AgriTrade Hub AI" <${process.env.SMTP_USER || 'kasanimanikanta2005@gmail.com'}>`,
      to: email,
      subject: mailSubject,
      html: htmlContent,
    });

    console.log(`[SMTP] Real OTP email delivered to ${email} (MessageID: ${info.messageId})`);

    await safeLog({
      recipient: email,
      subject: mailSubject,
      type: 'otp',
      referenceId: email,
      status: 'sent',
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[SMTP ERROR] Failed to send OTP email:', error.message);
    await safeLog({
      recipient: email,
      subject: mailSubject,
      type: 'otp',
      referenceId: email,
      status: 'failed',
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

// 2. Send Order Confirmation to Customer (Real SMTP)
export const sendCustomerOrderEmail = async (order) => {
  const itemsHtml = (order.items || [])
    .map(
      (item) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 12px 8px; font-size: 14px; color: #1e293b;">
          <strong>${item.name}</strong>
        </td>
        <td style="padding: 12px 8px; text-align: center; font-size: 14px; color: #475569;">
          ${item.quantity} ${item.unit || 'kg'}
        </td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; color: #475569;">
          ₹${item.price}
        </td>
        <td style="padding: 12px 8px; text-align: right; font-size: 14px; font-weight: 600; color: #065f46;">
          ₹${item.subtotal || item.price * item.quantity}
        </td>
      </tr>
    `
    )
    .join('');

  const subject = `AgriTrade Hub — Order Confirmed #${order.orderId}`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; color: #0f172a; }
        .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .header { background: #065f46; color: white; padding: 28px; text-align: center; }
        .body { padding: 28px; }
        .table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; }
        .badge { display: inline-block; background: #dcfce7; color: #15803d; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; }
        .summary-box { background: #f8fafc; border-radius: 8px; padding: 16px; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 style="margin: 0; font-size: 22px;">Order Confirmed!</h1>
          <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">Order ID: #${order.orderId}</p>
        </div>
        <div class="body">
          <p style="font-size: 15px; margin-top: 0;">Dear <strong>${order.customerName}</strong>,</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">
            Thank you for sourcing fresh farm produce via AgriTrade Hub AI. Your order has been placed and forwarded to our farm logistics network.
          </p>
          
          <div style="margin: 20px 0;">
            <span class="badge">STATUS: ${(order.orderStatus || 'CONFIRMED').toUpperCase()}</span>
            <span style="font-size: 13px; color: #64748b; margin-left: 10px;">Payment: <strong>${(order.paymentStatus || 'PAID').toUpperCase()}</strong></span>
          </div>

          <table class="table">
            <thead>
              <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 12px; color: #64748b;">
                <th style="padding: 10px 8px;">PRODUCE</th>
                <th style="padding: 10px 8px; text-align: center;">QTY</th>
                <th style="padding: 10px 8px; text-align: right;">PRICE</th>
                <th style="padding: 10px 8px; text-align: right;">TOTAL</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="summary-box">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #475569;">
              <span>Subtotal:</span> <span>₹${order.subtotal || order.total}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 14px; color: #475569;">
              <span>Logistics & Delivery:</span> <span>₹${order.deliveryFee || 0}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 16px; font-weight: 700; color: #065f46; border-top: 1px solid #cbd5e1; padding-top: 8px;">
              <span>Total Paid:</span> <span>₹${order.total}</span>
            </div>
          </div>

          <div style="margin-top: 24px; padding: 14px; background: #f0fdf4; border-left: 4px solid #059669; border-radius: 4px;">
            <strong style="color: #065f46; font-size: 14px;">Delivery Address:</strong>
            <p style="margin: 4px 0 0; font-size: 13px; color: #334155;">
              ${order.shippingAddress?.street || 'Main Road'}, ${order.shippingAddress?.city || 'Hyderabad'}, ${order.shippingAddress?.state || 'Telangana'} - ${order.shippingAddress?.pincode || '500001'}
            </p>
          </div>
        </div>
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px; text-align: center; font-size: 12px; color: #94a3b8;">
          AgriTrade Hub AI &bull; Smart Agricultural Supply Chain &bull; SIH 2026
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"AgriTrade Hub AI" <${process.env.SMTP_USER || 'kasanimanikanta2005@gmail.com'}>`,
      to: order.customerEmail,
      subject,
      html: htmlContent,
    });

    console.log(`[SMTP] Customer order confirmation delivered to ${order.customerEmail} (MessageID: ${info.messageId})`);

    await safeLog({
      recipient: order.customerEmail,
      subject,
      type: 'order_confirmation_customer',
      referenceId: order.orderId,
      status: 'sent',
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Customer order email failed (${order.orderId}):`, error.message);
    await safeLog({
      recipient: order.customerEmail,
      subject,
      type: 'order_confirmation_customer',
      referenceId: order.orderId,
      status: 'failed',
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

// 3. Send Order Notification to Admin (Real SMTP)
export const sendAdminOrderNotification = async (order) => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER || 'kasanimanikanta2005@gmail.com';

  const itemsList = (order.items || [])
    .map((item) => `<li><strong>${item.name}</strong>: ${item.quantity} ${item.unit || 'kg'} @ ₹${item.price} = ₹${item.subtotal || item.price * item.quantity}</li>`)
    .join('');

  const subject = `NEW ORDER — #${order.orderId} — AgriTrade Hub`;
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #0f172a; color: #f8fafc; padding: 20px; }
        .box { max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 8px; border: 1px solid #334155; padding: 24px; }
        .header { border-bottom: 2px solid #059669; padding-bottom: 12px; margin-bottom: 20px; }
        .data-row { margin: 8px 0; font-size: 14px; }
        .data-label { color: #94a3b8; font-weight: 600; display: inline-block; width: 140px; }
      </style>
    </head>
    <body>
      <div class="box">
        <div class="header">
          <h2 style="color: #34d399; margin: 0;">New Order Dispatched to System</h2>
          <p style="color: #94a3b8; margin: 4px 0 0; font-size: 13px;">AgriTrade Hub AI Admin Dispatch Alert</p>
        </div>
        <div class="data-row"><span class="data-label">Order ID:</span> <strong>#${order.orderId}</strong></div>
        <div class="data-row"><span class="data-label">Customer Name:</span> ${order.customerName}</div>
        <div class="data-row"><span class="data-label">Customer Email:</span> ${order.customerEmail}</div>
        <div class="data-row"><span class="data-label">Customer Phone:</span> ${order.customerPhone || 'N/A'}</div>
        <div class="data-row"><span class="data-label">Total Amount:</span> <strong style="color: #34d399;">₹${order.total}</strong></div>
        <div class="data-row"><span class="data-label">Payment Status:</span> ${order.paymentStatus || 'PAID'} (${order.paymentMethod || 'Razorpay Test'})</div>
        <div class="data-row"><span class="data-label">Delivery Address:</span> ${order.shippingAddress?.street || ''}, ${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} - ${order.shippingAddress?.pincode || ''}</div>
        <div class="data-row"><span class="data-label">Order Timestamp:</span> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</div>
        
        <h3 style="color: #e2e8f0; margin-top: 20px; font-size: 15px;">Ordered Produce:</h3>
        <ul style="color: #cbd5e1; font-size: 14px; line-height: 1.6;">
          ${itemsList}
        </ul>
      </div>
    </body>
    </html>
  `;

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"AgriTrade Hub AI" <${process.env.SMTP_USER || 'kasanimanikanta2005@gmail.com'}>`,
      to: adminEmail,
      subject,
      html: htmlContent,
    });

    console.log(`[SMTP] Admin dispatch alert delivered to ${adminEmail} (MessageID: ${info.messageId})`);

    await safeLog({
      recipient: adminEmail,
      subject,
      type: 'order_notification_admin',
      referenceId: order.orderId,
      status: 'sent',
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Admin order email failed (${order.orderId}):`, error.message);
    await safeLog({
      recipient: adminEmail,
      subject,
      type: 'order_notification_admin',
      referenceId: order.orderId,
      status: 'failed',
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};

// 4. Send Partner Data Sharing Invitation Email
export const sendPartnerShareNotificationEmail = async ({
  partnerEmail,
  accessLevel = 'Viewer',
  spreadsheetUrl,
  spreadsheetName = 'AgriTrade Hub AI – Partner Data',
  datasets = [],
  sharedBy = 'National Platform Administrator',
}) => {
  const subject = `AgriTrade Hub AI – Partner Data Access Granted (${accessLevel})`;
  const datasetsList = datasets.length > 0 
    ? datasets.map((d) => `<li style="margin-bottom: 4px;"><strong>${d}</strong></li>`).join('')
    : '<li>All Partner Reporting Modules</li>';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #065f46 0%, #047857 100%); padding: 32px 24px; text-align: center; color: white; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .header p { margin: 8px 0 0; opacity: 0.9; font-size: 13px; }
        .body { padding: 32px 24px; font-size: 14px; line-height: 1.6; }
        .badge { display: inline-block; background: #ecfdf5; color: #047857; font-weight: 700; padding: 4px 12px; border-radius: 9999px; border: 1px solid #a7f3d0; font-size: 12px; margin-bottom: 16px; }
        .card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 20px 0; }
        .btn { display: inline-block; background: #047857; color: #ffffff !important; text-decoration: none; font-weight: 700; padding: 14px 28px; border-radius: 10px; margin-top: 16px; text-align: center; }
        .footer { background: #f1f5f9; padding: 16px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>AgriTrade Hub AI</h1>
          <p>National Mission for Digital Agricultural Marketplace (SIH26033)</p>
        </div>
        <div class="body">
          <div class="badge">● Partner Collaboration Portal</div>
          <p>Hello,</p>
          <p>You have been authorized by <strong>${sharedBy}</strong> to access real-time agricultural supply chain and reporting data for <strong>${spreadsheetName}</strong>.</p>
          
          <div class="card">
            <p style="margin: 0 0 8px;"><strong>Assigned Access Level:</strong> <span style="text-transform: capitalize; color: #047857; font-weight: 800;">${accessLevel}</span></p>
            <p style="margin: 0 0 8px;"><strong>Authorized Datasets:</strong></p>
            <ul style="margin: 0; padding-left: 20px; color: #334155;">
              ${datasetsList}
            </ul>
          </div>

          <p style="margin-top: 24px;">Click the secure link below to open the Google Spreadsheet in your browser:</p>
          <div style="text-align: center; margin: 24px 0;">
            <a href="${spreadsheetUrl}" target="_blank" class="btn">Open Google Spreadsheet</a>
          </div>

          <p style="font-size: 12px; color: #64748b; margin-top: 24px;">Note: Access is managed via Google Drive permissions. Only the email address <strong>${partnerEmail}</strong> can view this spreadsheet.</p>
        </div>
        <div class="footer">
          AgriTrade Hub AI Governance System • Confidential Partner Reporting Layer
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const t = getTransporter();
    const info = await t.sendMail({
      from: `"AgriTrade Hub AI" <${process.env.SMTP_USER || 'kasanimanikanta2005@gmail.com'}>`,
      to: partnerEmail,
      subject,
      html: htmlContent,
    });

    console.log(`[SMTP] Partner access email delivered to ${partnerEmail} (MessageID: ${info.messageId})`);

    await safeLog({
      recipient: partnerEmail,
      subject,
      type: 'partner_share',
      referenceId: spreadsheetName,
      status: 'sent',
      messageId: info.messageId,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Partner sharing email failed (${partnerEmail}):`, error.message);
    await safeLog({
      recipient: partnerEmail,
      subject,
      type: 'partner_share',
      referenceId: spreadsheetName,
      status: 'failed',
      error: error.message,
    });
    return { success: false, error: error.message };
  }
};
