from google import genai
from google.genai import types
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

client = genai.Client(api_key=api_key)
MODEL  = "gemini-3-flash-preview"

def explain_mutation(
    uniprot_id: str,
    position: int,
    wild_aa: str,
    mutant_aa: str,
    wild_result: str,
    mutant_result: str,
    wild_struct: str,
    mutant_struct: str,
) -> str:
    # find changed positions
    changes = [
        i for i, (w, m) in enumerate(zip(wild_struct, mutant_struct)) if w != m
    ]
    affected = f"positions {changes[0]+1}–{changes[-1]+1}" if changes else "no positions"

    prompt = f"""
            You are a structural biologist explaining protein mutations to a researcher.

            Protein:   {uniprot_id}
            Mutation:  {wild_aa}{position}{mutant_aa}
            Structural change: {affected} shifted from the wild-type pattern.

            Wild-type secondary structure (first 60 residues):
            {wild_struct[:60]}

            Mutant secondary structure (first 60 residues):
            {mutant_struct[:60]}

            In 3-4 sentences explain:
            1. What the structural change means biologically
            2. Why {wild_aa}→{mutant_aa} causes this specific change
            3. What functional impact this mutation likely has

            Be specific, concise, and avoid generic statements.
            """.strip()

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            # max_output_tokens=5000,
        )
    )
    return response.text