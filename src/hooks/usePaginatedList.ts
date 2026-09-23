import { useCallback, useEffect, useState } from 'react'
import { getQuery } from '../helpers/apiQuery'

interface PaginatedData<T> {
    items: T[]
    page: number
    limit: number
    total: number
    totalPages: number
}

interface UsePaginatedListParams {
    page: number
    limit: number
    // Extra query params (e.g. search, onlyActive, states). Callers own any
    // debouncing before passing values in here.
    filters?: Record<string, string | number | boolean>
}

interface UsePaginatedListResult<T> {
    items: T[]
    loading: boolean
    totalPages: number
    refetch: () => void
}

function usePaginatedList<T>(
    url: string,
    { page, limit, filters = {} }: UsePaginatedListParams
): UsePaginatedListResult<T> {
    const [items, setItems] = useState<T[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    // Stable key so the fetch effect only re-runs when a filter value actually changes,
    // not on every render's new filters object reference.
    const filtersKey = JSON.stringify(filters)

    const fetchItems = useCallback(() => {
        setLoading(true)
        getQuery<PaginatedData<T>>(url, { ...filters, page, limit })
            .then((response) => {
                setItems(response.data.items)
                setTotalPages(response.data.totalPages)
            })
            .catch(() => {
                setItems([])
                setTotalPages(1)
            })
            .finally(() => setLoading(false))
        // filtersKey stands in for filters here, see comment above.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, filtersKey, page, limit])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    return { items, loading, totalPages, refetch: fetchItems }
}

export default usePaginatedList
