# 🚀 Vercel Integration Guide

## Overview

This guide will help you deploy your Next.js merchant loyalty application to Vercel, the platform created by the Next.js team that provides excellent hosting, CI/CD, and performance optimization.

## 🎯 **Why Vercel?**

- **Zero Configuration**: Automatically detects Next.js and optimizes settings
- **Global Edge Network**: Deploy to 35+ regions worldwide
- **Automatic HTTPS**: SSL certificates included
- **Preview Deployments**: Automatic previews for every PR
- **Analytics**: Built-in performance monitoring
- **Environment Variables**: Secure management of secrets
- **Custom Domains**: Easy domain configuration

## 📋 **Prerequisites**

- ✅ Next.js project (already done)
- ✅ GitHub repository (already done)
- ✅ Supabase project with environment variables
- ✅ Vercel account (free tier available)

## 🔧 **Setup Methods**

### **Method 1: GitHub Integration (Recommended)**

1. **Go to [vercel.com](https://vercel.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New Project"**
4. **Import your repository** (`derestine/mono`)
5. **Configure project settings**:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `.next` (auto-detected)
   - Install Command: `npm install` (auto-detected)

### **Method 2: Vercel CLI (Local Development)**

```bash
# Login to Vercel
npx vercel login

# Deploy from local directory
npx vercel

# Deploy to production
npx vercel --prod
```

### **Method 3: Drag & Drop (Simple)**

1. **Build your project locally**:
   ```bash
   npm run build
   ```
2. **Go to [vercel.com/new](https://vercel.com/new)**
3. **Drag your project folder** to the deployment area
4. **Vercel will automatically deploy** your Next.js app

## ⚙️ **Environment Variables Setup**

### **1. In Vercel Dashboard**

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### **2. Using Vercel CLI**

```bash
# Set environment variables
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY

# Pull environment variables to local .env.local
npx vercel env pull .env.local
```

### **3. Environment File Template**

Create `.env.local` (already exists):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 🚀 **Deployment Process**

### **Automatic Deployment (GitHub Integration)**

1. **Push to GitHub** (already done)
2. **Vercel automatically detects changes**
3. **Builds and deploys** to production
4. **Creates preview deployments** for PRs

### **Manual Deployment (CLI)**

```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod

# Deploy specific branch
npx vercel --prod --git-branch=main
```

## 🔍 **Configuration Files**

### **vercel.json** (Already Created)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["iad1"],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  },
  "functions": {
    "src/app/**/*.tsx": {
      "maxDuration": 30
    }
  }
}
```

### **next.config.ts** (Already Optimized)

Your Next.js config is already optimized for Vercel deployment.

## 🌐 **Custom Domain Setup**

### **1. Add Domain in Vercel**

1. Go to project settings → Domains
2. Add your custom domain
3. Vercel provides DNS records to configure

### **2. Configure DNS**

Add these records to your domain provider:
```
Type: A
Name: @
Value: 76.76.19.19

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### **3. SSL Certificate**

Vercel automatically provisions SSL certificates for custom domains.

## 📊 **Performance Optimization**

### **Built-in Optimizations**

- ✅ **Automatic Image Optimization**
- ✅ **Code Splitting**
- ✅ **Static Generation**
- ✅ **Edge Functions** (if needed)
- ✅ **CDN Distribution**

### **Additional Optimizations**

1. **Enable Analytics**:
   ```bash
   npx vercel analytics
   ```

2. **Performance Monitoring**:
   - Core Web Vitals tracking
   - Real User Monitoring (RUM)
   - Error tracking

## 🔄 **CI/CD Pipeline**

### **Automatic Deployments**

- **Main Branch**: Production deployment
- **Feature Branches**: Preview deployments
- **Pull Requests**: Automatic preview URLs

### **Deployment Hooks**

```bash
# Webhook URL for external CI/CD
https://api.vercel.com/v1/hooks/deploy/your-hook-id
```

## 🧪 **Testing Before Deployment**

### **1. Local Build Test**

```bash
npm run build
npm run start
```

### **2. Environment Variable Test**

```bash
# Check if environment variables are loaded
npm run dev
# Visit http://localhost:3000/test-supabase
```

### **3. Production Build Test**

```bash
# Test production build locally
npm run build
npm run start
```

## 🚨 **Common Issues & Solutions**

### **Build Failures**

1. **Check build logs** in Vercel dashboard
2. **Verify environment variables** are set
3. **Check Node.js version** compatibility
4. **Review dependency conflicts**

### **Environment Variable Issues**

1. **Ensure variables are public** (NEXT_PUBLIC_*)
2. **Check variable names** match exactly
3. **Redeploy after adding variables**

### **Performance Issues**

1. **Enable Vercel Analytics**
2. **Check Core Web Vitals**
3. **Optimize images and assets**
4. **Review bundle size**

## 📱 **Mobile & PWA Support**

### **PWA Configuration**

Your app already includes:
- ✅ Responsive design
- ✅ Touch-friendly interfaces
- ✅ Fast loading times
- ✅ Offline capabilities (if implemented)

### **Mobile Optimization**

- **Viewport meta tags** (already configured)
- **Touch targets** (already optimized)
- **Performance** (Vercel edge optimization)

## 🔒 **Security Features**

### **Built-in Security**

- ✅ **HTTPS by default**
- ✅ **Security headers**
- ✅ **DDoS protection**
- ✅ **Bot protection**

### **Additional Security**

1. **Content Security Policy** (CSP)
2. **Rate limiting**
3. **IP allowlisting** (if needed)

## 📈 **Monitoring & Analytics**

### **Vercel Analytics**

```bash
# Enable analytics
npx vercel analytics

# View metrics in dashboard
# - Page views
# - Performance metrics
# - Error rates
# - User behavior
```

### **Performance Monitoring**

- **Core Web Vitals**
- **Lighthouse scores**
- **Real User Metrics**
- **Error tracking**

## 🎉 **Deployment Checklist**

### **Pre-Deployment**

- [ ] **Environment variables** configured
- [ ] **Build passes** locally (`npm run build`)
- [ ] **All tests pass** (if applicable)
- [ ] **Database schema** applied to Supabase
- [ ] **API endpoints** tested

### **Post-Deployment**

- [ ] **Homepage loads** correctly
- [ ] **Authentication works** (signup/signin)
- [ ] **Database connections** successful
- [ ] **All pages accessible**
- [ ] **Performance metrics** acceptable
- [ ] **Error monitoring** enabled

## 🚀 **Quick Start Commands**

```bash
# 1. Install Vercel CLI locally
npm install --save-dev vercel

# 2. Login to Vercel
npx vercel login

# 3. Deploy to preview
npx vercel

# 4. Deploy to production
npx vercel --prod

# 5. View deployment status
npx vercel ls

# 6. Open project dashboard
npx vercel open
```

## 📞 **Support & Resources**

### **Vercel Documentation**
- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/functions/serverless-functions/runtimes/nodejs)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

### **Community**
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Next.js Discord](https://discord.gg/nextjs)

---

**Ready to deploy?** 🚀

Your Next.js app is already optimized for Vercel. Just connect your GitHub repository and you'll have automatic deployments with every push!
