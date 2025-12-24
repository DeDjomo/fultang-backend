
import requests
import subprocess
import time
import re
import json

# Configuration
BASE_URL = "http://localhost:8000/api"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "Admin@123"
NEW_PASSWORD = "MonMot2Passe!"

EMAILS = [
    "user@reception.com"
]

def get_token(username, password):
    url = f"{BASE_URL}/token/"
    data = {"username": username, "password": password}
    response = requests.post(url, json=data)
    if response.status_code == 200:
        return response.json()['access']
    else:
        print(f"[-] Failed to get token for {username}: {response.text}")
        return None

def reset_password(admin_token, email):
    url = f"{BASE_URL}/personnel/reset-password/"
    headers = {"Authorization": f"Bearer {admin_token}"}
    data = {"email": email}
    response = requests.post(url, json=data, headers=headers)
    return response.status_code == 200

def get_temp_password_from_logs(email):
    print(f"[*] Waiting for password log for {email}...")
    start_time = time.time()
    while time.time() - start_time < 30:  # Wait up to 30 seconds
        try:
            # Get last 50 lines of logs
            result = subprocess.run(["docker", "logs", "--tail", "50", "django-celery-worker"], capture_output=True, text=True)
            logs = result.stdout + result.stderr
            
            # Search for pattern: EMAIL ENVOYE A: <email>, PASSWORD: <password>
            # Pattern from tasks.py: logger.info(f"EMAIL ENVOYE A: {personnel.email}, PASSWORD: {password}")
            pattern = f"EMAIL ENVOYE A: {email}, PASSWORD: (.+)"
            match = re.search(pattern, logs)
            
            if match:
                password = match.group(1).strip()
                print(f"[+] Found password for {email}: {password}")
                return password
            
        except Exception as e:
            print(f"[-] Error reading logs: {e}")
        
        time.sleep(2)
    
    print(f"[-] Timeout waiting for password for {email}")
    return None

def change_password(user_token, old_password, new_password):
    url = f"{BASE_URL}/personnel/change-password/"
    headers = {"Authorization": f"Bearer {user_token}"}
    data = {
        "old_password": old_password,
        "new_password": new_password,
        "confirm_password": new_password
    }
    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        print("[+] Password changed successfully")
        return True
    else:
        print(f"[-] Failed to change password: {response.text}")
        return False

def main():
    print("[*] Starting batch password reset...")
    
    # 1. Get Admin Token
    admin_token = get_token(ADMIN_USERNAME, ADMIN_PASSWORD)
    if not admin_token:
        print("[-] Could not get admin token. Exiting.")
        return

    for email in EMAILS:
        print(f"\n--- Processing {email} ---")
        
        # 2. Reset Password (trigger email)
        if reset_password(admin_token, email):
            print(f"[*] Reset request sent for {email}")
        else:
            print(f"[-] Failed to send reset request for {email}")
            continue
            
        # 3. Get Temp Password from Logs
        temp_password = get_temp_password_from_logs(email)
        if not temp_password:
            continue
            
        # 4. Authenticate as User
        # Important: Login endpoint uses 'username', but we only have email.
        # However, backend 'api/settings/base.py' uses 'apps.gestion_hospitaliere.backends.EmailOrMatriculeBackend'
        # So we can pass email as username.
        user_token = get_token(email, temp_password)
        if not user_token:
            print(f"[-] Failed to login as {email}")
            continue
            
        # 5. Change Password
        change_password(user_token, temp_password, NEW_PASSWORD)

if __name__ == "__main__":
    main()
