'use client'

import { motion } from 'framer-motion'
import { MutationResult } from '@/app/page'

type Props = { result: MutationResult | null }

const CHUNK = 60

function StructureTrack({
  label, sequence, struct, mutant_struct
}: {
  label: string
  sequence: string
  struct: string
  mutant_struct?: string
}) {
  return (
    <div className="track">
      <div className="track-label">{label}</div>
      <div className="track-body">
        {struct.split('').map((s, i) => {
          const changed = mutant_struct ? s !== mutant_struct[i] : false
          return (
            <span
              key={i}
              className={`residue ss-${s} ${changed ? 'changed' : ''}`}
              title={`${sequence[i]}${i + 1}: ${s === 'H' ? 'Helix' : s === 'E' ? 'Sheet' : 'Coil'}`}
            >
              {sequence[i]}
            </span>
          )
        })}
      </div>
      <style jsx>{`
        .track { display: flex; flex-direction: column; gap: 6px; }
        .track-label {
          font-size: 9px;
          letter-spacing: 0.15em;
          color: var(--text-muted);
        }
        .track-body {
          display: flex;
          flex-wrap: wrap;
          gap: 1px;
        }
        .residue {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          padding: 3px 4px;
          cursor: default;
          transition: all 0.15s;
          border-bottom: 2px solid transparent;
        }
        .residue:hover { opacity: 0.7; }
        .ss-H { color: var(--helix);  border-bottom-color: var(--helix); }
        .ss-E { color: var(--sheet);  border-bottom-color: var(--sheet); }
        .ss-C { color: var(--text-muted); }
        .changed {
          background: #FF444422;
          border-bottom-color: var(--error) !important;
          color: var(--error) !important;
        }
      `}</style>
    </div>
  )
}

function CompositionBar({ comp, label }: {
  comp: { H: number; E: number; C: number }
  label: string
}) {
  const total = comp.H + comp.E + comp.C
  const pct   = (n: number) => `${((n / total) * 100).toFixed(1)}%`

  return (
    <div className="compbar">
      <div className="compbar-label">{label}</div>
      <div className="bar">
        <div className="seg helix"  style={{ width: pct(comp.H) }} title={`Helix ${pct(comp.H)}`} />
        <div className="seg sheet"  style={{ width: pct(comp.E) }} title={`Sheet ${pct(comp.E)}`} />
        <div className="seg coil"   style={{ width: pct(comp.C) }} title={`Coil ${pct(comp.C)}`}  />
      </div>
      <div className="compbar-stats">
        <span style={{ color: 'var(--helix)' }}>H {pct(comp.H)}</span>
        <span style={{ color: 'var(--sheet)' }}>E {pct(comp.E)}</span>
        <span style={{ color: 'var(--coil)'  }}>C {pct(comp.C)}</span>
      </div>
      <style jsx>{`
        .compbar { display: flex; flex-direction: column; gap: 6px; }
        .compbar-label { font-size: 9px; letter-spacing: 0.15em; color: var(--text-muted); }
        .bar { display: flex; height: 4px; border-radius: 2px; overflow: hidden; gap: 1px; }
        .seg { height: 100%; transition: width 0.6s cubic-bezier(.4,0,.2,1); }
        .helix { background: var(--helix); }
        .sheet { background: var(--sheet); }
        .coil  { background: var(--border); }
        .compbar-stats { display: flex; gap: 12px; font-size: 10px; }
      `}</style>
    </div>
  )
}

export default function Viewer({ result }: Props) {
  if (!result) return (
    <motion.section
      className="viewer-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="empty">
        <div className="ring" />
        <p>Enter a UniProt ID and mutation<br />to visualize structural changes</p>
      </div>
      <style jsx>{`
        .viewer-wrap {
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg);
          border-left: 1px solid var(--border);
        }
        .empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 24px;
          color: var(--text-muted);
          font-size: 12px;
          text-align: center;
          line-height: 1.8;
        }
        .ring {
          width: 80px; height: 80px;
          border: 1px solid var(--border);
          border-top-color: var(--accent);
          border-radius: 50%;
          animation: spin 3s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </motion.section>
  )

  return (
    <motion.section
      className="viewer-wrap"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="inner">

        {/* composition bars */}
        <div className="comp-row">
          <CompositionBar comp={result.composition.wild}   label="WILD-TYPE COMPOSITION" />
          <div className="divider" />
          <CompositionBar comp={result.composition.mutant} label="MUTANT COMPOSITION" />
        </div>

        <div className="separator" />

        {/* structure tracks */}
        <div className="tracks">
          <StructureTrack
            label="WILD-TYPE STRUCTURE"
            sequence={result.wild_seq}
            struct={result.wild_struct}
            mutant_struct={result.mutant_struct}
          />
          <StructureTrack
            label="MUTANT STRUCTURE"
            sequence={result.mutant_seq}
            struct={result.mutant_struct}
          />
        </div>

      </div>

      <style jsx>{`
        .viewer-wrap {
          background: var(--bg);
          border-left: 1px solid var(--border);
          overflow-y: auto;
          padding: 28px;
        }
        .inner {
          display: flex;
          flex-direction: column;
          gap: 24px;
          height: 100%;
        }
        .comp-row {
          display: flex;
          gap: 24px;
          align-items: flex-start;
        }
        .divider {
          width: 1px;
          background: var(--border);
          align-self: stretch;
        }
        .comp-row > :global(*) { flex: 1; }
        .separator {
          height: 1px;
          background: var(--border);
        }
        .tracks {
          display: flex;
          flex-direction: column;
          gap: 24px;
          flex: 1;
        }
      `}</style>
    </motion.section>
  )
}