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
import {
  getDomiciliosConCarritoActivo,
  getDomiciliosConRelaciones,
  getMesas,
  getMesasConCarritoActivo,
  getRestaurantes,
} from '@/services/restaurante.service';

export default async function Page() {
  const [mesas, domicilios, restaurantes] = await Promise.all([
    getMesas(),
    getDomiciliosConRelaciones(),
    getRestaurantes(),
  ]);

  // Seleccionar el primer restaurante como predeterminado
  const primerRestaurante = restaurantes.length > 0 ? restaurantes[0] : undefined;

  // Obtener mesas y domicilios con carritos activos (con productos)
  const [mesasConCarrito, domiciliosConCarrito] = primerRestaurante
    ? await Promise.all([
        getMesasConCarritoActivo(primerRestaurante.id),
        getDomiciliosConCarritoActivo(primerRestaurante.id),
      ])
    : [[], []];

  console.warn('📊 Dashboard cargado:', {
    restaurante: primerRestaurante?.nombre,
    totalMesas: mesas.length,
    mesasConCarrito: mesasConCarrito.length,
    mesasConCarritoIds: mesasConCarrito,
    domiciliosConCarrito: domiciliosConCarrito.length,
  });

  return (
    <RestaurantProvider defaultRestaurant={primerRestaurante}>
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
