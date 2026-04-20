import requests

BASE = "https://alphafold.ebi.ac.uk/api"

def get_structure(uniprot_id: str) -> dict:
    url = f"{BASE}/prediction/{uniprot_id}"
    r = requests.get(url, timeout=10)
    r.raise_for_status()
    data = r.json()[0]
    return {
        "uniprot_id":   uniprot_id,
        "pdb_url":      data["pdbUrl"],
        "cif_url":      data["cifUrl"],
        "sequence":     data["uniprotSequence"],
        "organism":     data.get("organismScientificName", "Unknown"),
        "gene":         data.get("gene", "Unknown"),
        "plddt_url":    data["pdbUrl"],  
    }

def get_sequence(uniprot_id: str) -> str:
    data = get_structure(uniprot_id)
    return data["sequence"]