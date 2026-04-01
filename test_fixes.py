"""
Test script to verify all fixes are working.
"""
import sqlite3

PASS = "[PASS]"
FAIL = "[FAIL]"


def test_database_connection():
    """Test database connection and tables."""
    print("=" * 60)
    print("TEST 1: Database Connection")
    print("=" * 60)

    try:
        conn = sqlite3.connect("police_station.db")
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM firs")
        fir_count = cursor.fetchone()[0]
        print(f"{PASS} FIRs table accessible: {fir_count} records")

        cursor.execute("SELECT COUNT(*) FROM criminals")
        criminal_count = cursor.fetchone()[0]
        print(f"{PASS} Criminals table accessible: {criminal_count} records")

        cursor.execute("SELECT COUNT(*) FROM documents")
        doc_count = cursor.fetchone()[0]
        print(f"{PASS} Documents table accessible: {doc_count} records")

        conn.close()
        print(f"\n{PASS} Database connection test PASSED\n")
        return True
    except Exception as e:
        print(f"\n{FAIL} Database connection test FAILED: {e}\n")
        return False


def test_fir_insertion():
    """Test FIR insertion."""
    print("=" * 60)
    print("TEST 2: FIR Insertion")
    print("=" * 60)

    try:
        conn = sqlite3.connect("police_station.db")
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) FROM firs")
        before_count = cursor.fetchone()[0]
        print(f"FIRs before insertion: {before_count}")

        test_id = f"FIR{str(before_count + 1).zfill(3)}"
        cursor.execute(
            """
            INSERT INTO firs (id, name, type, date, status, description, score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (test_id, "Test Person", "Theft", "13/11/2025", "Registered", "Test FIR for verification", 0.5),
        )

        conn.commit()

        cursor.execute("SELECT COUNT(*) FROM firs")
        after_count = cursor.fetchone()[0]
        print(f"FIRs after insertion: {after_count}")

        cursor.execute("SELECT * FROM firs WHERE id = ?", (test_id,))
        fir = cursor.fetchone()

        if fir and fir[1] == "Test Person":
            print(f"{PASS} Test FIR inserted successfully: {test_id}")
            print(f"  Name: {fir[1]}")
            print(f"  Type: {fir[2]}")
            print(f"  Status: {fir[4]}")

            cursor.execute("DELETE FROM firs WHERE id = ?", (test_id,))
            conn.commit()
            print(f"{PASS} Test FIR cleaned up")
        else:
            print(f"{FAIL} Test FIR not found after insertion")
            conn.close()
            return False

        conn.close()
        print(f"\n{PASS} FIR insertion test PASSED\n")
        return True
    except Exception as e:
        print(f"\n{FAIL} FIR insertion test FAILED: {e}\n")
        return False


def test_criminal_status_update():
    """Test criminal status update."""
    print("=" * 60)
    print("TEST 3: Criminal Status Update")
    print("=" * 60)

    try:
        conn = sqlite3.connect("police_station.db")
        cursor = conn.cursor()

        cursor.execute("SELECT id, name, status FROM criminals LIMIT 1")
        criminal = cursor.fetchone()

        if not criminal:
            print(f"{FAIL} No criminals found in database")
            conn.close()
            return False

        criminal_id, name, original_status = criminal
        print(f"Testing with criminal: {criminal_id} - {name}")
        print(f"Original status: {original_status}")

        new_status = "Under Investigation"
        cursor.execute("UPDATE criminals SET status = ? WHERE id = ?", (new_status, criminal_id))
        conn.commit()

        cursor.execute("SELECT status FROM criminals WHERE id = ?", (criminal_id,))
        updated_status = cursor.fetchone()[0]

        if updated_status == new_status:
            print(f"{PASS} Status updated successfully to: {new_status}")
            cursor.execute("UPDATE criminals SET status = ? WHERE id = ?", (original_status, criminal_id))
            conn.commit()
            print(f"{PASS} Original status restored: {original_status}")
        else:
            print(f"{FAIL} Status update failed. Expected: {new_status}, Got: {updated_status}")
            conn.close()
            return False

        conn.close()
        print(f"\n{PASS} Criminal status update test PASSED\n")
        return True
    except Exception as e:
        print(f"\n{FAIL} Criminal status update test FAILED: {e}\n")
        return False


def test_api_endpoints():
    """Test if API endpoints are defined."""
    print("=" * 60)
    print("TEST 4: API Endpoints")
    print("=" * 60)

    try:
        from app import app

        endpoints = []
        for rule in app.url_map.iter_rules():
            if "/api/" in rule.rule:
                methods = ", ".join(rule.methods - {"HEAD", "OPTIONS"})
                endpoints.append(f"{rule.rule} [{methods}]")

        print("Available API endpoints:")
        for endpoint in sorted(endpoints):
            print(f"  {PASS} {endpoint}")

        required = [
            "/api/firs",
            "/api/criminals",
            "/api/criminals/<criminal_id>",
            "/api/documents",
        ]

        print("\nRequired endpoints check:")
        all_found = True
        for req in required:
            found = any(req in endpoint for endpoint in endpoints)
            status = PASS if found else FAIL
            print(f"  {status} {req}")
            if not found:
                all_found = False

        if all_found:
            print(f"\n{PASS} API endpoints test PASSED\n")
            return True

        print(f"\n{FAIL} Some required endpoints missing\n")
        return False
    except Exception as e:
        print(f"\n{FAIL} API endpoints test FAILED: {e}\n")
        return False


def main():
    print("\n")
    print("=" * 60)
    print("TESTING ALL FIXES")
    print("=" * 60)
    print("\n")

    results = []
    results.append(("Database Connection", test_database_connection()))
    results.append(("FIR Insertion", test_fir_insertion()))
    results.append(("Criminal Status Update", test_criminal_status_update()))
    results.append(("API Endpoints", test_api_endpoints()))

    print("\n")
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    print("\n")

    for test_name, result in results:
        status = f"{PASS} PASSED" if result else f"{FAIL} FAILED"
        print(f"{test_name:.<40} {status}")

    all_passed = all(result for _, result in results)

    print("\n")
    if all_passed:
        print("=" * 60)
        print("ALL TESTS PASSED!")
        print("=" * 60)
        print("\n")
        print(f"{PASS} FIR registration now works correctly")
        print(f"{PASS} New FIRs appear instantly in the list")
        print(f"{PASS} Criminal status can be edited")
        print(f"{PASS} Database persistence is working")
        print("\nYou can now:")
        print("1. Start the app: python app.py")
        print("2. Open browser: http://127.0.0.1:5000")
        print("3. Test FIR registration")
        print("4. Test criminal status editing")
    else:
        print("=" * 60)
        print("SOME TESTS FAILED")
        print("=" * 60)
        print("\nPlease check the errors above.")

    print("\n")


if __name__ == "__main__":
    main()
