import { useCallback, useEffect, useState } from 'react'
import { getQuery } from '../helpers/apiQuery'
import useDebouncedValue from './useDebouncedValue'

interface PaginatedData<T> {
    items: T[]
    page: number
    limit: number
    total: number
    totalPages: number
}

interface UsePaginatedListParams {
    search: string
    onlyActive: boolean
    page: number
    limit: number
}

interface UsePaginatedListResult<T> {
    items: T[]
    loading: boolean
    totalPages: number
    refetch: () => void
}

const SEARCH_DEBOUNCE_MS = 400 // Time waiting for typing to pause before calling the API.

function usePaginatedList<T>(
    url: string,
    { search, onlyActive, page, limit }: UsePaginatedListParams
): UsePaginatedListResult<T> {
    const debouncedSearch = useDebouncedValue(search, SEARCH_DEBOUNCE_MS)
    const [items, setItems] = useState<T[]>([])
    const [totalPages, setTotalPages] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchItems = useCallback(() => {
        setLoading(true)
        getQuery<PaginatedData<T>>(url, { search: debouncedSearch, onlyActive, page, limit })
            .then((response) => {
                setItems(response.data.items)
                setTotalPages(response.data.totalPages)
            })
            .catch(() => {
                setItems([])
                setTotalPages(1)
            })
            .finally(() => setLoading(false))
    }, [url, debouncedSearch, onlyActive, page, limit])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    return { items, loading, totalPages, refetch: fetchItems }
}

export default usePaginatedList
