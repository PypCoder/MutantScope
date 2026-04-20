import torch
import torch.nn as nn
from pathlib import Path
from transformers import EsmModel, EsmTokenizer

WEIGHTS_PATH = Path(__file__).parent.parent / "weights" / "SERAPH.pth"
ESM_MODEL_ID  = "facebook/esm2_t6_8M_UR50D"

IDX_TO_LABEL  = {0: 'H', 1: 'E', 2: 'C'}
PADDING_LABEL = 5

class SERAPH(nn.Module):
    def __init__(self, esm_model, conv_channels=256, kernel_size=7,
                 lstm_hidden=256, num_classes=3, dropout=0.3, freeze_esm=True):
        super().__init__()
        self.esm = esm_model
        if freeze_esm:
            for param in self.esm.encoder.layer[:-2].parameters():
                param.requires_grad = False
        esm_embed_dim = self.esm.config.hidden_size
        self.conv    = nn.Conv1d(esm_embed_dim, conv_channels, kernel_size=kernel_size, padding=kernel_size//2)
        self.bn      = nn.BatchNorm1d(conv_channels)
        self.dropout = nn.Dropout(dropout)
        self.bilstm  = nn.LSTM(conv_channels, lstm_hidden, num_layers=2,
                                batch_first=True, bidirectional=True)
        self.fc      = nn.Linear(lstm_hidden * 2, num_classes)

    def forward(self, input_ids, attention_mask=None):
        x = self.esm(input_ids=input_ids, attention_mask=attention_mask).last_hidden_state
        x = x.transpose(1, 2)
        x = torch.relu(self.bn(self.conv(x)))
        x = self.dropout(x)
        x = x.transpose(1, 2)
        x, _ = self.bilstm(x)
        x = self.dropout(x)
        return self.fc(x)


# ── singleton ────────────────────────────────────────────────
_model     = None
_tokenizer = None

def load_seraph():
    global _model, _tokenizer
    if _model is not None:
        return _model, _tokenizer

    print("Loading ESM2 backbone...")
    esm        = EsmModel.from_pretrained(ESM_MODEL_ID)
    _tokenizer = EsmTokenizer.from_pretrained(ESM_MODEL_ID)

    print("Loading SERAPH weights...")
    _model = SERAPH(esm_model=esm)
    checkpoint = torch.load(WEIGHTS_PATH, map_location="cpu")
    _model.load_state_dict(checkpoint["model_state_dict"])
    _model.eval()
    print("SERAPH ready.")
    return _model, _tokenizer


def predict(sequence: str) -> dict:
    model, tokenizer = load_seraph()
    sequence = sequence.upper()

    tokens = tokenizer(
        sequence,
        return_tensors="pt",
        truncation=True,
        max_length=512,
    )

    with torch.no_grad():
        output = model(
            input_ids=tokens["input_ids"],
            attention_mask=tokens["attention_mask"]
        )
        preds = output.argmax(dim=-1)[0]

    # ESM tokenizer adds [CLS] and [EOS] tokens — strip them
    labels = [IDX_TO_LABEL[p.item()] for p in preds[1:-1]]

    prediction = "".join(labels)
    return {
        "sequence":    sequence,
        "prediction":  prediction,
        "length":      len(sequence),
        "composition": {
            "H": labels.count("H"),
            "E": labels.count("E"),
            "C": labels.count("C"),
        }
    }