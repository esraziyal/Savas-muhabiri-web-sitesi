import { useState, useEffect, createContext, useContext } from 'react';

interface RouterContextType {
  currentPath: string;
  navigate: (path: string) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType | undefined>(undefined);

export function RouterProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
      extractParams(window.location.pathname);
    };

    window.addEventListener('popstate', handlePopState);
    extractParams(currentPath);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const extractParams = (path: string) => {
    const interviewMatch = path.match(/^\/interview\/(.+)$/);
    if (interviewMatch) {
      setParams({ slug: interviewMatch[1] });
    } else {
      setParams({});
    }
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    extractParams(path);
    window.scrollTo(0, 0);
  };

  return (
    <RouterContext.Provider value={{ currentPath, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within RouterProvider');
  }
  return context;
}
