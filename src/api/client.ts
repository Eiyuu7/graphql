import { GRAPHQL_URL } from "../config";
import { getToken } from "../auth/auth.service";
import type { GraphQLResponse } from "../types";

/**
 * this is the only function in the app that talks to the GraphQL endpoint; following the functional modularity idiomatic
 *
 *? # something i learnt:
 *? GraphQL replies wit 200 with an array of 'errors' if the query fails
 *? that means checking response.ok is not enough. meaning we have to do `errors.length`
 *? rather than a truthiness test (like this !errors), because an empty array is truthy in JS/TS
 */

/* since fetch is async, this async function will eventually give us whatever we ask of it */
export async function graphqlRequest<T>(
  query: string,
  variables: Record<string, unknown> = {},
): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("not authenticated.");

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = (await response.json()) as GraphQLResponse<T>;
  if (errors && errors.length) throw new Error(errors[0].message);
  if (data == null) throw new Error("graphql response contained no data.");
  return data;
}
