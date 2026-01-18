from app.main import app

print("Registered Routes:")
for route in app.routes:
    if hasattr(route, 'methods'):
        print(f"{list(route.methods)} - {route.path}")
    else:
        print(f"N/A - {route.path}")
