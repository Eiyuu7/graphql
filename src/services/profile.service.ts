import { graphqlRequest } from '../api/client'
import { GET_PROFILE, GET_XP_TRANSACTIONS } from '../api/queries'
import { getToken } from '../auth/auth.service'
import { getUserId } from '../auth/jwt'
import type { BarDatum, LinePoint, Profile, ProfileResponse, Transaction, XpTransactionsResponse } from '../types'

// fetching operations done based on the types as well

export async function getProfile(): Promise<Profile> {
  const data = await graphqlRequest<ProfileResponse>(GET_PROFILE)
  return {
    user: data.user[0],
    moduleXp: data.xpAggregate?.aggregate?.sum?.amount || 0,
  }
}

export async function getXpTransactions(): Promise<Transaction[]> {
  const token = getToken()
  const userId = token ? getUserId(token) : undefined
  if (userId === undefined) throw new Error('could not determine user id from token.')

  const data = await graphqlRequest<XpTransactionsResponse>(GET_XP_TRANSACTIONS, { userId })
  return data.transaction
}

// pure helpers wihtout DOM manipulations

/** The platform measures xp in bytes, so 1 kB is 1000 xp rather than 1024. */
export function formatXp(amount: number | null | undefined): string {
  const value = amount || 0
  if (value >= 1e6) return (value / 1e6).toFixed(1) + ' MB'
  if (value >= 1e3) return (value / 1e3).toFixed(1) + ' kB'
  return Math.round(value) + ' B'
}

// another helper functions
export function remainderToNextMB(amount: number | null | undefined): string {
  const value = amount || 0
  const nextMB = (Math.floor(value / 1e6) + 1) * 1e6
  return `${formatXp(nextMB - value)} to next MB`
}

export const projectLabel = (t: Transaction): string => t.object?.name || (t.path || 'unknown').split('/').filter(Boolean).pop() || 'unknown'

export function groupXpByProject(transactions: Transaction[]): BarDatum[] {
  const totals = new Map<string, number>()
  for (const t of transactions) {
    const label = projectLabel(t)
    totals.set(label, (totals.get(label) || 0) + t.amount)
  }
  return [...totals].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
}

export function cumulativeXpOverTime(transactions: Transaction[]): LinePoint[] {
  let running = 0
  return transactions
    .slice()
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map((t) => ({
      date: new Date(t.createdAt),
      total: (running += t.amount),
      amount: t.amount,
      label: projectLabel(t),
    }))
}
