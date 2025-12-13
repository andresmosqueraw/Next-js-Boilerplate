'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FAQSection } from '@/components/faq-section';
import Features from '@/components/features';
import Hero from '@/components/home/hero';
import { NewReleasePromo } from '@/components/new-release-promo';
import { PricingSection } from '@/components/pricing-section';
import { StickyFooter } from '@/components/sticky-footer';
import { TestimonialsSection } from '@/components/testimonials';

export default function Home() {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'system');
    root.classList.add('dark');
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleMobileNavClick = (elementId: string) => {
    setIsMobileMenuOpen(false);
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        const headerOffset = 120; // Account for sticky header height + margin
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });
      }
    }, 100);
  };

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Pearl Mist Background with Top Glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(ellipse 50% 35% at 50% 0%, rgba(226, 232, 240, 0.12), transparent 60%), #000000',
        }}
      />

      {/* Desktop Header */}
      <header
        className={`sticky top-4 z-[9999] mx-auto hidden w-full flex-row items-center justify-between self-start rounded-full border border-border/50 bg-background/80 shadow-lg backdrop-blur-sm transition-all duration-300 md:flex ${
          isScrolled ? 'max-w-3xl px-2' : 'max-w-5xl px-4'
        } py-2`}
        style={{
          willChange: 'transform',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden',
          perspective: '1000px',
        }}
      >
        <a
          className={`z-50 flex items-center justify-center gap-2 transition-all duration-300 ${
            isScrolled ? 'ml-4' : ''
          }`}
          href="https://v0.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            fill="currentColor"
            viewBox="0 0 147 70"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="size-8 w-8 rounded-full text-foreground"
          >
            <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
            <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z"></path>
          </svg>
        </a>

        <div className="pointer-events-none hidden flex-1 flex-row items-center justify-start space-x-2 text-sm font-medium text-muted-foreground transition duration-200 hover:text-foreground md:flex md:space-x-2 md:ml-8">
          <button
            type="button"
            className="pointer-events-auto relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('features');
              if (element) {
                const headerOffset = 120; // Account for sticky header height + margin
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
          >
            <span className="relative z-20">Características</span>
          </button>
          <button
            type="button"
            className="pointer-events-auto relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('pricing');
              if (element) {
                const headerOffset = 120; // Account for sticky header height + margin
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
          >
            <span className="relative z-20">Precios</span>
          </button>
          <button
            type="button"
            className="pointer-events-auto relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('testimonials');
              if (element) {
                const headerOffset = 120; // Account for sticky header height + margin
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
          >
            <span className="relative z-20">Testimonios</span>
          </button>
          <button
            type="button"
            className="pointer-events-auto relative cursor-pointer px-4 py-2 text-muted-foreground transition-colors hover:text-foreground"
            onClick={(e) => {
              e.preventDefault();
              const element = document.getElementById('faq');
              if (element) {
                const headerOffset = 120; // Account for sticky header height + margin
                const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
                const offsetPosition = elementPosition - headerOffset;

                window.scrollTo({
                  top: offsetPosition,
                  behavior: 'smooth',
                });
              }
            }}
          >
            <span className="relative z-20">Preguntas Frecuentes</span>
          </button>
        </div>

        <div className="relative z-10 flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push('/sign-in')}
            className="relative cursor-pointer text-sm font-medium text-muted-foreground transition-colors hover:text-foreground hover:underline"
          >
            Iniciar Sesión
          </button>

          <button
            type="button"
            onClick={() => router.push('/sign-up')}
            className="relative cursor-pointer rounded-md bg-gradient-to-b from-primary to-primary/80 px-4 py-2 text-center text-sm font-bold text-primary-foreground shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5"
          >
            Registrarse
          </button>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="sticky top-4 z-[9999] mx-4 flex w-auto flex-row items-center justify-between rounded-full border border-border/50 bg-background/80 px-4 py-3 shadow-lg backdrop-blur-sm md:hidden">
        <a
          className="flex items-center justify-center gap-2"
          href="https://v0.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg
            fill="currentColor"
            viewBox="0 0 147 70"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
            className="size-7 w-7 rounded-full text-foreground"
          >
            <path d="M56 50.2031V14H70V60.1562C70 65.5928 65.5928 70 60.1562 70C57.5605 70 54.9982 68.9992 53.1562 67.1573L0 14H19.7969L56 50.2031Z"></path>
            <path d="M147 56H133V23.9531L100.953 56H133V70H96.6875C85.8144 70 77 61.1856 77 50.3125V14H91V46.1562L123.156 14H91V0H127.312C138.186 0 147 8.81439 147 19.6875V56Z"></path>
          </svg>
        </a>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border/50 bg-background/50 transition-colors hover:bg-background/80"
          aria-label="Alternar menú"
        >
          <div className="flex h-5 w-5 flex-col items-center justify-center space-y-1">
            <span
              className={`block h-0.5 w-4 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-1.5 rotate-45' : ''}`}
            >
            </span>
            <span
              className={`block h-0.5 w-4 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}
            >
            </span>
            <span
              className={`block h-0.5 w-4 bg-foreground transition-all duration-300 ${isMobileMenuOpen ? '-translate-y-1.5 -rotate-45' : ''}`}
            >
            </span>
          </div>
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[9998] bg-black/50 backdrop-blur-sm md:hidden">
          <div className="absolute top-20 right-4 left-4 rounded-2xl border border-border/50 bg-background/95 p-6 shadow-2xl backdrop-blur-md">
            <nav className="flex flex-col space-y-4">
              <button
                type="button"
                onClick={() => handleMobileNavClick('features')}
                className="rounded-lg px-4 py-3 text-left text-lg font-medium text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
              >
                Características
              </button>
              <button
                type="button"
                onClick={() => handleMobileNavClick('pricing')}
                className="rounded-lg px-4 py-3 text-left text-lg font-medium text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
              >
                Precios
              </button>
              <button
                type="button"
                onClick={() => handleMobileNavClick('testimonials')}
                className="rounded-lg px-4 py-3 text-left text-lg font-medium text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
              >
                Testimonios
              </button>
              <button
                type="button"
                onClick={() => handleMobileNavClick('faq')}
                className="rounded-lg px-4 py-3 text-left text-lg font-medium text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
              >
                Preguntas Frecuentes
              </button>
              <div className="mt-4 flex flex-col space-y-3 border-t border-border/50 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/sign-in');
                  }}
                  className="cursor-pointer rounded-lg px-4 py-3 text-left text-lg font-medium text-muted-foreground transition-colors hover:bg-background/50 hover:text-foreground"
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    router.push('/sign-up');
                  }}
                  className="rounded-lg bg-gradient-to-b from-primary to-primary/80 px-4 py-3 text-center text-lg font-bold text-primary-foreground shadow-lg transition-all duration-200 hover:-translate-y-0.5"
                >
                  Registrarse
                </button>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Hero />

      {/* Features Section */}
      <div id="features">
        <Features />
      </div>

      {/* Pricing Section */}
      <div id="pricing">
        <PricingSection />
      </div>

      {/* Testimonials Section */}
      <div id="testimonials">
        <TestimonialsSection />
      </div>

      <NewReleasePromo />

      {/* FAQ Section */}
      <div id="faq">
        <FAQSection />
      </div>

      {/* Sticky Footer */}
      <StickyFooter />
    </div>
  );
}
