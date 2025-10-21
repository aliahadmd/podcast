import nodemailer from 'nodemailer';
import { getCloudflareEnv } from './cloudflare';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class EmailHelper {
  private transporter: nodemailer.Transporter;
  private env: CloudflareEnv;

  constructor() {
    this.env = getCloudflareEnv();
    
    this.transporter = nodemailer.createTransport({
      host: this.env.SMTP_HOST,
      port: parseInt(this.env.SMTP_PORT),
      auth: {
        user: this.env.SMTP_USER,
        pass: this.env.SMTP_PASS,
      },
    });
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: `"${this.env.SMTP_FROM_NAME}" <${this.env.SMTP_FROM_EMAIL}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || this.stripHtml(options.html),
      });
    } catch (error) {
      console.error('Failed to send email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎧 Welcome to PodcastApp!</h1>
            </div>
            <div class="content">
              <h2>Hi ${name}! 👋</h2>
              <p>Thank you for joining PodcastApp, your premium podcast streaming platform.</p>
              <p>Here's what you can do now:</p>
              <ul>
                <li>🎵 Browse thousands of podcasts</li>
                <li>🔒 Access exclusive premium content with a subscription</li>
                <li>📊 Track your listening progress across devices</li>
                <li>💫 Enjoy ad-free, uninterrupted listening</li>
              </ul>
              <center>
                <a href="${this.env.APP_URL}/podcasts" class="button">Start Listening</a>
              </center>
              <p>Ready to unlock premium content? Subscribe to get unlimited access to all podcasts!</p>
              <center>
                <a href="${this.env.APP_URL}/profile" class="button">View Subscription Plans</a>
              </center>
            </div>
            <div class="footer">
              <p>© 2025 PodcastApp. All rights reserved.</p>
              <p>You're receiving this email because you signed up for PodcastApp.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Welcome to PodcastApp! 🎉',
      html,
    });
  }

  async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
    const resetUrl = `${this.env.APP_URL}/reset-password?token=${resetToken}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1f2937; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We received a request to reset your password for your PodcastApp account.</p>
              <p>Click the button below to reset your password:</p>
              <center>
                <a href="${resetUrl}" class="button">Reset Password</a>
              </center>
              <p>Or copy and paste this link into your browser:</p>
              <p style="background: #fff; padding: 10px; border: 1px solid #ddd; word-break: break-all;">
                ${resetUrl}
              </p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                This link will expire in 1 hour for security reasons.<br>
                If you didn't request this password reset, please ignore this email or contact support if you have concerns.
              </div>
            </div>
            <div class="footer">
              <p>© 2025 PodcastApp. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Reset Your Password - PodcastApp',
      html,
    });
  }

  async sendSubscriptionConfirmation(email: string, name: string, planType: 'monthly' | 'yearly'): Promise<void> {
    const planName = planType === 'monthly' ? 'Monthly' : 'Yearly';
    const price = planType === 'monthly' ? '$9.99/month' : '$99.99/year';
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .plan-box { background: white; border: 2px solid #10b981; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .features { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Subscription Activated!</h1>
            </div>
            <div class="content">
              <h2>Welcome to Premium, ${name}!</h2>
              <p>Your subscription has been successfully activated. You now have unlimited access to all premium content on PodcastApp!</p>
              
              <div class="plan-box">
                <h3>Your Subscription</h3>
                <p><strong>Plan:</strong> ${planName} Plan</p>
                <p><strong>Price:</strong> ${price}</p>
                <p><strong>Status:</strong> <span style="color: #10b981;">Active</span></p>
              </div>

              <div class="features">
                <h3>What's Included:</h3>
                <ul>
                  <li>✅ Unlimited access to all premium podcasts</li>
                  <li>✅ Ad-free listening experience</li>
                  <li>✅ High-quality audio streaming</li>
                  <li>✅ Cross-device playback sync</li>
                  <li>✅ Early access to new episodes</li>
                  <li>✅ Offline downloads (coming soon)</li>
                </ul>
              </div>

              <center>
                <a href="${this.env.APP_URL}/podcasts?premium=true" class="button">Explore Premium Podcasts</a>
              </center>

              <p>You can manage your subscription anytime from your profile page.</p>
              <center>
                <a href="${this.env.APP_URL}/profile" style="color: #667eea;">Manage Subscription</a>
              </center>
            </div>
            <div class="footer">
              <p>© 2025 PodcastApp. All rights reserved.</p>
              <p>Questions? Contact us at support@podcastapp.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '🎉 Your PodcastApp Premium Subscription is Active!',
      html,
    });
  }

  async sendSubscriptionCancellation(email: string, name: string, endDate: Date): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #6b7280; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Subscription Cancelled</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We're sorry to see you go! Your PodcastApp Premium subscription has been cancelled.</p>
              
              <div class="info-box">
                <strong>📅 Access Until:</strong><br>
                You'll continue to have access to premium content until <strong>${endDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
              </div>

              <p>After this date, you'll still have access to:</p>
              <ul>
                <li>✅ All free podcasts</li>
                <li>✅ Your account and listening history</li>
                <li>✅ Playback progress tracking</li>
              </ul>

              <p>Changed your mind? You can reactivate your subscription anytime!</p>
              <center>
                <a href="${this.env.APP_URL}/profile" class="button">Reactivate Subscription</a>
              </center>

              <p>We'd love to hear your feedback on how we can improve PodcastApp.</p>
            </div>
            <div class="footer">
              <p>© 2025 PodcastApp. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: 'Your PodcastApp Subscription Has Been Cancelled',
      html,
    });
  }

  async sendPaymentFailedEmail(email: string, name: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .alert-box { background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0; }
            .button { display: inline-block; padding: 12px 30px; background: #ef4444; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚠️ Payment Failed</h1>
            </div>
            <div class="content">
              <h2>Hi ${name},</h2>
              <p>We were unable to process your subscription payment.</p>
              
              <div class="alert-box">
                <strong>Action Required:</strong><br>
                Please update your payment method to continue enjoying premium content without interruption.
              </div>

              <p>Common reasons for payment failures:</p>
              <ul>
                <li>Insufficient funds</li>
                <li>Expired credit card</li>
                <li>Incorrect billing information</li>
                <li>Card issuer declined the transaction</li>
              </ul>

              <center>
                <a href="${this.env.APP_URL}/profile" class="button">Update Payment Method</a>
              </center>

              <p>If you continue to experience issues, please contact your bank or our support team.</p>
            </div>
            <div class="footer">
              <p>© 2025 PodcastApp. All rights reserved.</p>
              <p>Need help? Contact support@podcastapp.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await this.sendEmail({
      to: email,
      subject: '⚠️ Payment Failed - Action Required',
      html,
    });
  }

  private stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  }
}

