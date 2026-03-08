'use client';

import { useState, useEffect, useCallback } from 'react';
import { MarketOffer } from '@/lib/types';
import { seedOrderbook, replenishOrderbook } from '@/lib/orderbook';
import { loadOffers, saveOffers } from '@/lib/storage';

export function useOrderbook() {
  const [offers, setOffers] = useState<MarketOffer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = loadOffers();
    if (saved && saved.length > 100) {
      const live = replenishOrderbook(saved);
      setOffers(live);
      saveOffers(live);
    } else {
      const fresh = seedOrderbook(200);
      setOffers(fresh);
      saveOffers(fresh);
    }
    setLoading(false);
  }, []);

  const removeOffer = useCallback((id: string) => {
    setOffers(prev => {
      const next = replenishOrderbook(prev.filter(o => o.id !== id));
      saveOffers(next);
      return next;
    });
  }, []);

  const replenish = useCallback(() => {
    setOffers(prev => {
      const next = replenishOrderbook(prev);
      saveOffers(next);
      return next;
    });
  }, []);

  return { offers, loading, removeOffer, replenish };
}
