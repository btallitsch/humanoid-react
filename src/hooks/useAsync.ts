import { useState, useEffect, useCallback } from "react"

export function useAsync<T>(
  asyncFunction: () => Promise<T>,
  immediate = true
) {
  const [loading, setLoading] = useState(false)
  const [value, setValue] = useState<T | null>(null)
  const [error, setError] = useState<any>(null)

  const execute = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const result = await asyncFunction()
      setValue(result)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }, [asyncFunction])

  useEffect(() => {
    if (immediate) {
      execute()
    }
  }, [execute, immediate])

  return { execute, loading, value, error }
}
