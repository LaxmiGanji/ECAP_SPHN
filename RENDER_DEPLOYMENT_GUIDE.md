# Render Deployment Guide for ECAP SPHN Online Compiler

## Backend Deployment Issues & Solutions

### Problem
The online compiler shows "Backend compiler service is not available" error when deployed on Render.

### Root Causes
1. **Missing Environment Variables**: Frontend can't connect to backend
2. **Compiler Installation**: Render containers need programming language compilers
3. **CORS Configuration**: Backend needs proper CORS setup for frontend domain
4. **API Endpoint Configuration**: Frontend needs correct backend URL

### Solutions Applied

#### 1. Fixed Compiler Routes
- Updated Python execution from `python` to `python3` (matches Dockerfile)
- Enhanced error handling and logging

#### 2. Improved CORS Configuration
- Made CORS origin configurable via environment variable
- Added fallback to default frontend URL

#### 3. Enhanced Health Check
- Added compiler availability testing
- Returns detailed status of each programming language compiler

#### 4. Frontend Configuration
- Created proper API URL configuration
- Added environment-based URL switching

## Deployment Steps

### Backend Deployment
1. **Push Updated Code**: Ensure all changes are committed and pushed
2. **Environment Variables**: In Render dashboard, add:
   ```
   FRONTEND_URL=https://your-frontend-url.onrender.com
   ```
3. **Build Command**: `npm install`
4. **Start Command**: `npm start`
5. **Port**: `10000`

### Frontend Deployment
1. **Push Updated Code**: Ensure all changes are committed and pushed
2. **Build Command**: `npm run build`
3. **Publish Directory**: `build`
4. **Environment Variables**: No additional variables needed (hardcoded for now)

## Testing the Fix

### 1. Test Backend Health
```bash
curl https://your-backend-url.onrender.com/api/compiler/health
```

Expected Response:
```json
{
  "success": true,
  "message": "Compiler service is running",
  "supportedLanguages": ["python", "java", "c"],
  "compilers": {
    "python": true,
    "java": true,
    "c": true
  },
  "timestamp": "2025-01-31T..."
}
```

### 2. Test Code Execution
```bash
curl -X POST https://your-backend-url.onrender.com/api/compiler/execute \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello World\")","language":"python"}'
```

### 3. Frontend Testing
- Open the online compiler page
- Check if backend status shows "available"
- Try running a simple Python code
- Verify output appears in the terminal

## Troubleshooting

### If Backend Still Shows Unavailable
1. Check Render logs for compilation errors
2. Verify Dockerfile is being used
3. Check if compilers are installed: `docker exec -it <container> bash`
4. Test compilers manually: `python3 --version`, `java --version`, `gcc --version`

### If Frontend Can't Connect
1. Verify backend URL in `frontend/src/config.js`
2. Check CORS configuration
3. Test backend endpoint directly in browser
4. Check browser console for network errors

### If Code Execution Fails
1. Check backend logs for execution errors
2. Verify timeout settings (currently 10 seconds)
3. Test with simple code first
4. Check if input/output handling works

## Performance Considerations

### Timeout Settings
- Current timeout: 10 seconds per execution
- Adjust in `compiler.route.js` if needed
- Consider user experience vs security

### Resource Limits
- Render free tier has limitations
- Monitor memory and CPU usage
- Consider upgrading for production use

### Security
- Code execution is sandboxed in temporary directories
- Files are cleaned up after execution
- Consider additional security measures for production

## Monitoring

### Backend Health
- Regular health check monitoring
- Compiler availability status
- Error rate tracking

### Frontend Status
- Backend connectivity status
- User error reports
- Performance metrics

## Future Improvements

1. **Code Sandboxing**: Implement proper code isolation
2. **Rate Limiting**: Prevent abuse
3. **Input Validation**: Enhanced security
4. **Caching**: Store common code results
5. **Multi-language Support**: Add more programming languages
6. **File Upload**: Allow code file uploads
7. **Collaboration**: Real-time code sharing

## Support

If issues persist:
1. Check Render deployment logs
2. Verify all environment variables
3. Test locally with Docker
4. Check network connectivity between services
5. Review browser console errors
