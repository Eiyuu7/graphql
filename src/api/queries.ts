/**
 * the three requested queries given in the audit, along with a query check to make sure that
 * anything inside the `piscine` is basically ignored. however, the only thing that is accepted is
 * the 70k exp given for passing js piscine
 */
export const MODULE_XP_WHERE = `
    _or: [
      { path: { _nilike: "%piscine%" } }
      { amount: { _eq: 70000 }, object: { name: { _eq: "Piscine JS" } } }
    ]
  `

/** nested query, with an aggregate to calculate the total xp */
export const GET_PROFILE = `
    query {
      user {
        id
        login
        auditRatio
        totalUp
        totalDown
      }
      xpAggregate: transaction_aggregate(
        where: { type: { _eq: "xp" }, ${MODULE_XP_WHERE} }
      ) {
        aggregate {
          sum {
            amount
          }
        }
      }
    }
  `

/** argumented and nested query */
export const GET_XP_TRANSACTIONS = `
    query GetXp($userId: Int!) {
      transaction(
        where: {
          userId: { _eq: $userId }
          type: { _eq: "xp" }
          ${MODULE_XP_WHERE}
        }
        order_by: { createdAt: asc }
      ) {
        id
        amount
        createdAt
        path
        object {
          name
          type
        }
      }
    }
  `
