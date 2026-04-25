/* ============================================================
 * PrimeSetu — Shoper9-Based Retail OS
 * Zero Cloud · Sovereign · AI-Governed
 * ============================================================
 * System Architect   :  Jawahar R. M.
 * Organisation       :  AITDL Network
 * Project            :  PrimeSetu
 * © 2026 — All Rights Reserved
 * "Memory, Not Code."
 * ============================================================ */

import { useState, useEffect } from 'react';
import { fetchMenu, MenuItem } from '../api/menuService';

/**
 * useMenu Hook
 * Provides the dynamic Sovereign menu and helper functions for navigation.
 */
export const useMenu = () => {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    fetchMenu()
      .then(data => {
        if (isMounted) {
          setMenu(data);
          setLoading(false);
        }
      })
      .catch(err => {
        console.error("[PrimeSetu] Menu Hook Failure:", err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, []);

  /**
   * Finds a module definition by ID within the recursive menu tree.
   */
  const findModule = (id: string, items: MenuItem[] = menu): MenuItem | undefined => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children && item.children.length > 0) {
        const found = findModule(id, item.children);
        if (found) return found;
      }
    }
    return undefined;
  };

  /**
   * Flattens the menu tree into a single-level list for search/indexing.
   */
  const getFlattenedMenu = (items: MenuItem[] = menu): MenuItem[] => {
    let flattened: MenuItem[] = [];
    items.forEach(item => {
      flattened.push(item);
      if (item.children) {
        flattened = [...flattened, ...getFlattenedMenu(item.children)];
      }
    });
    return flattened;
  };

  return { 
    menu, 
    loading, 
    error, 
    findModule, 
    getFlattenedMenu 
  };
};
