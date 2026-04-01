import sqlite3
import random
from datetime import datetime, timedelta

def generate_random_date(days_back=180):
    """Generate a random date within the last 6 months"""
    today = datetime.now()
    random_days = random.randint(1, days_back)
    random_date = today - timedelta(days=random_days)
    return random_date.strftime('%d/%m/%Y')

def populate_documents():
    """Populate database with 20-30 fake documents linked to FIR names"""
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Get names from existing FIRs
    cursor.execute('SELECT DISTINCT name FROM firs LIMIT 15')
    fir_names = [row[0] for row in cursor.fetchall()]
    
    if not fir_names:
        print("No FIR names found. Please populate FIRs first!")
        conn.close()
        return
    
    # Get some FIR IDs for linking
    cursor.execute('SELECT id FROM firs ORDER BY RANDOM() LIMIT 20')
    fir_ids = [row[0] for row in cursor.fetchall()]
    
    # Document types and templates
    document_types = [
        'Witness Statement',
        'Medical Report',
        'Legal Notice',
        'Court Order',
        'Investigation Report',
        'Forensic Report',
        'Property Document',
        'Identity Proof',
        'Bank Statement',
        'Insurance Claim'
    ]
    
    document_templates = {
        'Witness Statement': [
            'Eyewitness testimony regarding incident',
            'Statement recorded at police station',
            'Witness account of events',
            'Detailed witness statement with signature'
        ],
        'Medical Report': [
            'Medical examination report',
            'Injury assessment document',
            'Hospital treatment records',
            'Medical certificate for injuries'
        ],
        'Legal Notice': [
            'Legal notice served to defendant',
            'Court summons document',
            'Legal warning notice',
            'Formal legal communication'
        ],
        'Court Order': [
            'Court order for case proceedings',
            'Judicial order document',
            'Court directive for investigation',
            'Magistrate order'
        ],
        'Investigation Report': [
            'Preliminary investigation findings',
            'Detailed investigation report',
            'Crime scene investigation document',
            'Officer investigation notes'
        ],
        'Forensic Report': [
            'Forensic analysis results',
            'Laboratory test report',
            'DNA analysis document',
            'Fingerprint analysis report'
        ],
        'Property Document': [
            'Property ownership papers',
            'Asset verification document',
            'Property valuation report',
            'Title deed copy'
        ],
        'Identity Proof': [
            'Identity verification document',
            'Address proof document',
            'Government ID copy',
            'Identification papers'
        ],
        'Bank Statement': [
            'Bank transaction records',
            'Account statement',
            'Financial transaction history',
            'Banking records'
        ],
        'Insurance Claim': [
            'Insurance claim form',
            'Claim assessment document',
            'Insurance policy papers',
            'Claim settlement document'
        ]
    }
    
    statuses = ['Active', 'Active', 'Active', 'Archived', 'Under Review']
    
    # Clear existing documents
    print("Clearing existing documents...")
    cursor.execute('DELETE FROM documents')
    
    # Generate 25 documents
    num_documents = 25
    print(f"Adding {num_documents} documents...")
    
    for i in range(1, num_documents + 1):
        doc_id = f'DOC{str(i).zfill(3)}'
        
        # Select random person from FIR names
        linked_person = random.choice(fir_names)
        
        # Select random document type
        doc_type = random.choice(document_types)
        
        # Generate document name
        doc_name = random.choice(document_templates[doc_type])
        
        # Link to FIR (80% chance)
        fir_id = random.choice(fir_ids) if random.random() < 0.8 and fir_ids else None
        
        date_added = generate_random_date()
        status = random.choice(statuses)
        
        # Generate description
        descriptions = [
            f'Official document related to case investigation',
            f'Legal document submitted for case {fir_id}' if fir_id else 'Legal document for records',
            f'Document collected during investigation process',
            f'Verified and authenticated document',
            f'Important case-related documentation'
        ]
        description = random.choice(descriptions)
        
        cursor.execute('''
            INSERT INTO documents (id, document_name, document_type, linked_person, fir_id, date_added, status, description)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (doc_id, doc_name, doc_type, linked_person, fir_id, date_added, status, description))
        
        if i % 5 == 0:
            print(f"  Added {i} documents...")
    
    conn.commit()
    conn.close()
    print(f"Successfully added {num_documents} documents!")
    print("\nDocuments are linked to the following people from FIRs:")
    for name in fir_names[:10]:
        print(f"  - {name}")

if __name__ == '__main__':
    print("=" * 50)
    print("Documents Population Script")
    print("=" * 50)
    print()
    
    populate_documents()
    
    print()
    print("=" * 50)
    print("Document population completed successfully!")
    print("=" * 50)
    print()
    print("Run 'python app.py' and refresh your browser to see the documents!")
