# Doctor Booking Routes Reference

## File Structure

```
app/
├── doctors/
│   ├── _layout.tsx          (Route layout configuration)
│   ├── list.tsx             (Doctor discovery/list page)
│   ├── [id].tsx             (Doctor profile/details page)
│   ├── book.tsx             (Appointment booking flow)
│   └── map.tsx              (Existing map view)
└── (tabs)/
    └── index.tsx            (Updated home page)
```

## Route Navigation Map

### Entry Points to Doctor Booking:

#### 1. From Home Screen

```typescript
// Service card or Hero button
router.push("/doctors/list");
```

#### 2. From Home - Nearby Doctors "View All"

```typescript
router.push("/doctors/list");
```

#### 3. Direct to Doctor Profile

```typescript
router.push({
  pathname: "/doctors/[id]",
  params: {
    id: doctor._id,
    doctorData: JSON.stringify(doctor),
  },
});
```

#### 4. Direct to Booking (requires doctorId)

```typescript
router.push({
  pathname: "/doctors/book",
  params: {
    doctorId: doctor._id,
    doctorName: doctor.name,
  },
});
```

## Page Routes Summary

| Route           | File       | Purpose                 | Params                   |
| --------------- | ---------- | ----------------------- | ------------------------ |
| `/doctors/list` | `list.tsx` | Browse & search doctors | None                     |
| `/doctors/[id]` | `[id].tsx` | View doctor profile     | `id`, `doctorData`       |
| `/doctors/book` | `book.tsx` | Multi-step booking      | `doctorId`, `doctorName` |
| `/doctors/map`  | `map.tsx`  | Map view (existing)     | None                     |

## Booking Flow Routes (Internal Navigation)

The booking page uses internal step management, not separate routes:

```
/doctors/book
├── Step 1: Date Selection
├── Step 2: Time Selection
├── Step 3: Appointment Details
└── Step 4: Confirmation
    ↓
    Success → /appointments
```

## Updated Navigation Links

### Home Page Changes (`/app/(tabs)/index.tsx`)

**Service Card:**

```typescript
{
  id: 'doctor',
  target: '/doctors/list'  // Changed from '/appointments/book'
}
```

**Hero Button:**

```typescript
router.push("/doctors/list"); // Changed from '/appointments/book'
```

**Nearby Doctors - View All Button:**

```typescript
router.push("/doctors/list"); // Changed from '/doctors/map'
```

**Nearby Doctors - Doctor Card:**

```typescript
router.push({
  pathname: "/doctors/[id]",
  params: { id: doctor._id, doctorData: JSON.stringify(doctor) },
});
// Changed from routing to /appointments/book directly
```

## Deep Linking (If Needed)

For deep links in your backend:

```
app://doctors/list                              → Doctor List
app://doctors/[id]?id=docId&doctorData=json    → Doctor Profile
app://doctors/book?doctorId=id&doctorName=name → Booking Flow
```

## BackButton Behavior

- From List → Home/Back Stack
- From Profile → List or Back Stack
- From Booking Step 1 → Profile or Back Stack
- Between Booking Steps → Previous Step (handled internally)

## TypeScript Types (For Reference)

```typescript
interface Doctor {
  _id: string;
  name: string;
  userType: string;
  specialization?: string;
  email?: string;
  phone?: string;
  avatar?: string;
  rating?: number;
  reviews?: number;
  experience?: string;
  bio?: string;
  distance?: number;
}

interface BookingParams {
  doctorId: string;
  doctorName: string;
}

interface ProfileParams {
  id: string;
  doctorData: string; // JSON stringified Doctor
}
```

## Important Notes

1. **Doctor List** is the new entry point for all doctor bookings
2. **Doctor Profile** shows full details before booking
3. **Booking Flow** is a 4-step wizard with internal navigation
4. **All routes properly configured** in `_layout.tsx`
5. **No separate appointment booking pages** for doctors
6. **Backward compatible** - Old routes still work, but redirect through new flow

## Quick Testing

```typescript
// Test each route:
router.push("/doctors/list");
router.push("/doctors/map");
router.push({
  pathname: "/doctors/[id]",
  params: {
    id: "test-id",
    doctorData: JSON.stringify({ _id: "test-id", name: "Test Doctor" }),
  },
});
```
