# Brand Consistency Auditor

## Overview
The Brand Consistency Auditor is a feature that helps founders ensure their website adheres to their brand guidelines by automatically analyzing colors and fonts used on their homepage.

## Features
- **Automated Website Crawling**: Uses Puppeteer to visit and analyze any website
- **Color Palette Audit**: Identifies all colors used and compares them against approved brand colors
- **Typography Audit**: Detects all font families and checks them against approved brand fonts
- **Consistency Score**: Calculates a percentage score based on brand compliance
- **Visual Report**: Displays results with color swatches and font badges

## Technical Implementation

### Backend (Node.js)
- **Endpoint**: `POST /api/audits/consistency`
- **Technology**: Puppeteer for headless browser automation
- **Process**:
  1. Launches headless Chrome browser
  2. Navigates to the provided URL
  3. Executes JavaScript to extract computed styles
  4. Compares found colors/fonts against brand guidelines
  5. Returns structured JSON with results

### Frontend (React)
- **Component**: `BrandConsistencyAuditor.js`
- **Features**:
  - URL input with validation
  - Loading state with progress indication
  - Visual display of approved/unapproved colors and fonts
  - Consistency score display
  - Brand guidelines reference

## API Request/Response

### Request
```json
{
  "url": "https://example.com",
  "brand_identity_id": 1
}
```

### Response
```json
{
  "auditUrl": "https://example.com",
  "results": {
    "colors": {
      "approved": ["#4f46e5"],
      "unapproved": ["#ff0000", "#333333"]
    },
    "fonts": {
      "approved": ["Inter"],
      "unapproved": ["Arial", "Times New Roman"]
    }
  },
  "score": 85,
  "brandIdentity": {
    "name": "Company Name",
    "approvedColors": ["#4f46e5", "#06b6d4"],
    "approvedFonts": ["inter", "system-ui"]
  }
}
```

## Future Enhancements
- Support for multiple pages analysis
- Detailed color usage statistics (e.g., percentage of page using each color)
- Export functionality for audit reports
- Historical tracking of brand consistency over time
- Integration with design systems and style guides
- Support for more brand elements (logos, spacing, etc.)