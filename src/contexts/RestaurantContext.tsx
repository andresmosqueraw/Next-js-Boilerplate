'use client';

import type { Restaurante } from '@/types/database';
import * as React from 'react';

type RestaurantContextType = {
  selectedRestaurant: Restaurante | undefined;
  setSelectedRestaurant: (restaurant: Restaurante) => void;
};

const RestaurantContext = React.createContext<RestaurantContextType | undefined>(undefined);

export function RestaurantProvider({
  children,
  defaultRestaurant,
}: {
  children: React.ReactNode;
  defaultRestaurant?: Restaurante;
}) {
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<Restaurante | undefined>(defaultRestaurant);

  const value = React.useMemo(
    () => ({
      selectedRestaurant,
      setSelectedRestaurant,
    }),
    [selectedRestaurant],
  );

  return (
    <RestaurantContext value={value}>
      {children}
    </RestaurantContext>
  );
}

export function useRestaurant() {
  const context = React.use(RestaurantContext);
  if (context === undefined) {
    throw new Error('useRestaurant must be used within a RestaurantProvider');
  }
  return context;
}
