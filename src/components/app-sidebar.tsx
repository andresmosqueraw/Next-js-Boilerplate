import type { Restaurante } from '@/types/database';

import * as React from 'react';
import { RestaurantSwitcher } from '@/components/restaurant-switcher';
import { SearchForm } from '@/components/search-form';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar';

// This is sample data.
const data = {
  navMain: [
    {
      title: 'Restaurante',
      url: '#',
      items: [
        {
          title: 'Mesas y Domicilios',
          url: '#',
          isActive: true,
        },
      ],
    },
  ],
};

export function AppSidebar({
  restaurantes,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  restaurantes: Restaurante[];
}) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <RestaurantSwitcher restaurantes={restaurantes} />
        <SearchForm />
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map(item => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map(item => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={item.isActive}>
                      <a href={item.url}>{item.title}</a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
