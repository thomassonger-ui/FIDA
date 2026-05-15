'use client'

import { useState, FormEvent, Suspense } from 'react'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'

function GateForm() {
  const params = useSearchParams()
  const from = params.get('from') || '/'
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(false)
    const res = await fetch('/api/gate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: value }),
    })
    if (res.ok) {
      window.location.href = from
    } else {
      setError(true)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 w-full max-w-xs">
      <input
        type="password"
        placeholder="Enter password"
        value={value}
        onChange={e => { setValue(e.target.value); setError(false) }}
        autoFocus
        className={[
          'w-full px-4 py-3 rounded text-sm bg-white border outline-none transition',
          'text-ink placeholder:text-subtle',
          error
            ? 'border-red-400 focus:border-red-400'
            : 'border-rule focus:border-teal',
        ].join(' ')}
      />
      {error && (
        <p className="text-xs text-red-500 -mt-2 text-center">Incorrect password</p>
      )}
      <button
        type="submit"
        disabled={loading || !value}
        className="w-full py-3 rounded text-sm font-semibold tracking-wide bg-navy text-white disabled:opacity-40 transition hover:bg-navy-soft"
      >
        {loading ? 'Checking…' : 'Enter'}
      </button>
    </form>
  )
}

export default function GatePage() {
  return (
    <main className="min-h-screen bg-paper-subtle flex flex-col items-center justify-center gap-8 px-4">
      <div className="flex flex-col items-center gap-4">
        <Image
          src="/atticus-logo.png"
          alt="Atticus"
          width={80}
          height={80}
          priority
        />
        <div className="flex items-start gap-0.5">
          <span className="font-display text-2xl text-navy tracking-tight">Atticus</span>
          <span className="text-[10px] font-semibold text-teal mt-1">™</span>
        </div>
      </div>
      <Suspense>
        <GateForm />
      </Suspense>
      <p className="text-xs text-subtle">Private access only</p>
    </main>
  )
}
