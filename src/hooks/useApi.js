import { useState, useEffect, useCallback } from "react";

export const useApi = (apiFn, deps = []) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const result = await apiFn();
            setData(result);
        } catch (err) {
            setError(
                err.response?.data?.message || "Failed to load dashboard data"
            );
        } finally {
            setLoading(false);
        }
    }, [apiFn]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    return { data, loading, error, refetch: fetchData };
};
