# Doctor Booking Enhancement - Visual Reference & UI Mockup

## 📱 Step 3: Appointment Details - Visual Layout

```
┌─────────────────────────────────────────┐
│  STEP 3 OF 4: APPOINTMENT DETAILS       │
├─────────────────────────────────────────┤
│                                         │
│  Appointment Type                       │
│  ┌──────────────┐  ┌──────────────┐   │
│  │    📹        │  │    ⟲         │   │
│  │ Consultation │  │  Follow-up   │   │
│  └──────────────┘  └──────────────┘   │
│                                         │
│  Reason for Visit                       │
│  ┌────────────┐  ┌────────────┐       │
│  │    🏥      │  │    💊      │       │
│  │  General   │  │ Medication │       │
│  │ Checkup    │  │   Refill   │       │
│  └────────────┘  └────────────┘       │
│  ┌────────────┐  ┌────────────┐       │
│  │    🩺      │  │    📋      │       │
│  │ Symptoms  │  │  Follow-up │       │
│  │           │  │ Treatment  │       │
│  └────────────┘  └────────────┘       │
│  ┌────────────┐  ┌────────────┐       │
│  │    🧪      │  │    💉      │       │
│  │    Lab     │  │   Vaccine  │       │
│  │  Results   │  │            │       │
│  └────────────┘  └────────────┘       │
│                                         │
│  Additional Notes                       │
│  ┌─────────────────────────────────────┐│
│  │ Describe your symptoms or concerns..││
│  │ [User text input - multi-line]      ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  Preferred Language                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐  │
│  │ English │ │ Spanish │ │  Hindi  │  │
│  └─────────┘ └─────────┘ └─────────┘  │
│    (BLUE)      (GRAY)      (GRAY)      │
│                                         │
│  Preferred Contact Method               │
│  ┌──────────┐ ┌────────┐ ┌────────┐   │
│  │ 📞 Phone │ │✉️ Email│ │💬 SMS │   │
│  └──────────┘ └────────┘ └────────┘   │
│    (DEFAULT)    (GRAY)     (GRAY)      │
│                                         │
│  Appointment Reminders                  │
│  ┌───────────────────────────┐         │
│  │ 🔔 Appointment Reminders  │    🟢  │
│  │ Get notifications before  │ (TOGGLE)│
│  │ your appointment          │         │
│  └───────────────────────────┘         │
│     (LIGHT BLUE BACKGROUND)             │
│                                         │
├─────────────────────────────────────────┤
│  [◄ BACK]              [NEXT ►]         │
└─────────────────────────────────────────┘
```

---

## 📋 Step 4: Confirmation Review - Visual Layout

```
┌─────────────────────────────────────────┐
│  STEP 4 OF 4: CONFIRMATION              │
├─────────────────────────────────────────┤
│                                         │
│  📅 Date & Time                         │
│  ├─────────────────────────────────────┤
│  └─ Tomorrow at 2:00 PM                 │
│                                         │
│  📋 Appointment Type                    │
│  ├─────────────────────────────────────┤
│  └─ Consultation                        │
│                                         │
│  📝 Reason                              │
│  ├─────────────────────────────────────┤
│  └─ Specific Symptoms                   │
│                                         │
│  📌 Notes                               │
│  ├─────────────────────────────────────┤
│  └─ Have had headaches for 3 days      │
│                                         │
│  🌐 Preferred Language                  │
│  ├─────────────────────────────────────┤
│  └─ English                             │
│                                         │
│  📞 Preferred Contact                   │
│  ├─────────────────────────────────────┤
│  └─ Phone                               │
│                                         │
│  🔔 Appointment Reminders               │
│  ├─────────────────────────────────────┤
│  └─ Enabled                             │
│                                         │
│  ℹ️  A confirmation will be sent to     │
│  your registered email and phone number.│
│                                         │
├─────────────────────────────────────────┤
│  [◄ BACK]        [CONFIRM & BOOK ✓]    │
└─────────────────────────────────────────┘
```

---

## 🎨 Color States Reference

### Language Buttons

```
DEFAULT STATE (English)
┌─────────────┐
│   English   │  bg: #f9f9f9
│   (BLUE)    │  border: #E5E7EB
└─────────────┘  text: #0066CC

SELECTED STATE (English)
┌─────────────┐
│   English   │  bg: #0066CC
│   (WHITE)   │  border: #0066CC
└─────────────┘  text: #fff
```

### Contact Method Buttons

```
DEFAULT STATE (All)
┌──────────────┐
│📞 Phone      │  bg: #f9f9f9
│(BLUE ICON)   │  border: #E5E7EB
└──────────────┘  icon: #0066CC

SELECTED STATE
┌──────────────┐
│📞 Phone      │  bg: #0066CC
│(WHITE ICON)  │  border: #0066CC
└──────────────┘  icon: #fff
```

### Reminders Toggle

```
OFF STATE (Gray)
┌──────────┐
│ ○ - - - │  bg: #ddd
│ ●        │  circle: #fff (left)
└──────────┘

ON STATE (Green)
┌──────────┐
│ - - - ○  │  bg: #00A86B
│        ●  │  circle: #fff (right)
└──────────┘
```

---

## 📐 Spacing & Dimensions

### Button Heights

```
Language Buttons:
Height: 44px (touch-friendly)
Padding: 12px vertical, 10px horizontal
Flex: 1 (equal width distribution)
Gap: 12px

Contact Method Buttons:
Height: 44px (touch-friendly)
Padding: 12px vertical, 10px horizontal
Flex: 1 (equal width distribution)
Gap: 12px

Reminder Container:
Height: ~60px (with text)
Padding: 16px vertical, 14px horizontal
```

### Spacing Measurements

```
Between Sections: 24px
Between Buttons: 12px
Button Border Radius: 12px
Section Label Bottom Margin: 12px
Container Border Radius: 12px
Toggle Switch Size: 50px width × 28px height
Toggle Circle Size: 24px diameter
```

---

## 🔤 Typography

### Font Sizes & Weights

```
Section Labels
├─ Font Size: 15px
├─ Weight: Bold (700)
└─ Color: #333

Button Text (Preferences)
├─ Font Size: 12-13px
├─ Weight: Semibold (600)
└─ Color: #0066CC (or #fff when active)

Reminder Subtitle
├─ Font Size: 12px
├─ Weight: Regular (400)
└─ Color: #666

Confirmation Labels
├─ Font Size: 12px
├─ Weight: Medium (500)
└─ Color: #999

Confirmation Values
├─ Font Size: 14px
├─ Weight: Semibold (600)
└─ Color: #333
```

---

## 🎯 Touch Target Areas

```
Language Buttons (3 buttons in row)
  Touch Area: (Screen Width - 48px) / 3 pixels each
  Minimum: ~100px width on mobile
  Height: 44px (minimum touch target)

Contact Buttons (3 buttons in row)
  Touch Area: (Screen Width - 48px) / 3 pixels each
  Minimum: ~100px width on mobile
  Height: 44px (minimum touch target)

Toggle Switch
  Touch Area: 50px × 28px
  Tap Zone: ~60px × 40px (with padding)
```

---

## 📱 Responsive Behavior

### On Small Screens (< 375px)

- Language buttons: Stack or reduce padding
- Contact buttons: Stack or reduce padding
- Toggle remains same size (important)

### On Standard Screens (375-812px)

- 3 buttons per row with 12px gap
- Full responsive flex layout
- All elements properly spaced

### On Large Screens (> 812px)

- Same layout maintained
- Buttons proportionally larger
- Better spacing overall

---

## 🔄 Animation & Transitions

### Button Press (Language/Contact)

```
Timeline: 200ms
├─ Background color fade
├─ Text color transition
├─ Border color change
└─ Scale effect (optional: 0.98 → 1.0)
```

### Toggle Switch

```
Timeline: 300ms
├─ Background color transition
├─ Circle position slide
└─ Optional opacity change
```

### Step Transitions

```
Timeline: 300ms
├─ Scroll to top
├─ Fade out old step
├─ Fade in new step
└─ Maintain scroll position on Back
```

---

## 🎬 Complete User Interaction Flow

```
STEP 3: APPOINTMENT DETAILS
│
├─ User sees all form fields
├─ Language defaults to English
├─ Contact defaults to Phone
├─ Reminders default to Enabled
│
├─ User taps "Spanish"
│  └─ Spanish button turns blue
│     Rest turn gray
│     selectedLanguage = 'spanish'
│
├─ User taps "Email"
│  └─ Email button turns blue with white icon
│     selectedLanguage = 'phone'
│
├─ User taps reminder toggle
│  └─ Toggle turns gray (slides left)
│     enableReminders = false
│
├─ User taps "Next ►"
│  └─ All selections preserved
│     Advance to Step 4
│
STEP 4: CONFIRMATION
│
├─ Preferred Language: Spanish ✓
├─ Preferred Contact: Email ✓
├─ Appointment Reminders: Disabled ✓
│
├─ User reviews all details
├─ User taps "◄ BACK"
│  └─ Returns to Step 3
│     All selections preserved
│     Spanish, Email, Disabled still selected
│
├─ User taps "Next ►"
│  └─ Returns to Step 4
│     Confirmation reflects Step 3 state
│
├─ User taps "CONFIRM & BOOK ✓"
│  └─ Loading spinner appears
│     API submission with all data:
│     {
│       language: 'spanish',
│       contactMethod: 'email',
│       remindersEnabled: false
│     }
│
└─ Success! Appointment booked
```

---

## 🎨 Icon Reference

### Icons Used from MaterialIcons

| Feature            | Icon Name            | Size       | Color (Default) | Color (Active) |
| ------------------ | -------------------- | ---------- | --------------- | -------------- |
| Appointment Type   | videocam             | 20         | #0066CC         | #fff           |
| Appointment Type   | ⟲ (refresh)          | 20         | #0066CC         | #fff           |
| Reason             | emoji icon           | 24 (emoji) | N/A             | N/A            |
| Language Selection | language             | 20         | #0066CC         | N/A            |
| Phone Contact      | phone                | 18         | #0066CC         | #fff           |
| Email Contact      | email                | 18         | #0066CC         | #fff           |
| SMS Contact        | message              | 18         | #0066CC         | #fff           |
| Reminders (On)     | notifications-active | 20         | #00A86B         | N/A            |
| Reminders (Off)    | notifications-off    | 20         | #999            | N/A            |
| Confirmation Icon  | event                | 20         | #0066CC         | N/A            |
| Confirmation Icon  | assignment           | 20         | #0066CC         | N/A            |
| Confirmation Icon  | description          | 20         | #0066CC         | N/A            |
| Confirmation Icon  | note                 | 20         | #0066CC         | N/A            |

---

## 📊 State Management Diagram

```
Component State
│
├─ selectedLanguage: 'english' | 'spanish' | 'hindi'
│  └─ Updates language buttons UI
│     └─ Displayed in Step 4 Confirmation
│
├─ preferredContact: 'phone' | 'email' | 'sms'
│  └─ Updates contact buttons UI
│     └─ Dynamic icon in Step 4 Confirmation
│
└─ enableReminders: boolean
   └─ Updates toggle UI
      └─ Displayed in Step 4 Confirmation

Step Navigation
├─ Step 1 → Step 2 → Step 3 → Step 4
└─ Back button preserves all state
```

---

## ✅ Accessibility Checklist

```
✓ All buttons > 44px touch target
✓ Icons paired with text labels
✓ Color + shape changes (not color alone)
✓ High contrast text (#333 on light/dark)
✓ Clear visual feedback on press
✓ Label text readable (min 12px)
✓ Toggle switch standard design
✓ Semantic HTML structure (React Native equivalent)
✓ No flashing animations (< 3Hz)
✓ Proper z-index layering
```

---

## 🚀 Performance Considerations

```
Rendering Optimization
├─ Language buttons: Map over array (no re-renders)
├─ Contact buttons: Map over array (no re-renders)
├─ Toggle: Single state update (minimal re-render)
└─ Confirmation: Read-only display (no updates)

State Updates
├─ Language: Single state update
├─ Contact: Single state update
└─ Reminders: Single state update

Memory Usage
├─ 3 state variables (minimal)
├─ No array state mutations
└─ No unnecessary component instances
```

---

**Visual Reference Complete** ✅

This document provides comprehensive visual mockups and technical specifications for the doctor booking enhancement features.
