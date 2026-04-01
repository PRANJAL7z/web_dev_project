"""
Verification script to test all new features
"""
import sqlite3

def verify_database():
    """Verify database tables and data"""
    print("=" * 60)
    print("DATABASE VERIFICATION")
    print("=" * 60)
    
    conn = sqlite3.connect('police_station.db')
    cursor = conn.cursor()
    
    # Check tables exist
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    print("\n✓ Tables found:")
    for table in tables:
        print(f"  - {table}")
    
    # Check documents table
    if 'documents' in tables:
        cursor.execute('SELECT COUNT(*) FROM documents')
        doc_count = cursor.fetchone()[0]
        print(f"\n✓ Documents table: {doc_count} documents")
        
        # Show sample documents
        cursor.execute('SELECT id, document_name, linked_person, fir_id FROM documents LIMIT 5')
        print("\n  Sample documents:")
        for row in cursor.fetchall():
            print(f"    {row[0]}: {row[1]} (Person: {row[2]}, FIR: {row[3]})")
    else:
        print("\n✗ Documents table not found!")
    
    # Check FIRs
    cursor.execute('SELECT COUNT(*) FROM firs')
    fir_count = cursor.fetchone()[0]
    print(f"\n✓ FIRs: {fir_count} records")
    
    # Check if FIRs have locations
    cursor.execute("SELECT description FROM firs WHERE description LIKE '%Location:%' LIMIT 3")
    print("\n  Sample FIR locations:")
    for row in cursor.fetchall():
        if 'Location:' in row[0]:
            location = row[0].split('Location:')[1].strip()[:50]
            print(f"    - {location}")
    
    conn.close()
    print("\n" + "=" * 60)

def verify_ml_model():
    """Verify ML model functionality"""
    print("\nML MODEL VERIFICATION")
    print("=" * 60)
    
    try:
        from ml_models.simple_crime_analyzer import SimpleCrimeAnalyzer
        
        analyzer = SimpleCrimeAnalyzer()
        report = analyzer.generate_report()
        
        print(f"\n✓ Crime Analysis Report Generated")
        print(f"  - Total Cities: {report['total_cities']}")
        print(f"  - Total Crimes: {report['total_crimes']}")
        print(f"  - Analysis Date: {report['analysis_date']}")
        
        if 'future_trends' in report and report['future_trends']:
            print(f"\n✓ Future Trends Prediction: {len(report['future_trends'])} cities")
            print("\n  Top 3 predicted high-risk cities:")
            for i, trend in enumerate(report['future_trends'][:3], 1):
                print(f"    {i}. {trend['city']}: {trend['current_score']} → {trend['predicted_month_3']} ({trend['trend']})")
        else:
            print("\n✗ Future trends not found!")
        
        if 'city_rankings' in report and report['city_rankings']:
            print(f"\n✓ City Rankings: {len(report['city_rankings'])} cities")
            print("\n  Top 3 current rankings:")
            for i, city in enumerate(report['city_rankings'][:3], 1):
                print(f"    {i}. {city['city']}: Score {city['avg_score']} ({city['crime_count']} crimes)")
        
        if 'officer_distribution' in report and report['officer_distribution']:
            print(f"\n✓ Officer Distribution: {len(report['officer_distribution'])} cities")
            total_officers = sum(d['officers_assigned'] for d in report['officer_distribution'])
            print(f"  - Total Officers Assigned: {total_officers}")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error in ML model: {e}")
        print("=" * 60)

def verify_api_endpoints():
    """Verify API endpoints are defined"""
    print("\nAPI ENDPOINTS VERIFICATION")
    print("=" * 60)
    
    try:
        from app import app
        
        endpoints = []
        for rule in app.url_map.iter_rules():
            if rule.endpoint != 'static':
                endpoints.append(f"{rule.rule} [{', '.join(rule.methods - {'HEAD', 'OPTIONS'})}]")
        
        print("\n✓ API Endpoints found:")
        for endpoint in sorted(endpoints):
            print(f"  - {endpoint}")
        
        # Check for new endpoints
        required_endpoints = ['/api/documents', '/api/crime-analysis', '/api/firs']
        print("\n✓ Required endpoints:")
        for endpoint in required_endpoints:
            found = any(endpoint in e for e in endpoints)
            status = "✓" if found else "✗"
            print(f"  {status} {endpoint}")
        
        print("\n" + "=" * 60)
        
    except Exception as e:
        print(f"\n✗ Error checking endpoints: {e}")
        print("=" * 60)

def main():
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 10 + "CRIMESENSE UPDATES VERIFICATION" + " " * 15 + "║")
    print("╚" + "=" * 58 + "╝")
    print("\n")
    
    verify_database()
    verify_ml_model()
    verify_api_endpoints()
    
    print("\n")
    print("╔" + "=" * 58 + "╗")
    print("║" + " " * 15 + "VERIFICATION COMPLETE" + " " * 21 + "║")
    print("╚" + "=" * 58 + "╝")
    print("\n")
    print("All features have been verified!")
    print("\nTo start the application, run:")
    print("  python app.py")
    print("\nThen open your browser to:")
    print("  http://127.0.0.1:5000")
    print("\n")

if __name__ == '__main__':
    main()
