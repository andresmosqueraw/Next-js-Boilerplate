'use client';

import type { Restaurante } from '@/types/database';
import { Check, ChevronsUpDown, Store } from 'lucide-react';

import * as React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

export function RestaurantSwitcher({
  restaurantes,
  defaultRestaurant,
}: {
  restaurantes: Restaurante[];
  defaultRestaurant?: Restaurante;
}) {
  // Seleccionar el restaurante por defecto o el primero de la lista
  const restauranteInicial = defaultRestaurant || (restaurantes.length > 0 ? restaurantes[0] : undefined);
  const [selectedRestaurant, setSelectedRestaurant] = React.useState<Restaurante | undefined>(restauranteInicial);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Store className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Restaurante</span>
                <span className="text-xs">
                  {selectedRestaurant?.nombre || 'Seleccionar'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width)"
            align="start"
          >
            {restaurantes.length === 0
              ? (
                  <DropdownMenuItem disabled>
                    No hay restaurantes
                  </DropdownMenuItem>
                )
              : (
                  restaurantes.map(restaurante => (
                    <DropdownMenuItem
                      key={restaurante.id}
                      onSelect={() => setSelectedRestaurant(restaurante)}
                    >
                      <div className="flex flex-col">
                        <span className="font-medium">{restaurante.nombre}</span>
                        {restaurante.direccion && (
                          <span className="text-xs text-muted-foreground">
                            {restaurante.direccion}
                          </span>
                        )}
                      </div>
                      {selectedRestaurant?.id === restaurante.id && (
                        <Check className="ml-auto size-4" />
                      )}
                    </DropdownMenuItem>
                  ))
                )}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
