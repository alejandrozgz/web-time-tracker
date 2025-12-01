# Screenshot Guide for User Manual

This document details exactly what screenshots you need to take and where to insert them in the Word document.

## How to Convert Markdown to Word

### Option 1: Using Pandoc (Recommended)
```bash
pandoc USER_GUIDE.md -o USER_GUIDE.docx
```

### Option 2: Using Microsoft Word
1. Open Word
2. Go to File → Open
3. Select `USER_GUIDE.md`
4. Word will import it with basic formatting
5. Save as .docx

### Option 3: Using Online Converter
- Go to https://www.markdowntoword.com/
- Upload USER_GUIDE.md
- Download the .docx file

## Screenshots Required (33 Total)

---

### **SCREENSHOT 1: Login Page**
**Location:** Section 2.1 - Accessing the Application
**What to capture:**
- Full browser window showing the login page
- URL visible in address bar (https://your-domain.com/tenant)
- Empty login form showing:
  - Company dropdown (closed)
  - Username field (empty)
  - Password field (empty)
  - "Sign In" button
  - Company logo/branding at top

**How to take it:**
1. Navigate to login page
2. Make sure you're logged out
3. Press F12 to open DevTools (optional: to show it's a web app)
4. Press F11 or zoom out to show full interface
5. Screenshot (Windows: Win + Shift + S, Mac: Cmd + Shift + 4)

**Insert after:** The paragraph "Navigate to the Time Tracker URL..."

---

### **SCREENSHOT 2: Completed Login Form**
**Location:** Section 2.2 - Logging In
**What to capture:**
- Same login page but with fields filled:
  - Company: "CRONUS USA, Inc." (or your company name)
  - Username: "DEMO001" or sample username (visible)
  - Password: "******" (masked)
  - Cursor hovering over "Sign In" button

**How to take it:**
1. Fill out the login form (but don't submit)
2. Hover mouse over Sign In button
3. Take screenshot

**Insert after:** Step 4 "Click the 'Sign In' button"

---

### **SCREENSHOT 3: Empty Dashboard**
**Location:** Section 2.3 - First Time Login
**What to capture:**
- Full dashboard view after login
- Timer showing 00:00:00
- Empty form fields
- "All synced" or "0 pending" in sync button
- Recent Entries section showing "No entries yet" or empty table
- User name visible in header

**How to take it:**
1. Login with a new user account OR
2. Use browser DevTools to hide existing entries temporarily
3. Capture full screen

**Insert after:** "All form fields will be empty and ready for your first entry"

---

### **SCREENSHOT 4: Full Dashboard with Annotations**
**Location:** Section 3.1 - Dashboard Layout
**What to capture:**
- Complete dashboard showing all sections
- Add colored boxes/arrows with labels:
  - "A: Header Section" → pointing to top bar
  - "B: Timer Section" → pointing to timer
  - "C: Entry Form" → pointing to form fields
  - "D: Sync Section" → pointing to sync button
  - "E: Recent Entries" → pointing to table below

**How to take it:**
1. Take screenshot of full dashboard with data
2. Use annotation tool (Windows: Snipping Tool, Mac: Preview, or Photoshop)
3. Add colored boxes and labels

**Insert after:** "The dashboard is divided into several key sections:"

---

### **SCREENSHOT 5: Timer Running**
**Location:** Section 4.1 - Using the Timer
**What to capture:**
- Close-up of timer section
- Timer showing time elapsed (e.g., 00:15:32)
- Timer display in GREEN color
- "Stop" button visible (not "Start")
- Reset button visible

**How to take it:**
1. Start the timer
2. Wait a few seconds
3. Zoom in or crop to show just the timer area
4. Take screenshot

**Insert after:** Step 3 "The button will change to ⏸️ 'Stop'"

---

### **SCREENSHOT 6: Timer Stopped with Hours**
**Location:** Section 4.1 - Using the Timer (Stopping)
**What to capture:**
- Timer showing stopped state (gray, not green)
- Timer displaying time like 02:30:15
- Hours field in form below showing "2.5" (automatically filled)
- "Start" button visible again

**How to take it:**
1. Stop the timer after running it
2. Show that hours field was auto-filled
3. Capture timer and hours field together

**Insert after:** Step 3 "The elapsed time will automatically fill the 'Hours' field"

---

### **SCREENSHOT 7: Manual Entry Form Filled**
**Location:** Section 4.2 - Manual Entry
**What to capture:**
- Entry form with all fields completed:
  - Job: "PROJECT-001 - Customer Portal"
  - Task: "TASK-100 - Development"
  - Date: "12/01/2024"
  - Hours: "3.5"
  - Description: "Developed customer invoice API endpoint"
  - Start Time: "09:00"
  - End Time: "12:30"
- "Save Entry" button enabled and highlighted

**How to take it:**
1. Fill out form completely manually (no timer)
2. Don't submit yet
3. Capture the form area

**Insert after:** Step 7 "Click 'Save Entry' button"

---

### **SCREENSHOT 8: Form Validation Errors**
**Location:** Section 4.3 - Field Validation
**What to capture:**
- Form with validation errors showing:
  - Job field: "Job is required" (in red below dropdown)
  - Hours field: "Hours must be greater than 0" (in red)
  - Description field: "Description is required" (in red)
- "Save Entry" button DISABLED (grayed out)

**How to take it:**
1. Clear the form
2. Try to submit (errors will appear)
3. Capture form with red error messages

**Insert after:** "The system validates your entries to ensure accuracy:"

---

### **SCREENSHOT 9: Success Message**
**Location:** Section 4.4 - Successful Entry
**What to capture:**
- Green toast notification at top of screen
- Message text: "Time entry saved successfully" or similar
- Background slightly dimmed
- Entry visible in Recent Entries table below

**How to take it:**
1. Save a time entry
2. Quickly capture the success toast (it may disappear after 3-5 seconds)
3. Or use browser DevTools to freeze the toast

**Insert after:** "After saving:"

---

### **SCREENSHOT 10: Recent Entries Table**
**Location:** Section 5.1 - Viewing Recent Entries
**What to capture:**
- Recent Entries table with 5-7 entries
- Show variety of statuses:
  - At least 2 with "Synced" (green)
  - At least 2 with "Not Synced" (orange)
  - At least 1 with "Error" (red) if possible
- Columns visible: Date, Job, Task, Hours, Description, Status, Actions
- Edit and Delete buttons visible on each row

**How to take it:**
1. Create several test entries with different statuses
2. Scroll to Recent Entries section
3. Capture the table

**Insert after:** "The Recent Entries section shows your last entries..."

---

### **SCREENSHOT 11: Edit Button Hover**
**Location:** Section 5.2 - Editing a Time Entry
**What to capture:**
- Mouse cursor hovering over Edit (pencil) icon
- That specific row slightly highlighted
- Tooltip showing "Edit" if present

**How to take it:**
1. Hover mouse over edit icon
2. Take screenshot quickly
3. Make sure cursor is visible

**Insert after:** "Locate the entry in the Recent Entries table"

---

### **SCREENSHOT 12: Form with Entry Being Edited**
**Location:** Section 5.2 - Editing (continued)
**What to capture:**
- Entry form populated with data from an entry
- Button text changed to "Update Entry" (not "Save Entry")
- All fields filled with existing entry data
- Entry in table below still visible

**How to take it:**
1. Click Edit on an entry
2. Don't make changes yet
3. Capture form showing populated fields and "Update Entry" button

**Insert after:** "The entry data will populate the form above"

---

### **SCREENSHOT 13: Delete Confirmation**
**Location:** Section 5.3 - Deleting a Time Entry
**What to capture:**
- Browser's native confirmation dialog
- Message: "Are you sure you want to delete this time entry?"
- "OK" and "Cancel" buttons
- Background slightly dimmed

**How to take it:**
1. Click Delete button on an entry
2. Quickly capture the confirmation dialog
3. Don't click OK or Cancel yet

**Insert after:** "A confirmation dialog appears"

---

### **SCREENSHOT 14: Deletion Success Message**
**Location:** Section 5.3 - Deleting (continued)
**What to capture:**
- Green toast notification
- Message: "Time entry deleted successfully"
- Entry removed from Recent Entries table

**How to take it:**
1. Delete an entry
2. Capture the success toast
3. Show that entry is gone from table

**Insert after:** "After deletion:"

---

### **SCREENSHOT 15: Sync Button with Pending**
**Location:** Section 6.3 - How to Sync
**What to capture:**
- Sync button showing:
  - Orange badge with number (e.g., "2 Pending")
  - Text below: "5.5 hours pending" or similar
  - Button enabled and ready to click

**How to take it:**
1. Have 2-3 unsync entries
2. Capture just the sync button area on the right
3. Make sure badge and hours are visible

**Insert after:** Step 1 "Look at the Sync button on the right side"

---

### **SCREENSHOT 16: Syncing in Progress**
**Location:** Section 6.3 - Click Sync Button
**What to capture:**
- Sync button during sync:
  - Loading spinner icon rotating
  - Text: "Syncing..."
  - Button disabled (grayed out)

**How to take it:**
1. Click sync button
2. Quickly capture while syncing (it's fast!)
3. Or use browser DevTools to freeze the state

**Insert after:** Step 2 "The button will show a loading spinner"

---

### **SCREENSHOT 17: Sync Success Notification**
**Location:** Section 6.3 - Wait for Completion
**What to capture:**
- Green success toast
- Message: "Successfully synced 2 entries to Business Central" or similar
- Include batch name if shown

**How to take it:**
1. Complete a sync
2. Capture success message

**Insert after:** "The sync process typically takes 2-10 seconds:"

---

### **SCREENSHOT 18: Entries After Sync**
**Location:** Section 6.3 - Verify Success
**What to capture:**
- Recent Entries table
- All entries now showing green "Synced" badges
- No Edit/Delete buttons on synced entries
- Sync button showing "All synced" or "0 pending"

**How to take it:**
1. After successful sync
2. Capture table showing synced entries

**Insert after:** "After syncing:"

---

### **SCREENSHOT 19: Sync Error Notification**
**Location:** Section 6.4 - Sync Errors
**What to capture:**
- Red error toast
- Message showing: "Sync failed: 1 entry failed, 1 succeeded" or similar
- Details if available

**How to take it:**
1. Trigger a sync error (remove batch name from entry if possible)
2. Capture error toast

**Insert after:** "If sync fails for some entries:"

---

### **SCREENSHOT 20: Entry with Error Status**
**Location:** Section 6.4 - Sync Errors (continued)
**What to capture:**
- Entry row with red "Error" badge
- Error message/details if visible
- Edit and Delete buttons still available

**How to take it:**
1. After sync error
2. Capture the failed entry in table

**Insert after:** "Failed entries show red 'Error' status"

---

### **SCREENSHOT 21: Business Central Job Journal**
**Location:** Section 6.5 - Verifying in BC
**What to capture:**
- Microsoft Dynamics 365 Business Central interface
- Job Journal page open
- Time entries from Time Tracker visible
- Batch name dropdown showing user's batch
- Draft/unposted journal lines

**How to take it:**
1. Login to Business Central
2. Navigate to Job Journal
3. Show synced entries from Time Tracker
4. Capture the BC interface

**Insert after:** "To verify entries in Business Central:"

---

### **SCREENSHOT 22: Status Badges Legend**
**Location:** Section 7.1 - Status Types
**What to capture:**
- Three status badges side by side:
  - 🟠 "Not Synced" (orange)
  - 🟢 "Synced" (green)
  - 🔴 "Error" (red)
- Can be screenshot from actual app or created graphic

**How to take it:**
1. Use image editor to create clean legend OR
2. Screenshot from app showing all three badges
3. Arrange side by side for clarity

**Insert after:** "Time Tracker uses three sync statuses:"

---

### **SCREENSHOT 23: Not Synced Entry**
**Location:** Section 7.1 - Not Synced Status
**What to capture:**
- Single entry row with orange "Not Synced" badge
- Edit and Delete buttons visible

**Insert after:** "🟠 Not Synced (Orange)"

---

### **SCREENSHOT 24: Synced Entry**
**Location:** Section 7.1 - Synced Status
**What to capture:**
- Single entry row with green "Synced" badge
- No Edit/Delete buttons (read-only)

**Insert after:** "🟢 Synced (Green)"

---

### **SCREENSHOT 25: Error Entry**
**Location:** Section 7.1 - Error Status
**What to capture:**
- Single entry row with red "Error" badge
- Error details if available
- Edit and Delete buttons available

**Insert after:** "🔴 Error (Red)"

---

### **SCREENSHOT 26: Status Flow Diagram**
**Location:** Section 7.2 - Status Lifecycle
**What to capture:**
- The ASCII diagram is already in the markdown
- You can create a clean graphic version using:
  - PowerPoint or Draw.io
  - Flowchart showing: Created → Not Synced → Synced (with Error branch)

**How to create it:**
1. Use PowerPoint SmartArt or draw.io
2. Create boxes connected by arrows
3. Export as PNG

**Insert after:** "Status Lifecycle" heading

---

### **SCREENSHOT 27: Mixed Status Table**
**Location:** Section 7.3 - Bulk Status View
**What to capture:**
- Recent Entries table with variety:
  - 3-4 synced (green)
  - 2-3 pending (orange)
  - 1 error (red)
- Demonstrate real-world scenario

**Insert after:** "You can see all statuses at a glance:"

---

### **SCREENSHOT 28: Login Error**
**Location:** Section 8.1 - Login Issues
**What to capture:**
- Login page with red error message
- Message: "Invalid credentials" or similar
- Form fields still visible

**How to take it:**
1. Enter wrong password
2. Submit login
3. Capture error message

**Insert after:** "Problem: 'Invalid credentials' error"

---

### **SCREENSHOT 29: Overlap Error**
**Location:** Section 8.2 - Time Entry Issues
**What to capture:**
- Error toast message
- Text: "Cannot create entry: time entries overlap with existing entry"
- Form still visible in background

**Insert after:** "Problem: 'Time entries overlap' error"

---

### **SCREENSHOT 30: Empty Job Dropdown**
**Location:** Section 8.2 - Job Not Found
**What to capture:**
- Job dropdown opened
- Showing "No jobs available" or empty list
- Form otherwise visible

**How to take it:**
1. Open job dropdown
2. If you have jobs, edit HTML temporarily with DevTools to show empty state
3. Or create test user with no jobs

**Insert after:** "Problem: Can't find my job/task in dropdown"

---

### **SCREENSHOT 31: Disabled Save Button**
**Location:** Section 8.2 - Disabled Button
**What to capture:**
- "Save Entry" button grayed out/disabled
- Form with missing required fields
- Mouse cursor hovering over disabled button (cursor changes to "not-allowed")

**Insert after:** "Problem: 'Save Entry' button is disabled"

---

### **SCREENSHOT 32: Batch Name Error**
**Location:** Section 8.3 - Sync Issues
**What to capture:**
- Error toast or message
- Text: "Entry has no batch name configured" or similar

**Insert after:** "Problem: 'No batch name configured' error"

---

### **SCREENSHOT 33: Loading Entries**
**Location:** Section 8.4 - Display Issues
**What to capture:**
- Recent Entries section showing loading spinner
- Or skeleton/placeholder loading state
- "Loading..." text if present

**Insert after:** "Problem: Recent entries don't load"

---

## Tips for Taking Screenshots

### General Guidelines:
1. **Resolution**: Take screenshots at 1920x1080 or higher
2. **Format**: Save as PNG (not JPG) for better quality
3. **File Naming**: Use descriptive names like `01-login-page.png`, `02-filled-login.png`
4. **Consistency**: Use same browser and zoom level (100%) for all screenshots
5. **Privacy**: Blur or replace any sensitive data (real company names, emails)

### Tools Recommended:
- **Windows**: Snipping Tool, Snip & Sketch (Win + Shift + S)
- **Mac**: Screenshot (Cmd + Shift + 4)
- **Browser Extension**: Awesome Screenshot, Fireshot
- **Annotation**: Greenshot, Snagit, Paint.NET, Photoshop

### Editing Screenshots:
1. Crop to remove browser chrome if needed
2. Add arrows/boxes for annotations (Screenshot 4)
3. Blur sensitive information
4. Resize if too large (max width: 1200px for Word)
5. Compress to reduce file size

---

## Inserting into Word

### Method 1: Manual Insertion
1. Open the converted Word document
2. Find the text `[IMAGE PLACEHOLDER X: ...]`
3. Delete that line
4. Go to Insert → Pictures → This Device
5. Select your screenshot
6. Right-click image → Wrap Text → "Top and Bottom"
7. Resize if needed (drag corners while holding Shift)
8. Add caption below: Right-click → Insert Caption

### Method 2: Using Find & Replace
1. Save all screenshots as `screenshot-01.png`, `screenshot-02.png`, etc.
2. In Word, use Insert → Pictures → Multiple Pictures (if available)
3. Or use a macro to batch insert

### Method 3: Keep Placeholders for Now
- Leave the placeholders in the document
- Share with screenshot taker
- They can insert images where indicated

---

## Final Checklist

Before delivering the manual:
- [ ] All 33 screenshots taken
- [ ] All screenshots inserted in correct locations
- [ ] All screenshots have proper captions
- [ ] File size reasonable (<20MB for email)
- [ ] Table of Contents updated (Word: References → Update Table)
- [ ] Headers and footers formatted
- [ ] Page numbers added
- [ ] Spell check completed
- [ ] Document saved as .docx

---

## Alternative: ChatGPT Prompt

If you want ChatGPT to help with this instead, here's the prompt to use:

```
I need you to create a comprehensive User Guide in Microsoft Word format for a Time Tracker web application that syncs with Microsoft Dynamics 365 Business Central. The guide should be professional, detailed, and suitable for end users (not administrators).

Please include:

1. Table of Contents with hyperlinks
2. These main sections:
   - Introduction (what is it, key features, system requirements)
   - Getting Started (accessing the app, logging in, first time setup)
   - Dashboard Overview (detailed layout explanation)
   - Recording Time Entries (using timer and manual entry)
   - Managing Time Entries (viewing, editing, deleting)
   - Syncing to Business Central (when, how, verification)
   - Understanding Sync Statuses (not synced, synced, error)
   - Troubleshooting (common issues and solutions)
   - FAQ (20+ questions organized by category)
   - Support & Contact information

3. Format requirements:
   - Professional business document style
   - Use tables for comparative information
   - Include step-by-step instructions with numbered lists
   - Add "Important Notes" boxes with warnings
   - Include placeholders for 30+ screenshots with descriptions
   - Use consistent heading styles (Heading 1, 2, 3)
   - Add page numbers and headers/footers

4. Tone: Clear, professional, user-friendly (non-technical language)

5. Length: Approximately 30-40 pages

6. Include example scenarios and best practices throughout

Please generate this as a downloadable Word document or provide the content in a format I can copy into Word with proper formatting.
```

**Note:** ChatGPT might not be able to generate a Word document directly, but it will give you well-structured content you can paste into Word. However, I believe the markdown file I created is more detailed and better organized!

---

Good luck with your User Manual! 🎉
