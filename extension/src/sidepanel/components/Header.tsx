import React from 'react'
export function Header() {
  return (
    <header className="samjho-header">
      <div className="samjho-header__mark" aria-hidden="true">
        S
      </div>
      <div>
        <h1 className="samjho-header__title">Samjho</h1>
        <p className="samjho-header__tagline">Know Before You Agree</p>
      </div>
    </header>
  )
}
