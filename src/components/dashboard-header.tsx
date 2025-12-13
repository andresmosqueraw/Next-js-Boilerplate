'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function DashboardHeader() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Leer el tema guardado en localStorage o detectar el tema actual
    const savedTheme = localStorage.getItem('kuenta-theme') as 'dark' | 'light' | null;
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (savedTheme) {
      // Aplicar el tema guardado
      if (savedTheme === 'dark') {
        htmlElement.classList.add('dark');
        bodyElement.classList.add('dark');
      } else {
        htmlElement.classList.remove('dark');
        bodyElement.classList.remove('dark');
      }
      setTheme(savedTheme);
    } else {
      // Detectar el tema actual del HTML/body
      const isDark = htmlElement.classList.contains('dark') || bodyElement.classList.contains('dark');
      const initialTheme = isDark ? 'dark' : 'light';
      setTheme(initialTheme);
      // Guardar el tema inicial
      localStorage.setItem('kuenta-theme', initialTheme);
    }
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    
    // Aplicar el tema al documento HTML y body
    const htmlElement = document.documentElement;
    const bodyElement = document.body;
    
    if (newTheme === 'dark') {
      htmlElement.classList.add('dark');
      bodyElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
      bodyElement.classList.remove('dark');
    }
    
    // Guardar la preferencia en localStorage
    localStorage.setItem('kuenta-theme', newTheme);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 shrink-0 items-center gap-2 px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <div className="flex items-center gap-3 flex-1">
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
        </div>

        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold tracking-tight text-foreground hidden sm:block">Kuenta</h1>
          <span className="hidden rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-500 sm:inline-block">
            LIVE
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden flex-col items-end font-mono text-sm sm:flex">
            <span className="text-xs text-muted-foreground">{formatDate(currentTime)}</span>
            <span className="text-foreground tabular-nums">{formatTime(currentTime)}</span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </header>
  );
}

