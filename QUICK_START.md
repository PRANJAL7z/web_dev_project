# Quick Start Guide - CrimeSense Management System

## Getting Started

### 1. Start the Application

```bash
python app.py
```

The server will start at: http://127.0.0.1:5000

### 2. Access the System

Open your web browser and navigate to:
```
http://127.0.0.1:5000
```

## New Features Overview

### 📄 Documents Management

**Location**: Click "Documents" in the navigation bar

**What you'll see**:
- 25 legal documents linked to people from FIR cases
- Document types: Witness Statements, Medical Reports, Legal Notices, Court Orders, etc.
- Search and filter capabilities

**Try this**:
1. Search for a person's name (e.g., "Prerna", "Monika", "Kunal")
2. Filter by document type (select from dropdown)
3. Filter by status (Active, Archived, Under Review)
4. Click the eye icon to view document details

### 🔍 Fixed FIR Search

**Location**: Click "FIRs" in the navigation bar

**What's fixed**:
- New FIRs now appear immediately after registration
- Search works instantly for newly added FIRs
- No need to refresh the page

**Try this**:
1. Click "Register New FIR"
2. Fill in the form:
   - Complainant Name: "John Doe"
   - Crime Type: "Theft"
   - Description: "Test case for verification"
3. Click "Register FIR"
4. See it appear immediately in the list
5. Search for "John Doe" - it will be found instantly!

### 📊 Crime Hotspot Prediction

**Location**: Click "Crime Hotspot" in the navigation bar

**What you'll see**:

#### 1. Statistics Dashboard
- Total monitored cities
- Total crimes recorded
- Officers available
- Last analysis date

#### 2. City Crime Rankings (Bar Graph)
- Visual bar chart showing crime scores by city
- Color-coded by severity (red = high, blue = low)
- Easy comparison between cities

#### 3. Crime Trend Predictions (Line Graph)
- Shows predicted crime trends for next 3 months
- Top 5 cities displayed
- Color-coded lines for each city
- Timeline: Current → Month +1 → Month +2 → Month +3

#### 4. Officer Distribution
- Automatic officer allocation based on crime scores
- Shows how many officers should be assigned to each city
- Displays crime count and score for context

#### 5. City Rankings with Predictions
- Ranked list of cities by crime score
- Shows current score and predicted score (3 months ahead)
- Trend indicators:
  - ↑ = Increasing crime trend
  - → = Stable crime trend
- Color-coded by risk level:
  - Red = High risk (top 3)
  - Orange = Medium risk (4-6)
  - Green = Lower risk (7+)

**Try this**:
1. Scroll through the bar graph to see current rankings
2. Check the trend prediction chart to see future projections
3. Review which cities need more officers
4. Look at the predicted crime rates for planning

## Understanding the Predictions

### How it works:
1. **Data Collection**: System analyzes all FIRs and their crime scores
2. **Location Extraction**: Identifies cities from FIR descriptions
3. **Score Calculation**: Computes average crime score per city
4. **Linear Regression**: Uses simple ML to predict future trends
5. **Visualization**: Displays predictions in easy-to-read charts

### Prediction Formula:
```
Predicted Score = Current Score × (1 + Current Score × 0.05 × Month)
```

This means:
- High-crime areas show steeper increases
- Low-crime areas remain relatively stable
- Predictions are conservative and realistic

## Navigation Guide

### Main Menu:
- **Home** - Dashboard with statistics
- **FIRs** - First Information Reports management
- **Criminal Records** - Criminal database
- **Evidence** - Evidence management
- **Documents** - NEW! Legal documents section
- **Officers** - Officer records and assignments
- **Crime Hotspot** - ENHANCED! Prediction and analysis
- **Face Recognition** - Coming soon
- **Reports** - Reports and complaints
- **About** - System information

## Tips for Best Experience

1. **Search Functionality**: All search boxes work in real-time
2. **Filters**: Use dropdown filters to narrow down results
3. **Instant Updates**: New entries appear immediately without refresh
4. **Visual Charts**: Hover over charts for better visibility
5. **Responsive Design**: Works on desktop and tablet devices

## Data Population

If you need to reset or add more data:

```bash
# Add more FIRs, criminals, reports, and evidence
python populate_database.py

# Add documents (already done, but can be re-run)
python populate_documents.py
```

## Troubleshooting

### Issue: Server won't start
**Solution**: Make sure port 5000 is not in use
```bash
# Kill any process using port 5000
netstat -ano | findstr :5000
taskkill /PID <process_id> /F
```

### Issue: No data showing
**Solution**: Run the population scripts
```bash
python populate_database.py
python populate_documents.py
```

### Issue: Charts not displaying
**Solution**: 
1. Make sure you're on the Crime Hotspot page
2. Wait a few seconds for data to load
3. Check browser console for errors (F12)

## System Requirements

- Python 3.7+
- Flask
- SQLite3
- scikit-learn
- numpy
- Modern web browser (Chrome, Firefox, Edge)

## Support

For issues or questions:
1. Check the UPDATES.md file for detailed technical information
2. Review the README.md for project overview
3. Check browser console (F12) for JavaScript errors
4. Verify all Python dependencies are installed

## What's Next?

The system is fully functional with:
✅ Instant FIR search and updates
✅ Complete documents management
✅ Crime hotspot prediction with trends
✅ Visual charts and graphs
✅ Officer distribution recommendations

Enjoy using CrimeSense Management System! 🚔
