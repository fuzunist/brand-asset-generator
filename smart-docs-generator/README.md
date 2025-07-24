# Smart Proposal & Contract Template Generator

Professional .docx document generator for business proposals and service contracts with brand customization.

## 🚀 Features

- **Two Essential Templates**:
  - Sales Proposal (Satış Teklifi)
  - Simple Service Agreement (Basit Hizmet Sözleşmesi)

- **Brand Customization**:
  - Company logo in header
  - Brand colors for headings
  - Company information in footer
  - Professional styling

- **Native .docx Output**:
  - Clean, editable Word documents
  - Compatible with MS Word, Google Docs, Apple Pages
  - Professional formatting preserved

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## 🛠️ Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd smart-docs-generator
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

## 🚀 Running the Application

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The application will start on `http://localhost:3000`

## 📖 API Documentation

### Endpoints

#### 1. Generate Document
- **POST** `/api/documents/generate`
- **Content-Type**: `application/json`

**Request Body:**
```json
{
  "templateType": "proposal",
  "formData": {
    "clientName": "ABC Corp",
    "projectName": "New Website Development",
    "projectScope": "Complete website redesign...",
    "totalPrice": 25000,
    "date": "2024-01-15"
  }
}
```

For contracts, additional fields are required:
```json
{
  "startDate": "2024-01-15",
  "endDate": "2024-03-15"
}
```

**Response:**
- Binary .docx file with appropriate headers
- Content-Type: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

#### 2. List Templates
- **GET** `/api/documents/templates`

**Response:**
```json
{
  "templates": [
    {
      "id": "proposal",
      "name": "Satış Teklifi",
      "description": "Profesyonel satış teklifi şablonu",
      "requiredFields": ["clientName", "projectName", "projectScope", "totalPrice", "date"]
    },
    {
      "id": "contract",
      "name": "Basit Hizmet Sözleşmesi",
      "description": "Temel hizmet sözleşmesi şablonu",
      "requiredFields": ["clientName", "projectName", "projectScope", "totalPrice", "date", "startDate", "endDate"]
    }
  ]
}
```

## 🏗️ Project Structure

```
smart-docs-generator/
├── api/
│   ├── server.js           # Express server
│   ├── routes/
│   │   └── documents.js    # Document generation routes
│   ├── controllers/
│   │   └── documentController.js
│   ├── services/
│   │   ├── proposalGenerator.js
│   │   ├── contractGenerator.js
│   │   └── userService.js
│   └── middleware/
│       └── validation.js
├── frontend/
│   ├── index.html          # UI interface
│   ├── app.js             # Frontend JavaScript
│   └── styles.css         # Custom styles
├── utils/
│   └── imageProcessor.js   # Logo processing utility
├── package.json
├── .env
└── README.md
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `AWS_REGION` | AWS region for S3 | `eu-central-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | - |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | - |
| `S3_BUCKET_NAME` | S3 bucket for logos | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3001,http://localhost:3000` |

## 🧪 Testing

### Manual Testing Steps:

1. Start the server: `npm run dev`
2. Open browser: `http://localhost:3000`
3. Select a template (Proposal or Contract)
4. Fill in the form with test data
5. Click "Generate Document"
6. Verify the downloaded .docx file

### Test Data Example:
- **Client Name**: ABC Teknoloji Ltd. Şti.
- **Project Name**: Kurumsal Web Sitesi Geliştirme
- **Project Scope**: Modern, responsive bir kurumsal web sitesi tasarımı ve geliştirmesi
- **Total Price**: 25000
- **Date**: Today's date

## 🚢 Deployment

### For Serverless (AWS Lambda, Vercel):

1. Install serverless dependencies
2. Configure serverless.yml
3. Deploy: `serverless deploy`

### For Traditional Hosting:

1. Install PM2: `npm install -g pm2`
2. Start with PM2: `pm2 start api/server.js --name smart-docs`
3. Save PM2 config: `pm2 save`
4. Setup startup script: `pm2 startup`

## 📝 Definition of Done (MVP Checklist)

- [x] User can choose between "Proposal" and "Contract" templates
- [x] Form displays to collect client/project data
- [x] Download button triggers document generation
- [x] Downloaded Word document contains brand logo in header
- [x] Document contains brand contact info in footer
- [x] Document headings styled with brand colors
- [x] User form data correctly placed in document
- [x] Document opens without errors in Word processors
- [x] Backend handles errors gracefully

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 👥 Support

For support, email support@techstart.com or create an issue in the repository.