'use client'

import { motion } from 'framer-motion'
import { MutationResult } from '@/app/page'

type Props = { result: MutationResult }

const COLORS: Record<string, string> = {
  H: 'var(--helix)',
  E: 'var(--sheet)',
  C: 'var(--coil)',
}

export default function Drawer({ result }: Props) {
  const diff = result.wild_seq.split('').map((aa, i) => ({
    aa,
    changed: aa !== result.mutant_seq[i],
    index:   i,
  }))

  return (
    <motion.section
      className="drawer"
      initial={{ y: '100%', opacity: 0 }}
      animate={{ y: 0,      opacity: 1 }}
      exit={{    y: '100%', opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 35 }}
    >
      {/* meta row */}
      <div className="meta">
        <div className="chip">
          <span className="chip-label">PROTEIN</span>
          <span className="chip-value">{result.uniprot_id}</span>
        </div>
        <div className="chip">
          <span className="chip-label">MUTATION</span>
          <span className="chip-value accent">
            {result.wild_aa}{result.position}{result.mutant_aa}
          </span>
        </div>
        <div className="chip">
          <span className="chip-label">LENGTH</span>
          <span className="chip-value">{result.wild_seq.length} aa</span>
        </div>
        <div className="legend">
          <span style={{ color: 'var(--helix)' }}>■ Helix</span>
          <span style={{ color: 'var(--sheet)' }}>■ Sheet</span>
          <span style={{ color: 'var(--coil)'  }}>■ Coil</span>
          <span style={{ color: 'var(--error)' }}>■ Mutated</span>
        </div>
      </div>

      {/* sequence track */}
      <div className="seq-track">
        {diff.map(({ aa, changed, index }) => (
          <span
            key={index}
            className={`res ${changed ? 'mutated' : ''}`}
            title={`Position ${index + 1}: ${aa}`}
          >
            {aa}
          </span>
        ))}
      </div>

      {/* explanation */}
      <div className="explanation">
        <span className="exp-label">GEMINI ANALYSIS</span>
        <p>{result.explanation}</p>
      </div>

      <style jsx>{`
        .drawer {
          border-top: 1px solid var(--border);
          background: var(--bg-surface);
          padding: 16px 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          max-height: 240px;
          overflow: hidden;
        }
        .meta {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-shrink: 0;
        }
        .chip {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .chip-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }
        .chip-value {
          font-size: 13px;
          font-weight: 500;
        }
        .chip-value.accent { color: var(--accent); }
        .legend {
          margin-left: auto;
          display: flex;
          gap: 12px;
          font-size: 11px;
          color: var(--text-muted);
        }
        .seq-track {
          display: flex;
          flex-wrap: wrap;
          gap: 1px;
          overflow-y: auto;
          max-height: 60px;
          flex-shrink: 0;
        }
        .res {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: var(--text-muted);
          padding: 1px 2px;
          transition: color 0.2s;
        }
        .res:hover { color: var(--text); }
        .res.mutated {
          color: var(--error);
          background: #FF444422;
        }
        .explanation {
          display: flex;
          flex-direction: column;
          gap: 6px;
          overflow-y: auto;
        }
        .exp-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        p {
          font-size: 12px;
          line-height: 1.7;
          color: var(--text);
          opacity: 0.85;
        }
      `}</style>
    </motion.section>
  )
}