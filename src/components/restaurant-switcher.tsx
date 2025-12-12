'use client';

import type { Restaurante } from '@/types/database';
import { Check, ChevronsUpDown, Store } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
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
import { useRestaurant } from '@/contexts/RestaurantContext';

export function RestaurantSwitcher({
  restaurantes,
}: {
  restaurantes: Restaurante[];
}) {
  const { selectedRestaurant, setSelectedRestaurant } = useRestaurant();
  const router = useRouter();
  const pathname = usePathname();

  const handleSelectRestaurant = (restaurante: Restaurante) => {
    setSelectedRestaurant(restaurante);
    
    // Actualizar la URL con el restauranteId si estamos en el dashboard
    if (pathname?.includes('/dashboard')) {
      const newUrl = `/dashboard?restauranteId=${restaurante.id}`;
      router.push(newUrl);
      router.refresh();
    }
  };

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
                      onSelect={() => handleSelectRestaurant(restaurante)}
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
