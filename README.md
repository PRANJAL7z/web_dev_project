# CrimeSense Management System - Complete Documentation

## Project Overview

**CrimeSense** is a comprehensive police station management system with AI-powered crime analysis, prediction, and visualization capabilities. Built with Flask (Python) backend and vanilla JavaScript frontend, it provides digital workflows for FIR management, criminal records, evidence tracking, and predictive crime hotspot analysis.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Database Schema](#database-schema)
3. [Features & Operations](#features--operations)
4. [API Endpoints](#api-endpoints)
5. [Machine Learning Models](#machine-learning-models)
6. [Frontend Components](#frontend-components)
7. [Installation & Setup](#installation--setup)
8. [Usage Guide](#usage-guide)
9. [File Structure](#file-structure)
10. [Technical Implementation](#technical-implementation)

---

## System Architecture

### Technology Stack
- **Backend**: Flask (Python 3.7+)
- **Database**: SQLite3
- **ML Libraries**: scikit-learn, numpy
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Visualization**: HTML5 Canvas (no external chart libraries)

### Core Components
1. **Flask Application** (`app.py`) - REST API server
2. **ML Models** (`ml_models/`) - Crime analysis and prediction
3. **Database** (`police_station.db`) - SQLite database
4. **Frontend** (`templates/`, `static/`) - Web interface
5. **Data Population Scripts** - Database seeding utilities

---

## Database Schema

### Tables Overview

The system uses 6 main tables:

#### 1. FIRs Table
```sql
CREATE TABLE firs (
    id TEXT PRIMARY KEY,              -- Format: FIR001, FIR002, etc.
    name TEXT NOT NULL,               -- Complainant name
    type TEXT NOT NULL,               -- Crime type (Theft, Assault, Fraud, etc.)
    date TEXT NOT NULL,               -- Date in DD/MM/YYYY format
    status TEXT NOT NULL,             -- Registered, Under Investigation, Closed
    description TEXT NOT NULL,        -- Detailed incident description
    score REAL NOT NULL               -- AI-calculated importance score (0.0-1.0)
)
```

#### 2. Criminals Table
```sql
CREATE TABLE criminals (
    id TEXT PRIMARY KEY,              -- Format: CR001, CR002, etc.
    name TEXT NOT NULL,               -- Criminal name
    crime_type TEXT NOT NULL,         -- Type of crime committed
    date_recorded TEXT NOT NULL,      -- Date recorded (DD/MM/YYYY)
    status TEXT NOT NULL,             -- Registered, Under Investigation, Closed
    risk_level TEXT NOT NULL,         -- Low, Medium, High
    details TEXT                      -- Additional information
)
```

#### 3. Documents Table
```sql
CREATE TABLE documents (
    id TEXT PRIMARY KEY,              -- Format: DOC001, DOC002, etc.
    document_name TEXT NOT NULL,      -- Name of the document
    document_type TEXT NOT NULL,      -- Type (Witness Statement, Medical Report, etc.)
    linked_person TEXT NOT NULL,      -- Person linked to (from FIRs)
    fir_id TEXT,                      -- Optional FIR reference
    date_added TEXT NOT NULL,         -- Date added (DD/MM/YYYY)
    status TEXT NOT NULL,             -- Active, Archived, Under Review
    description TEXT                  -- Document description
)
```

#### 4. Reports Table
```sql
CREATE TABLE reports (
    id TEXT PRIMARY KEY,              -- Format: RPT001, RPT002, etc.
    officer_name TEXT NOT NULL,       -- Reporting officer name
    incident_type TEXT NOT NULL,      -- Type of incident
    date TEXT NOT NULL,               -- Date (DD/MM/YYYY)
    status TEXT NOT NULL,             -- Pending, Under Review, Resolved
    description TEXT NOT NULL         -- Report description
)
```

#### 5. Officers Table
```sql
CREATE TABLE officers (
    id TEXT PRIMARY KEY,              -- Format: IPS2024001, etc.
    name TEXT NOT NULL,               -- Officer name
    rank TEXT NOT NULL,               -- Inspector, Sub-Inspector, Constable, etc.
    status TEXT NOT NULL,             -- Active, On Leave
    department TEXT                   -- Investigation, Patrol, Traffic
)
```

#### 6. Evidence Table
```sql
CREATE TABLE evidence (
    id TEXT PRIMARY KEY,              -- Format: EV001, EV002, etc.
    fir_id TEXT NOT NULL,             -- Linked FIR ID
    evidence_type TEXT NOT NULL,      -- Document, Image, Video, Audio
    description TEXT NOT NULL,        -- Evidence description
    collected_by TEXT NOT NULL,       -- Officer who collected
    date_collected TEXT NOT NULL,     -- Collection date (DD/MM/YYYY)
    status TEXT NOT NULL              -- Collected, Under Analysis, Verified
)
```

---

## Features & Operations

### 1. FIR Management


**Operations:**
- **Register New FIR**: Create FIR with complainant name, crime type, and description
- **View All FIRs**: Display all FIRs sorted by importance score (descending)
- **Search FIRs**: Real-time search by name, type, or ID
- **Filter FIRs**: Filter by status (Registered, Under Investigation, Closed) and crime type
- **AI Scoring**: Automatic importance score calculation using sentiment analysis

**Technical Flow:**
1. User fills FIR form (complainant name, crime type, description)
2. Frontend sends POST to `/api/firs`
3. Backend generates unique ID (FIR001, FIR002, etc.)
4. Sentiment analyzer calculates importance score (0.0-1.0)
5. FIR saved to database with `conn.commit()`
6. Complete FIR object returned to frontend
7. Frontend automatically refreshes list using `fetchFIRs()`
8. New FIR appears instantly and is searchable

**Importance Score Calculation:**
- Analyzes description text for urgency keywords
- High priority: "urgent", "critical", "emergency", "immediate", "serious"
- Medium priority: "assault", "injured", "weapon", "violence"
- Low priority: "routine", "minor", "small"
- Score range: 0.1 (low) to 0.9 (high)

### 2. Criminal Records Management

**Operations:**
- **Add Criminal Record**: Create new criminal entry with initial status "Registered"
- **Edit Criminal Status**: Update status (Registered → Under Investigation → Closed)
- **View All Criminals**: Display all criminal records
- **Search Criminals**: Real-time search by name, crime type, or ID
- **Filter Criminals**: Filter by status and crime type
- **Risk Level Assessment**: Categorize as Low, Medium, or High risk


**Technical Flow - Add Criminal:**
1. User fills criminal form (name, crime type, risk level, details)
2. Frontend sends POST to `/api/criminals` with status="Registered"
3. Backend generates unique ID (CR001, CR002, etc.)
4. Criminal saved to database
5. Frontend refreshes list automatically
6. New criminal appears with "Registered" status

**Technical Flow - Edit Status:**
1. User clicks edit button (pencil icon) next to criminal
2. JavaScript prompts for new status
3. Validates status (must be: Registered, Under Investigation, or Closed)
4. Frontend sends PUT to `/api/criminals/<id>` with new status
5. Backend updates database: `UPDATE criminals SET status = ? WHERE id = ?`
6. Database commits change
7. Frontend refreshes list
8. Updated status appears immediately

**Status Workflow:**
```
Add Criminal → Status: "Registered"
     ↓
Click Edit → Change to: "Under Investigation"
     ↓
Click Edit → Change to: "Closed"
```

### 3. Documents Management

**Operations:**
- **View Documents**: Display all 25 documents
- **Search Documents**: Search by name, person, or FIR ID
- **Filter by Type**: 10 document types available
- **Filter by Status**: Active, Archived, Under Review
- **Link to FIRs**: Documents linked to people from FIR records

**Document Types:**
1. Witness Statement
2. Medical Report
3. Legal Notice
4. Court Order
5. Investigation Report
6. Forensic Report
7. Property Document
8. Identity Proof
9. Bank Statement
10. Insurance Claim


**Technical Implementation:**
- 25 fake documents generated by `populate_documents.py`
- Documents linked to actual names from FIR records (not all names)
- 80% of documents have FIR ID links
- Search filters work in real-time using JavaScript
- No page refresh needed for filtering

### 4. Crime Hotspot Analysis & Prediction

**Operations:**
- **Linear Regression Analysis**: Scatter plot showing crime count vs score
- **City Crime Rankings**: Bar graph of all cities by crime score
- **Trend Predictions**: 3-month future crime trend forecasts
- **Officer Distribution**: Automatic officer allocation by crime severity
- **City Rankings**: Ranked list with current and predicted scores

**Technical Flow - Crime Analysis:**
1. Backend extracts location data from FIR descriptions
2. Groups crimes by city/region
3. Calculates average crime score per city
4. Performs linear regression (crime count vs score)
5. Predicts future trends using formula: `predicted_score = current_score × (1 + current_score × 0.05 × month)`
6. Distributes officers proportionally to crime scores
7. Returns complete analysis report as JSON
8. Frontend renders 4 visualizations

**Regression Graph Details:**
- **X-axis**: Number of crimes per city
- **Y-axis**: Average crime score (0.0-1.0)
- **Data Points**: Each city shown as colored dot
  - 🟢 Green: Low danger (score 0.0-0.33)
  - 🟡 Yellow: Medium danger (score 0.34-0.66)
  - 🔴 Red: High danger (score 0.67-1.0)
- **Regression Line**: Black line showing prediction trend
- **Labels**: City name and score on each point
- **Model Info**: Equation (y = mx + b) and R² score displayed


**Bar Graph Details:**
- Shows all cities ranked by average crime score
- Color intensity based on severity (red = high, blue = low)
- City names displayed at 45° angle
- Score values shown above each bar

**Trend Prediction Chart:**
- Line graph for top 5 cities
- Shows: Current → Month +1 → Month +2 → Month +3
- Color-coded lines per city
- Predicts crime trajectory over time

**Officer Distribution Algorithm:**
```python
officers_for_city = (city_total_score / total_all_scores) × total_officers
# Ensures minimum 1 officer per city with crimes
```

### 5. Evidence Management

**Operations:**
- **View Evidence**: Display all evidence items
- **Filter by Type**: Document, Image, Video, Audio
- **Link to FIRs**: Each evidence linked to specific FIR
- **Track Chain of Custody**: Collected by, date, status
- **Evidence Stats**: Count by type displayed

**Technical Implementation:**
- Evidence grid shows first 6 items
- Document-focused (100 evidence items, mostly documents)
- Status tracking: Collected, Under Analysis, Verified, In Storage

### 6. Officer Management

**Operations:**
- **View Officers**: Display all 15 officers
- **Filter by Status**: Active, On Leave
- **Filter by Department**: Investigation, Patrol, Traffic
- **View Toggle**: Grid or Table view
- **Officer Stats**: Count by status

**Officer Ranks (Indian Police):**
- Inspector
- Sub-Inspector
- Assistant Sub-Inspector
- Head Constable
- Constable


### 7. Reports & Complaints

**Operations:**
- **Submit Report**: Officers can submit incident reports
- **View Reports**: Display all reports
- **Filter by Status**: Pending, Under Review, Resolved
- **Track Progress**: Real-time status updates

---

## API Endpoints

### FIR Endpoints

**GET `/api/firs`**
- Returns: Array of all FIRs sorted by score (descending)
- Response format:
```json
[
  {
    "id": "FIR001",
    "name": "John Doe",
    "type": "Theft",
    "date": "13/11/2025",
    "status": "Registered",
    "description": "Mobile phone theft...",
    "score": 0.65
  }
]
```

**POST `/api/firs`**
- Body: `{ "name": "string", "type": "string", "description": "string" }`
- Process:
  1. Generates new ID (FIR{count+1})
  2. Calculates sentiment score
  3. Sets status to "Registered"
  4. Inserts into database
  5. Commits transaction
- Returns: `{ "success": true, "id": "FIR001", "fir": {...} }`

### Criminal Endpoints

**GET `/api/criminals`**
- Returns: Array of all criminals
- Response format:
```json
[
  {
    "id": "CR001",
    "name": "Jane Smith",
    "crimeType": "Fraud",
    "date": "12/11/2025",
    "status": "Registered",
    "riskLevel": "Medium",
    "details": "Online fraud case"
  }
]
```


**POST `/api/criminals`**
- Body: `{ "name": "string", "crimeType": "string", "status": "string", "riskLevel": "string", "details": "string" }`
- Process: Same as FIR creation
- Returns: `{ "success": true, "id": "CR001" }`

**PUT `/api/criminals/<criminal_id>`**
- Body: `{ "status": "string" }`
- Valid statuses: "Registered", "Under Investigation", "Closed"
- Process:
  1. Receives criminal ID and new status
  2. Executes: `UPDATE criminals SET status = ? WHERE id = ?`
  3. Commits transaction
  4. Returns success/failure
- Returns: `{ "success": true, "message": "Criminal status updated successfully" }`

### Document Endpoints

**GET `/api/documents`**
- Returns: Array of all documents (25 items)
- Response format:
```json
[
  {
    "id": "DOC001",
    "documentName": "Witness Statement",
    "documentType": "Witness Statement",
    "linkedPerson": "John Doe",
    "firId": "FIR001",
    "dateAdded": "10/11/2025",
    "status": "Active",
    "description": "Official witness statement..."
  }
]
```

### Crime Analysis Endpoint

**GET `/api/crime-analysis`**
- Returns: Complete crime analysis report
- Response format:
```json
{
  "city_rankings": [...],
  "predictions": {...},
  "officer_distribution": [...],
  "future_trends": [...],
  "regression_data": [...],
  "regression_model": {
    "coefficient": 0.0234,
    "intercept": 0.3456,
    "r_squared": 0.7823
  },
  "analysis_date": "13/11/2025 14:30",
  "total_cities": 14,
  "total_crimes": 100
}
```


### Evidence Endpoints

**GET `/api/evidence`**
- Returns: Array of all evidence items

**POST `/api/evidence`**
- Body: `{ "firId": "string", "evidenceType": "string", "description": "string", "collectedBy": "string" }`

### Officer Endpoints

**GET `/api/officers`**
- Returns: Array of all officers (15 items)

### Report Endpoints

**GET `/api/reports`**
- Returns: Array of all reports

**POST `/api/reports`**
- Body: `{ "officerName": "string", "incidentType": "string", "description": "string" }`

---

## Machine Learning Models

### 1. Sentiment Analyzer (`ml_models/sentiment_analyzer.py`)

**Purpose**: Calculate importance score for FIRs

**Algorithm:**
```python
def analyze_case_sentiment(description_text):
    score = 0.3  # Base score
    
    # High urgency keywords (+0.15 each)
    urgent_keywords = ['urgent', 'critical', 'emergency', 'immediate', 'serious']
    
    # High priority keywords (+0.12 each)
    high_priority = ['assault', 'injured', 'hospitalized', 'attack', 'weapon', 'violence']
    
    # Medium priority keywords (+0.05 each)
    medium_priority = ['theft', 'missing', 'accident', 'fraud', 'concerned']
    
    # Low priority keywords (-0.1 each)
    low_priority = ['routine', 'minor', 'small', 'argument']
    
    # Calculate final score (clamped between 0.1 and 0.9)
    return max(0.1, min(0.9, score))
```

**Usage:**
- Called automatically when creating new FIR
- Score determines priority in FIR list
- Higher score = more urgent case


### 2. Crime Analyzer (`ml_models/simple_crime_analyzer.py`)

**Purpose**: Analyze crime patterns and predict trends

**Class: SimpleCrimeAnalyzer**

**Methods:**

**`extract_crime_data()`**
- Extracts location and scores from FIR descriptions
- Parses "Location: Area, City" from descriptions
- Groups scores by city
- Returns: `{ "City": [score1, score2, ...] }`

**`calculate_city_rankings()`**
- Calculates average score per city
- Counts crimes per city
- Sorts by average score (descending)
- Returns: Array of city objects with rankings

**`simple_linear_regression()`**
- Features: Crime count per city (X)
- Target: Average crime score (Y)
- Algorithm: scikit-learn LinearRegression
- Formula: `y = mx + b`
- Returns: model, predictions, X, y, city_names

**`predict_future_trends()`**
- Predicts crime trends for next 3 months
- Formula: `predicted_score = current_score × (1 + current_score × 0.05 × month)`
- Higher crime areas show steeper increases
- Returns: Array with predictions for each city

**`distribute_officers(total_officers=15)`**
- Allocates officers based on crime severity
- Formula: `officers = (city_score / total_score) × total_officers`
- Ensures minimum 1 officer per city with crimes
- Returns: Array with officer distribution

**`generate_report()`**
- Combines all analysis methods
- Returns complete JSON report with:
  - City rankings
  - Predictions
  - Officer distribution
  - Future trends
  - Regression data
  - Model metrics (coefficient, intercept, R²)
  - Analysis metadata

---

## Frontend Components

### JavaScript Functions (`static/script.js`)


**Navigation:**
- `showPage(pageId)`: Switches between pages, updates active nav button

**Data Fetching:**
- `fetchFIRs()`: GET /api/firs, populates table, updates count
- `fetchCriminals()`: GET /api/criminals, populates table with edit buttons
- `fetchDocuments()`: GET /api/documents, populates table
- `fetchEvidence()`: GET /api/evidence, updates stats and grid
- `fetchOfficers()`: GET /api/officers, populates grid
- `fetchReports()`: GET /api/reports, populates table
- `fetchCrimeAnalysis()`: GET /api/crime-analysis, triggers all visualizations

**Form Submissions:**
- `submitFIR(event)`: POST /api/firs, refreshes list automatically
- `submitCriminal(event)`: POST /api/criminals, sets status="Registered"
- `editCriminalStatus(criminalId)`: PUT /api/criminals/<id>, prompts for new status

**Filtering:**
- `filterFIRs()`: Real-time search and filter for FIRs
- `filterCriminals()`: Real-time search and filter for criminals
- `filterDocuments()`: Real-time search and filter for documents

**Visualizations:**

**`createRegressionChart(regressionData, model)`**
- Draws scatter plot with regression line
- Color codes points by danger level:
  - Green: score 0.0-0.33
  - Yellow: score 0.34-0.66
  - Red: score 0.67-1.0
- Black regression line
- Displays city names and scores
- Shows model equation and R² score
- Canvas size: 800x400px

**`createBarGraph(cityRankings)`**
- Draws bar chart of city rankings
- Color intensity based on score
- City names at 45° angle
- Score values above bars
- Axes with labels

**`createTrendChart(futureTrends)`**
- Line graph for top 5 cities
- 4 time points: Current, +1mo, +2mo, +3mo
- Color-coded lines per city
- Shows crime trajectory


**`updateOfficerDistribution(officerDistribution)`**
- Creates grid of officer allocation cards
- Shows officers per city with crime stats

**`updateCityRankings(cityRankings, futureTrends)`**
- Creates ranked list of cities
- Shows current and predicted scores
- Trend indicators (↑ Increasing / → Stable)
- Color-coded by risk level

**Modal Functions:**
- `openFIRModal()`, `closeFIRModal()`
- `openCriminalModal()`, `closeCriminalModal()`
- `openReportModal()`, `closeReportModal()`

### HTML Structure (`templates/index.html`)

**Pages (all with `id` and class `page-section`):**
1. `home` - Dashboard with statistics
2. `firs` - FIR management table
3. `criminal-records` - Criminal records table
4. `evidence` - Evidence grid
5. `documents` - Documents table
6. `officers` - Officers grid
7. `crime-hotspot` - Crime analysis with 4 visualizations
8. `face-recognition` - Placeholder
9. `reports` - Reports table
10. `about` - System information

**Modals:**
- `firModal` - Register new FIR form
- `criminalModal` - Add criminal record form
- `reportModal` - Submit report form

**Key Elements:**
- Navigation bar with page buttons
- Search boxes with real-time filtering
- Filter dropdowns for status and type
- Action buttons (view, edit)
- Canvas elements for charts
- Stats cards with counts

### CSS Styling (`static/style.css`)

**Theme:**
- Blue gradient background
- Glass-morphism effects (backdrop-filter: blur)
- Dark theme with rgba colors
- Smooth transitions and hover effects


**Key Classes:**
- `.nav-bar` - Navigation styling
- `.page-section` - Page container
- `.data-table` - Table styling
- `.status-badge` - Status indicators
- `.modal` - Modal overlay
- `.graph-container` - Chart containers
- `.hotspot-section` - Analysis sections

**Status Badge Colors:**
- `.status-investigation` - Red (Under Investigation)
- `.status-registered` - Orange (Registered)
- `.status-closed` - Green (Closed)

---

## Installation & Setup

### Prerequisites
```bash
Python 3.7+
pip (Python package manager)
```

### Required Python Packages
```bash
pip install flask
pip install scikit-learn
pip install numpy
```

### Installation Steps

1. **Clone/Download Project**
```bash
cd police-station-ms
```

2. **Install Dependencies**
```bash
pip install flask scikit-learn numpy
```

3. **Initialize Database** (automatic on first run)
```bash
python app.py
```
This creates `police_station.db` with sample data

4. **Optional: Populate More Data**
```bash
python populate_database.py    # Adds 100 FIRs, criminals, reports, evidence
python populate_documents.py   # Adds 25 documents
```

5. **Run Application**
```bash
python app.py
```

6. **Access Application**
```
http://127.0.0.1:5000
```

### Verification
```bash
python test_fixes.py           # Run automated tests
python verify_updates.py       # Verify all features
```

---

## Usage Guide

### Starting the Application
```bash
python app.py
```
Server starts on port 5000 (http://127.0.0.1:5000)


### Registering a New FIR

1. Navigate to **FIRs** page
2. Click **"Register New FIR"** button
3. Fill form:
   - Complainant Name: Enter name
   - Crime Type: Select from dropdown
   - Description: Enter detailed description
4. Click **"Register FIR"**
5. FIR appears immediately in list
6. Search for it by name - works instantly

**Behind the scenes:**
- Form submission triggers `submitFIR(event)`
- POST request to `/api/firs`
- Backend generates ID, calculates score
- Database insert with commit
- Frontend receives complete FIR object
- `fetchFIRs()` called to refresh list
- New FIR visible and searchable

### Adding and Editing Criminal Records

**Add Criminal:**
1. Navigate to **Criminal Records** page
2. Click **"Add Criminal Record"**
3. Fill form (name, crime type, risk level, details)
4. Click **"Add Record"**
5. Criminal appears with status "Registered"

**Edit Status:**
1. Find criminal in list
2. Click **pencil icon (✏️)** button
3. Enter new status in prompt:
   - "Registered"
   - "Under Investigation"
   - "Closed"
4. Status updates immediately

**Behind the scenes:**
- Edit button calls `editCriminalStatus(criminalId)`
- Prompts user for new status
- Validates input against allowed statuses
- PUT request to `/api/criminals/<id>`
- Backend updates database
- Frontend refreshes list
- Updated status visible

### Viewing Crime Hotspot Analysis

1. Navigate to **Crime Hotspot** page
2. View 4 visualizations:

**A. Linear Regression Analysis**
- Scatter plot with colored dots
- Green = low danger, Yellow = medium, Red = high
- Black regression line
- Model equation and R² score below

**B. City Crime Rankings**
- Bar graph of all cities
- Sorted by crime score
- Color intensity shows severity

**C. Crime Trend Predictions**
- Line graph for top 5 cities
- Shows 3-month forecast
- Color-coded trajectories

**D. Officer Distribution**
- Grid showing officer allocation
- Based on crime severity
- Shows crime count and score per city

**E. City Rankings Table**
- Ranked list with predictions
- Current and predicted scores
- Trend indicators


### Searching and Filtering

**FIRs:**
- Type in search box: Searches name, type, ID, description
- Select status filter: Registered, Under Investigation, Closed
- Select crime type filter: Theft, Assault, Fraud, etc.
- All filters work in real-time (no page refresh)

**Criminals:**
- Search by name, crime type, or ID
- Filter by status
- Filter by crime type
- Real-time filtering

**Documents:**
- Search by name, person, or FIR ID
- Filter by document type (10 types)
- Filter by status (Active, Archived, Under Review)
- Real-time filtering

### Viewing Documents

1. Navigate to **Documents** page
2. Browse 25 documents
3. See document details:
   - Document name and type
   - Linked person (from FIRs)
   - FIR ID (if linked)
   - Date added
   - Status
4. Use search and filters to find specific documents

---

## File Structure

```
police-station-ms/
│
├── app.py                          # Main Flask application
├── police_station.db               # SQLite database (auto-created)
│
├── ml_models/
│   ├── sentiment_analyzer.py      # FIR importance scoring
│   └── simple_crime_analyzer.py   # Crime analysis & prediction
│
├── templates/
│   └── index.html                  # Main HTML template
│
├── static/
│   ├── script.js                   # Frontend JavaScript
│   └── style.css                   # CSS styling
│
├── populate_database.py            # Database seeding script
├── populate_documents.py           # Documents generation script
├── test_fixes.py                   # Automated test suite
├── verify_updates.py               # Feature verification script
│
└── Documentation/
    ├── README.md                   # This file
    ├── FIXES_APPLIED.md            # Bug fixes documentation
    ├── UPDATES.md                  # Feature updates
    ├── QUICK_START.md              # Quick start guide
    ├── STATUS.txt                  # Current status
    └── REGRESSION_GRAPH_ADDED.md   # Regression feature docs
```


---

## Technical Implementation

### Database Operations

**Connection Pattern:**
```python
conn = sqlite3.connect('police_station.db')
cursor = conn.cursor()
# Execute queries
cursor.execute('SELECT * FROM table')
# Always commit changes
conn.commit()
# Always close connection
conn.close()
```

**Insert Pattern:**
```python
cursor.execute('''
    INSERT INTO table (col1, col2, col3)
    VALUES (?, ?, ?)
''', (val1, val2, val3))
conn.commit()
```

**Update Pattern:**
```python
cursor.execute('''
    UPDATE table 
    SET col1 = ?
    WHERE id = ?
''', (new_value, record_id))
conn.commit()
```

**Query Pattern:**
```python
cursor.execute('SELECT * FROM table WHERE condition = ?', (value,))
rows = cursor.fetchall()
# Process rows
```

### ID Generation

**Pattern for all tables:**
```python
cursor.execute('SELECT COUNT(*) FROM table')
count = cursor.fetchone()[0]
new_id = f'PREFIX{str(count + 1).zfill(3)}'
# Examples: FIR001, CR001, DOC001, RPT001, EV001
```

### Date Format

**Consistent format across all tables:**
```python
from datetime import datetime
date = datetime.now().strftime('%d/%m/%Y')
# Example: "13/11/2025"
```

### Frontend-Backend Communication

**POST Request Pattern:**
```javascript
const response = await fetch('/api/endpoint', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: value })
});
const result = await response.json();
```

**GET Request Pattern:**
```javascript
const response = await fetch('/api/endpoint');
const data = await response.json();
```

**PUT Request Pattern:**
```javascript
const response = await fetch(`/api/endpoint/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ key: value })
});
```


### Canvas Drawing (Charts)

**Setup Pattern:**
```javascript
const canvas = document.getElementById('canvasId');
const ctx = canvas.getContext('2d');

// Clear canvas
ctx.clearRect(0, 0, canvas.width, canvas.height);

// Set background
ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
ctx.fillRect(0, 0, canvas.width, canvas.height);
```

**Drawing Shapes:**
```javascript
// Rectangle
ctx.fillStyle = 'color';
ctx.fillRect(x, y, width, height);

// Circle
ctx.beginPath();
ctx.arc(x, y, radius, 0, 2 * Math.PI);
ctx.fill();

// Line
ctx.beginPath();
ctx.moveTo(x1, y1);
ctx.lineTo(x2, y2);
ctx.stroke();
```

**Text Drawing:**
```javascript
ctx.fillStyle = 'color';
ctx.font = 'size family';
ctx.textAlign = 'center|left|right';
ctx.fillText('text', x, y);
```

### Color Calculation (Regression Chart)

**Danger-based color grading:**
```javascript
const normalizedScore = (score - minScore) / (maxScore - minScore);

if (normalizedScore < 0.33) {
    // Green (low danger)
    fillColor = `rgb(34, 197, 94)`;
} else if (normalizedScore < 0.67) {
    // Yellow/Orange (medium danger)
    fillColor = `rgb(251, 191, 36)`;
} else {
    // Red (high danger)
    fillColor = `rgb(239, 68, 68)`;
}
```

### Real-time Search Implementation

**Pattern:**
```javascript
searchInput.addEventListener('input', filterFunction);

function filterFunction() {
    const searchTerm = searchInput.value.toLowerCase();
    const rows = document.querySelectorAll('tbody tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}
```


### Modal Management

**Pattern:**
```javascript
// Open modal
function openModal() {
    document.getElementById('modalId').classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('modalId').classList.remove('active');
}

// Close on outside click
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
    }
}
```

### Form Submission

**Pattern:**
```javascript
async function submitForm(event) {
    event.preventDefault();  // Prevent default form submission
    
    // Get form values
    const value1 = document.getElementById('input1').value;
    const value2 = document.getElementById('input2').value;
    
    // Send to backend
    const response = await fetch('/api/endpoint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key1: value1, key2: value2 })
    });
    
    const result = await response.json();
    
    if (result.success) {
        // Clear form
        document.getElementById('input1').value = '';
        document.getElementById('input2').value = '';
        
        // Close modal
        closeModal();
        
        // Refresh data
        await fetchData();
    }
}
```

---

## Data Flow Examples

### Example 1: Adding a New FIR

**Step-by-step flow:**

1. **User Action**: Fills FIR form and clicks "Register FIR"

2. **Frontend (script.js)**:
   ```javascript
   submitFIR(event) {
       event.preventDefault();
       const data = {
           name: "John Doe",
           type: "Theft",
           description: "Mobile phone stolen"
       };
       fetch('/api/firs', { method: 'POST', body: JSON.stringify(data) });
   }
   ```

3. **Backend (app.py)**:
   ```python
   @app.route('/api/firs', methods=['POST'])
   def create_fir():
       data = request.json
       new_id = generate_id()  # FIR101
       score = analyze_case_sentiment(data['description'])  # 0.65
       
       cursor.execute('''
           INSERT INTO firs VALUES (?, ?, ?, ?, ?, ?, ?)
       ''', (new_id, data['name'], data['type'], date, 'Registered', 
             data['description'], score))
       
       conn.commit()
       return jsonify({'success': True, 'id': new_id, 'fir': {...}})
   ```


4. **ML Processing (sentiment_analyzer.py)**:
   ```python
   def analyze_case_sentiment(description):
       score = 0.3
       if 'urgent' in description.lower():
           score += 0.15
       if 'theft' in description.lower():
           score += 0.05
       return round(max(0.1, min(0.9, score)), 2)
   ```

5. **Database**:
   ```sql
   INSERT INTO firs VALUES (
       'FIR101', 'John Doe', 'Theft', '13/11/2025', 
       'Registered', 'Mobile phone stolen', 0.65
   );
   COMMIT;
   ```

6. **Frontend Response**:
   ```javascript
   if (result.success) {
       alert('FIR FIR101 registered successfully!');
       closeFIRModal();
       await fetchFIRs();  // Refresh list
   }
   ```

7. **Display Update**: New FIR appears in table, sorted by score

### Example 2: Editing Criminal Status

**Step-by-step flow:**

1. **User Action**: Clicks edit button (✏️) next to criminal

2. **Frontend**:
   ```javascript
   editCriminalStatus('CR001') {
       const newStatus = prompt('Enter new status');
       if (!['Registered', 'Under Investigation', 'Closed'].includes(newStatus)) {
           alert('Invalid status!');
           return;
       }
       fetch('/api/criminals/CR001', {
           method: 'PUT',
           body: JSON.stringify({ status: newStatus })
       });
   }
   ```

3. **Backend**:
   ```python
   @app.route('/api/criminals/<criminal_id>', methods=['PUT'])
   def update_criminal(criminal_id):
       data = request.json
       cursor.execute('''
           UPDATE criminals SET status = ? WHERE id = ?
       ''', (data['status'], criminal_id))
       conn.commit()
       return jsonify({'success': True})
   ```

4. **Database**:
   ```sql
   UPDATE criminals 
   SET status = 'Under Investigation' 
   WHERE id = 'CR001';
   COMMIT;
   ```

5. **Frontend Response**:
   ```javascript
   if (result.success) {
       alert('Status updated!');
       await fetchCriminals();  // Refresh list
   }
   ```

6. **Display Update**: Criminal status badge updates to new status


### Example 3: Crime Hotspot Analysis

**Step-by-step flow:**

1. **User Action**: Navigates to Crime Hotspot page

2. **Frontend**:
   ```javascript
   fetchCrimeAnalysis() {
       const response = await fetch('/api/crime-analysis');
       const data = await response.json();
       
       createRegressionChart(data.regression_data, data.regression_model);
       createBarGraph(data.city_rankings);
       createTrendChart(data.future_trends);
       updateOfficerDistribution(data.officer_distribution);
       updateCityRankings(data.city_rankings, data.future_trends);
   }
   ```

3. **Backend**:
   ```python
   @app.route('/api/crime-analysis')
   def get_crime_analysis():
       analyzer = SimpleCrimeAnalyzer()
       report = analyzer.generate_report()
       return jsonify(report)
   ```

4. **ML Processing**:
   ```python
   class SimpleCrimeAnalyzer:
       def generate_report(self):
           # Extract data from FIRs
           location_scores = self.extract_crime_data()
           # {'Agra': [0.5, 0.6, 0.55], 'Delhi': [0.4, 0.5]}
           
           # Calculate rankings
           city_rankings = self.calculate_city_rankings()
           # [{'city': 'Agra', 'avg_score': 0.558, 'crime_count': 10}]
           
           # Linear regression
           model, predictions, X, y, cities = self.simple_linear_regression()
           # model: LinearRegression object
           # X: [[10], [7], [9]]  (crime counts)
           # y: [0.558, 0.501, 0.497]  (avg scores)
           
           # Predict trends
           future_trends = self.predict_future_trends()
           # [{'city': 'Agra', 'predicted_month_3': 0.605, 'trend': 'Increasing'}]
           
           # Distribute officers
           officer_distribution = self.distribute_officers(15)
           # [{'city': 'Agra', 'officers_assigned': 3}]
           
           return complete_report
   ```

5. **Visualization**:
   ```javascript
   createRegressionChart(data, model) {
       // For each city
       data.forEach(point => {
           // Calculate color based on score
           const color = getColorByScore(point.actual_score);
           // Draw colored dot at (crime_count, score)
           ctx.arc(x, y, 7, 0, 2*Math.PI);
           ctx.fillStyle = color;
           ctx.fill();
       });
       
       // Draw black regression line
       ctx.strokeStyle = '#000000';
       ctx.beginPath();
       // Connect predicted points
       ctx.stroke();
   }
   ```

6. **Display**: 4 charts rendered showing complete analysis

---

## Troubleshooting


### Common Issues

**Issue: Port 5000 already in use**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Linux/Mac
lsof -ti:5000 | xargs kill -9
```

**Issue: Module not found**
```bash
pip install flask scikit-learn numpy
```

**Issue: Database not found**
- Run `python app.py` - database auto-creates
- Or run `python populate_database.py`

**Issue: FIR not appearing after submission**
- Check browser console (F12) for errors
- Verify `submitFIR` function exists in script.js
- Check server logs for errors
- Ensure database commit is happening

**Issue: Criminal edit not working**
- Verify PUT endpoint exists: `/api/criminals/<id>`
- Check `editCriminalStatus` function in script.js
- Ensure valid status entered (Registered/Under Investigation/Closed)

**Issue: Charts not displaying**
- Check canvas elements exist in HTML
- Verify data is being fetched from `/api/crime-analysis`
- Check browser console for JavaScript errors
- Ensure FIRs have location data in descriptions

**Issue: Search not working**
- Verify event listeners are attached
- Check filter functions exist
- Ensure table rows have correct structure

**Issue: Data not persisting**
- Verify `conn.commit()` is called after INSERT/UPDATE
- Check database file exists: `police_station.db`
- Run `python test_fixes.py` to verify

---

## Testing

### Automated Tests

**Run all tests:**
```bash
python test_fixes.py
```

**Tests included:**
1. Database Connection Test
   - Verifies all tables exist
   - Checks record counts
   - Tests table accessibility

2. FIR Insertion Test
   - Inserts test FIR
   - Verifies insertion
   - Cleans up test data

3. Criminal Status Update Test
   - Updates criminal status
   - Verifies update
   - Restores original status

4. API Endpoints Test
   - Checks all endpoints exist
   - Verifies required endpoints
   - Lists available endpoints

**Expected output:**
```
✓ Database Connection test PASSED
✓ FIR Insertion test PASSED
✓ Criminal Status Update test PASSED
✓ API Endpoints test PASSED

ALL TESTS PASSED!
```


### Manual Testing

**Test FIR Registration:**
1. Start server: `python app.py`
2. Open: http://127.0.0.1:5000
3. Navigate to FIRs page
4. Click "Register New FIR"
5. Fill form:
   - Name: "Test User"
   - Type: "Theft"
   - Description: "Test case for verification"
6. Submit
7. Verify: FIR appears immediately
8. Search: "Test User" - should find it
9. Check database: `SELECT * FROM firs WHERE name='Test User'`

**Test Criminal Status Edit:**
1. Navigate to Criminal Records
2. Click "Add Criminal Record"
3. Fill form and submit
4. Verify status shows "Registered"
5. Click edit button (✏️)
6. Enter "Under Investigation"
7. Verify status updates
8. Click edit again
9. Enter "Closed"
10. Verify status updates

**Test Crime Hotspot:**
1. Navigate to Crime Hotspot page
2. Verify 4 visualizations appear:
   - Regression chart with colored dots
   - Bar graph with city rankings
   - Trend prediction chart
   - Officer distribution grid
3. Check regression chart:
   - Dots are color-coded (green/yellow/red)
   - Black regression line visible
   - City names labeled
   - Model equation displayed
4. Verify all data loads correctly

---

## Performance Considerations

### Database Optimization
- SQLite is lightweight and fast for this scale
- Indexes on ID columns (PRIMARY KEY)
- No complex joins needed
- Suitable for 100-1000 records

### Frontend Optimization
- No external chart libraries (reduces load time)
- Canvas rendering is fast
- Real-time search uses simple string matching
- No pagination needed for current data size

### Scalability Notes
- For 10,000+ records, consider:
  - Adding database indexes
  - Implementing pagination
  - Using server-side filtering
  - Caching analysis results
  - Moving to PostgreSQL/MySQL

---

## Security Considerations

### Current Implementation
- Development server (Flask debug mode)
- No authentication/authorization
- No input validation on backend
- SQL injection protected by parameterized queries
- No HTTPS

### Production Recommendations
1. **Use Production Server**: Gunicorn, uWSGI
2. **Add Authentication**: User login system
3. **Input Validation**: Validate all inputs
4. **HTTPS**: Use SSL certificates
5. **Rate Limiting**: Prevent abuse
6. **CORS**: Configure properly
7. **Environment Variables**: Store secrets securely
8. **Database Backups**: Regular backups
9. **Logging**: Implement proper logging
10. **Error Handling**: Don't expose stack traces

---

## Future Enhancements

### Planned Features
1. **Face Recognition**: AI-powered suspect identification
2. **Real-time Notifications**: Email/SMS alerts
3. **Mobile App**: React Native or Flutter
4. **Advanced Analytics**: Time-series analysis, ARIMA models
5. **Document Upload**: Actual file upload capability
6. **Export Features**: PDF reports, CSV exports
7. **Multi-language Support**: Hindi, regional languages
8. **Role-based Access**: Different permissions for ranks
9. **Audit Trail**: Track all changes
10. **Integration**: Connect with other police systems

### Technical Improvements
1. **Database Migration**: Move to PostgreSQL
2. **API Documentation**: Swagger/OpenAPI
3. **Unit Tests**: Comprehensive test coverage
4. **CI/CD Pipeline**: Automated deployment
5. **Docker**: Containerization
6. **Microservices**: Split into services
7. **WebSockets**: Real-time updates
8. **Caching**: Redis for performance
9. **Search Engine**: Elasticsearch for advanced search
10. **Cloud Deployment**: AWS/Azure/GCP

---

## API Reference Summary

### Complete Endpoint List

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/` | Main page | - | HTML |
| GET | `/api/firs` | Get all FIRs | - | Array of FIRs |
| POST | `/api/firs` | Create FIR | `{name, type, description}` | `{success, id, fir}` |
| GET | `/api/criminals` | Get all criminals | - | Array of criminals |
| POST | `/api/criminals` | Create criminal | `{name, crimeType, status, riskLevel, details}` | `{success, id}` |
| PUT | `/api/criminals/<id>` | Update criminal status | `{status}` | `{success, message}` |
| GET | `/api/documents` | Get all documents | - | Array of documents |
| GET | `/api/evidence` | Get all evidence | - | Array of evidence |
| POST | `/api/evidence` | Create evidence | `{firId, evidenceType, description, collectedBy}` | `{success, id}` |
| GET | `/api/officers` | Get all officers | - | Array of officers |
| GET | `/api/reports` | Get all reports | - | Array of reports |
| POST | `/api/reports` | Create report | `{officerName, incidentType, description}` | `{success, id}` |
| GET | `/api/crime-analysis` | Get crime analysis | - | Complete analysis report |

---

## Configuration

### Flask Configuration
```python
# app.py
app = Flask(__name__)
app.config['DEBUG'] = True  # Set to False in production
```

### Database Configuration
```python
DATABASE = 'police_station.db'
# SQLite file created in project root
```

### Server Configuration
```python
if __name__ == '__main__':
    app.run(
        host='127.0.0.1',  # Localhost only
        port=5000,          # Default port
        debug=True          # Debug mode
    )
```

### Production Configuration
```python
# For production, use:
if __name__ == '__main__':
    app.run(
        host='0.0.0.0',     # Accept external connections
        port=80,            # Standard HTTP port
        debug=False         # Disable debug mode
    )
```

---

## Data Models

### FIR Model
```python
{
    "id": "FIR001",                    # String, unique
    "name": "John Doe",                # String, required
    "type": "Theft",                   # String, required
    "date": "13/11/2025",              # String, DD/MM/YYYY
    "status": "Registered",            # String, enum
    "description": "Detailed text",    # String, required
    "score": 0.65                      # Float, 0.0-1.0
}
```

### Criminal Model
```python
{
    "id": "CR001",                     # String, unique
    "name": "Jane Smith",              # String, required
    "crimeType": "Fraud",              # String, required
    "date": "12/11/2025",              # String, DD/MM/YYYY
    "status": "Registered",            # String, enum
    "riskLevel": "Medium",             # String, enum
    "details": "Additional info"       # String, optional
}
```

### Document Model
```python
{
    "id": "DOC001",                    # String, unique
    "documentName": "Witness Statement", # String, required
    "documentType": "Witness Statement", # String, required
    "linkedPerson": "John Doe",        # String, required
    "firId": "FIR001",                 # String, optional
    "dateAdded": "10/11/2025",         # String, DD/MM/YYYY
    "status": "Active",                # String, enum
    "description": "Description text"  # String, optional
}
```

### Crime Analysis Model
```python
{
    "city_rankings": [                 # Array of city objects
        {
            "city": "Agra",
            "avg_score": 0.558,
            "crime_count": 10,
            "total_score": 5.58
        }
    ],
    "regression_data": [               # Array for scatter plot
        {
            "city": "Agra",
            "crime_count": 10,
            "actual_score": 0.558,
            "predicted_score": 0.545
        }
    ],
    "future_trends": [                 # Array of predictions
        {
            "city": "Agra",
            "current_score": 0.558,
            "predicted_month_1": 0.586,
            "predicted_month_2": 0.614,
            "predicted_month_3": 0.642,
            "trend": "Increasing"
        }
    ],
    "officer_distribution": [          # Array of allocations
        {
            "city": "Agra",
            "officers_assigned": 3,
            "crime_score": 0.558,
            "crime_count": 10
        }
    ],
    "regression_model": {              # Model metrics
        "coefficient": 0.0234,
        "intercept": 0.3456,
        "r_squared": 0.7823
    },
    "analysis_date": "13/11/2025 14:30",
    "total_cities": 14,
    "total_crimes": 100
}
```

---

## Environment Setup

### Development Environment
```bash
# Python version
python --version  # Should be 3.7+

# Create virtual environment (optional)
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows

# Install dependencies
pip install flask scikit-learn numpy

# Run application
python app.py

# Access at
http://127.0.0.1:5000
```

### Production Environment
```bash
# Install production server
pip install gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:80 app:app

# Or with uWSGI
pip install uwsgi
uwsgi --http :80 --wsgi-file app.py --callable app
```

---

## Deployment

### Local Deployment
1. Install Python 3.7+
2. Install dependencies: `pip install flask scikit-learn numpy`
3. Run: `python app.py`
4. Access: http://127.0.0.1:5000

### Server Deployment (Linux)
```bash
# Update system
sudo apt update && sudo apt upgrade

# Install Python
sudo apt install python3 python3-pip

# Clone project
git clone <repository>
cd police-station-ms

# Install dependencies
pip3 install flask scikit-learn numpy gunicorn

# Run with Gunicorn
gunicorn -w 4 -b 0.0.0.0:80 app:app

# Or create systemd service
sudo nano /etc/systemd/system/crimesense.service
```

### Docker Deployment
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .

EXPOSE 5000

CMD ["python", "app.py"]
```

```bash
# Build and run
docker build -t crimesense .
docker run -p 5000:5000 crimesense
```

---

## Contributing

### Code Style
- Python: PEP 8
- JavaScript: Standard JS
- HTML/CSS: Consistent indentation (2 spaces)

### Git Workflow
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

### Testing Requirements
- All new features must have tests
- Run `python test_fixes.py` before committing
- Ensure no errors in browser console

---

## License

This project is for educational and demonstration purposes.

---

## Support

### Documentation Files
- `README.md` - This complete documentation
- `QUICK_START.md` - Quick start guide
- `FIXES_APPLIED.md` - Bug fixes documentation
- `UPDATES.md` - Feature updates
- `REGRESSION_GRAPH_ADDED.md` - Regression feature details
- `STATUS.txt` - Current project status

### Testing Scripts
- `test_fixes.py` - Automated test suite
- `verify_updates.py` - Feature verification

### Data Scripts
- `populate_database.py` - Seed database with 100 records
- `populate_documents.py` - Generate 25 documents

---

## Summary

**CrimeSense Management System** is a complete police station management solution with:

✅ **6 Database Tables** - FIRs, Criminals, Documents, Reports, Officers, Evidence
✅ **12 API Endpoints** - Full CRUD operations
✅ **10 Web Pages** - Complete user interface
✅ **AI-Powered Analysis** - Sentiment analysis and crime prediction
✅ **4 Visualizations** - Regression, bar, trend, and distribution charts
✅ **Real-time Features** - Instant search, filtering, and updates
✅ **Linear Regression** - Crime pattern analysis with color-coded visualization
✅ **Trend Prediction** - 3-month crime forecasting
✅ **Officer Distribution** - Automatic resource allocation
✅ **Document Management** - 25 documents linked to FIR records
✅ **Status Tracking** - Editable criminal record statuses

**Technology Stack:**
- Backend: Flask (Python)
- Database: SQLite3
- ML: scikit-learn, numpy
- Frontend: Vanilla JavaScript, HTML5, CSS3
- Visualization: HTML5 Canvas

**Key Features:**
- Instant FIR registration with AI scoring
- Criminal record management with status editing
- Crime hotspot analysis with regression
- Predictive analytics for crime trends
- Real-time search and filtering
- Professional visualizations
- Complete documentation

**Ready for:**
- Development and testing
- Educational purposes
- Demonstration and presentation
- Further enhancement and customization

---

## Quick Reference

### Start Application
```bash
python app.py
```

### Access URL
```
http://127.0.0.1:5000
```

### Run Tests
```bash
python test_fixes.py
```

### Populate Data
```bash
python populate_database.py
python populate_documents.py
```

### Stop Server
```
Ctrl + C
```

---

**End of Documentation**

For any questions or issues, refer to the documentation files in the project root or run the test scripts to verify functionality.

**Project Status: ✅ FULLY FUNCTIONAL**

All features implemented, tested, and documented.
