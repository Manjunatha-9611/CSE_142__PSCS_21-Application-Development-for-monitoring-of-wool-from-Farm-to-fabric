# AI Wool Quality Assurance Module Setup

## Overview
The AI Wool Quality Assurance Module integrates machine learning capabilities to automatically analyze wool quality from images, generate certificates, and maintain records.

## Features Implemented
- ✅ Image upload & camera capture
- ✅ AI-powered quality analysis using Hugging Face
- ✅ Real-time quality scoring (0-100%)
- ✅ Automatic certificate generation (PDF)
- ✅ Firebase storage for images and records
- ✅ Cross-platform responsive design
- ✅ Role-based access control

## Setup Instructions

### 1. Install Dependencies
```bash
npm install html2canvas jspdf
```

### 2. Hugging Face API Setup
1. Create account at https://huggingface.co/
2. Generate API token from Settings > Access Tokens
3. Add to `.env` file:
```
REACT_APP_HUGGING_FACE_TOKEN=your_token_here
```

### 3. Firebase Storage Rules
Update Firebase Storage rules:
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /wool-images/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 4. Firebase Database Rules
Update Realtime Database rules:
```json
{
  "rules": {
    "quality-records": {
      "$recordId": {
        ".read": "auth != null",
        ".write": "auth != null && auth.uid == data.child('userId').val()"
      }
    }
  }
}
```

## Usage

### For Farmers/Users:
1. Navigate to Quality Assurance page
2. Click "AI Quality Analysis" tab
3. Capture image or upload wool photo
4. Click "Analyze Quality" 
5. View results and download certificate

### For Assessors/Government:
- Access all quality records
- Filter and export reports
- View analysis history

## AI Model Details
- **Model**: google/vit-base-patch16-224 (Vision Transformer)
- **Fallback**: Mock analysis for demo purposes
- **Score Calculation**: AI confidence mapped to 0-100% quality score
- **Categories**: 
  - High Quality (>75%)
  - Medium Quality (40-75%)
  - Low Quality (<40%)

## Security Features
- User authentication required
- Images linked to authenticated users
- Secure certificate generation
- Role-based data access

## Mobile Support
- Camera access on mobile devices
- Responsive design for all screen sizes
- Touch-friendly interface
- Progressive Web App ready

## Troubleshooting

### Camera Access Issues
- Ensure HTTPS in production
- Grant camera permissions
- Use file upload as fallback

### AI Analysis Fails
- Check Hugging Face API token
- Verify internet connection
- Falls back to mock analysis

### Certificate Download Issues
- Check browser popup blockers
- Ensure PDF generation completes
- Try different browser

## Future Enhancements
- Offline analysis capability
- Custom AI model training
- Batch processing
- Advanced analytics dashboard
- Blockchain certificate verification