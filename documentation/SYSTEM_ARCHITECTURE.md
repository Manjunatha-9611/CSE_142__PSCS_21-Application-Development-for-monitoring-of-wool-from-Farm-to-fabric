# 🏗️ Wool Monitoring System - Model Architecture

## 📊 System Overview Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WOOL MONITORING SYSTEM                       │
│                     (Farm to Fabric)                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  React.js Frontend (SPA)                                       │
│  ├── Role-Based Dashboards                                     │
│  ├── Responsive UI Components                                  │
│  ├── Real-time Data Visualization                              │
│  └── Progressive Web App Features                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  Core Services & APIs                                          │
│  ├── Authentication Service                                    │
│  ├── Blockchain Service                                        │
│  ├── AI Quality Analysis Service                               │
│  ├── Market Data Service                                       │
│  ├── QR Code Service                                          │
│  └── Real-time Database Service                               │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DATA PERSISTENCE LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  Firebase Realtime Database                                    │
│  ├── User Profiles & Authentication                            │
│  ├── Blockchain Records                                        │
│  ├── Quality Assessment Data                                   │
│  ├── Market Information                                        │
│  └── Storage & Processing Records                              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL INTEGRATIONS                       │
├─────────────────────────────────────────────────────────────────┤
│  Third-Party APIs & Services                                   │
│  ├── Hugging Face AI Models                                    │
│  ├── News APIs (NewsAPI, Guardian)                             │
│  ├── Market Data APIs                                          │
│  └── Geolocation Services                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔗 Detailed Traceability Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    BLOCKCHAIN TRACEABILITY                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                ┌───────────────┼───────────────┐
                ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │   WOOL BATCH    │ │    MOVEMENT     │ │ QUALITY CHECK   │
    │   CREATION      │ │    TRACKING     │ │   RECORDING     │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
                │               │               │
                ▼               ▼               ▼
    ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
    │ Block Creation  │ │ Location Update │ │ Grade Assignment│
    │ SHA-256 Hash    │ │ GPS Coordinates │ │ Certificate Gen │
    │ Proof of Work   │ │ Actor Recording │ │ Inspector Notes │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
                │               │               │
                └───────────────┼───────────────┘
                                ▼
            ┌─────────────────────────────────────────┐
            │         IMMUTABLE BLOCKCHAIN            │
            │                                         │
            │  Block 0 → Block 1 → Block 2 → Block N │
            │     │        │        │        │       │
            │   Genesis   Batch   Movement  Quality   │
            │   Block    Created   Tracked  Checked   │
            └─────────────────────────────────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────────┐
            │         DATA FLOW TRACKING              │
            │                                         │
            │  Farm → Processing → Storage → Market   │
            │   │         │          │         │     │
            │  QR Code   QR Code    QR Code   QR Code │
            │  Scan      Scan       Scan      Scan    │
            └─────────────────────────────────────────┘
```

### Traceability Data Flow:
1. **Farmer** registers wool batch → Creates blockchain block
2. **Transporter** scans QR → Records movement on blockchain  
3. **Processor** receives wool → Updates processing status
4. **Quality Assessor** inspects → Adds quality grade to blockchain
5. **Government** monitors → Views complete audit trail

---

## 🔬 AI Quality Assessment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI QUALITY ANALYSIS PIPELINE                │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────────┐
            │         IMAGE CAPTURE MODULE            │
            │                                         │
            │  Camera → Image Processing → Validation │
            │     │           │              │        │
            │  WebRTC    Compression    Format Check  │
            └─────────────────────────────────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────────┐
            │         AI MODEL PIPELINE               │
            │                                         │
            │  Primary: ResNet-50 (Microsoft)         │
            │     ↓                                   │
            │  Backup: ViT-Base (Google)              │
            │     ↓                                   │
            │  Tertiary: ConvNeXt (Facebook)          │
            │     ↓                                   │
            │  Fallback: Mock Analysis                │
            └─────────────────────────────────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────────┐
            │         QUALITY SCORING ENGINE          │
            │                                         │
            │  Fiber Analysis → Quality Score (0-100) │
            │       │               │                 │
            │  Contamination    Grade Classification  │
            │  Detection        (Premium/High/Medium) │
            │       │               │                 │
            │  Color Analysis   Certificate Generation│
            └─────────────────────────────────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────────┐
            │         RESULT STORAGE & SHARING        │
            │                                         │
            │  Firebase DB → Blockchain → QR Code     │
            │      │            │           │         │
            │  Real-time    Immutable   Shareable     │
            │  Sync         Record      Certificate   │
            └─────────────────────────────────────────┘
```

### AI Analysis Flow:
1. **Image Capture** → Camera/Upload interface
2. **Pre-processing** → Image validation and compression
3. **AI Analysis** → Multiple model inference with fallback
4. **Quality Scoring** → Algorithmic quality assessment
5. **Certificate Generation** → PDF certificate with QR code
6. **Blockchain Recording** → Immutable quality record

---

## 📈 Market Information Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    MARKET DATA ECOSYSTEM                       │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   PRICE DATA    │ │   NEWS FEEDS    │ │  ANALYTICS      │
│   COLLECTION    │ │   AGGREGATION   │ │  PROCESSING     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Historical CSV  │ │ NewsAPI         │ │ Trend Analysis  │
│ Alpha Vantage   │ │ Guardian API    │ │ Price Forecasts │
│ CoinGecko API   │ │ WorldNews API   │ │ Market Signals  │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
            ┌─────────────────────────────────────────┐
            │         DATA PROCESSING ENGINE          │
            │                                         │
            │  Price Normalization → Chart Generation │
            │         │                    │          │
            │  Trend Detection      Visualization     │
            │         │                    │          │
            │  Market Analysis      Real-time Updates │
            └─────────────────────────────────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────────┐
            │         USER INTERFACE LAYER            │
            │                                         │
            │  Interactive Charts → Price Alerts      │
            │         │                    │          │
            │  News Timeline        Market Dashboard  │
            │         │                    │          │
            │  Government Schemes   Trading Platform  │
            └─────────────────────────────────────────┘
```

### Market Data Flow:
1. **Data Collection** → Multiple API sources with fallbacks
2. **Processing** → Normalization, trend analysis, forecasting
3. **Visualization** → Interactive charts and dashboards
4. **Real-time Updates** → Live price feeds and news
5. **User Personalization** → Role-based market insights

---

## 🛒 Marketplace Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WOOL MARKETPLACE PLATFORM                   │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│   SELLER SIDE   │ │   PLATFORM      │ │   BUYER SIDE    │
│   (FARMERS)     │ │   MANAGEMENT    │ │   (TRADERS)     │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Batch Listing   │ │ Order Matching  │ │ Browse & Search │
│ Price Setting   │ │ Quality Verify  │ │ Quality Review  │
│ Quality Certs   │ │ Transaction Log │ │ Purchase Orders │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
            ┌─────────────────────────────────────────┐
            │         TRANSACTION PROCESSING          │
            │                                         │
            │  Order Creation → Quality Verification  │
            │         │                    │          │
            │  Price Negotiation    Blockchain Record │
            │         │                    │          │
            │  Payment Processing   Delivery Tracking │
            └─────────────────────────────────────────┘
                                │
                                ▼
            ┌─────────────────────────────────────────┐
            │         TRUST & VERIFICATION            │
            │                                         │
            │  Quality Certificates → Farmer Ratings  │
            │         │                    │          │
            │  Blockchain Proof     Transaction History│
            │         │                    │          │
            │  Government Oversight  Dispute Resolution│
            └─────────────────────────────────────────┘
```

### Marketplace Flow:
1. **Listing Creation** → Farmers list wool batches with quality certificates
2. **Discovery** → Buyers search and filter by quality, location, price
3. **Verification** → Blockchain-verified quality and authenticity
4. **Transaction** → Secure order processing with escrow
5. **Delivery Tracking** → Real-time shipment monitoring
6. **Completion** → Rating system and payment release

---

## 🔐 Security & Access Control Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                       │
└─────────────────────────────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ AUTHENTICATION  │ │ AUTHORIZATION   │ │ DATA SECURITY   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ Firebase Auth   │ │ Role-Based      │ │ Blockchain      │
│ Email/Password  │ │ Access Control  │ │ Immutability    │
│ Session Mgmt    │ │ (RBAC)          │ │ SHA-256 Hash    │
└─────────────────┘ └─────────────────┘ └─────────────────┘

Role Permissions Matrix:
┌─────────────┬─────────┬─────────┬─────────┬─────────────┐
│    Role     │ Farmer  │ Buyer   │Assessor │ Government  │
├─────────────┼─────────┼─────────┼─────────┼─────────────┤
│ Create Batch│   ✓     │    ✗    │    ✗    │      ✗      │
│ View Own    │   ✓     │    ✓    │    ✓    │      ✓      │
│ View All    │   ✗     │    ✗    │    ✗    │      ✓      │
│ Quality Test│   ✗     │    ✗    │    ✓    │      ✗      │
│ Market Trade│   ✓     │    ✓    │    ✗    │      ✗      │
│ Analytics   │   ✗     │    ✗    │    ✗    │      ✓      │
└─────────────┴─────────┴─────────┴─────────┴─────────────┘
```

---

## 📱 Technology Stack Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    TECHNOLOGY STACK                            │
└─────────────────────────────────────────────────────────────────┘

Frontend Layer:
├── React.js 18 (Functional Components + Hooks)
├── React Router DOM v6 (SPA Navigation)
├── Bootstrap 5 (Responsive UI Framework)
├── Chart.js (Data Visualization)
├── Leaflet Maps (Geographic Tracking)
├── QR Code Libraries (react-qr-code, qrcode)
└── Font Awesome 6 (Icons)

Backend Services:
├── Firebase Authentication (User Management)
├── Firebase Realtime Database (Data Storage)
├── Blockchain Implementation (Custom SHA-256)
├── AI/ML Services (Hugging Face APIs)
├── External APIs (News, Market Data)
└── Real-time WebSocket Connections

Development Tools:
├── Create React App (Build System)
├── ESLint + Prettier (Code Quality)
├── Git Version Control
├── Environment Variables (.env)
└── Hot Module Replacement (HMR)

Deployment Architecture:
├── Static Hosting (Netlify/Vercel Ready)
├── CDN Distribution
├── Progressive Web App (PWA)
├── Mobile Responsive Design
└── Cross-browser Compatibility
```

---

## 📊 Data Flow Diagram

```
User Authentication
        │
        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Dashboard     │───▶│   Traceability  │───▶│ Quality Assess  │
│   (Overview)    │    │   (Blockchain)  │    │ (AI Analysis)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Marketplace   │    │   Market Info   │    │ Storage Mgmt    │
│   (Trading)     │    │   (Analytics)   │    │ (Processing)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
        │                       │                       │
        └───────────────────────┼───────────────────────┘
                                ▼
            ┌─────────────────────────────────────────┐
            │         FIREBASE REALTIME DB            │
            │                                         │
            │  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
            │  │ Users   │ │Blockchain│ │Quality  │   │
            │  │ Batches │ │Movement │ │Records  │   │
            │  │ Market  │ │Storage  │ │Analytics│   │
            │  └─────────┘ └─────────┘ └─────────┘   │
            └─────────────────────────────────────────┘
```

This architecture provides a comprehensive view of your wool monitoring system for presentation purposes, showing the complete data flow, security model, and technology integration.