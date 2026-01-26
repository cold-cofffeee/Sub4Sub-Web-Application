/**
 * Email Service
 * Handles email sending with nodemailer
 */

const nodemailer = require('nodemailer');
const config = require('../config/config');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }
  
  initTransporter() {
    // Skip if email not configured
    if (!config.email.user || !config.email.pass) {
      console.log('⚠ Email service disabled (no credentials configured)');
      return;
    }
    
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.secure,
      auth: {
        user: config.email.user,
        pass: config.email.pass
      }
    });
    
    console.log('✓ Email service initialized');
  }
  
  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      console.log('Email not sent (service disabled):', subject);
      return { success: false, message: 'Email service not configured' };
    }
    
    try {
      const mailOptions = {
        from: `"${config.email.fromName}" <${config.email.fromEmail}>`,
        to,
        subject,
        html,
        text: text || this.htmlToText(html)
      };
      
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, message: error.message };
    }
  }
  
  async sendWelcomeEmail(user) {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Welcome to ${config.app.name}! 🎉</h2>
        <p>Hi ${user.username},</p>
        <p>Thank you for joining our YouTube growth community! Your account has been successfully created.</p>
        <p>You can now start exchanging subscriptions and growing your channel.</p>
        <a href="${config.app.url}/exchange" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Start Exchanging</a>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The ${config.app.name} Team</p>
      </div>
    `;
    
    return this.sendEmail(user.email, `Welcome to ${config.app.name}!`, html);
  }
  
  async sendPasswordResetEmail(user, resetToken) {
    const resetUrl = `${config.app.url}/auth/reset-password/${resetToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Password Reset Request</h2>
        <p>Hi ${user.username},</p>
        <p>You requested to reset your password. Click the button below to proceed:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The ${config.app.name} Team</p>
      </div>
    `;
    
    return this.sendEmail(user.email, 'Password Reset Request', html);
  }
  
  async sendVerificationEmail(user, verificationToken) {
    const verifyUrl = `${config.app.url}/auth/verify-email/${verificationToken}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #667eea;">Verify Your Email Address</h2>
        <p>Hi ${user.username},</p>
        <p>Please verify your email address by clicking the button below:</p>
        <a href="${verifyUrl}" style="display: inline-block; padding: 12px 24px; background-color: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0;">Verify Email</a>
        <p>If you didn't create an account, please ignore this email.</p>
        <p>Best regards,<br>The ${config.app.name} Team</p>
      </div>
    `;
    
    return this.sendEmail(user.email, 'Verify Your Email Address', html);
  }
  
  htmlToText(html) {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

module.exports = new EmailService();
