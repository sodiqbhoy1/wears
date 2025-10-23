# 📧 Email Setup Guide - Nodemailer + Gmail

## 🎯 **You're using: Nodemailer + Gmail**

**Why this choice:**
- ✅ **Free** - No monthly costs
- ✅ **Simple** - Easy to set up
- ✅ **Reliable** - Gmail's infrastructure
- ✅ **500 emails/day** - More than enough for most businesses

## 🚀 **Setup Steps:**

### **Step 1: Install Nodemailer**
```bash
npm install nodemailer
```

### **Step 2: Set up Gmail App Password**

1. **Go to your Google Account** → [myaccount.google.com](https://myaccount.google.com)
2. **Click "Security"** in the left sidebar
3. **Enable 2-Step Verification** (if not already enabled)
4. **Click "App passwords"** (under 2-Step Verification)
5. **Select "Mail"** and your device
6. **Copy the 16-character password** generated

### **Step 3: Update Environment Variables**

Add to your `.env.local` file:
```env
EMAIL_USER=your-gmail-address@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Example:**
```env
EMAIL_USER=foodjoint.orders@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop
```

### **Step 4: Test Email Functionality**

1. **Complete the setup** above
2. **Place a test order** on your site
3. **Check the customer's email** for order confirmation
4. **Check server logs** for email sending status

## 📋 **Current Status:**

- ✅ **Email service implemented** with Nodemailer
- ✅ **Order confirmation templates** ready (HTML + text)
- ✅ **Integration complete** in checkout and webhook
- ⚠️ **Waiting for Gmail credentials** to send actual emails

## 🔧 **What Happens Now:**

### **Without Email Credentials:**
- Orders work normally
- Email function logs to console: "Email service not configured"
- No actual emails sent (but everything else works)

### **With Email Credentials:**
- Customers receive professional order confirmation emails
- Emails include tracking codes and order details
- Beautiful HTML formatting with your branding

## 📧 **Email Template Features:**

Your customers will receive emails with:
- ✅ **Professional branding** (FoodJoint colors)
- ✅ **Order confirmation** with tracking code
- ✅ **Order details** and items breakdown
- ✅ **Direct tracking link** to your website
- ✅ **Contact information** for support
- ✅ **Mobile-friendly** design

## 🛡️ **Security Best Practices:**

1. **Use App Passwords** - Never use your main Gmail password
2. **Dedicated Email** - Consider using orders@yourdomain.com
3. **Environment Variables** - Keep credentials in .env.local (never commit to git)
4. **Monitor Usage** - Gmail has daily sending limits

## 🚨 **Important Notes:**

### **Gmail Sending Limits:**
- **500 emails per day** for personal Gmail
- **2000 emails per day** for Google Workspace
- **Rate limit**: Max 100 recipients per email

### **Alternative Options:**
If you need more than 500 emails/day, consider:
- **Google Workspace** ($6/month, higher limits)
- **SendGrid** ($15/month, professional service)
- **AWS SES** (Pay per email, very cheap)

## 🧪 **Testing Checklist:**

- [ ] Install nodemailer: `npm install nodemailer`
- [ ] Set up Gmail App Password
- [ ] Add EMAIL_USER and EMAIL_PASS to .env.local
- [ ] Restart your development server
- [ ] Place a test order
- [ ] Check customer email for order confirmation
- [ ] Verify tracking link works in email

## 📞 **Need Help?**

Common issues:
- **"Invalid login"** → Check app password is correct
- **"EAUTH"** → 2-Step verification not enabled
- **"Daily sending quota exceeded"** → Wait 24 hours or upgrade to Google Workspace

## 🎉 **Ready to Go!**

Once you add your Gmail credentials, your customers will automatically receive beautiful order confirmation emails with tracking codes! 

**Your email system is fully implemented and waiting for credentials.** 📧✨