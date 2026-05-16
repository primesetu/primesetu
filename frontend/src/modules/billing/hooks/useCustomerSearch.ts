import { useState, useCallback, useRef } from 'react';
import { useQuery }       from '@tanstack/react-query';
import { customerApi }    from '@/api/customer';
import type { CustomerRecord } from '@/api/customer';

export function useCustomerSearch() {
  const [query,    setQuery]    = useState('');
  const [selected, setSelected] = useState<CustomerRecord | null>(null);

  const { data: results = [], isFetching } = useQuery({
    queryKey:  ['customer-search', query],
    queryFn:   () => customerApi.search(query),
    enabled:   query.trim().length >= 2,
    staleTime: 30_000,
  });

  const handleSearch = useCallback((val: string) => {
    setQuery(val);
    if (!val) setSelected(null);
  }, []);

  const selectCustomer = useCallback((c: CustomerRecord) => {
    setSelected(c);
    setQuery(c.name);
  }, []);

  const clear = useCallback(() => {
    setSelected(null);
    setQuery('');
  }, []);

  return { query, results, isFetching, selected, handleSearch, selectCustomer, clear };
}
