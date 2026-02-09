from google.generativeai import configure, list_models

# 1️⃣ Add your Gemini API key here
configure(api_key="")

# 2️⃣ Fetch & print all models
print("\n🔍 Available Gemini Models:\n")

for model in list_models():
    print(f"- {model.name}")
