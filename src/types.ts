/**
 * shared shapes and interfaces. everything the GraphQL API hands back is described here
 * i guess containerised information of what we're getting back
 *
 *
 * i suppose can be compared to how in Go, the info we'd get back after unmarshalling would get assigned
 * to a defined struct
 */

// for auth

export interface JWTClaims {
  sub?: string | number
  exp: number
  'https://hasura.io/jwt/claims'?: {
    'x-hasura-user-id'?: string
  }
}

// for transport

export interface GraphQLError {
  message: string
}

/**
 * ive written somewhere how js handles GraphQL answers 200 OK
 * even for failures, so `errors` needs to be checked with .length in other instances
 * */
export interface GraphQLResponse<T> {
  data?: T | null
  errors?: GraphQLError[]
}

// for domain

export interface User {
  id: number
  login: string
  auditRatio: number | null
  totalUp: number
  totalDown: number
}

export interface TransactionObject {
  name: string
  type: string
}

export interface Transaction {
  id: number
  amount: number
  createdAt: string
  path: string
  object: TransactionObject | null
}

// for query results

export interface ProfileResponse {
  user: User[]
  xpAggregate: {
    aggregate: {
      sum: { amount: number | null } | null
    } | null
  } | null
}

export interface XpTransactionsResponse {
  transaction: Transaction[]
}

/** profile view shows the user and xp*/
export interface Profile {
  user: User
  moduleXp: number
}

// for charts

export interface BarDatum {
  label: string
  value: number
}

// also for charts
export interface LinePoint {
  date: Date
  total: number
  amount: number
  label: string
}

export type Palette = Record<'amber' | 'green' | 'text' | 'dim' | 'faint' | 'border', string>

export type ViewName = 'login' | 'profile'
