import { useEffect, useState } from 'react';

export default function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!url) {
      setLoading(false);
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

    setLoading(true);
    setError('');

    fetch(url, { signal })
      .then((response) => {
        if (!response.ok) throw new Error('Không tải được dữ liệu.');
        return response.json();
      })
      .then((data) => setData(data))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Không tải được dữ liệu.');
        }
      })
      .finally(() => setLoading(false));

    return () => {
      abortController.abort();
    };
  }, [url]);

  return { data, loading, error };
}
