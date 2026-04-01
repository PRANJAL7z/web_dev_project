from flask import Flask, render_template, jsonify, request
from ml_models.sentiment_analyzer import analyze_case_sentiment
from ml_models.simple_crime_analyzer import SimpleCrimeAnalyzer
import sqlite3
from datetime import datetime
import os

app = Flask(__name__)

# Database initialization
def init_db():
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Create FIRs table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS firs (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT NOT NULL,
            score REAL NOT NULL
        )
    ''')
    
    # Create Criminals table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS criminals (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            crime_type TEXT NOT NULL,
            date_recorded TEXT NOT NULL,
            status TEXT NOT NULL,
            risk_level TEXT NOT NULL,
            details TEXT
        )
    ''')
    
    # Create Reports table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS reports (
            id TEXT PRIMARY KEY,
            officer_name TEXT NOT NULL,
            incident_type TEXT NOT NULL,
            date TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT NOT NULL
        )
    ''')
    
    # Create Officers table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS officers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            rank TEXT NOT NULL,
            status TEXT NOT NULL,
            department TEXT
        )
    ''')
    
    # Create Evidence table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS evidence (
            id TEXT PRIMARY KEY,
            fir_id TEXT NOT NULL,
            evidence_type TEXT NOT NULL,
            description TEXT NOT NULL,
            collected_by TEXT NOT NULL,
            date_collected TEXT NOT NULL,
            status TEXT NOT NULL
        )
    ''')
    
    # Create Documents table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS documents (
            id TEXT PRIMARY KEY,
            document_name TEXT NOT NULL,
            document_type TEXT NOT NULL,
            linked_person TEXT NOT NULL,
            fir_id TEXT,
            date_added TEXT NOT NULL,
            status TEXT NOT NULL,
            description TEXT
        )
    ''')
    
    conn.commit()
    
    # Check if tables are empty and add sample data
    cursor.execute('SELECT COUNT(*) FROM firs')
    if cursor.fetchone()[0] == 0:
        sample_firs = [
            ('FIR001', 'Rajesh Kumar', 'Theft', '15/01/2025', 'Under Investigation', 
             'Urgent case of mobile phone theft reported at the market. Victim was assaulted during the incident.'),
            ('FIR002', 'Priya Sharma', 'Assault', '14/01/2025', 'Registered',
             'Serious assault case with multiple injuries. Immediate medical attention was required for the victim.'),
            ('FIR003', 'Amit Patel', 'Fraud', '13/01/2025', 'Closed',
             'Online banking fraud complaint. Small amount lost in phishing scam.'),
            ('FIR004', 'Sunita Desai', 'Burglary', '12/01/2025', 'Under Investigation',
             'Critical burglary case with urgent investigation needed. Multiple valuable items stolen from residence.'),
            ('FIR005', 'Vikram Singh', 'Vandalism', '11/01/2025', 'Registered',
             'Property vandalism reported. Minor damage to public property, routine investigation ongoing.')
        ]
        
        for fir in sample_firs:
            score = analyze_case_sentiment(fir[5])
            cursor.execute('''
                INSERT INTO firs (id, name, type, date, status, description, score)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (*fir, score))
        
        # Add sample criminals
        sample_criminals = [
            ('CR001', 'Ramesh Yadav', 'Theft', '10/01/2025', 'Active', 'High', 'Multiple theft cases'),
            ('CR002', 'Suresh Patil', 'Assault', '08/01/2025', 'Arrested', 'High', 'Violent assault record'),
            ('CR003', 'Dinesh Sharma', 'Fraud', '05/01/2025', 'Released', 'Medium', 'Online fraud activities'),
            ('CR004', 'Mukesh Verma', 'Burglary', '03/01/2025', 'Active', 'High', 'House burglary suspect'),
            ('CR005', 'Rajiv Kumar', 'Vandalism', '01/01/2025', 'Released', 'Low', 'Property damage')
        ]
        
        for criminal in sample_criminals:
            cursor.execute('''
                INSERT INTO criminals (id, name, crime_type, date_recorded, status, risk_level, details)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', criminal)
        
        # Add sample officers with Indian police ranks
        sample_officers = [
            ('IPS2024001', 'Rajesh Kumar', 'Inspector', 'On Leave', 'Investigation'),
            ('IPS2024002', 'Priya Sharma', 'Sub-Inspector', 'Active', 'Patrol'),
            ('IPS2024003', 'Vikram Singh', 'Head Constable', 'Active', 'Traffic'),
            ('IPS2024004', 'Amit Patel', 'Constable', 'Active', 'Patrol'),
            ('IPS2024005', 'Sunita Desai', 'Assistant Sub-Inspector', 'Active', 'Investigation'),
            ('IPS2024006', 'Rahul Sharma', 'Constable', 'Active', 'Traffic'),
            ('IPS2024007', 'Anjali Mehta', 'Sub-Inspector', 'Active', 'Patrol'),
            ('IPS2024008', 'Karan Malhotra', 'Head Constable', 'On Leave', 'Investigation'),
            ('IPS2024009', 'Neha Gupta', 'Constable', 'Active', 'Patrol'),
            ('IPS2024010', 'Suresh Yadav', 'Assistant Sub-Inspector', 'Active', 'Traffic'),
            ('IPS2024011', 'Deepika Singh', 'Sub-Inspector', 'Active', 'Investigation'),
            ('IPS2024012', 'Arjun Verma', 'Constable', 'Active', 'Patrol'),
            ('IPS2024013', 'Pooja Joshi', 'Head Constable', 'Active', 'Traffic'),
            ('IPS2024014', 'Ravi Kumar', 'Assistant Sub-Inspector', 'On Leave', 'Investigation'),
            ('IPS2024015', 'Sneha Reddy', 'Constable', 'Active', 'Patrol')
        ]
        
        for officer in sample_officers:
            cursor.execute('''
                INSERT INTO officers (id, name, rank, status, department)
                VALUES (?, ?, ?, ?, ?)
            ''', officer)
        
        conn.commit()
    
    conn.close()

# Initialize database on startup
init_db()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/firs')
def get_firs():
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM firs ORDER BY score DESC')
    rows = cursor.fetchall()
    
    firs = []
    for row in rows:
        firs.append({
            'id': row[0],
            'name': row[1],
            'type': row[2],
            'date': row[3],
            'status': row[4],
            'description': row[5],
            'score': row[6]
        })
    
    conn.close()
    return jsonify(firs)

@app.route('/api/firs', methods=['POST'])
def create_fir():
    data = request.json
    
    # Generate new FIR ID
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM firs')
    count = cursor.fetchone()[0]
    new_id = f'FIR{str(count + 1).zfill(3)}'
    
    # Analyze sentiment
    score = analyze_case_sentiment(data['description'])
    
    # Insert into database
    cursor.execute('''
        INSERT INTO firs (id, name, type, date, status, description, score)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        new_id,
        data['name'],
        data['type'],
        datetime.now().strftime('%d/%m/%Y'),
        'Registered',
        data['description'],
        score
    ))
    
    conn.commit()
    conn.close()
    
    # Return the complete FIR object for immediate display
    return jsonify({
        'success': True,
        'id': new_id,
        'fir': {
            'id': new_id,
            'name': data['name'],
            'type': data['type'],
            'date': datetime.now().strftime('%d/%m/%Y'),
            'status': 'Registered',
            'description': data['description'],
            'score': score
        }
    })

@app.route('/api/criminals')
def get_criminals():
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM criminals')
    rows = cursor.fetchall()
    
    criminals = []
    for row in rows:
        criminals.append({
            'id': row[0],
            'name': row[1],
            'crimeType': row[2],
            'date': row[3],
            'status': row[4],
            'riskLevel': row[5],
            'details': row[6]
        })
    
    conn.close()
    return jsonify(criminals)

@app.route('/api/criminals', methods=['POST'])
def create_criminal():
    data = request.json
    
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM criminals')
    count = cursor.fetchone()[0]
    new_id = f'CR{str(count + 1).zfill(3)}'
    
    cursor.execute('''
        INSERT INTO criminals (id, name, crime_type, date_recorded, status, risk_level, details)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        new_id,
        data['name'],
        data['crimeType'],
        datetime.now().strftime('%d/%m/%Y'),
        data['status'],
        data['riskLevel'],
        data.get('details', '')
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/criminals/<criminal_id>', methods=['PUT'])
def update_criminal(criminal_id):
    """Update criminal record status"""
    data = request.json
    
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Update the status
    cursor.execute('''
        UPDATE criminals 
        SET status = ?
        WHERE id = ?
    ''', (data['status'], criminal_id))
    
    conn.commit()
    
    # Check if update was successful
    if cursor.rowcount > 0:
        conn.close()
        return jsonify({'success': True, 'message': 'Criminal status updated successfully'})
    else:
        conn.close()
        return jsonify({'success': False, 'message': 'Criminal not found'}), 404

@app.route('/api/reports')
def get_reports():
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM reports')
    rows = cursor.fetchall()
    
    reports = []
    for row in rows:
        reports.append({
            'id': row[0],
            'officerName': row[1],
            'incidentType': row[2],
            'date': row[3],
            'status': row[4],
            'description': row[5]
        })
    
    conn.close()
    return jsonify(reports)

@app.route('/api/reports', methods=['POST'])
def create_report():
    data = request.json
    
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM reports')
    count = cursor.fetchone()[0]
    new_id = f'RPT{str(count + 1).zfill(3)}'
    
    cursor.execute('''
        INSERT INTO reports (id, officer_name, incident_type, date, status, description)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (
        new_id,
        data['officerName'],
        data['incidentType'],
        datetime.now().strftime('%d/%m/%Y'),
        'Under Review',
        data['description']
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/officers')
def get_officers():
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM officers')
    rows = cursor.fetchall()
    
    officers = []
    for row in rows:
        officers.append({
            'id': row[0],
            'name': row[1],
            'rank': row[2],
            'status': row[3],
            'department': row[4]
        })
    
    conn.close()
    return jsonify(officers)

@app.route('/api/evidence')
def get_evidence():
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM evidence')
    rows = cursor.fetchall()
    
    evidence = []
    for row in rows:
        evidence.append({
            'id': row[0],
            'firId': row[1],
            'evidenceType': row[2],
            'description': row[3],
            'collectedBy': row[4],
            'dateCollected': row[5],
            'status': row[6]
        })
    
    conn.close()
    return jsonify(evidence)

@app.route('/api/evidence', methods=['POST'])
def create_evidence():
    data = request.json
    
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    cursor.execute('SELECT COUNT(*) FROM evidence')
    count = cursor.fetchone()[0]
    new_id = f'EV{str(count + 1).zfill(3)}'
    
    cursor.execute('''
        INSERT INTO evidence (id, fir_id, evidence_type, description, collected_by, date_collected, status)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (
        new_id,
        data['firId'],
        data['evidenceType'],
        data['description'],
        data['collectedBy'],
        datetime.now().strftime('%d/%m/%Y'),
        'Collected'
    ))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'id': new_id})

@app.route('/api/crime-analysis')
def get_crime_analysis():
    """Get simple crime analysis with bar graph data"""
    try:
        analyzer = SimpleCrimeAnalyzer()
        report = analyzer.generate_report()
        return jsonify(report)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents')
def get_documents():
    """Get all documents"""
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM documents ORDER BY date_added DESC')
    rows = cursor.fetchall()
    
    documents = []
    for row in rows:
        documents.append({
            'id': row[0],
            'documentName': row[1],
            'documentType': row[2],
            'linkedPerson': row[3],
            'firId': row[4],
            'dateAdded': row[5],
            'status': row[6],
            'description': row[7]
        })
    
    conn.close()
    return jsonify(documents)

if __name__ == '__main__':
    app.run(debug=True)