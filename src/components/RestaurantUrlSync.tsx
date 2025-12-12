'use client';

import { useSearchParams } from 'next/navigation';
import * as React from 'react';
import { useRestaurant } from '@/contexts/RestaurantContext';
import type { Restaurante } from '@/types/database';

export function RestaurantUrlSync({ restaurantes }: { restaurantes: Restaurante[] }) {
  const searchParams = useSearchParams();
  const { selectedRestaurant, setSelectedRestaurant } = useRestaurant();

  React.useEffect(() => {
    const restauranteIdParam = searchParams.get('restauranteId');
    
    if (restauranteIdParam) {
      const restauranteId = Number.parseInt(restauranteIdParam, 10);
      const restaurante = restaurantes.find(r => r.id === restauranteId);
      
      if (restaurante && restaurante.id !== selectedRestaurant?.id) {
        console.warn('🔄 [RestaurantUrlSync] Estableciendo restaurante desde URL:', restaurante.nombre);
        setSelectedRestaurant(restaurante);
      }
    }
  }, [searchParams, restaurantes, selectedRestaurant, setSelectedRestaurant]);

  return null;
}

