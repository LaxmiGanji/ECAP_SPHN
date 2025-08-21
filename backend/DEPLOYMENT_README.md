# Backend Compiler Deployment Guide

## 🚀 **Quick Deployment Steps**

### **Option 1: Using postinstall script (Recommended)**
1. **Push code to GitHub:**
   ```bash
   git add .
   git commit -m "Add compiler support"
   git push origin main
   ```

2. **Redeploy on Render:**
   - Go to Render Dashboard
   - Find `ecap-sphn-backend` service
   - Click "Manual Deploy" → "Deploy latest commit"
   - Wait for build to complete

### **Option 2: Using Docker (If postinstall fails)**
1. **In Render Dashboard:**
   - Set **Environment** to `Docker`
   - Set **Dockerfile Path** to `Dockerfile`
   - Redeploy

## 🔧 **What Gets Installed**

The deployment will install:
- ✅ **Python 3.x** - For Python code execution
- ✅ **OpenJDK 11** - For Java compilation and execution
- ✅ **GCC** - For C code compilation and execution

## 📡 **Testing the Compiler**

After deployment, test these endpoints:

### **Health Check:**
```
GET https://ecap-sphn-backend.onrender.com/api/compiler/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Compiler service is running",
  "supportedLanguages": ["python", "java", "c"]
}
```

### **Code Execution:**
```
POST https://ecap-sphn-backend.onrender.com/api/compiler/execute
```

**Request Body:**
```json
{
  "code": "print('Hello, World!')",
  "language": "python"
}
```

## 🚨 **Troubleshooting**

### **Issue: Build fails during postinstall**
- Switch to Docker deployment
- Dockerfile will handle compiler installation

### **Issue: Compilers not found**
- Check Render build logs
- Ensure postinstall script completed successfully
- Verify environment variables are set

### **Issue: Port conflicts**
- Backend uses `process.env.PORT` (Render sets this automatically)
- Frontend should connect to `/api` endpoints

## 🔗 **Environment Variables**

Ensure these are set in Render:
```bash
MONGODB_URI=your_mongodb_connection_string
FRONTEND_API_LINK=https://ecap-sphn-frontend.onrender.com
PORT=10000
```

## ✅ **Success Indicators**

- ✅ Build completes without errors
- ✅ Health endpoint responds successfully
- ✅ Frontend shows "Backend compiler service is available"
- ✅ Students can run code in Python, Java, and C

## 🎯 **Next Steps After Deployment**

1. Test the health endpoint
2. Try running simple code in each language
3. Check frontend status indicator
4. Verify all three languages work correctly
