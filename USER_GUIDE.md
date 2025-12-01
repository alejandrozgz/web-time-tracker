# Time Tracker - User Guide

**Version:** 1.0
**Last Updated:** December 2024
**Document Type:** End User Guide

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [Dashboard Overview](#3-dashboard-overview)
4. [Recording Time Entries](#4-recording-time-entries)
5. [Managing Time Entries](#5-managing-time-entries)
6. [Syncing to Business Central](#6-syncing-to-business-central)
7. [Understanding Sync Statuses](#7-understanding-sync-statuses)
8. [Troubleshooting](#8-troubleshooting)
9. [Frequently Asked Questions](#9-frequently-asked-questions)

---

## 1. Introduction

### 1.1 What is Time Tracker?

Time Tracker is a web-based application that allows you to record your work hours and automatically synchronize them with Microsoft Dynamics 365 Business Central. The application provides a simple and intuitive interface for tracking time spent on different jobs and tasks.

### 1.2 Key Features

- **Easy Time Entry**: Quickly record hours worked with job and task selection
- **Real-time Validation**: Prevents overlapping time entries
- **Business Central Integration**: Automatic synchronization with BC Job Journal
- **Edit & Delete**: Modify or remove entries before syncing
- **Sync Status Tracking**: Visual indicators for entry status
- **Recent Entries View**: Quick access to your latest time records

### 1.3 System Requirements

- **Web Browser**: Chrome, Firefox, Safari, or Edge (latest version)
- **Internet Connection**: Required for all operations
- **Business Central Access**: Valid credentials for your organization
- **Screen Resolution**: Minimum 1280x720 recommended

---

## 2. Getting Started

### 2.1 Accessing the Application

**[IMAGE PLACEHOLDER 1: Login page screenshot]**
*Caption: Time Tracker login page showing tenant URL, username, password, and company selection fields*

1. Open your web browser
2. Navigate to the Time Tracker URL provided by your administrator
   - Format: `https://your-domain.com/{tenant-name}`
   - Example: `https://timetracker.atpdynamics.com/atpdynamics`
3. You will see the login page

### 2.2 Logging In

**[IMAGE PLACEHOLDER 2: Login form with filled credentials]**
*Caption: Completed login form ready to submit*

To log in to the application:

1. **Select Company** from the dropdown menu
   - This list shows all companies you have access to
   - If you only have one company, it will be pre-selected

2. **Enter your Username**
   - This is your Business Central resource username
   - Example: `JSMITH` or `john.smith`
   - Case-sensitive in some configurations

3. **Enter your Password**
   - Same password you use for Business Central
   - The password field is masked for security

4. Click the **"Sign In"** button

5. If credentials are correct, you'll be redirected to the Dashboard

### 2.3 First Time Login

When logging in for the first time:

- You'll see an empty dashboard with no time entries
- The sync button will show "All synced" or "0 pending"
- The timer will be stopped (00:00:00)
- All form fields will be empty and ready for your first entry

**[IMAGE PLACEHOLDER 3: Empty dashboard for new user]**
*Caption: Dashboard appearance for first-time users with no time entries*

---

## 3. Dashboard Overview

### 3.1 Dashboard Layout

**[IMAGE PLACEHOLDER 4: Full dashboard view with annotations]**
*Caption: Complete dashboard view showing all main sections: header, timer, entry form, sync button, and recent entries*

The dashboard is divided into several key sections:

#### A. Header Section
- **Company Name**: Displays your currently selected company
- **User Name**: Shows your logged-in username
- **Logout Button**: Located in the top-right corner

#### B. Timer Section (Top Center)
- **Digital Timer Display**: Shows elapsed time (HH:MM:SS)
- **Start/Stop/Reset Buttons**: Control the timer
- **Visual Indicator**: Green when running, gray when stopped

#### C. Time Entry Form (Center)
- **Job Selection**: Dropdown to select the job
- **Task Selection**: Dropdown to select the task
- **Date Picker**: Calendar to select the date
- **Hours Field**: Manual hour entry (required if not using timer)
- **Description Field**: Text area for work description
- **Time Range**: Optional start and end time fields
- **Save Button**: Submits the time entry

#### D. Sync Section (Right Side)
- **Sync Status Badge**: Shows pending entries count
- **Sync Button**: Uploads entries to Business Central
- **Pending Hours**: Total hours waiting to sync

#### E. Recent Entries (Bottom)
- **Entries Table**: Lists your recent time entries
- **Action Buttons**: Edit and Delete options for each entry
- **Status Indicators**: Visual sync status for each entry

### 3.2 Understanding the Interface

**Color Coding:**
- 🟢 **Green**: Synced successfully to Business Central
- 🟠 **Orange**: Not synced yet (pending)
- 🔴 **Red**: Sync error (requires attention)
- ⚪ **Gray**: Inactive or disabled state

**Icons:**
- ▶️ **Play**: Start timer
- ⏸️ **Pause**: Stop timer
- 🔄 **Reset**: Reset timer to zero
- 📤 **Upload**: Sync to Business Central
- ✏️ **Edit**: Modify entry
- 🗑️ **Delete**: Remove entry

---

## 4. Recording Time Entries

### 4.1 Method 1: Using the Timer

**[IMAGE PLACEHOLDER 5: Timer in action with start button highlighted]**
*Caption: Timer running (showing green play button and elapsed time)*

The timer is the easiest way to track time as you work:

#### Starting the Timer:

1. **Before starting work**, click the ▶️ **"Start"** button
2. The timer display will turn **green** and begin counting
3. The button will change to ⏸️ **"Stop"**
4. Continue working while the timer runs

**[IMAGE PLACEHOLDER 6: Timer stopped with hours captured]**
*Caption: Timer stopped after working, showing 2:30:00 in the hours field*

#### Stopping the Timer:

1. **When you finish working**, click ⏸️ **"Stop"**
2. The timer will pause and turn **gray**
3. The elapsed time will **automatically fill** the "Hours" field
4. You can now continue filling out the rest of the form

#### Tips for Timer Use:

- ⚠️ **Don't navigate away** while timer is running (it will stop)
- ⚠️ **Don't close the browser tab** (timer will reset)
- ✅ **Use Stop instead of closing** the application
- ✅ **Reset timer** with 🔄 button if you need to start over

### 4.2 Method 2: Manual Entry

**[IMAGE PLACEHOLDER 7: Manual time entry form filled out]**
*Caption: Completed time entry form with all fields filled manually (no timer used)*

You can also enter time manually without using the timer:

1. **Select Job** from the dropdown
   - Click the "Select Job" field
   - Scroll or type to search
   - Click the desired job

2. **Select Task** from the dropdown
   - This dropdown activates after selecting a job
   - Choose the appropriate task for your work
   - Tasks are filtered by the selected job

3. **Choose Date** using the calendar picker
   - Click the date field
   - Navigate to the correct date
   - Click to select
   - Default is today's date

4. **Enter Hours Manually**
   - Type the hours worked (decimal format)
   - Examples:
     - 2.5 = 2 hours and 30 minutes
     - 1.25 = 1 hour and 15 minutes
     - 8 = 8 hours exactly

5. **Add Description** (Required)
   - Enter a clear description of work performed
   - Minimum 3 characters
   - Be specific: "Fixed invoice posting bug" not just "Bug fix"

6. **Optional: Add Time Range**
   - Enter Start Time (e.g., 09:00)
   - Enter End Time (e.g., 17:30)
   - System will validate the time range matches hours entered

7. Click **"Save Entry"** button

### 4.3 Field Validation

**[IMAGE PLACEHOLDER 8: Form showing validation errors]**
*Caption: Time entry form displaying validation error messages in red*

The system validates your entries to ensure accuracy:

#### Required Fields:
- ✅ **Job**: Must be selected
- ✅ **Task**: Must be selected
- ✅ **Date**: Must be selected
- ✅ **Hours**: Must be greater than 0
- ✅ **Description**: Minimum 3 characters

#### Validation Rules:
- **Hours Format**: Decimal numbers only (e.g., 2.5, not 2:30)
- **Date Range**: Cannot be in the future
- **Time Range**: If provided, end time must be after start time
- **Overlapping**: Cannot create entries that overlap with existing ones
- **Maximum Hours**: Cannot exceed 24 hours per day

#### Common Validation Errors:

| Error Message | Cause | Solution |
|--------------|-------|----------|
| "Job is required" | No job selected | Select a job from dropdown |
| "Hours must be greater than 0" | Empty or zero hours | Enter valid hour amount |
| "Description is required" | Empty description | Add work description |
| "Time entries overlap" | Overlapping time ranges | Adjust start/end times |
| "Invalid date" | Future date selected | Select current or past date |

### 4.4 Successful Entry Confirmation

**[IMAGE PLACEHOLDER 9: Success message after saving entry]**
*Caption: Green success toast notification "Time entry saved successfully"*

After saving:

1. A **green success message** appears at the top of the screen
2. The form **clears automatically**
3. The entry appears in the **Recent Entries** table below
4. The **Sync button** updates to show pending entries
5. You can immediately create another entry

---

## 5. Managing Time Entries

### 5.1 Viewing Recent Entries

**[IMAGE PLACEHOLDER 10: Recent entries table with multiple entries]**
*Caption: Recent Entries table showing 5 entries with different sync statuses*

The Recent Entries section shows your last entries with the following information:

- **Date**: When the work was performed
- **Job**: Job number and name
- **Task**: Task number and description
- **Hours**: Time spent (in decimal format)
- **Description**: Work performed
- **Status**: Current sync status
- **Actions**: Edit and Delete buttons

### 5.2 Editing a Time Entry

**[IMAGE PLACEHOLDER 11: Edit button highlighted on a time entry]**
*Caption: Mouse hovering over the Edit (pencil) icon on a recent entry*

To modify an existing entry:

1. Locate the entry in the **Recent Entries** table
2. Click the ✏️ **Edit** button (pencil icon)
3. The entry data will **populate the form** above
4. Make your desired changes
5. Click **"Update Entry"** (button text changes from "Save")

**[IMAGE PLACEHOLDER 12: Form populated with entry being edited]**
*Caption: Time entry form filled with data from an entry being edited, showing "Update Entry" button*

#### What Can Be Edited:

✅ **Can be changed:**
- Job (if not synced)
- Task (if not synced)
- Date
- Hours
- Description
- Time range (start/end)

❌ **Cannot be changed:**
- Entries already synced to Business Central
- Entry ID or creation date

#### Important Notes:

- ⚠️ You can only edit entries that have **NOT been synced** yet
- ⚠️ Once synced to BC, entries become **read-only** in the Time Tracker
- ✅ Changes are saved immediately after clicking "Update Entry"
- ✅ The entry remains in "Not Synced" status after editing

### 5.3 Deleting a Time Entry

**[IMAGE PLACEHOLDER 13: Delete confirmation dialog]**
*Caption: Browser confirmation dialog asking "Are you sure you want to delete this time entry?"*

To remove an entry:

1. Locate the entry in the **Recent Entries** table
2. Click the 🗑️ **Delete** button (trash icon)
3. A **confirmation dialog** appears
4. Click **"OK"** to confirm deletion or **"Cancel"** to abort

#### Deletion Rules:

✅ **Can be deleted:**
- Entries with status "Not Synced" (orange)
- Entries with status "Error" (red)

❌ **Cannot be deleted:**
- Entries with status "Synced" (green)
- Entries already posted in Business Central

**[IMAGE PLACEHOLDER 14: Success message after deletion]**
*Caption: Green toast notification "Time entry deleted successfully"*

After deletion:
- Entry is **permanently removed** from the system
- A success message confirms the deletion
- The entry disappears from Recent Entries
- Pending count updates accordingly

---

## 6. Syncing to Business Central

### 6.1 Understanding Sync

**What is Syncing?**

Syncing is the process of uploading your time entries from the Time Tracker to Microsoft Dynamics 365 Business Central. Once synced:

- Entries appear in BC Job Journal
- They can be reviewed by supervisors
- They can be posted to job ledgers
- They become part of official time records

### 6.2 When to Sync

**Best Practices:**

- ✅ **End of each day**: Sync before leaving work
- ✅ **After completing a task**: Sync when finishing a project milestone
- ✅ **Before deadlines**: Ensure time is recorded before payroll cutoffs
- ✅ **Regular intervals**: Sync every few hours if working on multiple jobs

**Automatic Sync:**
- Time Tracker does **NOT** sync automatically
- **You** must manually click the sync button
- This gives you control to review entries before sending

### 6.3 How to Sync

**[IMAGE PLACEHOLDER 15: Sync button showing pending entries]**
*Caption: Sync button showing "2 Pending" badge in orange and "5.5 hours pending"*

#### Step 1: Check Pending Entries

1. Look at the **Sync button** on the right side
2. It shows a badge with the **number of pending entries**
3. Below it shows **total pending hours**
4. Orange color indicates entries waiting to sync

#### Step 2: Click Sync Button

**[IMAGE PLACEHOLDER 16: Sync button during syncing process]**
*Caption: Sync button showing loading spinner and "Syncing..." text*

1. Click the **"Sync to BC"** button
2. The button will show a **loading spinner**
3. Text changes to **"Syncing..."**
4. Button is disabled during the process

#### Step 3: Wait for Completion

**[IMAGE PLACEHOLDER 17: Successful sync notification]**
*Caption: Green toast notification showing "Successfully synced 2 entries to Business Central"*

The sync process typically takes 2-10 seconds:

- 🔄 **Uploading**: Entries are sent to Business Central
- ✅ **Validating**: BC checks the data
- 📝 **Creating**: Journal lines are created in BC
- ✔️ **Confirming**: Status updates in Time Tracker

#### Step 4: Verify Sync Success

**[IMAGE PLACEHOLDER 18: Recent entries after successful sync]**
*Caption: Recent Entries table showing synced entries with green "Synced" badges*

After syncing:

- Entries change to **green "Synced"** status
- The sync button shows **"All synced"** or **"0 pending"**
- A **success message** appears
- Entries become **read-only** (no edit/delete)

### 6.4 Sync Errors

**[IMAGE PLACEHOLDER 19: Sync error notification]**
*Caption: Red error toast showing "Sync failed: 1 entry failed, 1 succeeded"*

If sync fails for some entries:

1. An **error message** appears showing:
   - How many entries succeeded
   - How many entries failed

2. Failed entries show **red "Error"** status

3. You can:
   - Check the entry details
   - Edit if needed (to fix the issue)
   - Click sync again to retry

**[IMAGE PLACEHOLDER 20: Entry with error status in table]**
*Caption: Recent entry row showing red "Error" badge and retry option*

#### Common Sync Errors:

| Error | Cause | Solution |
|-------|-------|----------|
| "No batch name configured" | User's batch not set in BC | Contact administrator |
| "Invalid job number" | Job doesn't exist in BC | Select different job |
| "Invalid task number" | Task not found in BC | Select different task |
| "BC connection failed" | Network or BC unavailable | Check internet, try again |
| "Authentication failed" | Session expired | Log out and log in again |

### 6.5 Verifying in Business Central

**[IMAGE PLACEHOLDER 21: Business Central Job Journal with synced entries]**
*Caption: Microsoft Dynamics 365 BC showing Job Journal with entries from Time Tracker*

To verify entries in Business Central:

1. Log in to **Business Central**
2. Navigate to **Job Journal**
3. Select your **batch name** (assigned by administrator)
4. You'll see your synced time entries
5. Entries are in **Draft** status (editable)
6. Review and **Post** when ready

**Key Points:**
- ✅ Time Tracker entries appear as **draft journal lines**
- ✅ They can still be **edited or deleted** in BC
- ✅ They're **not posted** until you do so manually in BC
- ⚠️ Changes in BC don't sync back to Time Tracker

---

## 7. Understanding Sync Statuses

### 7.1 Status Types

**[IMAGE PLACEHOLDER 22: Legend showing all three status badges]**
*Caption: Visual legend showing "Not Synced" (orange), "Synced" (green), and "Error" (red) badges side by side*

Time Tracker uses three sync statuses:

#### 🟠 Not Synced (Orange)

**[IMAGE PLACEHOLDER 23: Entry with "Not Synced" status]**
*Caption: Time entry row with orange "Not Synced" badge*

- **Meaning**: Entry is saved locally but not yet sent to Business Central
- **Actions Available**: Edit, Delete, Sync
- **What to do**: Click "Sync to BC" when ready to upload
- **Can be modified**: Yes

#### 🟢 Synced (Green)

**[IMAGE PLACEHOLDER 24: Entry with "Synced" status]**
*Caption: Time entry row with green "Synced" badge*

- **Meaning**: Entry successfully uploaded to Business Central
- **Actions Available**: View only (no edit/delete)
- **What to do**: Verify in BC Job Journal if needed
- **Can be modified**: No (only in BC)

#### 🔴 Error (Red)

**[IMAGE PLACEHOLDER 25: Entry with "Error" status]**
*Caption: Time entry row with red "Error" badge and error details*

- **Meaning**: Sync attempted but failed
- **Actions Available**: Edit, Delete, Retry Sync
- **What to do**:
  1. Check error message
  2. Fix the issue (edit entry)
  3. Sync again
- **Can be modified**: Yes

### 7.2 Status Lifecycle

**[IMAGE PLACEHOLDER 26: Flow diagram of status transitions]**
*Caption: Diagram showing: "Created → Not Synced → (Sync) → Synced" with error branch*

```
┌─────────────┐
│   Created   │ (New entry saved)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Not Synced  │ ──┐ (Waiting to sync)
└──────┬──────┘   │
       │          │ Edit/Delete
       │ Sync     │ Available
       │          │
       ▼          │
   ┌───────┐     │
   │  ...  │     │
   └───┬───┘     │
       │         │
   ┌───▼────┐   │
   │ Error? │───┘ (Sync failed, retry)
   └───┬────┘
       │ No error
       ▼
┌─────────────┐
│   Synced    │ (Success! Read-only)
└─────────────┘
```

### 7.3 Bulk Status View

**[IMAGE PLACEHOLDER 27: Recent entries showing mixed statuses]**
*Caption: Recent Entries table with entries in different statuses: some synced (green), some pending (orange), one error (red)*

You can see all statuses at a glance:
- Scan the **Status column** in Recent Entries
- Look for **color coding** to quickly identify issues
- **Error entries** require immediate attention
- **Pending entries** should be synced regularly

---

## 8. Troubleshooting

### 8.1 Login Issues

#### Problem: "Invalid credentials" error

**[IMAGE PLACEHOLDER 28: Login error message]**
*Caption: Red error message on login page: "Invalid credentials"*

**Possible Causes:**
- Incorrect username or password
- User not active in Business Central
- Wrong company selected

**Solutions:**
1. ✅ Verify your username (check with supervisor)
2. ✅ Re-type password carefully (case-sensitive)
3. ✅ Try selecting a different company
4. ✅ Check if you can login to Business Central directly
5. ✅ Contact your system administrator if issue persists

#### Problem: "Company not found" error

**Solutions:**
1. ✅ Ensure company exists in the system
2. ✅ Verify you have access to the selected company
3. ✅ Contact administrator to grant access

### 8.2 Time Entry Issues

#### Problem: "Time entries overlap" error

**[IMAGE PLACEHOLDER 29: Overlap error message]**
*Caption: Error toast: "Cannot create entry: time entries overlap with existing entry"*

**Cause:** You're trying to create an entry with a time range that overlaps with an existing entry for the same date.

**Solution:**
1. Check your existing entries for that date
2. Adjust start/end times to avoid overlap
3. Or remove time range and use only hours

#### Problem: Can't find my job/task in dropdown

**[IMAGE PLACEHOLDER 30: Empty job dropdown]**
*Caption: Job selection dropdown showing "No jobs available"*

**Possible Causes:**
- No jobs assigned to your resource in Business Central
- BC sync not configured

**Solutions:**
1. ✅ Contact your supervisor to assign jobs
2. ✅ Verify jobs exist in Business Central
3. ✅ Contact administrator if jobs should be visible

#### Problem: "Save Entry" button is disabled

**[IMAGE PLACEHOLDER 31: Disabled save button]**
*Caption: Save Entry button appearing grayed out/disabled*

**Cause:** Form validation failed - required fields are missing

**Solution:**
1. ✅ Check all **required fields** have values:
   - Job
   - Task
   - Date
   - Hours (must be > 0)
   - Description
2. ✅ Look for **red error messages** under fields
3. ✅ Correct any validation errors
4. ✅ Button will enable automatically when form is valid

### 8.3 Sync Issues

#### Problem: Sync button doesn't work (nothing happens)

**Possible Causes:**
- No pending entries to sync
- Already syncing in background
- Network connection lost

**Solutions:**
1. ✅ Check if you have pending entries (orange status)
2. ✅ Wait a few seconds and try again
3. ✅ Check your internet connection
4. ✅ Refresh the page (F5) and try again

#### Problem: "No batch name configured" error

**[IMAGE PLACEHOLDER 32: Batch name error]**
*Caption: Error message: "Entry has no batch name configured"*

**Cause:** Your Business Central user resource doesn't have a default batch name assigned.

**Solution:**
1. ✅ Contact your system administrator
2. ✅ They need to assign a Job Journal Batch to your resource in BC
3. ✅ You cannot fix this yourself

#### Problem: Entries sync but don't appear in Business Central

**Solutions:**
1. ✅ Verify you're looking at the correct **Job Journal Batch**
2. ✅ Check you're in the right **Company** in BC
3. ✅ Look for the entries by **Date** or **Resource No.**
4. ✅ Entries might be in a different batch - ask administrator

#### Problem: Sync takes very long time

**Causes:**
- Slow internet connection
- Business Central server is slow
- Syncing many entries at once

**Solutions:**
1. ✅ Be patient - wait up to 30 seconds
2. ✅ Check your internet speed
3. ✅ Sync smaller batches (don't accumulate too many entries)
4. ✅ If timeout occurs, check which entries failed and retry

### 8.4 Display Issues

#### Problem: Timer doesn't stop

**Solution:**
1. ✅ Click Stop button again
2. ✅ Refresh the page
3. ✅ Timer will reset, but your hours are safe if already entered in form

#### Problem: Recent entries don't load

**[IMAGE PLACEHOLDER 33: Loading spinner for entries]**
*Caption: Recent Entries section showing loading spinner*

**Solutions:**
1. ✅ Wait a few seconds for loading
2. ✅ Refresh the page (F5)
3. ✅ Clear browser cache
4. ✅ Try a different browser
5. ✅ Check internet connection

#### Problem: Application looks broken or misaligned

**Solutions:**
1. ✅ Use a supported browser (Chrome, Firefox, Safari, Edge)
2. ✅ Update your browser to the latest version
3. ✅ Zoom level should be 100% (Ctrl + 0)
4. ✅ Clear browser cache and cookies
5. ✅ Try opening in incognito/private mode

### 8.5 Session Issues

#### Problem: "Session expired" error

**Cause:** You've been logged in too long (24 hours) or session was terminated.

**Solution:**
1. ✅ Click **Logout** button
2. ✅ **Log in again** with your credentials
3. ✅ Your unsaved work may be lost - sync frequently!

#### Problem: Logged out unexpectedly

**Possible Causes:**
- Session timeout
- Closed browser tab
- Network interruption

**Prevention:**
1. ✅ Sync entries frequently (every few hours)
2. ✅ Don't leave application idle for extended periods
3. ✅ Save entries immediately after creating them

---

## 9. Frequently Asked Questions

### 9.1 General Questions

**Q: Can I use Time Tracker on my phone or tablet?**

A: Yes, Time Tracker is responsive and works on mobile devices. However, the best experience is on desktop/laptop with a larger screen.

---

**Q: Can I work offline?**

A: No, Time Tracker requires an internet connection to function. All operations communicate with the server in real-time.

---

**Q: How long are my time entries stored?**

A: Time entries are stored indefinitely in the system. However, the Recent Entries view typically shows the last 30-60 days. Older entries can be viewed in Business Central.

---

**Q: Can I see other users' time entries?**

A: No, you can only see your own time entries. Supervisors and administrators have access to all entries through the Admin Panel or Business Central.

---

**Q: What happens if I forget to sync?**

A: Your entries remain in "Not Synced" status until you manually sync them. They won't be lost, but they won't appear in Business Central until synced. Make sure to sync before payroll deadlines!

---

### 9.2 Time Entry Questions

**Q: How do I enter partial hours?**

A: Use decimal format:
- 15 minutes = 0.25
- 30 minutes = 0.5
- 45 minutes = 0.75
- 1 hour 15 min = 1.25
- 2 hours 30 min = 2.5

---

**Q: Can I create entries for future dates?**

A: No, you can only create entries for today or past dates. Future entries are not allowed.

---

**Q: What if I worked on the same task multiple times in one day?**

A: You can create multiple entries for the same job/task on the same date. Just make sure:
- Time ranges don't overlap (if using start/end times)
- Each entry has a unique description
- Total hours are accurate

---

**Q: Is there a limit to how many hours I can enter per day?**

A: The system validates that entries don't exceed 24 hours per day. If you try to enter more, you'll get a validation error.

---

**Q: Can I copy an entry to create a similar one?**

A: Not directly, but you can:
1. Click Edit on the entry
2. Change the date/hours/description
3. Click "Save Entry" (it will create a new one)
4. The original entry remains unchanged

---

### 9.3 Sync Questions

**Q: How often should I sync?**

A: Best practice is to sync:
- At the end of each workday
- Before payroll cutoff dates
- After completing a major task
- At least once per day

---

**Q: Can I un-sync an entry?**

A: No, once an entry is synced to Business Central, it cannot be un-synced from Time Tracker. However, you can:
- Delete it from BC Job Journal (before posting)
- Edit it in BC Job Journal
- Create a correcting entry

---

**Q: What if I sync the wrong entry?**

A: If you catch it immediately:
1. Go to Business Central
2. Find the entry in your Job Journal batch
3. Delete or edit it there
4. Entries in BC are still drafts until posted

---

**Q: Does syncing post my entries in Business Central?**

A: No! Syncing only creates **draft journal lines** in BC. Entries must be manually posted in Business Central by you or your supervisor.

---

**Q: Can I sync entries from different days at once?**

A: Yes! When you click "Sync to BC", all your pending entries (regardless of date) will be synced together. Each entry is created as a separate line in the BC Job Journal.

---

### 9.4 Editing & Deletion Questions

**Q: Why can't I edit a synced entry?**

A: Once synced to Business Central, entries become read-only in Time Tracker to maintain data integrity. To make changes:
1. Go to Business Central
2. Edit the entry in the Job Journal
3. Or delete it and create a correcting entry in Time Tracker

---

**Q: I deleted an entry by mistake, can I recover it?**

A: No, deletions are permanent and cannot be undone. If the entry was:
- **Not synced**: It's lost, you'll need to recreate it
- **Already synced**: It still exists in Business Central Job Journal

---

**Q: Why can't I delete an entry with "Error" status?**

A: You CAN delete entries with Error status. The Delete button should be available. If it's not working:
1. Refresh the page
2. Try logging out and back in
3. Contact support if the issue persists

---

### 9.5 Technical Questions

**Q: My timer stopped when I switched tabs. Why?**

A: The timer is designed to stop if you navigate away to prevent accidental time tracking. Always click Stop before switching tabs or closing the browser.

---

**Q: Can I use multiple browsers at the same time?**

A: Yes, but not recommended. Each browser session is independent:
- Changes in one won't appear in the other until you refresh
- You might create duplicate entries
- Stick to one browser for consistency

---

**Q: Does the application save my work automatically?**

A: No, you must click "Save Entry" to store each time entry. Draft entries in the form are not automatically saved. If you navigate away or close the browser, unsaved work will be lost.

---

**Q: What do I do if the application is down?**

A: If Time Tracker is unavailable:
1. Try refreshing the page
2. Check your internet connection
3. Try a different browser
4. Wait 10-15 minutes and try again
5. Contact your IT department or system administrator
6. As a backup, note your hours and enter them later

---

### 9.6 Best Practices

**Q: What's the best way to write descriptions?**

A:  Write clear, specific descriptions:

✅ **Good examples:**
- "Developed customer invoice API endpoint"
- "Fixed bug in payment processing module"
- "Meeting with client to review project requirements"
- "Testing integration with new accounting system"

❌ **Bad examples:**
- "Work" (too vague)
- "Project" (which project? what work?)
- "Meeting" (with who? about what?)
- "Bug fix" (which bug?)

---

**Q: Should I use the timer or manual entry?**

A: **Use the timer when:**
- Working on a single task continuously
- You want accurate time tracking
- You're at your computer the whole time

**Use manual entry when:**
- Recording time at end of day
- Worked on multiple tasks
- Didn't have access to Time Tracker while working
- Need to enter historical data

---

**Q: How can I make syncing faster?**

A: Tips for efficient syncing:
1. ✅ Sync regularly (don't accumulate 50+ entries)
2. ✅ Ensure stable internet connection
3. ✅ Sync in batches of 10-20 entries
4. ✅ Avoid syncing during peak hours if possible
5. ✅ Close unnecessary browser tabs

---

## Support & Contact

If you encounter issues not covered in this guide:

1. **Contact your Supervisor** for workflow questions
2. **Contact IT Support** for technical issues
3. **Contact System Administrator** for:
   - Login problems
   - Missing jobs/tasks
   - Batch configuration
   - Access permissions

**Emergency Contact:**
- Email: support@atpdynamics.com
- Phone: +1 (555) 123-4567

---

## Appendix: Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Tab | Move to next field |
| Shift + Tab | Move to previous field |
| Enter | Submit form (when Save button is focused) |
| Esc | Close modal/dialog |
| F5 | Refresh page |
| Ctrl + Click | Open link in new tab |

---

**Document Version:** 1.0
**Last Updated:** December 2024
**© 2024 ATP Dynamics Solutions. All rights reserved.**
