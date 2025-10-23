# 🚀 Production Deployment Checklist

## ✅ COMPLETED SECURITY FIXES:
- [x] Protected `/api/menu` endpoints with JWT authentication
- [x] Protected `/api/upload` endpoint with JWT authentication  
- [x] Updated strong JWT secret key
- [x] Added auth headers to admin frontend requests
- [x] Created JWT verification middleware

## ⚠️ REMAINING ISSUES TO FIX:

### 1. Replace `<img>` with Next.js `<Image>` (Performance Issue)
**File**: `src/app/admin/menu/page.js` line 160
**Issue**: Using `<img>` instead of optimized `next/image`
**Fix**: Replace with `<Image>` component

### 2. Console Logs in Production
**Files**: Multiple files have console.log statements
**Issue**: Logs exposed in production
**Action**: Remove/replace with proper logging

### 3. Environment Variables for Production
**Current**: Using test Paystack keys
**Needed**: 
- Production Paystack keys (`pk_live_...`, `sk_live_...`)
- Strong production JWT secret
- Production MongoDB URI

## 🔧 PRODUCTION SETUP STEPS:

### Step 1: Environment Variables
Create `.env.local` for production with:
```env
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-super-strong-production-secret-min-32-chars
NEXT_PUBLIC_PAYSTACK_KEY=pk_live_your-live-public-key
PAYSTACK_SECRET_KEY=sk_live_your-live-secret-key
```

### Step 2: Paystack Production Setup
1. Switch to Paystack Live mode
2. Get Live API keys
3. Configure webhook URL: `https://yourdomain.com/api/paystack-webhook`
4. Test live payments with small amounts

### Step 3: Database Setup
1. Ensure production MongoDB is configured
2. Create database indexes for performance
3. Set up database backups

### Step 4: Deploy & Test
1. Deploy to Vercel/Netlify/your hosting provider
2. Test all functionality:
   - [ ] User registration/login
   - [ ] Menu browsing
   - [ ] Cart functionality  
   - [ ] Payment processing
   - [ ] Order creation
   - [ ] Admin dashboard
   - [ ] Menu management
   - [ ] Order management

## 🛡️ SECURITY CHECKLIST:
- [x] Admin APIs protected with JWT
- [x] Strong JWT secret
- [x] Webhook signature verification (optional)
- [x] Input validation on APIs
- [x] Duplicate order prevention
- [ ] Rate limiting (recommended)
- [ ] HTTPS only (hosting provider)
- [ ] CORS configuration (if needed)

## 📊 PERFORMANCE CHECKLIST:
- [ ] Replace `<img>` with `<Image>`
- [ ] Remove console.logs
- [ ] Database indexes
- [ ] Image optimization
- [ ] Caching strategies
- [ ] Bundle size optimization

## 🧪 TESTING CHECKLIST:
- [ ] Unit tests for APIs
- [ ] Integration tests for payment flow
- [ ] Manual testing of all features
- [ ] Load testing for high traffic
- [ ] Mobile responsiveness testing

## 🚨 CURRENT STATUS: 
**MOSTLY READY** - Core security issues fixed, but needs minor cleanup before production deployment.

## 🎯 NEXT STEPS:
1. Fix the `<img>` → `<Image>` issue
2. Clean up console.logs  
3. Set up production environment variables
4. Deploy and test thoroughly