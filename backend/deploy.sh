#!/bin/bash

echo "🚀 Deploying Backend with Compiler Support..."

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "❌ Git not initialized. Please run: git init"
    exit 1
fi

# Add all files
echo "📁 Adding files to git..."
git add .

# Commit changes
echo "💾 Committing changes..."
git commit -m "Add compiler support and deployment configuration"

# Push to remote (assuming main branch)
echo "📤 Pushing to remote repository..."
git push origin main

echo "✅ Backend code pushed successfully!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to Render Dashboard"
echo "2. Find your backend service (ecap-sphn-backend)"
echo "3. Click 'Manual Deploy' → 'Deploy latest commit'"
echo "4. Wait for build to complete (this will install compilers)"
echo "5. Test: https://ecap-sphn-backend.onrender.com/api/compiler/health"
echo ""
echo "🎯 If postinstall script fails, switch to Docker deployment:"
echo "   - Set Environment to 'Docker' in Render"
echo "   - Set Dockerfile Path to 'Dockerfile'"
