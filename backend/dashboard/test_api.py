#!/usr/bin/env python
"""
API Test Script for Dashboard Backend
Tests all endpoints to ensure they are working correctly
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000/api"

# Colors for terminal output
class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_test(test_name, passed, details=""):
    """Print test result with color"""
    status = f"{Colors.GREEN}✓ PASSED{Colors.END}" if passed else f"{Colors.RED}✗ FAILED{Colors.END}"
    print(f"\n{Colors.BLUE}[TEST]{Colors.END} {test_name}: {status}")
    if details:
        print(f"  {details}")

def test_user_registration():
    """Test user registration endpoint"""
    url = f"{BASE_URL}/auth/register"
    
    # Generate unique email for testing
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    test_data = {
        "email": f"test{timestamp}@example.com",
        "password": "TestPassword123!",
        "password_confirm": "TestPassword123!",
        "first_name": "Test",
        "last_name": "User",
        "user_name": f"testuser{timestamp}"
    }
    
    try:
        response = requests.post(url, json=test_data, headers={"Content-Type": "application/json"})
        passed = response.status_code == 201 and response.json().get("status") == "success"
        
        if passed:
            token = response.json()["data"]["token"]["access"]
            print_test("User Registration", True, f"User created: {test_data['email']}")
            return token, test_data["email"]
        else:
            print_test("User Registration", False, f"Status: {response.status_code}, Response: {response.text}")
            return None, None
    except Exception as e:
        print_test("User Registration", False, f"Error: {str(e)}")
        return None, None

def test_user_login(email):
    """Test user login endpoint"""
    url = f"{BASE_URL}/auth/login"
    
    test_data = {
        "username": email,
        "password": "TestPassword123!"
    }
    
    try:
        response = requests.post(url, json=test_data, headers={"Content-Type": "application/json"})
        passed = response.status_code == 200 and response.json().get("status") == "success"
        
        if passed:
            token = response.json()["data"]["token"]["access"]
            print_test("User Login", True, f"Login successful for: {email}")
            return token
        else:
            print_test("User Login", False, f"Status: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        print_test("User Login", False, f"Error: {str(e)}")
        return None

def test_forgot_password():
    """Test forgot password endpoint"""
    url = f"{BASE_URL}/auth/forgot-password"
    
    test_data = {
        "email": "test@example.com"
    }
    
    try:
        response = requests.post(url, json=test_data, headers={"Content-Type": "application/json"})
        passed = response.status_code == 200 and response.json().get("status") == "success"
        print_test("Forgot Password", passed, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Forgot Password", False, f"Error: {str(e)}")

def test_create_company(token):
    """Test company creation endpoint"""
    url = f"{BASE_URL}/companies"
    
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    test_data = {
        "CompanyName": f"Test Company {timestamp}",
        "domain": "testcompany.com",
        "website": "https://testcompany.com",
        "poc": "John Doe",
        "email": "contact@testcompany.com",
        "phone": "+919876543210",
        "status": "Under Progress",
        "meetingAvailability": "Next Week"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.post(url, json=test_data, headers=headers)
        passed = response.status_code == 201 and response.json().get("status") == "success"
        
        if passed:
            company_id = response.json()["data"]["company"]["id"]
            print_test("Create Company", True, f"Company created with ID: {company_id}")
            return company_id
        else:
            print_test("Create Company", False, f"Status: {response.status_code}, Response: {response.text}")
            return None
    except Exception as e:
        print_test("Create Company", False, f"Error: {str(e)}")
        return None

def test_list_companies(token):
    """Test company list endpoint"""
    url = f"{BASE_URL}/companies/"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        passed = response.status_code == 200 and response.json().get("status") == "success"
        
        if passed:
            total = response.json()["data"]["total"]
            print_test("List Companies", True, f"Total companies: {total}")
        else:
            print_test("List Companies", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("List Companies", False, f"Error: {str(e)}")

def test_update_company(token, company_id):
    """Test company update endpoint"""
    url = f"{BASE_URL}/companies/{company_id}"
    
    test_data = {
        "quotes": "Updated quotation text for testing",
        "status": "Interested"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.put(url, json=test_data, headers=headers)
        passed = response.status_code == 200 and response.json().get("status") == "success"
        print_test("Update Company", passed, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Update Company", False, f"Error: {str(e)}")

def test_update_company_status(token, company_id):
    """Test company status update endpoint"""
    url = f"{BASE_URL}/companies/{company_id}/status"
    
    test_data = {
        "status": "Quotation"
    }
    
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.patch(url, json=test_data, headers=headers)
        passed = response.status_code == 200 and response.json().get("status") == "success"
        print_test("Update Company Status", passed, f"Status: {response.status_code}")
    except Exception as e:
        print_test("Update Company Status", False, f"Error: {str(e)}")

def test_upcoming_meetings(token):
    """Test upcoming meetings endpoint"""
    url = f"{BASE_URL}/companies/upcoming-meetings?limit=3"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        passed = response.status_code == 200 and response.json().get("status") == "success"
        
        if passed:
            total = response.json()["data"]["total"]
            print_test("Upcoming Meetings", True, f"Upcoming meetings: {total}")
        else:
            print_test("Upcoming Meetings", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("Upcoming Meetings", False, f"Error: {str(e)}")

def test_next_week_updates(token):
    """Test next week updates endpoint"""
    url = f"{BASE_URL}/companies/updates"
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    try:
        response = requests.get(url, headers=headers)
        passed = response.status_code == 200 and response.json().get("status") == "success"
        
        if passed:
            total = response.json()["data"]["total"]
            print_test("Next Week Updates", True, f"Updates count: {total}")
        else:
            print_test("Next Week Updates", False, f"Status: {response.status_code}, Response: {response.text}")
    except Exception as e:
        print_test("Next Week Updates", False, f"Error: {str(e)}")

def main():
    """Run all tests"""
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"{Colors.YELLOW}Dashboard API Test Suite{Colors.END}")
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}")
    
    # Test Authentication
    print(f"\n{Colors.YELLOW}--- Authentication Tests ---{Colors.END}")
    token, email = test_user_registration()
    if not token:
        print(f"\n{Colors.RED}Registration failed. Cannot continue with other tests.{Colors.END}")
        return
    
    token = test_user_login(email)
    if not token:
        print(f"\n{Colors.RED}Login failed. Cannot continue with other tests.{Colors.END}")
        return
    
    test_forgot_password()
    
    # Test Company Management
    print(f"\n{Colors.YELLOW}--- Company Management Tests ---{Colors.END}")
    company_id = test_create_company(token)
    test_list_companies(token)
    
    if company_id:
        test_update_company(token, company_id)
        test_update_company_status(token, company_id)
    
    # Test Meeting Management
    print(f"\n{Colors.YELLOW}--- Meeting Management Tests ---{Colors.END}")
    test_upcoming_meetings(token)
    test_next_week_updates(token)
    
    print(f"\n{Colors.YELLOW}{'='*60}{Colors.END}")
    print(f"{Colors.GREEN}All tests completed!{Colors.END}")
    print(f"{Colors.YELLOW}{'='*60}{Colors.END}\n")

if __name__ == "__main__":
    main()
