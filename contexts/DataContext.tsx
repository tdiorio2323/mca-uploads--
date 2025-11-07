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
  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;
  setCommunications: React.Dispatch<React.SetStateAction<Communication[]>>;
}

const DataContext = createContext<DataContextState | undefined>(undefined);

const STORAGE_KEY = 'mca-crm-mock-data';

interface StoredData {
    deals: Deal[];
    documents: Document[];
    communications: Communication[];
    tasks: Task[];
}


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
            try {
                const storedDataRaw = sessionStorage.getItem(STORAGE_KEY);
                if (storedDataRaw) {
                    const storedData: StoredData = JSON.parse(storedDataRaw);
                    setDeals(storedData.deals);
                    setDocuments(storedData.documents);
                    setCommunications(storedData.communications);
                    setTasks(storedData.tasks);
                } else {
                    const generatedData = generateAllMockData(fetchedMerchants);
                    setDeals(generatedData.deals);
                    setDocuments(generatedData.documents);
                    setCommunications(generatedData.communications);
                    setTasks(generatedData.tasks);
                }
            } catch (e) {
                console.error("Failed to load or parse stored data, regenerating.", e);
                const generatedData = generateAllMockData(fetchedMerchants);
                setDeals(generatedData.deals);
                setDocuments(generatedData.documents);
                setCommunications(generatedData.communications);
                setTasks(generatedData.tasks);
            }
        }
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!loading && merchants.length > 0) {
      const dataToStore: StoredData = { deals, documents, communications, tasks };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    }
  }, [deals, documents, communications, tasks, loading, merchants]);

  const value = { 
    merchants, deals, documents, communications, tasks, loading, error, 
    setTasks, setDeals, setDocuments, setCommunications 
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
