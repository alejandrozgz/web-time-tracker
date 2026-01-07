# Time Tracker - User Guide

**Version:** 2.0
**Last Updated:** December 2024
**© ATP Dynamics Solutions**

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Logging In](#logging-in)
3. [Dashboard Overview](#dashboard-overview)
4. [Recording Time](#recording-time)
5. [Recent Entries](#recent-entries)
6. [Weekly Timesheet](#weekly-timesheet)
7. [Approval Status](#approval-status)
8. [Synchronization](#synchronization)
9. [Language Settings](#language-settings)
10. [Mobile Usage](#mobile-usage)

---

## Getting Started

The **Time Tracker** is a web application that allows you to record work hours and sync them with Microsoft Dynamics 365 Business Central (BC). All time entries are submitted to BC for supervisor approval.

### System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection
- Valid Business Central credentials
- Assigned company and resource number

### Access

Navigate to: `https://time-tracker.atpdynamicssolutions.com/{tenant-slug}`

Your organization will provide your specific tenant URL.

---

## Logging In

### Login Page

When you access the application, you'll see the login page with three required fields:

1. **Company** - Select your company from the dropdown
2. **Username** - Enter your Business Central username (Resource No.)
3. **Password** - Enter your Business Central password

### Steps to Login

1. Click the **Company** dropdown and select your organization
2. Type your **username** in the Username field
3. Type your **password** in the Password field
4. Click the **"Login"** button

> **Language Selection**: The language selector is available in the top-right corner of the login page.

### Troubleshooting Login Issues

**Invalid credentials:**
- Verify your username and password
- Check that you selected the correct company
- Contact your system administrator if issues persist

**Company not in list:**
- Contact your administrator to verify your company setup in the system

---

## Dashboard Overview

After logging in, you'll see the main dashboard with two tabs:

### Header Bar

The header displays:
- **Company name** and tenant information
- **User name** and resource number
- **Language selector** (🇺🇸 EN / 🇪🇸 ES)
- **Sync button** - Manually synchronize with Business Central
- **Logout button** - Exit the application

### Main Tabs

**⏱️ Time Tracker Tab**
- Record new time entries
- View recent entries
- Edit or delete entries (when allowed)

**📅 Week Tab**
- View weekly timesheet
- See hours by project and task
- Review daily and weekly totals

---

## Recording Time

The Time Tracker offers two modes for recording time:

### Mode Selection

At the top of the tracker, you'll see two buttons:
- **Timer** - Record time in real-time
- **Manual** - Enter time after the fact

> **Default Mode**: The application opens in **Manual mode** by default.

---

### Manual Mode (Default)

Use this mode to enter time for work you've already completed.

#### Fields

1. **Description** (required)
   - Describe what you worked on
   - Example: "Development of customer portal feature"

2. **Task Selection** (required)
   - Click **"Select task..."** to open the dropdown
   - Tasks are grouped by project
   - Click a task to select it

3. **Date**
   - Select the date when the work was performed
   - Defaults to today's date

4. **Start Time**
   - Enter start time in 24-hour format (HH:MM)
   - Example: 09:00

5. **End Time**
   - Enter end time in 24-hour format (HH:MM)
   - Example: 17:00

6. **Calculated Hours**
   - Displays automatically based on start and end times
   - Updates in real-time as you type

#### Adding a Manual Entry

1. Type a description of your work
2. Click "Select task..." and choose a project/task
3. Select the date
4. Enter start time (e.g., 09:00)
5. Enter end time (e.g., 17:00)
6. Verify the calculated hours
7. Click **"Add manual time"**

#### Validations

- End time must be after start time
- Minimum duration: 36 seconds
- Maximum duration: 24 hours
- Description is required
- Task selection is required

---

### Timer Mode

Use this mode to track time as you work.

#### How to Use the Timer

1. **Enter a description** of what you're working on
2. **Select a task** from the dropdown
3. Click **"Start"** to begin timing
4. The timer displays elapsed time in HH:MM:SS format
5. Click **"Pause"** to temporarily stop (you can resume later)
6. Click **"Stop"** to finish and save the entry

#### Timer States

- **Start** (▶️) - Begins timing
- **Pause** (⏸️) - Temporarily stops the timer
- **Resume** (▶️) - Continues a paused timer
- **Stop** (⏹️) - Ends timing and saves the entry

> **Important**: You cannot start the timer without entering a description and selecting a task.

---

### Task Selector

The task selector shows all available projects and tasks:

#### Structure

```
📁 PROJECT-001 - Project Name
   • Task 1 - Task Description
   • Task 2 - Task Description

📁 PROJECT-002 - Another Project
   • Task 3 - Task Description
   • Task 4 - Task Description
```

#### Using the Selector

1. Click **"Select task..."**
2. Browse through the list of projects
3. Click on the desired task
4. The selector closes automatically
5. The selected task appears in the field

---

## Recent Entries

The **Recent Entries** section shows all your time records, organized by date.

### Overview

**Header:**
- Title: "Recent entries"
- Approval status legend with colored indicators

**Entries:**
- Grouped by date (newest first)
- Expandable/collapsible by day
- Each entry shows description, project, task, time, and status

---

### Collapsing/Expanding Days

**To collapse a day:**
1. Click anywhere on the date header
2. The entries hide, showing only the date and total hours
3. The icon changes to ▶

**To expand a day:**
1. Click the collapsed date header
2. All entries for that day appear
3. The icon changes to ▼

> **Tip**: This helps organize your view when you have many days of entries.

---

### Entry Information (Desktop View)

Each entry displays:

**Left side:**
- **Description** - What you worked on
- **Project • Task** - Assignment details

**Right side:**
- **Time range** - Start and end times (HH:MM - HH:MM)
- **Total hours** - Hours in parentheses (X.XXh)
- **Status dot** - Colored indicator (if synced)
- **Sync badge** - Synchronization status
- **Action buttons** - Edit (✏️) and Delete (🗑️)

---

### Entry Information (Mobile View)

On mobile devices, entries use a two-row layout:

**Top row:**
- Description and project/task (left)
- Action buttons (right)

**Bottom row:**
- Time range and hours (left)
- Status dot and sync badge (right)

---

### Approval Status Indicators

Each entry has visual indicators showing its approval status:

#### Color System

**Border Color:**
- **🟡 Thick yellow border (left side)** - Pending approval
- **🟢 Thick green border (left side)** - Approved
- **🔴 Thick red border (left side)** - Rejected

**Status Dot:**
- **• Small colored dot** appears next to the time (matches border color)

**Hover Effect:**
- Subtle background color appears when you hover over an entry

#### Legend

At the top of Recent Entries, you'll see:

```
Approval Status: • Pending • Approved • Rejected
```

This legend explains the color coding system.

---

### Sync Status Badges

Every entry shows its synchronization status:

| Badge | Color | Meaning |
|-------|-------|---------|
| **Not Synced** | 🟠 Orange | Entry created locally, not sent to BC yet |
| **Synced** | 🔵 Blue | Successfully sent to Business Central |
| **Error** | 🔴 Red | Synchronization failed |

---

### Editing Entries

#### When Can You Edit?

You can edit an entry if:
- ✅ It's **Not Synced** (orange badge)
- ✅ It's **Rejected** (red border)

You cannot edit if:
- ❌ It's **Synced and Pending** approval
- ❌ It's **Approved** (green border)

#### How to Edit

1. Click the **Edit button** (✏️)
2. The entry becomes editable with form fields
3. Modify description, task, start time, or end time
4. Click **Save** (✓) to confirm
5. Click **Cancel** (✕) to discard changes

---

### Deleting Entries

#### When Can You Delete?

Same rules as editing:
- ✅ Not Synced entries
- ✅ Rejected entries
- ❌ Pending or Approved entries

#### How to Delete

1. Click the **Delete button** (🗑️)
2. Confirm in the popup dialog
3. The entry is permanently removed

> **Warning**: This action cannot be undone.

---

### Rejected Entries

When a supervisor rejects an entry in Business Central:

**Visual indicators:**
- Red border on the left
- Red status dot

**Rejection message:**
- Appears below the entry
- Shows the reason provided by the supervisor
- Example: "⚠️ Rejection reason: Hours don't match project records"

**What to do:**
1. Read the rejection reason
2. Edit the entry to correct the issue
3. Save the changes
4. The entry will be re-synced automatically
5. Wait for approval

---

### Load More

If you have more than 20 entries, a **"Load more"** button appears at the bottom.

Click it to load the next 20 entries. This continues until all entries are loaded.

---

## Weekly Timesheet

The **Week** tab provides a consolidated view of all your hours organized by project, task, and day.

### Navigation

**Week selector:**
```
[◀] January 8 - January 14, 2024 [▶]  [📅 This Week]
```

- **◀ Previous** - Go to previous week
- **▶ Next** - Go to next week
- **📅 This Week** - Jump back to current week

---

### Table Structure

#### Columns

1. **Project / Task** - Shows job and task names
2. **Monday through Sunday** - 7 day columns
3. **Total** - Weekly total for each task

#### Rows

- **Project headers** (📁) - Group tasks by project
- **Task rows** - Show hours per day
- **Daily Totals** - Sum of all tasks per day
- **Week Total** - Grand total (bottom right)

---

### Reading the Timesheet

#### Hour Cells

Each cell shows:
- **Number** - Hours worked (e.g., 8.0)
- **"-"** - No hours recorded
- **Color** - Sync status indicator

#### Cell Colors

| Color | Meaning |
|-------|---------|
| 🟠 Orange background | Not synced |
| 🔵 Blue background | Synced |
| 🔴 Red background | Sync error |
| ⚪ Gray background | No hours |

#### Current Day

The current day's column has a **light blue background** for easy identification.

#### Over-hours Warning

If a day has more than 8 hours, the total appears in **red** as a warning.

---

### Example Timesheet

```
┌──────────────────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────────┐
│ Project/Task     │  M  │  T  │  W  │  T  │  F  │  S  │  S  │ Total  │
├──────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────────┤
│ 📁 PROJECT-001                                                      │
│   Development    │ 8.0 │ 7.0 │ 8.0 │ 8.0 │ 6.0 │  -  │  -  │ 37.0h  │
│   Testing        │  -  │ 1.0 │  -  │  -  │ 2.0 │  -  │  -  │  3.0h  │
├──────────────────┼─────┼─────┼─────┼─────┼─────┼─────┼─────┼────────┤
│ Daily Totals     │ 8.0 │ 8.0 │ 8.0 │ 8.0 │ 8.0 │ 0.0 │ 0.0 │ 40.0h  │
└──────────────────┴─────┴─────┴─────┴─────┴─────┴─────┴─────┴────────┘
```

---

## Approval Status

### Approval Flow

```
Created (Local)
    ↓
Pending (Synced to BC)
    ↓
Approved ✓  or  Rejected ✗
```

---

### Status Details

#### 1. Not Synced (Local)

**Description:**
- Entry exists only in the Time Tracker
- Has not been sent to Business Central yet

**Visual:**
- No colored border
- Orange "Not Synced" badge

**Available actions:**
- ✅ Edit
- ✅ Delete

---

#### 2. Pending Approval

**Description:**
- Entry successfully synced to Business Central
- Waiting for supervisor approval

**Visual:**
- 🟡 Yellow left border (4px thick)
- 🟡 Yellow status dot
- Blue "Synced" badge

**Available actions:**
- ❌ Cannot edit
- ❌ Cannot delete

---

#### 3. Approved

**Description:**
- Supervisor approved the entry in BC
- Time is validated and processed

**Visual:**
- 🟢 Green left border (4px thick)
- 🟢 Green status dot
- Blue "Synced" badge

**Available actions:**
- ❌ Cannot edit
- ❌ Cannot delete

---

#### 4. Rejected

**Description:**
- Supervisor rejected the entry in BC
- Includes a rejection reason

**Visual:**
- 🔴 Red left border (4px thick)
- 🔴 Red status dot
- Rejection message below entry
- Blue "Synced" badge

**Available actions:**
- ✅ Edit (to correct)
- ✅ Delete

---

### Checking Approval Status

**Method 1: Visual indicators**
- Look at the border color of entries in Recent Entries
- Yellow = Pending
- Green = Approved
- Red = Rejected

**Method 2: Legend**
- Reference the approval status legend at the top of Recent Entries

**Method 3: Business Central**
- You can also check directly in Business Central

---

## Synchronization

### What is Synchronization?

Synchronization is the process of sending time entries from the Time Tracker to Business Central and receiving approval status updates.

### What Gets Synchronized?

**To Business Central:**
- New time entries
- Description, date, times
- Project and task assignments
- Your user/resource information

**From Business Central:**
- Approval status changes
- Rejection reasons
- Available projects and tasks
- Company information

---

### Manual Sync

#### How to Sync

1. Click the **"Sync"** button in the top-right corner
2. Wait for the process to complete
3. Button will show "Synced X min ago" when done

#### Sync Button States

| Display | Meaning |
|---------|---------|
| **"Sync"** | Ready to synchronize |
| **"Syncing..."** (spinning icon) | In progress |
| **"Synced 2 min ago"** | Last sync time |

---

### Automatic Sync

The system automatically syncs:
- When you create a new entry
- Every 15 minutes (background)
- When switching between tabs

> **Best Practice**: Manually sync at the end of your workday to ensure all entries are sent to Business Central.

---

### Sync Errors

**Error badge on entry:**
- Entry shows red "Error" badge
- Sync to Business Central failed

**How to resolve:**
1. Check your internet connection
2. Edit the entry to verify all information is correct
3. Save the entry
4. Click the Sync button
5. Contact your administrator if error persists

---

## Language Settings

The Time Tracker supports **English** and **Spanish**.

### Changing Language

#### From Login Page

Click the language selector in the top-right corner:
- 🇺🇸 **EN** - English
- 🇪🇸 **ES** - Español

#### From Dashboard

**Desktop:**
- Language selector appears in the header (right side)

**Mobile:**
- Language selector appears in the second row of the header

### Language Persistence

Your language preference is saved locally and persists across sessions.

---

## Mobile Usage

The Time Tracker is fully responsive and optimized for mobile devices.

### Mobile Features

#### Optimized Layouts

- **Recent Entries**: Two-row layout for better readability
- **Timesheet**: Horizontal scroll for full week view
- **Forms**: Larger touch targets and simplified inputs

#### Navigation

- **Header**: Compact with essential information
- **Tabs**: Easy switching between Tracker and Week
- **Buttons**: Touch-friendly sizes

#### Best Practices

1. **Portrait mode** recommended for Recent Entries
2. **Landscape mode** better for Weekly Timesheet
3. **Pull to refresh** not supported - use Sync button
4. **Wi-Fi recommended** for faster synchronization

---

## Frequently Asked Questions

### Can I edit an entry after it's synced?

No, unless it was rejected by your supervisor. Approved and pending entries cannot be modified to maintain record integrity.

### Can I register time for previous days?

Yes, use Manual mode and select any date in the Date field.

### What if I forget to stop the timer?

The timer will continue running. Stop it manually and use Manual mode to enter the correct hours if needed.

### How often are approval statuses updated?

- At login
- When you manually sync
- When switching tabs
- Automatically every 15 minutes

### Can I delete an approved entry?

No. Once approved in Business Central, entries cannot be deleted from the Time Tracker. Contact your supervisor for any changes.

### Does the app work offline?

No. Internet connection is required for:
- Login
- Synchronization
- Approval status updates

However, you can still fill out the form offline, and entries will sync when you reconnect.

### What does the colored dot mean?

The dot indicates approval status:
- 🟡 Yellow - Pending approval
- 🟢 Green - Approved
- 🔴 Red - Rejected

### Why do I see "approval_status.legend" instead of text?

This means translations didn't load. Try:
1. Hard refresh: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Clear browser cache
3. Change language and change back

---

## Support

### Technical Support

**ATP Dynamics Solutions**
- 🌐 Website: https://atpdynamicssolutions.com
- 📧 Email: soporte@atpdynamicssolutions.com

### Support Hours

- Monday - Friday: 9:00 AM - 6:00 PM
- Saturday: 9:00 AM - 1:00 PM
- Sunday & Holidays: Closed

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Tab` | Navigate between fields |
| `Enter` | Submit form |
| `Esc` | Cancel editing |
| `Ctrl + Shift + R` | Hard refresh (clear cache) |

---

## Glossary

| Term | Definition |
|------|------------|
| **BC** | Business Central (Microsoft Dynamics 365) |
| **Resource No.** | Your employee ID in Business Central |
| **Time Entry** | A record of hours worked |
| **Sync** | Synchronization with Business Central |
| **Job** | Project in Business Central |
| **Task** | Specific work item within a project |

---

**End of User Guide**

For the latest updates and detailed information, please refer to the online documentation or contact support.
