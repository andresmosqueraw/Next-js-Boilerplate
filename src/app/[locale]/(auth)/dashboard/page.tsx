import { AppSidebar } from '@/components/app-sidebar';
import { DashboardContent } from '@/components/DashboardContent';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { RestaurantProvider } from '@/contexts/RestaurantContext';
import { RestaurantUrlSync } from '@/components/RestaurantUrlSync';
import {
  getDomiciliosConCarritoActivo,
  getDomiciliosConRelaciones,
  getMesas,
  getMesasConCarritoActivo,
  getRestaurantes,
} from '@/services/restaurante.service';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ restauranteId?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  // Determinar qué restaurante usar: el de la URL o el primero por defecto
  const restauranteIdFromUrl = resolvedSearchParams?.restauranteId
    ? Number.parseInt(resolvedSearchParams.restauranteId, 10)
    : null;

  const [mesas, restaurantes] = await Promise.all([
    getMesas(),
    getRestaurantes(),
  ]);
  
  const restauranteSeleccionado = restauranteIdFromUrl
    ? restaurantes.find(r => r.id === restauranteIdFromUrl) || restaurantes[0]
    : restaurantes[0];

  // Seleccionar el restaurante como predeterminado
  const restauranteDefault = restaurantes.length > 0 ? restauranteSeleccionado : undefined;

  // Obtener domicilios filtrados por restaurante (si está seleccionado)
  // Esto usa cliente_restaurante para mostrar todos los domicilios de clientes conocidos
  const domicilios = await getDomiciliosConRelaciones(restauranteDefault?.id);

  // Obtener mesas y domicilios con carritos activos (con productos) para el restaurante seleccionado
  const [mesasConCarrito, domiciliosConCarrito] = restauranteDefault
    ? await Promise.all([
        getMesasConCarritoActivo(restauranteDefault.id),
        getDomiciliosConCarritoActivo(restauranteDefault.id),
      ])
    : [[], []];

  console.warn('📊 Dashboard cargado:', {
    restaurante: restauranteDefault?.nombre,
    restauranteId: restauranteDefault?.id,
    totalMesas: mesas.length,
    mesasConCarrito: mesasConCarrito.length,
    mesasConCarritoIds: mesasConCarrito,
    domiciliosConCarrito: domiciliosConCarrito.length,
  });

  return (
    <RestaurantProvider defaultRestaurant={restauranteDefault}>
      <RestaurantUrlSync restaurantes={restaurantes} />
      <SidebarProvider defaultOpen={false}>
        <AppSidebar restaurantes={restaurantes} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">
                    Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                  <BreadcrumbPage>Mesas y Domicilios</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>
          <DashboardContent
            todasLasMesas={mesas}
            todosLosDomicilios={domicilios}
            mesasConCarrito={mesasConCarrito}
            domiciliosConCarrito={domiciliosConCarrito}
          />
      </SidebarInset>
    </SidebarProvider>
    </RestaurantProvider>
  );
}
