## Windows Installation Guide - Step by Step

### Step 1: Check if Node.js is Installed

Open Command Prompt or PowerShell and type:
```bash
node --version
npm --version
```

If you see version numbers like `v18.0.0` and `9.0.0`, skip to Step 3.

### Step 2: Install Node.js (if not installed)

1. Go to https://nodejs.org/
2. Click the **LTS** version button (recommended for stability)
3. Run the installer and follow the prompts
4. Check the box "Add Node.js to PATH"
5. Click "Install"
6. Restart your computer

After restart, verify installation:
```bash
node --version
npm --version
```

### Step 3: Install pnpm

Open Command Prompt (press Win+R, type `cmd`, press Enter) and run:

```bash
npm install -g pnpm
```

Verify it worked:
```bash
pnpm --version
```

You should see a version number like `8.0.0` or higher.

### Step 4: Navigate to Your Project Folder

If your project is on Desktop:
```bash
cd Desktop\thermal-printer-cashier
```

Or if it's in a custom location (e.g., C:\Users\YourName\cashier-app):
```bash
cd C:\Users\YourName\cashier-app
```

Or simply:
- Open File Explorer
- Navigate to your project folder
- Press Shift + Right-click (in empty space)
- Select "Open PowerShell window here"

### Step 5: Install Project Dependencies

In your Command Prompt/PowerShell, run:

```bash
pnpm install
```

**Wait for it to complete.** This will:
- Download all required packages
- Create a `node_modules` folder
- Set up the development environment

You'll see green checkmarks when it's done.

### Step 6: Start the Development Server

Run this command:

```bash
pnpm dev
```

**What to expect:**
- You'll see some startup messages
- The app window will open automatically
- You might see "Waiting for Electron..."

Wait 10-15 seconds for the Electron window to appear.

### Step 7: Login with a Test PIN

When the app opens, you'll see a login screen. Enter one of these PINs:
- `1234` (Admin)
- `5678` (Cashier 1)
- `9012` (Cashier 2)

Click the PIN number buttons, then click "Login" or press Enter.

---

## Troubleshooting for Windows Users

### Issue 1: "pnpm is not recognized as an internal or external command"

**Solution:**
```bash
npm install -g pnpm
```

Then close and reopen Command Prompt. Try `pnpm --version`.

### Issue 2: "Command 'dev' not found"

**Solution - Make sure you're in the correct folder:**

Wrong:
```bash
C:\Users\YourName> pnpm dev
```

Correct:
```bash
C:\Users\YourName\thermal-printer-cashier> pnpm dev
```

Check that you're in a folder with `package.json` file:
```bash
dir
```

You should see `package.json`, `vite.config.ts`, `src` folder, etc.

### Issue 3: Port 5173 already in use

**Solution:**
This means another app is using that port. Close the other app or try:

```bash
# Stop the current dev server (Ctrl+C)
# Then run with a different port
pnpm dev:react -- --port 5174
```

### Issue 4: Electron app won't open or crashes

**Solution:**
```bash
# Close the dev server (Ctrl+C)
# Clear node_modules and reinstall
rmdir /s /q node_modules
pnpm install
pnpm dev
```

### Issue 5: "thermal-printer" or other module not found

**Solution:**
```bash
# Ensure all dependencies are installed
pnpm install
# Or do a fresh install
pnpm install --force
```

### Issue 6: SQLite database errors

**Solution:**
The database will be created automatically. If you get errors:

```bash
# The database is stored in your user profile
# Windows typically stores it at:
# C:\Users\YourName\AppData\Local\Thermal Printer Cashier

# Or you can delete it and let the app recreate it:
# Just delete the folder and restart the app
```

---

## Quick Reference - All Commands

| What you want | Command |
|---------------|---------|
| Install everything (do once) | `pnpm install` |
| Start development | `pnpm dev` |
| Stop development | Press `Ctrl+C` |
| Build for production | `pnpm build` |
| Create installer | `pnpm dist` |
| Clear everything & restart | `rmdir /s /q node_modules` then `pnpm install` then `pnpm dev` |

---

## File Structure on Your Computer

After installation, your folder will look like:
```
C:\Users\YourName\thermal-printer-cashier\
├── src\                 ← Source code
├── node_modules\        ← Dependencies (created by pnpm install)
├── dist\                ← Build output (created by pnpm build)
├── package.json         ← Dependencies list
├── vite.config.ts       ← Build config
├── tsconfig.json        ← TypeScript config
├── README.md            ← Full documentation
└── QUICKSTART.md        ← Quick start guide
```

---

## Tips for Windows Users

1. **Use PowerShell instead of Command Prompt** - It's more modern and works better
2. **Copy/paste commands carefully** - Windows is sensitive to spaces
3. **Don't use spaces in folder names** - Use hyphens instead: `thermal-printer-cashier` not `thermal printer cashier`
4. **For file paths with spaces**, use quotes: `cd "C:\Program Files\My App"`

---

## Still Having Issues?

If you get an error after following these steps:

1. **Copy the exact error message**
2. **Check QUICKSTART.md** for common solutions
3. **Check DEVELOPMENT.md** for technical details
4. **Restart your computer** - Many Node.js issues resolve after restart

---

**You're ready! Start with Step 5 and 6 above. Your cashier app will be running in seconds!**
