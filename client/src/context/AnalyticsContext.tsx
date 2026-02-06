import { createContext, useContext, useState, type ReactNode} from "react";

interface Filters {
  crop?: string;
  city?: string;
  country?: string;
  startDate?: string;
  endDate?: string;
}

interface AnalyticsContextType {
  filters: Filters;
  setFilters: (filters: Filters) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<Filters>({});

  return (
    <AnalyticsContext.Provider value={{ filters, setFilters }}>
      {children}
    </AnalyticsContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAnalytics = () => {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return ctx;
};
