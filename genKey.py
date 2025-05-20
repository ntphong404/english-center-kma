import base64
import os

def generate_jwt_secret_key(length_bytes=64):
    # Tạo chuỗi byte ngẫu nhiên an toàn
    random_bytes = os.urandom(length_bytes)
    # Mã hóa base64
    base64_key = base64.b64encode(random_bytes).decode('utf-8')
    return base64_key

if __name__ == "__main__":
    key = generate_jwt_secret_key()
    print("JWT Secret Key (Base64, 64 bytes):")
    print(key)
