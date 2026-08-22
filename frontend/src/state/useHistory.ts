import { useEffect, useState } from 'react'
import {
  fetchHistory,
  fetchHistoryResult,
  fetchSaved,
  fetchSavedResult,
  saveAgreement,
  unsaveAgreement,
  type HistoryListItem,
  type SavedListItem,
} from '../api/history.js'
import type { AnalysisResultPayload, PublicUser } from '../api/types.js'

export function useHistory(user: PublicUser | null) {
  const [historyItems, setHistoryItems] = useState<HistoryListItem[]>([])
  const [savedItems, setSavedItems] = useState<SavedListItem[]>([])
  const [loading, setLoading] = useState(false)
  const [openResult, setOpenResult] = useState<AnalysisResultPayload | null>(null)

  async function refresh(): Promise<void> {
    if (!user) {
      setHistoryItems([])
      setSavedItems([])
      return
    }
    setLoading(true)
    const [historyOutcome, savedOutcome] = await Promise.all([fetchHistory(), fetchSaved()])
    setLoading(false)
    if (historyOutcome.ok) setHistoryItems(historyOutcome.value.items)
    if (savedOutcome.ok) setSavedItems(savedOutcome.value.items)
  }

  useEffect(() => {
    void refresh()
  }, [user?.id])

  async function openHistoryItem(agreementId: string): Promise<void> {
    const outcome = await fetchHistoryResult(agreementId)
    if (outcome.ok) setOpenResult(outcome.value.result)
  }

  async function openSavedItem(agreementId: string): Promise<void> {
    const outcome = await fetchSavedResult(agreementId)
    if (outcome.ok) setOpenResult(outcome.value.result)
  }

  function closeOpenResult(): void {
    setOpenResult(null)
  }

  async function save(entry: {
    agreementId: string
    contentHash: string
    analysisVersion: string
    title: string
    sourceUrl?: string
    result: AnalysisResultPayload
  }): Promise<boolean> {
    const outcome = await saveAgreement(entry)
    if (outcome.ok) await refresh()
    return outcome.ok
  }

  async function unsave(agreementId: string): Promise<void> {
    const outcome = await unsaveAgreement(agreementId)
    if (outcome.ok) await refresh()
  }

  function isSaved(agreementId: string): boolean {
    return savedItems.some((item) => item.agreementId === agreementId)
  }

  return { historyItems, savedItems, loading, openResult, refresh, openHistoryItem, openSavedItem, closeOpenResult, save, unsave, isSaved }
}
