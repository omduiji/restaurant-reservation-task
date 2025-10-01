# Restaurant Reservation Management System

A comprehensive **Vue.js** application for managing restaurant branch reservations with advanced scheduling capabilities.

---
## 🚀 Features at a Glance

✅ Enable/disable reservations per branch  
✅ Flexible time slot scheduling (up to 3/day)  
✅ Smart validation with VeeValidate  
✅ Mobile-first responsive UI  
✅ Composable-based architecture  
✅ Reusable modal + confirmation system  
## 📁 Project Structure

src/
├── components/ # UI Components
│ ├── ui/ # Base UI Components
│ │ ├── AppButton.vue
│ │ ├── AppModal.vue
│ │ ├── AppTextInput.vue
│ │ ├── AppSelectInput.vue
│ │ ├── AppCheckableInput.vue
│ │ ├── AppLoader.vue
│ │ └── TimeInput.vue
│ ├── AddBranchModal.vue # Enable reservations for branches
│ ├── AppConfirmationModal.vue # Reusable confirmation dialogs
│ ├── BranchTable.vue # Data table with responsive design
│ ├── ReservationModal.vue # Main reservation settings editor
│ └── TimeSlotInput.vue # Time slot management component
├── composables/ # Vue 3 Composables
│ ├── useApi.ts # API integration layer
│ ├── useBranches.ts # Branch management logic
│ ├── useConfirmationModal.ts # Modal state management
│ └── useLoader.ts # Loading state management
├── validation/ # Form validation configuration
│ ├── config.ts # VeeValidate rules and configuration
│ └── index.ts # Validation exports
├── types/ # TypeScript type definitions
├── utils/ # Utility functions
│ └── index.ts # ID generation utilities
└── App.vue # Main application component


---

## 🎯 Key Implementation Decisions

### 1. Component Architecture

- **Separation of Concerns:** UI components (`/ui`) are separated from business logic components.
- **Reusable Modals:** `AppModal` is used as the base for all modal dialogs.
- **Generic Table Component:** `BranchTable` supports mobile and desktop via slot-based customization.




2. Form Validation Strategy

Built with VeeValidate and custom rules such as:

Rule	Purpose
timeFormat	Validates HH:MM format
timeOrder	Ensures start < end time
reasonableDuration	15–480 minute duration
maxSlots	Limits to 3 time slots
tablesSelected	Optional selection validation
4. Time Management System

✅ 24-hour format

✅ Slot-based scheduling

✅ Overlap prevention

✅ Duration validation

5. Responsive Design

Mobile-first BranchTable layout

Adaptive modal dialogs

Touch-friendly input components

6. Error Handling & UX

Centralized loading state management

Confirmation modals for actions

Real-time validation messages

## Installation
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Build for production

Usage Instructions
1. Managing Branches
Action	Description
View Enabled Branches	Main table displays active reservation branches
Enable Reservations	Use Add Branches button
Disable Reservations	Select Disable on a specific branch
2. Configuring Reservation Settings

Set Reservation Duration (15–480 min)

Configure Table Selections (optional)

Define Weekly Schedule

Use Apply to All Days for quick duplication

3. Time Slot Management

✅ Add / Remove Slots
✅ Prevent Overlaps
✅ Min. duration = reservation duration
✅ Max 3 slots per day

🔎 Validation Rules Summary
Validation	Constraint
Required Fields	Must be filled
Duration	Numeric, 15–480 mins
Time Format	Must be HH:MM
Slots	Max 3 per day
🛠 Development Guidelines
Adding New Validation Rules

Define rule in validation/config.ts

Add messages

Extend TypeScript types if needed

Creating New Modals

Extend AppModal

Use useConfirmationModal for confirmation flows

Use VeeValidate for validation

API Integration

Implement API functions in services/api.ts

Wrap inside a composable

Always manage loading and errors properly


---

## 🛠️ Tech Stack

| Category     | Technology |
|--------------|------------|
| Framework    | Vue 3 (Composition API) |
| Language     | TypeScript |
| Forms        | VeeValidate + Custom Rules |
| State Logic  | Vue Composables |
| UI Toolkit   | Custom Built Components |

---
## 👨‍💻 Development Guidelines

✔️ Add new validation rules in validation/config.ts
✔️ Use AppModal as base for any new modal
✔️ Handle loading via useLoader()
✔️ Use composables for business logic
---

## 📦 Installation & Setup

```bash
# enter project-folder
cd /reservations-system

# Install dependencies
npm install

# Start development
npm run dev

# Build for production
npm run build



