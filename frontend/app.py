import streamlit as st
from openai import OpenAI

# Load key from Streamlit secrets
client = OpenAI(api_key=st.secrets["OPENAI_API_KEY"])

st.set_page_config(page_title="Market Automation AI App", page_icon="🚀", layout="wide")
st.title("🚀 Market Automation AI App")

# Sidebar task selection
task = st.sidebar.selectbox("Choose a function:", ["Text Generation"])

# Prompt input
prompt = st.text_area("Enter your prompt:")

if st.button("Generate"):
    if prompt.strip():
        with st.spinner("Generating..."):
            response = client.chat.completions.create(
                model="gpt-4o-mini",  # You can use gpt-4o or gpt-3.5-turbo
                messages=[{"role": "user", "content": prompt}]
            )
        st.write("### Output")
        st.write(response.choices[0].message["content"])
    else:
        st.warning("Please enter a prompt.")
