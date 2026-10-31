/**
 * Readable text for a request that never produced a usable server reply.
 *
 * `utils/request.ts` resolves *every* failure — transport errors included —
 * into the same `{ code, message }` envelope the server uses, so `handleResp`
 * stays the single place that decides what the user sees. The cost of that
 * uniformity is that when the reply is missing there is no server message to
 * show and the interceptor falls back to `error.message`, which for an aborted
 * XHR is the engine's own wording:
 *
 *   "The operation either timed out or was not allowed."
 *
 * That sentence reaches the toast verbatim, reads like a server bug, and gives
 * no hint about what to do. It is also what a browser shows when the tab is
 * restored from sleep or the service is mid-restart, i.e. almost always
 * something the user can simply retry.
 *
 * This module only produces display text. The numeric `code` and whether a
 * `data` key is present are deliberately left alone: `pages/home/uploads/
 * multipart.ts` tells a transport failure apart from a server envelope by
 * `"data" in resp` and by `code === -1`, so changing either would silently
 * disable the upload flow's retry path.
 */

/** HTTP statuses that mean "the service is not answering right now". */
const UNAVAILABLE_STATUSES = new Set([502, 503, 504])

/**
 * @param status   HTTP status of the reply, or `undefined` when the request
 *                 never got one (DNS, connection reset, aborted tab).
 * @param cancelled  the caller aborted the request on purpose.
 * @param fallback   axios' own message, used when nothing more specific fits.
 */
export const describeRequestError = ({
  status,
  cancelled = false,
  fallback,
}: {
  status?: number
  cancelled?: boolean
  fallback?: string
}): string => {
  // An abort the app asked for is not a failure worth alarming anyone about.
  if (cancelled) return "The request was cancelled."
  if (status === undefined) {
    return (
      "The service did not answer. Check your connection and try again — " +
      "if this keeps happening the service may be restarting."
    )
  }
  if (UNAVAILABLE_STATUSES.has(status)) {
    return `The service is temporarily unavailable (${status}). Try again in a moment.`
  }
  return fallback || `The request failed (${status}).`
}
