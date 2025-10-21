# SMTP Email Integration

## Overview

The PodcastApp uses Nodemailer with Mailtrap for sending transactional emails to users.

## Configuration

The SMTP settings are configured in `wrangler.jsonc`:

```json
"vars": {
  "SMTP_HOST": "sandbox.smtp.mailtrap.io",
  "SMTP_PORT": "2525",
  "SMTP_USER": "491e0716963d47",
  "SMTP_PASS": "228aaf237dbe46",
  "SMTP_FROM_EMAIL": "noreply@podcastapp.com",
  "SMTP_FROM_NAME": "PodcastApp",
  "APP_URL": "http://localhost:3000"
}
```

## Supported Emails

### 1. Welcome Email
**Trigger:** When a user registers
**Content:**
- Welcome message
- Feature highlights
- Links to browse podcasts and subscription plans

### 2. Password Reset Email
**Trigger:** When user requests password reset
**Content:**
- Reset link with token (expires in 1 hour)
- Security warning
- Instructions

### 3. Subscription Confirmation
**Trigger:** When subscription becomes active
**Content:**
- Plan details (Monthly/Yearly)
- Features included
- Link to premium podcasts
- Manage subscription link

### 4. Subscription Cancellation
**Trigger:** When subscription is cancelled
**Content:**
- Access end date
- What remains accessible
- Reactivation link
- Feedback request

### 5. Payment Failed
**Trigger:** When subscription payment fails
**Content:**
- Alert about failed payment
- Common reasons for failure
- Update payment method link
- Support information

## Email Templates

All emails use responsive HTML templates with:
- Professional styling
- Mobile-friendly design
- Clear call-to-action buttons
- Consistent branding

Templates are located in `lib/email.ts` in the `EmailHelper` class.

## Production Setup

### Using Mailtrap (Current - Testing)

Mailtrap is configured for development/testing. Emails are caught and don't reach real users.

**Access:** https://mailtrap.io/inboxes

### Switching to Production SMTP

For production, replace with a real email service:

#### Option 1: SendGrid

```bash
wrangler secret put SMTP_HOST
# smtp.sendgrid.net

wrangler secret put SMTP_PORT
# 587

wrangler secret put SMTP_USER
# apikey

wrangler secret put SMTP_PASS
# <your-sendgrid-api-key>
```

#### Option 2: AWS SES

```bash
wrangler secret put SMTP_HOST
# email-smtp.us-east-1.amazonaws.com

wrangler secret put SMTP_PORT
# 587

wrangler secret put SMTP_USER
# <your-ses-smtp-username>

wrangler secret put SMTP_PASS
# <your-ses-smtp-password>
```

#### Option 3: Mailgun

```bash
wrangler secret put SMTP_HOST
# smtp.mailgun.org

wrangler secret put SMTP_PORT
# 587

wrangler secret put SMTP_USER
# <your-mailgun-smtp-username>

wrangler secret put SMTP_PASS
# <your-mailgun-smtp-password>
```

### Update Environment Variables

For production, also update:

```bash
wrangler secret put SMTP_FROM_EMAIL
# support@yourdomain.com

wrangler secret put APP_URL
# https://yourdomain.com
```

## Testing Emails Locally

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Register a new user - check Mailtrap inbox for welcome email

3. Request password reset - check for reset email

4. Subscribe (use Stripe test mode) - check for confirmation email

## Email Helper Usage

```typescript
import { EmailHelper } from '@/lib/email';

const emailHelper = new EmailHelper();

// Send welcome email
await emailHelper.sendWelcomeEmail('user@example.com', 'John Doe');

// Send password reset
await emailHelper.sendPasswordResetEmail('user@example.com', 'John Doe', 'reset-token');

// Send subscription confirmation
await emailHelper.sendSubscriptionConfirmation('user@example.com', 'John Doe', 'monthly');

// Send cancellation notice
await emailHelper.sendSubscriptionCancellation('user@example.com', 'John Doe', new Date());

// Send payment failed alert
await emailHelper.sendPaymentFailedEmail('user@example.com', 'John Doe');
```

## Email Flow

### Registration Flow
```
User Signs Up → Create Account → Send Welcome Email → User Receives Email
```

### Password Reset Flow
```
User Requests Reset → Generate Token → Send Reset Email → User Clicks Link → Reset Page → New Password Set
```

### Subscription Flow
```
User Subscribes → Stripe Processes → Webhook Received → Update DB → Send Confirmation Email
```

### Cancellation Flow
```
User Cancels → Stripe Webhook → Update DB → Send Cancellation Email (with access end date)
```

### Payment Failed Flow
```
Payment Fails → Stripe Webhook → Update Status to "past_due" → Send Alert Email
```

## Security Considerations

1. **Email Enumeration Prevention**: Password reset always returns success message
2. **Token Expiration**: Reset tokens expire after 1 hour
3. **One-time Use**: Reset tokens can only be used once
4. **SMTP Credentials**: Store in Wrangler secrets, not in code
5. **Unsubscribe**: Consider adding unsubscribe links for marketing emails

## Troubleshooting

### Emails Not Sending

1. Check SMTP credentials in `wrangler.jsonc`
2. Verify Mailtrap inbox at https://mailtrap.io
3. Check server logs for email errors
4. Confirm nodemailer is installed: `npm list nodemailer`

### Wrong Email Content

1. Check `APP_URL` environment variable
2. Verify `SMTP_FROM_EMAIL` and `SMTP_FROM_NAME`
3. Review email templates in `lib/email.ts`

### Production Issues

1. Verify DNS records (SPF, DKIM) for production email domain
2. Check email service quotas and limits
3. Monitor bounce and complaint rates
4. Implement retry logic for failed sends

## Monitoring

Consider adding:
- Email delivery tracking
- Open rate tracking
- Click rate tracking
- Bounce handling
- Complaint handling

## Future Enhancements

Potential improvements:
- Email templates in separate files
- Multi-language support
- Email queuing for high volume
- Bulk email sending for newsletters
- Email analytics dashboard
- A/B testing for email content
- Rich text editor for admins

