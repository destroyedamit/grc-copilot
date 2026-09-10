# 🛡️ GRC Copilot

### AI-Powered Compliance & Risk Management Platform

GRC Copilot is a full-stack Governance, Risk, and Compliance (GRC) platform designed to simplify compliance management, evidence review, risk assessment, RFI tracking, and AI-assisted compliance analysis.

The platform combines a React frontend, Python/FastAPI backend, SQLite database, and LLaMA-powered AI services to provide a centralized compliance workflow.

---

## 🚀 Key Features

### 📋 Control Management
- Create and manage compliance controls
- Track control status and framework requirements
- Monitor evidence coverage
- Identify controls requiring attention

### 📁 Evidence Management
- Upload and manage compliance evidence
- Associate evidence with specific controls
- Track evidence status
- Perform AI-assisted evidence analysis

### 🤖 AI Compliance Review
- Analyze uploaded evidence using LLaMA
- Evaluate evidence coverage
- Identify missing requirements
- Generate compliance summaries
- Provide AI recommendations
- Highlight potential compliance gaps

### 📝 RFI Management
- Create and track Requests for Information (RFIs)
- Associate RFIs with compliance controls
- Track RFI priority and status
- Monitor pending evidence requests

### ⚠️ Risk Assessment
- Create and manage compliance risks
- Track likelihood and impact
- Calculate risk scores
- Classify risks by severity
- Link risks with related RFIs

### 🧠 AI Compliance Assistant
- Ask compliance-related questions
- Get AI-assisted analysis
- Use application data as context
- Support compliance decision-making

### 📊 Reports & Dashboard
- Compliance overview
- Control statistics
- Evidence tracking
- Risk metrics
- RFI monitoring
- Visual dashboards

---

## 🏗️ Application Architecture

```text
                    ┌─────────────────────┐
                    │    React Frontend   │
                    │                     │
                    │ Dashboard           │
                    │ Controls            │
                    │ Evidence            │
                    │ Risks               │
                    │ RFIs                │
                    │ AI Assistant        │
                    │ AI Review           │
                    │ Reports             │
                    └──────────┬──────────┘
                               │
                         REST API
                               │
                    ┌──────────▼──────────┐
                    │   FastAPI Backend   │
                    │                     │
                    │ Controls Router     │
                    │ Evidence Router     │
                    │ RFI Router         │
                    │ Risk Router        │
                    │ AI Services        │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │    SQLite Database  │
                    │                     │
                    │ Controls            │
                    │ Evidence            │
                    │ RFIs                │
                    │ Risks               │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   LLaMA AI Service  │
                    │                     │
                    │ Evidence Analysis   │
                    │ Compliance Review   │
                    │ AI Recommendations  │
                    └─────────────────────┘


🛠️ Tech Stack
    Frontend
        React
        JavaScript
        CSS
        Vite
    Backend
        Python
        FastAPI
        REST APIs
    Database
        SQLite
    AI
        LLaMA
        Generative AI

Development Tools
    Git
    GitHub
    Postman
    VS Code


Project Structure

ai-grc-assistant/
│
├── backend/
│   └── app/
│       ├── models/
│       │   ├── control.py
│       │   ├── evidence.py
│       │   ├── rfi.py
│       │   └── risk.py
│       │
│       ├── routers/
│       │   ├── controls.py
│       │   ├── evidence.py
│       │   ├── rfi.py
│       │   └── risk.py
│       │
│       ├── services/
│       │   └── ai_service.py
│       │
│       ├── database.py
│       └── main.py
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── AIAssistant.jsx
│   │   │   ├── AIReview.jsx
│   │   │   ├── Controls.jsx
│   │   │   ├── Evidence.jsx
│   │   │   ├── RFIManagement.jsx
│   │   │   ├── RiskAssessments.jsx
│   │   │   ├── Reports.jsx
│   │   │   └── Settings.jsx
│   │   │
│   │   ├── App.jsx
│   │   └── App.css
│   │
│   ├── package.json
│   └── vite.config.js
│
└── .gitignore


AI Review Workflow

    Upload Evidence
       ↓
    Extract Evidence Content
       ↓
    Send Context to LLaMA
       ↓
    AI Compliance Analysis
       ↓
    Coverage / Risk / Findings
       ↓
    AI Recommendation


Core Modules

| Module           | Purpose                          |
| ---------------- | -------------------------------- |
| Dashboard        | Overall compliance overview      |
| Controls         | Manage compliance controls       |
| Evidence         | Manage supporting evidence       |
| AI Review        | AI-assisted evidence assessment  |
| RFI Management   | Track information requests       |
| Risk Assessments | Identify and assess risks        |
| AI Assistant     | AI-powered compliance assistance |
| Reports          | Compliance reporting             |
| Settings         | Application configuration        |


🔌 API Endpoints

Controls
GET /api/controls/

Evidence
GET /api/evidence/
POST /api/evidence/{id}/analyze

RFI
GET /api/rfi/

Risks
GET /api/risks/


🔐 Security & Privacy

The project is designed as a local development application.

Sensitive configuration should be stored in environment variables.
Local databases and uploaded evidence files are excluded from Git.
API-based architecture separates frontend and backend responsibilities.
AI analysis can be performed using a local LLaMA-based service.


📸 Screenshots

Screenshots of the application will be added here.

Suggested screenshots:

Dashboard
Controls
Evidence Management
AI Review
RFI Management
Risk Assessments
AI Assistant


🚧 Current Development Status
Completed
React-based frontend
FastAPI backend
SQLite database
Control management
Evidence management
RFI management
Risk assessment module
AI evidence analysis workflow
LLaMA integration
AI Review interface
REST API integration
In Progress
End-to-end RFI generation workflow
RFI-to-Risk workflow integration
Real-time dashboard metrics
Database-aware AI Compliance Assistant
Complete compliance workflow automation


🔮 Future Enhancements
Advanced AI compliance copilot
Automated RFI generation
Automated risk scoring
Evidence gap detection
Compliance trend analytics
Role-based access control
Authentication and authorization
Cloud deployment
Support for additional compliance frameworks
Automated compliance reporting


👨‍💻 Author

Amit Kumar

Software Engineer | Python | React | React Native | FastAPI | TypeScript | GenAI

LinkedIn: https://www.linkedin.com/in/amitapk111/
GitHub: https://github.com/destroyedamit