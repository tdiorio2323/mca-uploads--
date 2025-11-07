import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { Merchant, Deal, Document, Communication, Task } from '../types';
import { generateAllMockData } from '../data/mockData';
import { PostgrestError } from '@supabase/supabase-js';

interface DataContextState {
  merchants: Merchant[];
  deals: Deal[];
  documents: Document[];
  communications: Communication[];
  tasks: Task[];
  loading: boolean;
  error: PostgrestError | null;
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  setDeals: React.Dispatch<React.SetStateAction<Deal[]>>;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<PostgrestError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('merchants').select('*');

      if (error) {
        console.error('Error fetching merchants:', error);
        setError(error);
      } else {
        const fetchedMerchants = data as Merchant[];
        setMerchants(fetchedMerchants);
        if (fetchedMerchants && fetchedMerchants.length > 0) {
            const { deals, documents, communications, tasks } = generateAllMockData(fetchedMerchants);
            setDeals(deals);
            setDocuments(documents);
            setCommunications(communications);
            setTasks(tasks);
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const value = { merchants, deals, documents, communications, tasks, loading, error, setTasks, setDeals };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
