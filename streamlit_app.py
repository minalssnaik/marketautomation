import streamlit as st
import requests
import os

st.set_page_config(page_title="Emerging Trends Dashboard", layout="wide")

st.title("🌍 Emerging Trends Explorer")

# Optional: if using FastAPI backend
API_URL = os.getenv("API_URL", "https://your-backend.onrender.com/api")

menu = ["Home", "Parameters", "Analysis"]
choice = st.sidebar.selectbox("Navigate", menu)

if choice == "Home":
    st.markdown("### Welcome to Emerging Trends Dashboard")
    st.write("Use the sidebar to explore parameters or see analysis results.")

elif choice == "Parameters":
    st.subheader("📊 Select Parameters")
    trends = st.multiselect("Emerging Trends", ["AI", "Blockchain", "Sustainability", "FinTech"])
    timeframe = st.selectbox("Timeframe", ["1 Month", "3 Months", "6 Months"])
    if st.button("Submit"):
        payload = {"emerging_trends": trends, "timeframe": timeframe}
        st.json(payload)
        # Send to backend if available
        try:
            response = requests.post(f"{API_URL}/parameters", json=payload)
            st.success(f"Response: {response.status_code}")
        except Exception as e:
            st.error(f"Error connecting to API: {e}")

elif choice == "Analysis":
    st.subheader("📈 Analysis Results")
    st.info("Visualize insights here...")
