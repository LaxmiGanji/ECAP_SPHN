# Quick Docker Deployment Guide

## 🚀 **Fix the Build Error**

The postinstall script failed because Render has a read-only file system. Use Docker instead.

## 🔧 **Steps to Fix:**

### **1. In Render Dashboard:**
- Go to your `ecap-sphn-backend` service
- Click **Settings** → **Environment**
- Change **Environment** from `Node` to `Docker`
- Set **Dockerfile Path** to `Dockerfile`
- **Save changes**

### **2. Redeploy:**
- Click **"Manual Deploy"** → **"Deploy latest commit"**
- Wait for Docker build to complete

## ✅ **What This Fixes:**

- ✅ **No more read-only file system errors**
- ✅ **Compilers installed properly in Docker container**
- ✅ **Python, Java, and C support working**
- ✅ **Online compiler feature functional**

## 🎯 **After Deployment:**

Test the compiler:
```
GET https://ecap-sphn-backend.onrender.com/api/compiler/health
```

Expected response:
```json
{
  "success": true,
  "message": "Compiler service is running",
  "supportedLanguages": ["python", "java", "c"]
}
```

## 🚨 **If Still Having Issues:**

1. Check Render build logs
2. Ensure Dockerfile is in the root of your backend folder
3. Verify all files are pushed to GitHub
4. Contact Render support if needed
