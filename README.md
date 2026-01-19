# WBM Automation Bot with Transport Connection Filtering

Automated apartment application bot for WBM Berlin with intelligent transport connection filtering.

## Features

✅ Automated form submission for apartment listings  
✅ **Transport connection filtering** - Skip listings based on specific keywords  
✅ Location filtering (wbs, lichtenberg, spandau)  
✅ Duplicate prevention - Tracks already submitted listings  
✅ Multiple applicant support  
✅ Slack notifications  
✅ Automatic retry with 2-minute intervals  

## Prerequisites

- Node.js (v14 or higher)
- npm
- Google Chrome browser
- Internet connection

## Installation

### Option 1: Quick Setup (Recommended)

```bash
cd packages/wbsautomation
chmod +x setup.sh
./setup.sh
```

### Option 2: Manual Setup

```bash
cd packages/wbsautomation
npm install
```

## Configuration

### Transport Connection Filter

Edit `main.js` lines 13-17 to configure filter words:

```javascript
const TRANSPORT_FILTER_WORDS = [
  "Autobahnring",
  "A100",
  "Stadtautobahn",
  "Ring",
  // Add more words to filter
];
```

**How it works:**
- The bot checks each listing's transport connection text
- If any filter word is found (case-insensitive), the listing is skipped
- Empty array = no filtering (all listings pass)

### Applicant Information

Edit the `formDatas` array in `main.js` (around line 142) to configure applicants.

## Running the Bot

```bash
node main.js
```

The bot will:
1. Check for new listings every 2 minutes
2. Filter out listings with unwanted transport connections
3. Submit applications for matching listings
4. Send Slack notifications
5. Track submitted listings to avoid duplicates

## Troubleshooting

### Issue: "Unable to obtain browser driver" on macOS

**Error message:**
```
Error: Unable to obtain browser driver.
...TypeError: Cannot read properties of null (reading 'toString')
```

**Solution 1: Verify Chrome Installation**
```bash
# Check if Chrome is installed at the expected location
ls -la "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# If not found, install from https://www.google.com/chrome/
# Update to latest version if already installed
```

**Solution 2: Clear npm cache and reinstall (RECOMMENDED FIRST)**
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Solution 3: Remove --headless temporarily**
If the error persists, test without headless mode:

Edit `main.js` line 343, comment out headless:
```javascript
// options.addArguments('--headless');  // Comment this line
```

This will open a visible Chrome window. If it works, the issue is specific to headless mode. You can re-enable it once confirmed working.

**Solution 3: Set Chrome binary path explicitly**
Add this to `createDriver()` function in `main.js` (around line 333):

```javascript
async function createDriver() {
  const options = new chrome.Options();
  options.addArguments('--headless');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  // Add this line for macOS:
  options.setChromeBinaryPath('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  
  return await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
}
```

**Solution 4: Run without headless mode (for testing)**
Remove the `'--headless'` argument temporarily to see what's happening:

```javascript
async function createDriver() {
  const options = new chrome.Options();
  // options.addArguments('--headless');  // Comment this out
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  
  return await new Builder()
    .forBrowser(Browser.CHROME)
    .setChromeOptions(options)
    .build();
}
```

### Issue: ChromeDriver version mismatch

**Error message:**
```
SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version X
Current browser version is Y
```

**Solution: Update ChromeDriver**
```bash
cd packages/wbsautomation
npm uninstall chromedriver
npm install chromedriver@latest
```

This happens when Chrome auto-updates but ChromeDriver doesn't. Reinstalling chromedriver gets the matching version.

### Issue: Module not found errors

```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: Listings not being filtered

1. Check console output for "Transport connection:" messages
2. Verify filter words are spelled correctly (case-insensitive matching)
3. Ensure `TRANSPORT_FILTER_WORDS` array is not empty
4. Check that the website structure hasn't changed

## Output Examples

**With filters active:**
```
🚀 Starting WBM Auto-Apply Bot
📁 Submitted listings file: /path/to/submitted_listings.json
⏰ Check interval: 2 minutes
🚫 Transport filter active - blocking words: Autobahnring, A100

🔍 Checking for new listings...
🔍 Checking transport connection for: https://...
📍 Transport connection: S-Bahn Berlin Hauptbahnhof in 5 Minuten
✅ Transport connection passed filter
```

**When filter blocks a listing:**
```
🔍 Checking transport connection for: https://...
📍 Transport connection: Nahe dem Autobahnring A100
🚫 Found filtered word: "A100"
⏭️  Skipping (filtered transport connection): https://...
```

## Files

- `main.js` - Main bot script with filtering logic
- `submitted_listings.json` - Tracks submitted applications
- `setup.sh` - Installation script
- `README.md` - This file

## How the Filter Works

1. Bot finds new listings on WBM website
2. For each new listing:
   - Opens listing page
   - Extracts text from `div.openimmo-detail__transport-connection p.openimmo-detail__transport-connection-text`
   - Checks if any filter word appears in the text (case-insensitive)
   - If filter word found → skip listing
   - If no filter words → proceed with application
3. Logs all decisions for transparency

## Support

For issues or questions, check the troubleshooting section above or review the error messages in the console output.
