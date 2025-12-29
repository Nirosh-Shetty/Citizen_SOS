# Complete Doctor Booking Flow - User Guide

## 🎯 Overview

The doctor booking system now includes a complete 4-step wizard with enhanced user preferences, providing a comprehensive appointment scheduling experience.

## 📋 Booking Steps Breakdown

### **Step 1: Select Date** 📅

**Screen**: Date Picker with Calendar
**User Actions**:

- Tap calendar icon to open date picker
- Select desired appointment date
- Confirm selection by tapping "Next"

**Input Variables**:

- `selectedDate`: Date object

**Validation**:

- Must select a future date
- Cannot select dates in the past

---

### **Step 2: Choose Time** ⏰

**Screen**: Time Slot Grid
**User Actions**:

- View 12 available time slots (09:00 AM - 04:30 PM in 30-min intervals)
- Tap to select preferred time
- Confirmation shows in blue button
- Tap "Next" to proceed

**Available Times**:

```
09:00 AM    09:30 AM    10:00 AM
10:30 AM    11:00 AM    11:30 AM
12:00 PM    12:30 PM    01:00 PM
01:30 PM    02:00 PM    02:30 PM
03:00 PM    03:30 PM    04:00 PM
04:30 PM
```

**Input Variables**:

- `selectedTime`: String in "HH:MM AM/PM" format

**Validation**:

- Must select a time slot
- Cannot proceed without selection

---

### **Step 3: Appointment Details** 📝

**Screen**: Comprehensive Preference Form
**Sections**:

#### A. **Appointment Type** (Required)

- **Consultation**: Initial consultation with doctor
- **Follow-up**: Follow-up visit for ongoing treatment
- Selection: Single toggle button

#### B. **Reason for Visit** (Required)

**6 Options with Icons**:

1. 🏥 General Checkup
2. 💊 Medication Refill
3. 🩺 Specific Symptoms
4. 📋 Follow-up Treatment
5. 🧪 Lab Results Review
6. 💉 Vaccination/Immunization

**UI Pattern**: 2-column grid layout

#### C. **Additional Notes** (Optional)

- Text input field
- Placeholder: "Describe your symptoms or concerns..."
- Max height: 4 lines
- Free-form text entry

#### D. **Preferred Language** (NEW) 🌐

- **Options**: English, Spanish, Hindi
- **Purpose**: Communication language for appointment
- **Selection**: 3-button toggle group
- **Default**: English
- **UI**: Equal-width buttons with blue active state

#### E. **Preferred Contact Method** (NEW) 📞

- **Phone**: Call notification
- **Email**: Email notification
- **SMS**: Text message notification
- **Purpose**: How doctor's office contacts you
- **Selection**: 3-button toggle group with icons
- **Default**: Phone

#### F. **Appointment Reminders** (NEW) 🔔

- **Toggle Switch**: Enable/Disable
- **Default**: Enabled
- **Description**: "Get notifications before your appointment"
- **UI**: Card container with blue background and green toggle
- **Icon**: Notifications icon (changes based on state)

**Input Variables**:

- `appointmentType`: 'consultation' | 'followup'
- `reason`: string (selected reason)
- `notes`: string (optional)
- `selectedLanguage`: 'english' | 'spanish' | 'hindi'
- `preferredContact`: 'phone' | 'email' | 'sms'
- `enableReminders`: boolean

**Validation**:

- Appointment Type: Required
- Reason: Required
- Notes: Optional
- All preference fields: Auto-validated with defaults

---

### **Step 4: Confirmation Review** ✅

**Screen**: Summary of All Appointment Details
**Displays**:

1. **Date & Time** 📅

   - Format: "MM/DD/YYYY at HH:MM AM/PM"
   - Icon: Calendar

2. **Appointment Type** 📋

   - Value: "Consultation" or "Follow-up"
   - Icon: Assignment

3. **Reason** 💬

   - Selected reason text
   - Icon: Description

4. **Notes** 📝

   - Shown only if provided
   - Icon: Note
   - Conditional display

5. **Preferred Language** 🌐

   - Value: Selected language (capitalized)
   - Icon: Language

6. **Preferred Contact** 📞

   - Value: "Phone", "Email", or "SMS"
   - Icon: Dynamic (phone/email/message)

7. **Reminders** 🔔
   - Value: "Enabled" or "Disabled"
   - Icon: Dynamic (notifications-active/notifications-off)
   - Color: Green if enabled, Gray if disabled

**Info Banner**:

- Text: "ℹ️ A confirmation will be sent to your registered email and phone number."
- Background: Light blue (#F0F7FF)
- Display: Always visible

**User Actions**:

- Review all details
- Tap "Back" to edit any step
- Tap "Confirm & Book" to submit appointment

---

## 🔄 Navigation Flow

```
START
  ↓
[Step 1: Date] ← → [Back disabled]
  ↓ (Next)
[Step 2: Time] ← → [Back enabled]
  ↓ (Next)
[Step 3: Details] ← → [Back enabled]
  ↓ (Next)
[Step 4: Confirm] ← → [Back enabled]
  ↓ (Confirm & Book)
[API Submission]
  ↓
[Success/Error]
  ↓
END
```

---

## 📱 Step Navigation Controls

### Header

- **Title**: Dynamic (changes per step)
- **Progress Indicator**: Step counter (1/4, 2/4, 3/4, 4/4)
- **Back Button**: Enabled from Step 2+

### Footer

- **Back Button**: Hidden on Step 1, enabled on Step 2-4

  - Style: Secondary button with border
  - Action: Go to previous step

- **Next/Confirm Button**: Primary blue button
  - Step 1-3: "Next →" (conditional styling)
  - Step 4: "Confirm & Book ✓"
  - Disabled: If required fields empty
  - Loading: Shows spinner during submission

---

## 💾 Data Collection Summary

| Field     | Type    | Required | Default      | Step |
| --------- | ------- | -------- | ------------ | ---- |
| Date      | Date    | Yes      | Today        | 1    |
| Time      | String  | Yes      | None         | 2    |
| Type      | Enum    | Yes      | consultation | 3    |
| Reason    | String  | Yes      | None         | 3    |
| Notes     | String  | No       | ""           | 3    |
| Language  | Enum    | No       | english      | 3    |
| Contact   | Enum    | No       | phone        | 3    |
| Reminders | Boolean | No       | true         | 3    |

---

## 🎨 Visual Design

### Colors

- **Primary**: #0066CC (Blue) - Buttons, active states, icons
- **Success**: #00A86B (Green) - Confirm button, enabled reminders
- **Background**: #F0F7FF (Light Blue) - Info sections, inactive states
- **Border**: #E5E7EB (Light Gray) - Input borders, dividers
- **Text**: #333333 (Dark) - Main text

### Typography

- **Headers**: 16px, Weight 700
- **Labels**: 15px, Weight 700
- **Body**: 14px, Weight 500
- **Small**: 12-13px, Weight 600

### Spacing

- **Section Gap**: 24px
- **Button Gap**: 12px
- **Padding**: 14-16px
- **Border Radius**: 12px (buttons, cards)

---

## 🔐 Data Validation

### Step 1 (Date)

```javascript
✓ Date is in the future
✓ Date is valid
✓ Date format is correct
```

### Step 2 (Time)

```javascript
✓ Time slot is selected
✓ Time is within business hours (09:00 AM - 04:30 PM)
✓ Time format is valid
```

### Step 3 (Details)

```javascript
✓ Appointment type is selected
✓ Reason is selected
✓ Language, contact method have defaults
✓ Notes field is optional but validated if provided
✓ Reminders toggle is always valid
```

### Step 4 (Confirmation)

```javascript
✓ All previous validations pass
✓ Ready for API submission
```

---

## 🚀 API Submission

When user taps "Confirm & Book", the following payload is sent:

```javascript
{
  doctorId: string,           // From route params
  userId: string,             // From auth context
  appointmentDate: Date,      // Step 1
  appointmentTime: string,    // Step 2 ("HH:MM AM/PM")
  appointmentType: string,    // Step 3 ('consultation' | 'followup')
  reason: string,             // Step 3
  additionalNotes: string,    // Step 3 (optional)
  preferredLanguage: string,  // Step 3 ('english' | 'spanish' | 'hindi')
  preferredContactMethod: string, // Step 3 ('phone' | 'email' | 'sms')
  remindersEnabled: boolean,  // Step 3 (default: true)
  timestamp: Date,            // Server time
  status: 'pending'           // Initial status
}
```

---

## ⚠️ Loading States

### During Submission

- Button shows spinner (ActivityIndicator)
- All buttons disabled
- Scroll locked
- Appears for 1-3 seconds typically

### Success

- Navigation to confirmation screen
- Success toast/alert message
- Storage update with appointment details

### Error

- Alert dialog with error message
- Retry option available
- User returned to Step 4
- Fields retain values

---

## 💡 User Experience Features

### Smart Defaults

- Language: Defaults to English (can be changed)
- Contact: Defaults to Phone (can be changed)
- Reminders: Enabled by default (user can toggle)

### Persistent Selection

- Step navigation doesn't clear selections
- Back button preserves all data
- Can review and edit any step

### Touch Feedback

- Button press animations
- Visual state changes (color, border)
- Haptic feedback (optional)

### Accessibility

- Large touch targets (min 44px)
- Clear labels and icons
- Color not only indicator
- Text pairs with icons

---

## 🔍 Troubleshooting

**Issue**: Cannot proceed from Step 3

- **Solution**: Ensure appointment type and reason are selected

**Issue**: Time slots not appearing

- **Solution**: Check if date is selected in Step 1

**Issue**: Language/Contact not changing

- **Solution**: Ensure tap registers on button area

**Issue**: Confirmation shows old data

- **Solution**: Navigate back and reselect, then forward

---

## 📲 Example User Journey

1. **User Opens Booking**: Lands on Step 1 (Date picker visible)
2. **Selects Date**: Picks tomorrow, taps "Next"
3. **Chooses Time**: Selects "02:00 PM", taps "Next"
4. **Fills Details**:
   - Selects "Consultation"
   - Chooses "Specific Symptoms" as reason
   - Adds note: "Have had headaches for 3 days"
   - Changes language to "Spanish"
   - Keeps contact as "Phone"
   - Enables reminders
   - Taps "Next"
5. **Reviews Confirmation**: All details shown correctly
6. **Confirms Booking**: Taps "Confirm & Book"
7. **Waits**: Spinner shows for 2 seconds
8. **Success**: Redirected to appointments list

---

## 📊 Analytics Data Collected

The booking system can track:

- Most selected appointment types
- Most common reasons for visits
- Popular time slots
- Language preferences
- Contact method preferences
- Reminder adoption rate

---

## 🔄 Future Enhancement Ideas

- [ ] Doctor availability real-time sync
- [ ] Insurance verification
- [ ] Payment processing
- [ ] Video consultation option
- [ ] Patient history integration
- [ ] Prescription pre-filling
- [ ] Waitlist notification
- [ ] SMS/Email confirmation details

---

**Last Updated**: Current Session
**Status**: ✅ Complete
**Version**: 2.0 (with enhanced preferences)
