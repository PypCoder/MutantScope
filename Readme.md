# MutantScope
### AI-Powered Protein Mutation Analysis Platform

MutantScope analyzes the structural impact of protein mutations using **SERAPH** — an original CNN+BiLSTM model built on ESM2 that predicts secondary structure changes (α-helix, β-sheet, coil) from raw amino acid sequences.

## What it does

Enter any UniProt protein ID, select a position and mutant amino acid — MutantScope will:
1. Fetch the wild-type protein sequence from AlphaFold DB
2. Run **SERAPH** on both wild-type and mutant sequences to predict secondary structure
3. Diff the two predictions to find exactly which regions changed
4. Generate a biological explanation via Gemini AI

## Stack

**Backend**
- FastAPI
- SERAPH (custom ESM2 + CNN + BiLSTM, trained on CullPDB)
- AlphaFold EBI API
- Gemini 3.0 Flash

**Frontend**
- Next.js 15 + TypeScript
- Framer Motion
- Tailwind CSS v4
- Bun

## SERAPH Model

SERAPH (Secondary Structure Recognition and Prediction Hub) is an original deep learning model trained from scratch on the CullPDB dataset. Architecture:

```
ESM2 (facebook/esm2_t6_8M_UR50D)  ← pretrained protein language model
    ↓
Conv1D (kernel=7)  ← local motif detection
    ↓
BatchNorm + Dropout
    ↓
BiLSTM (2 layers, 256 hidden)  ← long-range dependencies
    ↓
Linear → 3 classes (H / E / C)
```

Q3 Test Accuracy: **75.31%**

## Running locally

**Backend**
```bash
cd server
uv sync
# create .env with GEMINI_API_KEY=your_key
uv run uvicorn main:app --reload
```

**Frontend**
```bash
cd client
bun install
bun run dev
```

**Docker** (requires virtualization enabled)
```bash
docker-compose up --build
```

## API

`GET /protein/{uniprot_id}` — fetch protein structure info

`POST /mutate` — run full mutation analysis
```json
{
  "uniprot_id": "P69905",
  "position": 87,
  "mutant_aa": "P"
}
```

## Example

**HBA1 L87P** (Hemoglobin alpha, position 87, Leucine → Proline)

A known pathogenic mutation that destabilizes the F-helix of the alpha-globin chain, leading to hemolytic anemia.

---

<p align="center">
  <a href="https://github.com/PypCoder" target="_blank">
    <img src="https://img.shields.io/badge/GitHub-PypCoder-181717?style=for-the-badge&logo=github&logoColor=white" alt="PypCoder GitHub"/>
  </a>
</p>