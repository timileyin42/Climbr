import os

def create_directory_structure():
    """
    Create the directory structure for the iRxcruit backend project.
    """
    # Define the directories to create
    directories = [
        "app/routers",
        "app/models",
        "app/services",
        "app/dependencies",
        "app/templates",
        "app/static/css",
        "app/static/js",
        "app/static/images",
        "tests"
    ]
    
    # Create each directory
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")
    
    # Create __init__.py files to make directories into packages
    init_files = [
        "app/__init__.py",
        "app/routers/__init__.py",
        "app/models/__init__.py",
        "app/services/__init__.py",
        "app/dependencies/__init__.py",
        "tests/__init__.py"
    ]
    
    for init_file in init_files:
        if not os.path.exists(init_file):
            with open(init_file, "w") as f:
                f.write("# This file makes the directory a Python package\n")
            print(f"Created file: {init_file}")

if __name__ == "__main__":
    print("Creating directory structure for iRxcruit backend...")
    create_directory_structure()
    print("Directory structure created successfully!")