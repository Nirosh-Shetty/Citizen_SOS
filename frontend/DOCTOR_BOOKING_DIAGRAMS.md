# Doctor Booking - Architecture & Flow Diagrams

## 📊 User Journey Map

```
┌─────────────────────────────────────────────────────────────────┐
│                        HOME SCREEN                              │
│  (/(tabs)/index.tsx)                                            │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Doctor Card  │  │Health Checkup│  │View All Link │          │
│  │ (Services)   │  │ (Hero Button) │  │(Nearby Dr.)  │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                  │
│         └─────────────────┼──────────────────┘                  │
│                           │                                     │
│                           ▼                                     │
└───────────────────────────────────────────────────────────────┘

                    ┌──────────────────────┐
                    │  DOCTOR LIST PAGE    │
                    │  (/doctors/list.tsx) │
                    │                      │
                    │ • Search doctors     │
                    │ • Filter by spec.    │
                    │ • View ratings       │
                    │ • Click doctor card  │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ DOCTOR PROFILE PAGE  │
                    │ (/doctors/[id].tsx)  │
                    │                      │
                    │ • Full doctor info   │
                    │ • Reviews & ratings  │
                    │ • Clinic hours       │
                    │ • Call/Message btns  │
                    │ • Book Appt button   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  BOOKING FLOW PAGE   │
                    │ (/doctors/book.tsx)  │
                    │                      │
                    │  STEP 1: DATE        │
                    │  ├─ Calendar picker  │
                    │  ├─ Validate date    │
                    │  └─ Next button      │
                    │                      │
                    │  STEP 2: TIME        │
                    │  ├─ 12 time slots    │
                    │  ├─ Select time      │
                    │  └─ Next button      │
                    │                      │
                    │  STEP 3: DETAILS     │
                    │  ├─ Type selector    │
                    │  ├─ Reason selector  │
                    │  ├─ Notes input      │
                    │  └─ Next button      │
                    │                      │
                    │  STEP 4: CONFIRM     │
                    │  ├─ Review details   │
                    │  ├─ Confirm button   │
                    │  └─ Submit booking   │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │ SUCCESS CONFIRMATION │
                    │ & API SUBMISSION     │
                    │                      │
                    │ • Save to storage    │
                    │ • Show success msg   │
                    │ • Navigate to        │
                    │   /appointments      │
                    └──────────────────────┘
```

## 🏗️ Component Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     APP ROUTING LAYER                           │
│                  (/app/doctors/_layout.tsx)                     │
└──────────────────┬──────────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┬──────────┐
        │          │          │          │
        ▼          ▼          ▼          ▼
    ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
    │ /list  │ │  /[id] │ │ /book  │ │ /map   │
    └────────┘ └────────┘ └────────┘ └────────┘
        │          │          │          │
        ▼          ▼          ▼          ▼
    DoctorList  DoctorDetail  Booking   MapView
    Component   Component     Component (Existing)
```

## 🔄 State Flow Diagram

### Doctor List Component

```
┌────────────────────────────────────────┐
│     DOCTOR LIST STATE MANAGEMENT       │
│                                        │
│  API Loading                           │
│    ↓                                   │
│  Fetch Nearby Doctors                  │
│    ↓                                   │
│  Set doctors[]                         │
│    ↓                                   │
│  ┌─ Search Query ─┐ ┌─ Specialty ─┐  │
│  │   onChange     │ │   onChange   │  │
│  └────────┬───────┘ └──────┬──────┘   │
│           │                │           │
│           ▼                ▼           │
│      filterDoctors()                   │
│           │                           │
│           ▼                           │
│      filteredDoctors[]                │
│           │                           │
│           ▼                           │
│      Render Doctor Cards              │
│                                        │
│  Pull-to-Refresh ──► onRefresh()      │
│                                        │
└────────────────────────────────────────┘
```

### Booking Component

```
┌────────────────────────────────────────┐
│     BOOKING WIZARD STATE FLOW          │
│                                        │
│  currentStep = 'date'                  │
│    ↓                                   │
│  [Show Date Picker]                    │
│    ↓                                   │
│  handleDateChange() → selectedDate     │
│    ↓                                   │
│  handleNextStep() → Validate date      │
│    ├─ Valid? → currentStep = 'time'    │
│    └─ Invalid? → Alert error           │
│    ↓                                   │
│  [Show Time Slots]                     │
│    ↓                                   │
│  setSelectedTime() → selectedTime      │
│    ↓                                   │
│  handleNextStep() → currentStep = 'details'
│    ↓                                   │
│  [Show Details Form]                   │
│    ├─ appointmentType selector         │
│    ├─ reason selector                  │
│    └─ notes input                      │
│    ↓                                   │
│  handleNextStep() → Validate form      │
│    └─ currentStep = 'confirm'          │
│    ↓                                   │
│  [Show Confirmation]                   │
│    ├─ Review all details               │
│    └─ Confirm button                   │
│    ↓                                   │
│  handleConfirmBooking()                │
│    ├─ API: appointmentsAPI.book()      │
│    ├─ Storage: appendAppointment()     │
│    ├─ Success: Alert & navigate        │
│    └─ Error: Alert error message       │
│                                        │
└────────────────────────────────────────┘
```

## 🌐 Data Flow & API Integration

```
┌──────────────────────────────────────────────────────────┐
│                   DATA FLOW DIAGRAM                      │
│                                                          │
│  CLIENT                  API                  DATABASE   │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                                          │
│  [Doctor List]                                           │
│    ├─ Location permission                               │
│    ├─ Get user location                                 │
│    └─ getNearbyProfessionals('doctor', lat, lng, rad)  │
│         ↓                                                │
│    [API] /api/users/nearby?type=doctor                 │
│         ↓                                                │
│    [DB] Query doctors near location                    │
│         ↓                                                │
│    Return doctors array                                 │
│         ↓                                                │
│    renderDoctorList(doctors)                            │
│                                                          │
│  [Doctor Profile]                                        │
│    └─ Use doctor data from list                         │
│       (passed via route params)                         │
│                                                          │
│  [Booking Confirmation]                                  │
│    ├─ Collect appointment data                          │
│    ├─ bookAppointment(appointmentData)                 │
│         ↓                                                │
│    [API] POST /api/appointments                         │
│         ↓                                                │
│    [DB] Create appointment record                       │
│         ↓                                                │
│    Return created appointment                           │
│         ↓                                                │
│    storageService.appendAppointment(apt)              │
│         ↓                                                │
│    [Local Storage] Save locally                         │
│         ↓                                                │
│    Success → Navigate to /appointments                 │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

## 📱 UI Component Hierarchy

```
DoctorList
├── Header
│   ├── BackButton
│   ├── Title
│   └── CloseButton
├── SearchContainer
│   ├── SearchIcon
│   ├── TextInput
│   └── ClearButton
├── SpecialtyScroll
│   └── SpecialtyChip[] (filtered)
└── DoctorList
    └── DoctorCard (array)
        ├── AvatarContainer
        │   ├── Avatar/Placeholder
        │   └── StatusBadge
        ├── DoctorInfo
        │   ├── Name
        │   ├── Specialty
        │   ├── Rating
        │   ├── Details (exp, phone)
        │   └── Bio
        └── ActionArrow

DoctorProfile
├── Header (back & more buttons)
├── ProfileCard
│   ├── ProfileImage
│   ├── VerificationBadge
│   ├── Name
│   ├── Title
│   └── Statistics
├── ActionButtons (Call, Message)
├── InfoSections
│   ├── About
│   ├── Services
│   ├── Schedule
│   ├── Reviews
│   └── Contact
└── BookingFooter
    └── BookButton

Booking (4 Steps)
├── Header
├── DoctorCard (reference)
├── StepIndicator (progress dots)
├── StepTitle
├── StepContent (dynamic based on step)
│   ├── Date: DatePicker
│   ├── Time: TimeSlotGrid
│   ├── Details: TypeSelector, ReasonGrid, NotesInput
│   └── Confirm: DetailsList
└── Footer (Back, Next/Confirm buttons)
```

## 🔗 Route Navigation Graph

```
    ┌─────────────────┐
    │  Home / Index   │
    │ /(tabs)/index   │
    └────────┬────────┘
             │
    ┌────────▼────────┐
    │  Doctor List    │
    │ /doctors/list   │
    └────────┬────────┘
             │
    ┌────────▼─────────────┐
    │  Doctor Profile       │
    │ /doctors/[id]         │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │  Booking Wizard       │
    │ /doctors/book         │
    │ (4 internal steps)    │
    └────────┬──────────────┘
             │
    ┌────────▼──────────────┐
    │ Success & Navigate    │
    │ to /appointments      │
    └───────────────────────┘
```

## 🎯 Feature Dependencies

```
Doctor List
├── Requires: Location Permission
├── Requires: API getNearbyProfessionals
├── Requires: Search & Filter Logic
└── Requires: Doctor Card Components

Doctor Profile
├── Requires: Doctor Data (from routing)
├── Requires: Mock Reviews Data
├── Requires: Navigation Router
└── Requires: Contact Buttons

Booking Wizard
├── Requires: Doctor ID & Name
├── Requires: DateTimePicker Library
├── Requires: Form Validation
├── Requires: API bookAppointment
├── Requires: Storage Service
└── Requires: Navigation Router
```

## 📊 Data Models

```typescript
// Doctor Model
{
  _id: string,
  name: string,
  userType: string,
  specialization: string,
  email: string,
  phone: string,
  avatar: string,
  rating: number (0-5),
  reviews: number,
  experience: string,
  bio: string,
  distance: number (km)
}

// Appointment Model
{
  _id: string,
  professionalId: string,
  userId: string,
  appointmentDate: Date,
  timeSlot: string,
  reason: string,
  notes: string,
  type: 'consultation' | 'followup',
  status: 'scheduled' | 'completed' | 'cancelled'
}

// Review Model (Mock)
{
  id: string,
  author: string,
  rating: number (1-5),
  text: string,
  date: string,
  avatar: string
}
```

---

These diagrams illustrate the complete architecture and flow of the doctor booking feature.
