import { useCallback, useEffect, useState } from 'react'
import { getQuery } from '../helpers/apiQuery'

interface UseFetchListResult<T> {
    items: T[]
    loading: boolean
    refetch: () => void
}

function useFetchList<T>(url: string): UseFetchListResult<T> {
    const [items, setItems] = useState<T[]>([])
    const [loading, setLoading] = useState(true)

    const fetchItems = useCallback(() => {
        setLoading(true)
        getQuery<T[]>(url)
            .then((response) => setItems(response.data))
            .catch(() => setItems([]))
            .finally(() => setLoading(false))
    }, [url])

    useEffect(() => {
        fetchItems()
    }, [fetchItems])

    return { items, loading, refetch: fetchItems }
}

export default useFetchList
