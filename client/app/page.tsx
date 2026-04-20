'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import LeftPanel from '@/components/LeftPanel'
import Viewer from '@/components/Viewer'
import Drawer from '@/components/Drawer'

export type MutationResult = {
  uniprot_id:    string
  position:      number
  wild_aa:       string
  mutant_aa:     string
  wild_seq:      string
  mutant_seq:    string
  mutant_pdb:    string
  explanation:   string
  wild_struct:   string
  mutant_struct: string
  composition: {
    wild:   { H: number; E: number; C: number }
    mutant: { H: number; E: number; C: number }
  }
}

export default function Home() {
  const [result, setResult]     = useState<MutationResult | null>(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const handleMutate = async (uniprotId: string, position: number, mutantAa: string) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}/mutate`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          uniprot_id: uniprotId,
          position,
          mutant_aa:  mutantAa,
        }),
      })
      if (!res.ok) throw new Error((await res.json()).detail)
      setResult(await res.json())
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="layout">
      {/* header */}
      <motion.header
        className="header"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y:   0 }}
        transition={{ duration: 0.6 }}
      >
        <span className="wordmark">SERAPH</span>
        <div className="sep" />
        <span className="tagline">Secondary Structure Recognition & Prediction Hub</span>
        <div className={`status ${loading ? 'active' : ''}`}>
          {loading ? 'ANALYZING' : 'READY'}
        </div>
      </motion.header>

      <div className="body">
        <LeftPanel onMutate={handleMutate} loading={loading} error={error} />
        <Viewer result={result} />
      </div>

      <AnimatePresence>
        {result && <Drawer result={result} />}
      </AnimatePresence>

      <style jsx>{`
        .layout {
          display: grid;
          grid-template-rows: 56px 1fr auto;
          height: 100vh;
          overflow: hidden;
        }
        .header {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 0 28px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-surface);
          backdrop-filter: blur(8px);
        }
        .wordmark {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 15px;
          letter-spacing: 0.25em;
          color: var(--accent);
        }
        .sep {
          width: 1px;
          height: 16px;
          background: var(--border);
        }
        .tagline {
          font-size: 10px;
          color: var(--text-muted);
          letter-spacing: 0.08em;
        }
        .status {
          margin-left: auto;
          font-size: 9px;
          letter-spacing: 0.2em;
          color: var(--text-muted);
          padding: 5px 12px;
          border: 1px solid var(--border);
          transition: all 0.3s;
        }
        .status.active {
          color: var(--accent);
          border-color: var(--accent);
          box-shadow: 0 0 12px var(--accent-glow);
        }
        .body {
          display: grid;
          grid-template-columns: 300px 1fr;
          overflow: hidden;
        }
      `}</style>
    </main>
  )
}