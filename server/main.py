import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from services.alphafold import get_structure, get_sequence
from models.seraph import predict as seraph_predict
from services.esmfold import fold_sequence
from services.gemini import explain_mutation

app = FastAPI(title="MutantScope API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── request models ──────────────────────────────────────────
class MutationRequest(BaseModel):
    uniprot_id: str
    position:   int
    mutant_aa:  str

# ── routes ──────────────────────────────────────────────────
@app.get("/protein/{uniprot_id}")
def get_protein(uniprot_id: str):
    try:
        return get_structure(uniprot_id.upper())
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.post("/mutate")
def mutate(req: MutationRequest):
    try:
        # 1. get wild-type sequence
        wild_seq = get_sequence(req.uniprot_id.upper())

        # 2. validate position
        if req.position < 1 or req.position > len(wild_seq):
            raise HTTPException(status_code=400, detail="Position out of range")

        wild_aa = wild_seq[req.position - 1]

        # 3. create mutant sequence
        mutant_seq = (
            wild_seq[:req.position - 1] +
            req.mutant_aa.upper() +
            wild_seq[req.position:]
        )

        wild_structure = get_structure(req.uniprot_id.upper())
        mutant_pdb = wild_structure["pdb_url"]

        wild_result = seraph_predict(wild_seq)
        mutant_result = seraph_predict(mutant_seq)

        # 5. gemini explanation
        # seraph will plug in here once training is done
        explanation = explain_mutation(
            uniprot_id=req.uniprot_id,
            position=req.position,
            wild_aa=wild_aa,
            mutant_aa=req.mutant_aa,
            wild_result = wild_result,
            mutant_result = mutant_result,
            wild_struct = wild_result["prediction"],
            mutant_struct = mutant_result["prediction"],
        )

        return {
            "uniprot_id": req.uniprot_id,
            "position": req.position,
            "wild_aa": wild_aa,
            "mutant_aa": req.mutant_aa,
            "wild_seq": wild_seq,
            "mutant_seq": mutant_seq,
            "mutant_pdb": mutant_pdb,
            "explanation": explanation,
            "wild_struct": wild_result["prediction"],
            "mutant_struct": mutant_result["prediction"],
            "composition": {
                "wild": wild_result["composition"],
                "mutant": mutant_result["composition"],
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
def health():
    return {"status": "ok"}