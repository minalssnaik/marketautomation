import streamlit as st
import openai
import pandas as pd
import numpy as np

# Load OpenAI API Key from Streamlit secrets
openai.api_key = st.secrets["OPENAI_API_KEY"]

# ---- App Title ----
st.set_page_config(page_title="Market Automation", layout="wide")
st.title("🚀 Market Automation AI App")

# ---- Sidebar ----
st.sidebar.header("Select Task")
task = st.sidebar.selectbox("Choose a function:", ["Text Generation", "Summarization", "Data Analysis"])

# ---- Functions ----
def generate_text(prompt):
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=prompt,
        max_tokens=200
    )
    return response.choices[0].text

def summarize_text(text):
    response = openai.Completion.create(
        model="text-davinci-003",
        prompt=f"Summarize this:\n{text}",
        max_tokens=150
    )
    return response.choices[0].text

def analyze_data(file):
    df = pd.read_csv(file)
    st.write("Data Preview:", df.head())
    st.write("Basic Stats:", df.describe())
    return df

# ---- Main UI ----
if task == "Text Generation":
    prompt = st.text_area("Enter your prompt:")
    if st.button("Generate"):
        if prompt:
            result = generate_text(prompt)
            st.subheader("Generated Text:")
            st.write(result)
        else:
            st.warning("Please enter a prompt!")

elif task == "Summarization":
    text_input = st.text_area("Enter text to summarize:")
    if st.button("Summarize"):
        if text_input:
            summary = summarize_text(text_input)
            st.subheader("Summary:")
            st.write(summary)
        else:
            st.warning("Please enter text to summarize!")

elif task == "Data Analysis":
    uploaded_file = st.file_uploader("Upload CSV file", type=["csv"])
    if uploaded_file is not None:
        analyze_data(uploaded_file)
