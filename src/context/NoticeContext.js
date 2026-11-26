import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const NoticeContext = createContext(null);

export function NoticeProvider({ children }) {
  const [notice, setNotice] = useState(null);
  const timerRef = useRef(null);

  const showNotice = useCallback((message) => {
    setNotice(message);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setNotice(null);
      timerRef.current = null;
    }, 3000);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <NoticeContext.Provider value={showNotice}>
      {children}
      {notice && <div role="status" className="notice-toast">{notice}</div>}
    </NoticeContext.Provider>
  );
}

export function useNotice() {
  const context = useContext(NoticeContext);
  if (!context) throw new Error('useNotice phải dùng bên trong NoticeProvider');
  return context;
}
