import requests

response = requests.post("http://localhost:8000/api/v1/auth/login/access-token", data={"username": "admin", "password": "admin"})
print("Status:", response.status_code)
print("Response:", response.text)
