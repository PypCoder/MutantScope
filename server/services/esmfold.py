import requests
import os

# HF_TOKEN = os.environ["HF_TOKEN"]

# ESMFold public APIs are currently unavailable without paid auth.
# MutantScope uses AlphaFold DB structure for visualization.
# SERAPH handles the mutation analysis on the sequence directly.

def fold_sequence(sequence: str) -> str:
    raise NotImplementedError("ESMFold unavailable — using AlphaFold DB PDB instead.")