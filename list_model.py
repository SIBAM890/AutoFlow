from google.generativeai import configure, list_models

# 1️⃣ Add your Gemini API key here
configure(api_key="AIzaSyDcc8gnjCMIAV_z48vYuUwMC9-OSH3Qe04")

# 2️⃣ Fetch & print all models
print("\n🔍 Available Gemini Models:\n")

for model in list_models():
    print(f"- {model.name}")
