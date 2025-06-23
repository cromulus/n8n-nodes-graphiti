# Automated Build Process

This repository uses **GitHub Actions** to automatically build and deploy the compiled files. You no longer need to build locally!

## 🚀 How It Works

### **For Contributors:**
1. **Write your code** - Edit TypeScript files in `nodes/` and `credentials/`
2. **Commit source changes** - Only commit `.ts` files, not `dist/` files
3. **Push to master** - GitHub Actions handles the rest automatically
4. **GitHub builds** - Action runs `pnpm build` and commits `dist/` files
5. **Ready for users** - Built files available for installation immediately

### **Automated Pipeline:**
```
Source Code Push → GitHub Action → Build → Commit dist/ → Ready for Use
      ↓                ↓           ↓         ↓            ↓
   (You push)      (Auto-trigger) (pnpm)  (Auto-commit) (Users install)
```

## 🔧 Technical Details

### **Triggers:**
- **Push to master branch** - Builds and commits dist files
- **Pull Requests** - Tests and builds (no commit)

### **What Gets Built:**
- TypeScript compilation (`tsc`)
- Icon processing (`gulp build:icons`)
- All output goes to `dist/` folder

### **What Gets Committed:**
- `dist/credentials/GraphitiApi.credentials.js`
- `dist/nodes/GraphitiApi/Graphiti.node.js`
- `dist/nodes/GraphitiApi/GraphitiMemory.node.js`
- TypeScript declaration files (`.d.ts`)
- Source maps (`.js.map`)

### **Quality Checks:**
- **Linting** - ESLint runs on every build
- **Type checking** - TypeScript compilation validates types
- **Build verification** - Ensures all files compile successfully

## 📋 Developer Workflow

### **Local Development:**
```bash
# 1. Make your changes
vim nodes/GraphitiApi/Graphiti.node.ts

# 2. Test locally (optional)
pnpm run build
pnpm run lint

# 3. Commit only source files
git add nodes/ credentials/
git commit -m "feat: Add new feature"

# 4. Push to master
git push origin master

# 5. GitHub Action automatically builds and commits dist files
```

### **The `dist/` folder is:**
- ✅ **Ignored in .gitignore** (for local development)
- ✅ **Auto-generated** by GitHub Actions
- ✅ **Committed automatically** after successful builds
- ✅ **Always up-to-date** with source code

## 🔄 Migration from Manual Building

### **Before** (Manual Process):
```bash
# Old workflow
npm run build
git add dist/
git commit -m "build: Update compiled files"
git push
```

### **After** (Automated Process):
```bash
# New workflow
git add nodes/ credentials/
git commit -m "feat: Your actual changes"
git push  # GitHub builds automatically!
```

## ⚠️ Important Notes

### **Don't Commit dist/ Locally:**
The `dist/` folder is now in `.gitignore` and should only be committed by GitHub Actions.

### **[skip ci] Prevents Loops:**
The auto-commit includes `[skip ci]` to prevent triggering another build cycle.

### **Branch Protection:**
Only builds on pushes to **master branch** - feature branches are tested but not deployed.

### **Failed Builds:**
If the build fails, no dist files are committed. Check the GitHub Actions tab for error details.

## 🎯 Benefits

### **For Contributors:**
- **Cleaner commits** - Only source code in version control
- **No local build requirements** - Write code, push, done!
- **Consistent builds** - Same environment every time
- **Automatic testing** - Linting and building on every change

### **For Users:**
- **Always up-to-date** - Built files match source code exactly
- **Reliable installations** - Consistent build environment
- **Faster releases** - No manual build step delays

### **For Maintainers:**
- **Reduced PR noise** - No more dist file changes in reviews
- **Quality assurance** - Automated testing prevents broken builds
- **Release automation** - Push and it's immediately available

## 🔍 Monitoring

### **Check Build Status:**
- Visit the **Actions** tab in GitHub
- Green ✅ = Build successful, dist files updated
- Red ❌ = Build failed, no changes committed

### **View Build Logs:**
- Click on any workflow run to see detailed logs
- Debug TypeScript errors, linting issues, etc.

Your n8n node package now has **enterprise-grade CI/CD** with zero manual intervention! 🚀 
