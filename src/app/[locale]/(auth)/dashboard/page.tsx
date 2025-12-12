import { AppSidebar } from '@/components/app-sidebar';
import { DomiciliosCard } from '@/components/DomiciliosCard';
import { MesasCard } from '@/components/MesasCard';
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
import { getDomicilios, getMesas } from '@/services/restaurante.service';

export default async function Page() {
  const mesas = await getMesas();
  const domicilios = await getDomicilios();

  return (
    <SidebarProvider>
      <AppSidebar />
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
        <div className="flex flex-1 flex-col gap-6 p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <MesasCard mesas={mesas} />
            <DomiciliosCard domicilios={domicilios} />
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
