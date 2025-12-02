# Component Documentation - Karnataka Wool Monitoring System

## Overview

This document provides detailed documentation for all React components in the Karnataka Wool Monitoring System. Each component is documented with its purpose, props, usage examples, and implementation details.

## Table of Contents

1. [Page Components](#page-components)
2. [UI Components](#ui-components)
3. [Service Components](#service-components)
4. [Context Providers](#context-providers)
5. [Component Architecture](#component-architecture)
6. [Styling Guidelines](#styling-guidelines)

## Page Components

### ECommerceHome.jsx
**Purpose:** Main landing page displaying wool marketplace overview

**Features:**
- Hero section with government branding
- Statistics dashboard with KPI cards
- Featured products and categories
- Market information display

**Props:**
- `user` (Object): Current authenticated user

**Key Functions:**
```javascript
// Load marketplace data from Firebase
const loadHomeData = async () => {
  // Fetches batches, categories, and statistics
}
```

**Usage:**
```jsx
<ECommerceHome user={currentUser} />
```

### FarmerTraceability.jsx
**Purpose:** Farmer dashboard for batch management and tracking

**Features:**
- Batch creation with quality data
- QR code generation and management
- Tracking history visualization
- Batch status monitoring

**Props:**
- `user` (Object): Authenticated farmer user

**State Management:**
```javascript
const [myBatches, setMyBatches] = useState([]);
const [selectedBatch, setSelectedBatch] = useState(null);
const [trackingHistory, setTrackingHistory] = useState([]);
```

**Key Functions:**
```javascript
// Create new wool batch
const handleCreateBatch = async () => {
  // Validates data and creates batch in Firebase
  // Generates QR code for batch
  // Updates local state
}

// Select batch for detailed view
const handleSelectBatch = async (batch) => {
  // Loads tracking history
  // Updates selected batch state
}
```

### ProductCatalog.jsx
**Purpose:** Product browsing and purchasing interface

**Features:**
- Product filtering and search
- Shopping cart integration
- Quality verification
- Responsive product grid

**Props:**
- `user` (Object): Current user for cart operations

**State Management:**
```javascript
const [products, setProducts] = useState([]);
const [cart, setCart] = useState([]);
const [filters, setFilters] = useState({
  search: '',
  category: '',
  minPrice: '',
  maxPrice: '',
  grade: ''
});
```

### TrackingPage.jsx
**Purpose:** Dedicated tracking page similar to logistics systems

**Features:**
- Ekart-style tracking interface
- Progress timeline visualization
- Batch information display
- Interactive tracking history

**Props:**
- Uses `useParams()` to get `batchId` from URL

**Key Features:**
```javascript
// Load tracking data for specific batch
const loadTrackingData = async () => {
  const batchData = await firebaseService.getBatch(batchId);
  const history = await firebaseService.getTrackingHistory(batchId);
  // Process and display tracking information
}
```

### Login.jsx
**Purpose:** User authentication interface

**Features:**
- Email/password authentication
- Role-based login
- Government portal styling
- Password reset functionality

**State Management:**
```javascript
const [formData, setFormData] = useState({
  email: '',
  password: '',
  role: 'farmer'
});
```

## UI Components

### Navbar.jsx
**Purpose:** Main navigation component with KLWB styling

**Features:**
- Two-tier government header
- Role-based navigation menu
- Mobile responsive hamburger menu
- Language toggle (English/Kannada)

**Props:**
- `user` (Object): Current user for role-based menu
- `onLogout` (Function): Logout handler

**Structure:**
```jsx
// Identity bar with government branding
<div className="klwb-identity-bar">
  <div className="klwb-identity-content">
    <span className="klwb-identity-text-kannada">ಕರ್ನಾಟಕ ಸರ್ಕಾರ</span>
    <span className="klwb-identity-text-english">Government of Karnataka</span>
  </div>
</div>

// Navigation bar with menu items
<nav className="klwb-navbar">
  {/* Navigation items based on user role */}
</nav>
```

### BatchQRScanner.jsx
**Purpose:** QR code scanning component for batch verification

**Features:**
- Camera-based QR scanning
- Batch information display
- Error handling for invalid codes
- KLWB styled interface

**Props:**
- `onScanSuccess` (Function): Callback for successful scan
- `onClose` (Function): Modal close handler
- `user` (Object): Current user for permissions

**Key Functions:**
```javascript
// Handle QR code scan result
const handleScanResult = async (result) => {
  try {
    // Decode QR data
    const qrData = JSON.parse(result);
    
    // Verify batch exists
    const batch = await firebaseService.getBatch(qrData.batchId);
    
    // Update tracking if valid
    if (batch) {
      await firebaseService.addTrackingEntry(qrData.batchId, {
        location: 'Scanned Location',
        actor: user.name,
        status: 'SCANNED'
      });
    }
  } catch (error) {
    console.error('Invalid QR code:', error);
  }
}
```

### BatchTrackingMap.jsx
**Purpose:** Interactive map for visualizing batch movement

**Features:**
- Leaflet map integration
- Route visualization with OSRM
- Multiple location markers
- Timeline integration

**Props:**
- `batchId` (String): Batch to track
- `onClose` (Function): Modal close handler

**Map Implementation:**
```javascript
// Generate route between tracking points
const generateRoute = async (locations) => {
  try {
    // Use OSRM for realistic road routing
    const routeResponse = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}`
    );
    const routeData = await routeResponse.json();
    // Process and display route
  } catch (error) {
    // Fallback to straight lines
    console.warn('Routing failed, using direct lines');
  }
}
```

### WoolQualityForm.jsx
**Purpose:** Quality assessment form for inspectors

**Features:**
- Comprehensive quality parameters
- Automatic grade calculation
- Validation and error handling
- KLWB form styling

**Props:**
- `batchId` (String): Batch being assessed
- `onSave` (Function): Save callback

**Quality Parameters:**
```javascript
const qualityParams = {
  micron: 0,           // Fiber diameter
  stapleLength: 0,     // Fiber length
  strength: 'Medium',  // Fiber strength
  color: '',           // Wool color
  moisture: 0,         // Moisture content
  yield: 0,            // Clean wool yield
  crimp: 'Medium',     // Fiber crimp
  elasticity: 'Medium' // Fiber elasticity
};
```

### WoolQualityDetails.jsx
**Purpose:** Display quality information for wool batches

**Features:**
- Quality parameter visualization
- Grade display with color coding
- Inspector information
- Assessment history

**Props:**
- `batch` (Object): Batch with quality data
- `quality` (Object): Quality assessment data

### OrderTrackingSteps.jsx
**Purpose:** Visual progress indicator for order tracking

**Features:**
- Step-by-step progress visualization
- Status-based styling
- Timeline integration
- Responsive design

**Props:**
- `batch` (Object): Batch being tracked
- `trackingHistory` (Array): Array of tracking events

**Step Configuration:**
```javascript
const trackingSteps = [
  { status: 'REGISTERED', title: 'Batch Registered', icon: 'fas fa-clipboard-check' },
  { status: 'IN_TRANSIT', title: 'In Transit', icon: 'fas fa-truck' },
  { status: 'PROCESSING', title: 'Processing', icon: 'fas fa-cogs' },
  { status: 'QUALITY_VERIFIED', title: 'Quality Verified', icon: 'fas fa-certificate' },
  { status: 'DELIVERED', title: 'Delivered', icon: 'fas fa-check-circle' }
];
```

## Service Components

### AuthGuard.jsx
**Purpose:** Route protection based on authentication and roles

**Features:**
- Authentication verification
- Role-based access control
- Redirect to login if unauthorized
- Loading state management

**Props:**
- `user` (Object): Current user
- `allowedRoles` (Array): Roles allowed to access
- `children` (ReactNode): Protected content
- `showLoginPrompt` (Boolean): Show login prompt if not authenticated

**Implementation:**
```javascript
const AuthGuard = ({ user, allowedRoles, children, showLoginPrompt }) => {
  // Check if user is authenticated
  if (!user) {
    return showLoginPrompt ? <LoginPrompt /> : <Navigate to="/login" />;
  }
  
  // Check if user has required role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDenied />;
  }
  
  // Render protected content
  return children;
};
```

### RoleGuard.jsx
**Purpose:** Component-level role-based access control

**Features:**
- Fine-grained permission control
- Multiple role support
- Fallback content rendering
- Integration with AuthGuard

**Props:**
- `user` (Object): Current user
- `allowedRoles` (Array): Allowed roles
- `children` (ReactNode): Protected content
- `fallback` (ReactNode): Content shown if access denied

### ErrorBoundary.jsx
**Purpose:** Error boundary for graceful error handling

**Features:**
- Catches JavaScript errors in component tree
- Displays user-friendly error messages
- Error reporting to console
- Recovery mechanisms

**Implementation:**
```javascript
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Report to error tracking service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### ConnectionStatus.jsx
**Purpose:** Network connectivity monitoring

**Features:**
- Real-time connection status
- Offline mode indicators
- Retry mechanisms
- User notifications

## Context Providers

### LanguageContext.jsx
**Purpose:** Multi-language support for the application

**Features:**
- Language switching (English/Kannada)
- Translation function provider
- Persistent language preference
- RTL support preparation

**Context Value:**
```javascript
const LanguageContext = createContext({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key, // Translation function
  isRTL: false
});
```

**Usage:**
```javascript
const { t, language, setLanguage } = useLanguage();

return (
  <div>
    <h1>{t('welcome_message')}</h1>
    <button onClick={() => setLanguage('kn')}>
      Switch to Kannada
    </button>
  </div>
);
```

### ThemeContext.jsx
**Purpose:** Theme management for KLWB styling

**Features:**
- Government theme enforcement
- Dark/light mode support
- Custom CSS variable management
- Responsive design utilities

**Context Value:**
```javascript
const ThemeContext = createContext({
  theme: 'klwb-government',
  isDarkMode: false,
  toggleDarkMode: () => {},
  colors: {
    primary: '#004B87',
    secondary: '#6C757D',
    success: '#28A745',
    // ... other KLWB colors
  }
});
```

## Component Architecture

### Component Hierarchy
```
App.jsx
├── Navbar.jsx
├── ErrorBoundary.jsx
├── ConnectionStatus.jsx
└── Routes
    ├── ECommerceHome.jsx
    ├── Login.jsx
    ├── Dashboard Components
    │   ├── FarmerTraceability.jsx
    │   ├── ProductCatalog.jsx
    │   └── TrackingPage.jsx
    └── Protected Routes (AuthGuard)
        ├── Marketplace Components
        ├── Quality Components
        └── Admin Components
```

### Data Flow Pattern
```
User Action → Component State → Service Call → Firebase → State Update → UI Render
```

### State Management Strategy
1. **Local State**: Component-specific data (useState)
2. **Context State**: Global app state (useContext)
3. **Server State**: Firebase real-time data
4. **Derived State**: Computed values (useMemo)

### Component Communication
```javascript
// Parent to Child: Props
<ChildComponent data={parentData} onAction={handleAction} />

// Child to Parent: Callbacks
const handleChildAction = (data) => {
  // Update parent state
  setParentState(data);
};

// Sibling Components: Context or Parent State
const SharedContext = createContext();
```

## Styling Guidelines

### KLWB Theme Variables
```css
:root {
  --klwb-primary: #004B87;
  --klwb-primary-light: #1E5A8B;
  --klwb-secondary: #6C757D;
  --klwb-success: #28A745;
  --klwb-warning: #FFA500;
  --klwb-danger: #C62828;
  --klwb-white: #FFFFFF;
  --klwb-light: #F8F9FA;
  --klwb-gray: #6C757D;
  --klwb-gray-light: #E9ECEF;
  --klwb-gray-lighter: #F8F9FA;
}
```

### Component Styling Classes
```css
/* Card Components */
.klwb-detail-card {
  background: var(--klwb-white);
  border-radius: var(--klwb-radius-lg);
  box-shadow: var(--klwb-shadow-sm);
}

.klwb-detail-header {
  background: var(--klwb-light);
  padding: var(--klwb-spacing-md);
  border-bottom: 1px solid var(--klwb-gray-light);
}

/* Button Components */
.klwb-btn-primary {
  background: var(--klwb-primary);
  color: var(--klwb-white);
  border: none;
  padding: var(--klwb-spacing-sm) var(--klwb-spacing-md);
}

/* Form Components */
.klwb-form-control {
  border: 1px solid var(--klwb-gray-light);
  border-radius: var(--klwb-radius-md);
  padding: var(--klwb-spacing-sm);
}
```

### Responsive Design
```css
/* Mobile First Approach */
.component {
  /* Mobile styles */
}

@media (min-width: 768px) {
  .component {
    /* Tablet styles */
  }
}

@media (min-width: 1200px) {
  .component {
    /* Desktop styles */
  }
}
```

### Component Testing

#### Unit Testing Example
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguageProvider } from '../context/LanguageContext';
import BatchQRScanner from '../components/BatchQRScanner';

describe('BatchQRScanner', () => {
  const mockProps = {
    onScanSuccess: jest.fn(),
    onClose: jest.fn(),
    user: { name: 'Test User', role: 'farmer' }
  };
  
  test('renders scanner interface', () => {
    render(
      <LanguageProvider>
        <BatchQRScanner {...mockProps} />
      </LanguageProvider>
    );
    
    expect(screen.getByText('QR Code Scanner')).toBeInTheDocument();
  });
  
  test('calls onClose when close button clicked', () => {
    render(
      <LanguageProvider>
        <BatchQRScanner {...mockProps} />
      </LanguageProvider>
    );
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(mockProps.onClose).toHaveBeenCalled();
  });
});
```

#### Integration Testing
```javascript
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FarmerTraceability from '../pages/FarmerTraceability';
import * as firebaseService from '../services/firebaseService';

// Mock Firebase service
jest.mock('../services/firebaseService');

describe('FarmerTraceability Integration', () => {
  test('loads and displays farmer batches', async () => {
    const mockBatches = [
      { batchId: 'BATCH_1', batchName: 'Test Batch', weight: 50 }
    ];
    
    firebaseService.getFarmerBatches.mockResolvedValue(mockBatches);
    
    render(
      <BrowserRouter>
        <FarmerTraceability user={{ uid: 'farmer_1', role: 'farmer' }} />
      </BrowserRouter>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Test Batch')).toBeInTheDocument();
    });
  });
});
```

---

**Last Updated:** December 2024  
**Version:** 1.0.0