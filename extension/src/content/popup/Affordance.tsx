import React from 'react'

export function Affordance({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className="samjho-affordance" onClick={onClick}>
      {label}
    </button>
  )
}
