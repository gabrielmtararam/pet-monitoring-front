export function toUtcISOStringOrUndefined(localDateTime: string | null | undefined): string | undefined {
  if (!localDateTime)
    return undefined

  const parsed = new Date(localDateTime)
  if (Number.isNaN(parsed.getTime()))
    return undefined

  return parsed.toISOString()
}

