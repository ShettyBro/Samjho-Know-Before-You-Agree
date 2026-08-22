import React from 'react'
export function DisclaimerNote({ disclaimer }: { disclaimer: string }) {
  return (
    <footer className="samjho-disclaimer" role="note">
      <p>{disclaimer}</p>
    </footer>
  )
}
