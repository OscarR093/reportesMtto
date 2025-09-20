// useApi hook for data fetching
import { useState, useEffect } from 'react';

const useApi = (apiFunction, params = [], autoFetch = true) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async (...args) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await apiFunction(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Error al cargar los datos');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch) {
      fetchData(...params);
    }
  }, []);

  return { data, loading, error, refetch: fetchData };
};

export default useApi;