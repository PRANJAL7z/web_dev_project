import sqlite3
import random
from datetime import datetime, timedelta
from ml_models.sentiment_analyzer import analyze_case_sentiment

# Indian names
first_names = [
    'Rajesh', 'Priya', 'Amit', 'Sunita', 'Vikram', 'Anjali', 'Rahul', 'Deepika',
    'Suresh', 'Kavita', 'Arjun', 'Neha', 'Sanjay', 'Pooja', 'Ravi', 'Sneha',
    'Anil', 'Rekha', 'Karan', 'Meera', 'Ramesh', 'Geeta', 'Prakash', 'Divya',
    'Manoj', 'Nisha', 'Ashok', 'Rani', 'Vishal', 'Swati', 'Dinesh', 'Anita',
    'Nitin', 'Preeti', 'Mahesh', 'Shweta', 'Rohit', 'Shruti', 'Ajay', 'Monika',
    'Sandeep', 'Ritu', 'Yogesh', 'Pallavi', 'Vikas', 'Seema', 'Pankaj', 'Aarti',
    'Sachin', 'Simran', 'Abhishek', 'Sonia', 'Gaurav', 'Ruchi', 'Manish', 'Isha',
    'Kunal', 'Tanya', 'Varun', 'Kirti', 'Naveen', 'Aditi', 'Sumit', 'Prerna'
]

last_names = [
    'Kumar', 'Sharma', 'Patel', 'Desai', 'Singh', 'Mehta', 'Verma', 'Gupta',
    'Shah', 'Joshi', 'Reddy', 'Nair', 'Iyer', 'Rao', 'Malhotra', 'Kapoor',
    'Chopra', 'Bhatia', 'Agarwal', 'Bansal', 'Jain', 'Saxena', 'Mishra', 'Pandey',
    'Chauhan', 'Rathore', 'Yadav', 'Thakur', 'Pillai', 'Menon', 'Das', 'Sen',
    'Ghosh', 'Bose', 'Mukherjee', 'Bhatt', 'Trivedi', 'Kulkarni', 'Patil', 'Pawar'
]

# Crime types
crime_types = ['Theft', 'Assault', 'Fraud', 'Burglary', 'Vandalism', 'Robbery', 'Kidnapping']

# FIR descriptions with varying urgency
fir_descriptions = [
    # High urgency
    'Urgent case of armed robbery at jewelry store. Multiple suspects involved with weapons. Immediate action required.',
    'Critical assault case with severe injuries to victim. Suspect fled the scene. Emergency medical treatment needed.',
    'Serious burglary with violence. Homeowner injured during break-in. Suspects still at large.',
    'Urgent kidnapping case reported. Child missing for 3 hours. Family traumatized and seeking immediate help.',
    'Critical hit and run accident with multiple casualties. Driver absconded. Urgent investigation needed.',
    
    # Medium urgency
    'Mobile phone theft reported at market area. Victim approached while shopping. Moderate concern.',
    'House burglary during family absence. Valuable items stolen including cash and jewelry.',
    'Vehicle theft from parking lot. Car missing since morning. Owner filed complaint.',
    'Online banking fraud reported. Amount of Rs. 50,000 transferred without authorization.',
    'Assault case reported after neighborhood dispute. Minor injuries sustained by complainant.',
    
    # Low urgency
    'Bicycle theft from residential area. Locked cycle stolen overnight from building parking.',
    'Minor property damage due to vandalism. Graffiti on compound wall. Routine investigation.',
    'Petty theft of groceries from local store. Small amount involved. Shop owner filed complaint.',
    'Minor road rage incident. Verbal argument between two drivers. No physical harm.',
    'Noise complaint against neighbor. Disturbance during late hours. Routine matter.'
]

# Criminal details
criminal_statuses = ['Active', 'Arrested', 'Released']
risk_levels = ['Low', 'Medium', 'High']

criminal_details_list = [
    'Multiple prior offenses. Known to operate in downtown area.',
    'First-time offender. Cooperative during investigation.',
    'History of violent crimes. Considered dangerous.',
    'Part of organized crime group. Multiple accomplices.',
    'Repeat offender with several cases pending.',
    'Recently released on bail. Under surveillance.',
    'Known associate of criminal gang. High flight risk.',
    'Juvenile offender. Undergoing rehabilitation.',
    'White-collar criminal. Specializes in financial fraud.',
    'Drug-related offenses. Links to interstate smuggling.'
]

# Cities and areas in India with more detailed locations
cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune',
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Agra', 'Surat', 'Indore', 'Nagpur'
]

# Specific areas within cities for more detailed crime mapping
areas = [
    'Downtown', 'Market Area', 'Residential Colony', 'Industrial Zone', 'Commercial District',
    'Suburb', 'Slum Area', 'Highway', 'Railway Station', 'Bus Stand', 'Shopping Mall',
    'University Area', 'Hospital Zone', 'Government Office', 'Banking District', 'IT Park',
    'Old City', 'New City', 'Airport Area', 'Port Area', 'Border Area', 'Rural Outskirts'
]

def init_evidence_table():
    """Create evidence table if it doesn't exist"""
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
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
    
    conn.commit()
    conn.close()

def generate_random_date(days_back=365):
    """Generate a random date within the last year"""
    today = datetime.now()
    random_days = random.randint(1, days_back)
    random_date = today - timedelta(days=random_days)
    return random_date.strftime('%d/%m/%Y')

def generate_name():
    """Generate a random Indian name"""
    return f"{random.choice(first_names)} {random.choice(last_names)}"

def populate_firs(count=100):
    """Populate database with FIRs"""
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Clear existing FIRs (optional)
    print("Clearing existing FIRs...")
    cursor.execute('DELETE FROM firs')
    
    print(f"Adding {count} FIRs...")
    for i in range(1, count + 1):
        fir_id = f'FIR{str(i).zfill(3)}'
        name = generate_name()
        crime_type = random.choice(crime_types)
        date = generate_random_date()
        status = random.choice(['Registered', 'Under Investigation', 'Closed'])
        description = random.choice(fir_descriptions)
        
        # Add detailed location context to description
        city = random.choice(cities)
        area = random.choice(areas)
        full_description = f"{description} Location: {area}, {city}."
        
        # Calculate importance score
        score = analyze_case_sentiment(full_description)
        
        cursor.execute('''
            INSERT INTO firs (id, name, type, date, status, description, score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (fir_id, name, crime_type, date, status, full_description, score))
        
        if i % 10 == 0:
            print(f"  Added {i} FIRs...")
    
    conn.commit()
    conn.close()
    print(f"Successfully added {count} FIRs!")

def populate_criminals(count=100):
    """Populate database with criminal records"""
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Clear existing criminals (optional)
    print("Clearing existing criminals...")
    cursor.execute('DELETE FROM criminals')
    
    print(f"Adding {count} criminals...")
    for i in range(1, count + 1):
        criminal_id = f'CR{str(i).zfill(3)}'
        name = generate_name()
        crime_type = random.choice(crime_types)
        date_recorded = generate_random_date()
        status = random.choice(criminal_statuses)
        risk_level = random.choice(risk_levels)
        details = random.choice(criminal_details_list)
        
        cursor.execute('''
            INSERT INTO criminals (id, name, crime_type, date_recorded, status, risk_level, details)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (criminal_id, name, crime_type, date_recorded, status, risk_level, details))
        
        if i % 10 == 0:
            print(f"  Added {i} criminals...")
    
    conn.commit()
    conn.close()
    print(f"Successfully added {count} criminals!")

def populate_reports(count=100):
    """Populate database with reports"""
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Clear existing reports (optional)
    print("Clearing existing reports...")
    cursor.execute('DELETE FROM reports')
    
    incident_types = ['Equipment Malfunction', 'Public Complaint', 'Internal Issue', 'Vehicle Issue', 'Safety Concern']
    report_descriptions = [
        'Equipment needs maintenance and repair.',
        'Complaint received from local resident regarding noise.',
        'Internal procedural issue requires attention.',
        'Official vehicle breakdown during patrol duty.',
        'Safety equipment inspection required.',
        'Station facilities need upgrading.',
        'Public grievance about delayed response.',
        'Communication equipment malfunction reported.',
        'Request for additional resources.',
        'Staff training requirement identified.'
    ]
    
    print(f"Adding {count} reports...")
    for i in range(1, count + 1):
        report_id = f'RPT{str(i).zfill(3)}'
        officer_name = generate_name()
        incident_type = random.choice(incident_types)
        date = generate_random_date(180)
        status = random.choice(['Pending', 'Under Review', 'Resolved'])
        description = random.choice(report_descriptions)
        
        cursor.execute('''
            INSERT INTO reports (id, officer_name, incident_type, date, status, description)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (report_id, officer_name, incident_type, date, status, description))
        
        if i % 10 == 0:
            print(f"  Added {i} reports...")
    
    conn.commit()
    conn.close()
    print(f"Successfully added {count} reports!")

def populate_evidence(count=100):
    """Populate database with evidence records - focusing on documents"""
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Clear existing evidence
    print("Clearing existing evidence...")
    cursor.execute('DELETE FROM evidence')
    
    evidence_types = ['Document', 'Document', 'Document', 'Document', 'Document']  # Focus on documents
    evidence_descriptions = [
        'Official witness statement document with signature and date',
        'Medical examination report detailing victim injuries',
        'Bank transaction records showing fraudulent activities',
        'Property ownership documents for stolen items',
        'Vehicle registration papers from recovered vehicle',
        'Insurance claim documents related to the incident',
        'Employment records of suspect for background verification',
        'Phone call logs and communication records',
        'Email correspondence between parties involved',
        'Contract documents in fraud cases',
        'Receipts and invoices for stolen merchandise',
        'Court order documents from previous cases',
        'Identity verification documents of complainant',
        'Property damage assessment report',
        'Forensic laboratory analysis report',
        'Police investigation notes and findings',
        'Surveillance report from security personnel',
        'Financial statements showing monetary losses',
        'Legal notice documents served to parties',
        'Expert witness testimony documentation',
        'Crime scene investigation report',
        'Evidence collection log with timestamps',
        'Chain of custody documentation',
        'Laboratory test results and analysis',
        'Photographic evidence documentation',
        'Audio transcript of witness interviews',
        'Video analysis report from surveillance footage',
        'Digital forensics report from seized devices',
        'Social media activity documentation',
        'Background check reports on suspects'
    ]
    
    evidence_statuses = ['Collected', 'Under Analysis', 'Verified', 'In Storage']
    
    # Get list of FIR IDs
    cursor.execute('SELECT id FROM firs')
    fir_ids = [row[0] for row in cursor.fetchall()]
    
    if not fir_ids:
        print("No FIRs found. Please populate FIRs first!")
        conn.close()
        return
    
    print(f"Adding {count} evidence records...")
    for i in range(1, count + 1):
        evidence_id = f'EV{str(i).zfill(3)}'
        fir_id = random.choice(fir_ids)
        evidence_type = random.choice(evidence_types)
        description = random.choice(evidence_descriptions)
        collected_by = generate_name()
        date_collected = generate_random_date(300)
        status = random.choice(evidence_statuses)
        
        cursor.execute('''
            INSERT INTO evidence (id, fir_id, evidence_type, description, collected_by, date_collected, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (evidence_id, fir_id, evidence_type, description, collected_by, date_collected, status))
        
        if i % 10 == 0:
            print(f"  Added {i} evidence items...")
    
    conn.commit()
    conn.close()
    print(f"Successfully added {count} evidence records!")

if __name__ == '__main__':
    print("=" * 50)
    print("CrimeSense Database Population Script")
    print("=" * 50)
    print()
    
    # Initialize evidence table
    print("Initializing evidence table...")
    init_evidence_table()
    print("Evidence table ready!")
    print()
    
    # Populate all tables
    populate_firs(100)
    print()
    populate_criminals(100)
    print()
    populate_reports(100)
    print()
    populate_evidence(100)
    
    print()
    print("=" * 50)
    print("Database population completed successfully!")
    print("=" * 50)
    print()
    print("Summary:")
    print("  - 100 FIRs")
    print("  - 100 Criminals")
    print("  - 100 Reports")
    print("  - 100 Evidence Items (Document-based)")
    print()
    print("Run 'python app.py' and refresh your browser to see the data!")