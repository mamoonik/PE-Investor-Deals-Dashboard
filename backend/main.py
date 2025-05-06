
##############################################
################                   ###########
################                   ###########
##############################################
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from custom_zerox.py_zerox.pyzerox.ocr import extract_text_from_pdf
from openai import OpenAI
import os
from dotenv import load_dotenv
import json
import tempfile
import psycopg2

# Load environment variables and OpenAI client
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# PostgreSQL connection setup
conn = psycopg2.connect(
    dbname="prosights_db",
    user="mamoon_user",
    password="Press@ProSights",
    host="localhost",
    port="5432"
)
cursor = conn.cursor()

# Helper to safely extract just the first value string from each field
def extract_first_value(field):
    if isinstance(field, list) and len(field) > 0 and isinstance(field[0], dict):
        return field[0].get("value", "N/A")
    return "N/A"

# Initialize FastAPI with CORS
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    try:
        # Save uploaded file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp:
            temp.write(await file.read())
            temp_path = temp.name
        
        print(f"📄 Uploaded file: {file.filename}") 

        # Run OCR
        raw_text = await extract_text_from_pdf(temp_path)

        ## LLM prompt
        prompt = f"""
        You are an intelligent document extraction agent.

        Your job is to extract **all relevant values** for each field listed below from the document. For each value, **also include the page number** (as an integer) where it appears.

        Respond in this exact JSON structure:

        {{
        "company_name": [{{"value": "string", "page": number}}],
        "company_description": [{{"value": "string", "page": number}}],
        "business_model": [{{"value": "string", "page": number}}],
        "industry": [{{"value": "string", "page": number}}],
        "management_team": [{{"value": "string", "page": number}}],
        "revenue": [{{"value": "string", "page": number}}],
        "revenue_growth": [{{"value": "string", "page": number}}],
        "gross_profit": [{{"value": "string", "page": number}}],
        "ebitda": [{{"value": "string", "page": number}}]
        }}

        Do not include markdown. Do not explain. Just return valid JSON.

        Document:
        {raw_text}
        """


        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )

        structured = response.choices[0].message.content.strip()
        data = {}

        print("🔍 LLM raw output:\n", structured)

        # Remove markdown code block if present
        if structured.startswith("```json"):
            structured = structured.replace("```json", "").replace("```", "").strip()

        try:
            data = json.loads(structured)
            ####################################################
            # Insrt source_document into each field for hover capabilty across multiple files uploaded
            source_doc = file.filename
            for key, values in data.items():
                if isinstance(values, list):
                    for item in values:
                        if isinstance(item, dict):
                            item["source_document"] = source_doc
            ####################################################
            required_keys = [
                "company_name", "company_description", "business_model",
                "industry", "management_team", "revenue", "revenue_growth",
                "gross_profit", "ebitda"
            ]
            if not all(k in data for k in required_keys):
                raise ValueError("Missing one or more expected keys in JSON")
        except Exception as e:
            print("❌ Failed to parse LLM output as JSON. Saving all fields as 'N/A'.")
            print("⚠️ Error:", e)
            data = {key: "N/A" for key in [
                "company_name", "company_description", "business_model",
                "industry", "management_team", "revenue", "revenue_growth",
                "gross_profit", "ebitda"
            ]}

        with conn.cursor() as cursor: 
            cursor.execute(
            """
            INSERT INTO extracted_data (
                document, company_name, company_description, business_model,
                industry, management_team, revenue, revenue_growth, gross_profit, ebitda, raw_text
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) 
            """,
            (
                file.filename,
                json.dumps(data.get("company_name", [])),
                json.dumps(data.get("company_description", [])),
                json.dumps(data.get("business_model", [])),
                json.dumps(data.get("industry", [])),
                json.dumps(data.get("management_team", [])),
                json.dumps(data.get("revenue", [])),
                json.dumps(data.get("revenue_growth", [])),
                json.dumps(data.get("gross_profit", [])),
                json.dumps(data.get("ebitda", [])),
                raw_text #just added this to add raw_text
                )
            )
            conn.commit()

        return {
            "extracted_text": raw_text,
            "structured_data": data
        }

    except Exception as e:
        # return {"error": str(e)}
        return {"error": "Something went wrong. Please try again.", "details": str(e)}
