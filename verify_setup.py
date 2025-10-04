#!/usr/bin/env python3
"""
Quick verification script to check if the project is ready to run
"""
import sys
import os
import subprocess
import requests
import time
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - Compatible")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} - Requires Python 3.8+")
        return False

def check_node_version():
    """Check if Node.js is available"""
    try:
        result = subprocess.run(['node', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            version = result.stdout.strip()
            print(f"✅ Node.js {version} - Available")
            return True
    except FileNotFoundError:
        pass
    
    print("❌ Node.js not found - Please install Node.js 16+")
    return False

def check_project_structure():
    """Verify project files exist"""
    required_files = [
        'server/main.py',
        'server/requirements.txt',
        'client/package.json',
        'client/src/App.js',
        'server/.env'
    ]
    
    missing_files = []
    for file_path in required_files:
        if not Path(file_path).exists():
            missing_files.append(file_path)
    
    if missing_files:
        print("❌ Missing required files:")
        for file in missing_files:
            print(f"   - {file}")
        return False
    else:
        print("✅ All required project files found")
        return True

def check_backend_dependencies():
    """Check if Python packages are installed"""
    required_packages = ['fastapi', 'uvicorn', 'sqlalchemy', 'pydantic']
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package)
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print("❌ Missing Python packages:")
        for package in missing_packages:
            print(f"   - {package}")
        print("\n💡 Run: cd server && pip install -r requirements.txt")
        return False
    else:
        print("✅ Required Python packages installed")
        return True

def check_frontend_dependencies():
    """Check if node_modules exists"""
    if Path('client/node_modules').exists():
        print("✅ Frontend dependencies installed")
        return True
    else:
        print("❌ Frontend dependencies not installed")
        print("💡 Run: cd client && npm install")
        return False

def main():
    print("🔍 Verifying Slate Intelligence Document Classifier Setup")
    print("=" * 60)
    
    checks = [
        ("Python Version", check_python_version),
        ("Node.js Installation", check_node_version),
        ("Project Structure", check_project_structure),
        ("Backend Dependencies", check_backend_dependencies),
        ("Frontend Dependencies", check_frontend_dependencies),
    ]
    
    all_passed = True
    for check_name, check_func in checks:
        print(f"\n🔍 {check_name}:")
        if not check_func():
            all_passed = False
    
    print("\n" + "=" * 60)
    if all_passed:
        print("🎉 All checks passed! Project is ready to run.")
        print("\n🚀 To start the project:")
        print("   Option 1: Double-click 'start_project.bat'")
        print("   Option 2: Run servers manually (see README.md)")
        print("\n🌐 After startup, visit: http://localhost:3000")
    else:
        print("⚠️  Some issues found. Please fix them before running the project.")
        print("📖 Check README.md for detailed setup instructions.")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    main()