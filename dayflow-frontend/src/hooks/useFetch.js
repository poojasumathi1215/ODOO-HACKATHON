import { useState, useEffect, useCallback } from 'react';

export const useFetch = (apiFunc, params = null, autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (customParams = null) => {
      setLoading(true);
      setError(null);
      try {
        const response = await apiFunc(customParams !== null ? customParams : params);
        setData(response.data !== undefined ? response.data : response);
        return response;
      } catch (err) {
        setError(err.message || 'Something went wrong');
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFunc, params]
  );

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [autoFetch, execute]);

  return { data, loading, error, refetch: execute, setData };
};

export default useFetch;
