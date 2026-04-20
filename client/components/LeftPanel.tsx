'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

const AA_LIST = [
  'A','C','D','E','F','G','H','I','K','L',
  'M','N','P','Q','R','S','T','V','W','Y'
]

type Props = {
  onMutate: (uniprotId: string, position: number, mutantAa: string) => void
  loading:  boolean
  error:    string | null
}

export default function LeftPanel({ onMutate, loading, error }: Props) {
  const [uniprotId, setUniprotId] = useState('P69905')
  const [position,  setPosition]  = useState(87)
  const [mutantAa,  setMutantAa]  = useState('P')

  const handleSubmit = () => {
    if (!uniprotId || !position || !mutantAa) return
    onMutate(uniprotId.toUpperCase(), position, mutantAa)
  }

  return (
    <motion.aside
      className="panel"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x:   0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="section">
        <label className="label">UNIPROT ID</label>
        <input
          className="input"
          value={uniprotId}
          onChange={e => setUniprotId(e.target.value)}
          placeholder="e.g. P69905"
          spellCheck={false}
        />
      </div>

      <div className="section">
        <label className="label">POSITION</label>
        <input
          className="input"
          type="number"
          value={position}
          onChange={e => setPosition(Number(e.target.value))}
          placeholder="e.g. 87"
          min={1}
        />
      </div>

      <div className="section">
        <label className="label">MUTANT AMINO ACID</label>
        <div className="aa-grid">
          {AA_LIST.map(aa => (
            <button
              key={aa}
              className={`aa-btn ${mutantAa === aa ? 'selected' : ''}`}
              onClick={() => setMutantAa(aa)}
            >
              {aa}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="error">{error}</div>
      )}

      <button
        className="submit"
        onClick={handleSubmit}
        disabled={loading}
      >
        {loading ? (
          <span className="pulse">ANALYZING MUTATION</span>
        ) : (
          'RUN ANALYSIS'
        )}
      </button>

      <div className="hint">
        <div className="hint-label">QUICK EXAMPLES</div>
        <p>→ <span onClick={() => { setUniprotId('P69905'); setPosition(87);  setMutantAa('P') }}>HBA1 L87P — Hemoglobin</span></p>
        <p>→ <span onClick={() => { setUniprotId('P04637'); setPosition(273); setMutantAa('H') }}>TP53 R273H — Tumor Suppressor</span></p>
      </div>

      <style jsx>{`
        .panel {
          border-right: 1px solid var(--border);
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          overflow-y: auto;
          background: var(--bg-surface);
          height: 100%;
        }
        .section { display: flex; flex-direction: column; gap: 10px; }
        .label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          font-weight: 500;
        }
        .input {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text);
          font-family: 'DM Mono', monospace;
          font-size: 14px;
          padding: 12px 14px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
          width: 100%;
          letter-spacing: 0.05em;
        }
        .input:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-dim);
        }
        .input::placeholder { color: var(--text-dim); }
        .aa-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 3px;
        }
        .aa-btn {
          background: var(--bg);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: 'DM Mono', monospace;
          font-size: 12px;
          padding: 9px 0;
          cursor: pointer;
          transition: all 0.15s;
          letter-spacing: 0.05em;
        }
        .aa-btn:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--accent-dim);
        }
        .aa-btn.selected {
          background: var(--accent-dim);
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: inset 0 0 0 1px var(--accent-glow);
        }
        .submit {
          background: var(--accent);
          border: none;
          color: #000;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 11px;
          letter-spacing: 0.2em;
          padding: 16px;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
          width: 100%;
          margin-top: auto;
        }
        .submit:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
        .submit:active:not(:disabled) { transform: translateY(0); }
        .submit:disabled { opacity: 0.4; cursor: not-allowed; }
        .pulse { animation: pulse 1.4s ease-in-out infinite; }
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.3 } }
        .error {
          font-size: 11px;
          color: var(--error);
          border: 1px solid var(--error);
          padding: 10px 12px;
          background: #E0525210;
          line-height: 1.6;
        }
        .hint {
          font-size: 11px;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding-top: 4px;
        }
        .hint-label {
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--text-dim);
          margin-bottom: 2px;
        }
        .hint span {
          color: var(--accent);
          cursor: pointer;
          opacity: 0.8;
          transition: opacity 0.15s;
        }
        .hint span:hover { opacity: 1; }
      `}</style>
    </motion.aside>
  )
}