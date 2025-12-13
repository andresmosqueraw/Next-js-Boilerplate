import { Marquee } from '@/components/magicui/marquee';

const testimonials = [
  {
    name: 'Carlos Mendoza',
    username: 'Contador Público',
    body: 'Recomiendo este POS a todos mis clientes. Cumple con todas las normativas y los reportes son perfectos para mi trabajo contable. Ahorra horas de trabajo cada mes.',
    img: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'María González',
    username: 'Firma Contable González & Asociados',
    body: 'Gestionamos más de 20 negocios desde un solo panel. Los reportes consolidados y la facturación electrónica funcionan perfectamente. Nuestros clientes están muy satisfechos.',
    img: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Roberto Silva',
    username: 'Contador Independiente',
    body: 'La exportación a Excel y sistemas contables es excelente. Ya no tengo que digitar manualmente los datos. El sistema cumple con la ley y eso me da mucha tranquilidad.',
    img: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Ana Martínez',
    username: 'Contadora Pública',
    body: 'Mis clientes pueden facturar desde el primer día sin problemas. El soporte técnico es excelente y siempre están disponibles cuando necesito ayuda.',
    img: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Luis Ramírez',
    username: 'Estudio Contable Ramírez',
    body: 'El control de múltiples negocios es increíble. Puedo ver todos los reportes de mis clientes en un solo lugar. Las auditorías son mucho más fáciles ahora.',
    img: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Patricia López',
    username: 'Contadora Pública',
    body: 'Recomiendo este sistema porque es profesional y cumple con la ley. Mis clientes están protegidos y yo tengo toda la información que necesito para hacer mi trabajo.',
    img: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Fernando Torres',
    username: 'Contador Público',
    body: 'La facturación electrónica es válida y los reportes son completos. Mis clientes pueden trabajar tranquilos sabiendo que cumplen con todas las obligaciones fiscales.',
    img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Sandra Ruiz',
    username: 'Firma Contable Ruiz & Partners',
    body: 'Gestionamos más de 50 negocios con este sistema. La consolidación de reportes y el acceso centralizado hacen nuestro trabajo mucho más eficiente.',
    img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
  },
  {
    name: 'Diego Herrera',
    username: 'Contador Público',
    body: 'El sistema es fácil de usar para mis clientes y los reportes son perfectos para mi trabajo. Ya no tengo que preocuparme por el cumplimiento legal.',
    img: 'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face',
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialCard = ({
  img,
  name,
  username,
  body,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <div className="relative w-full max-w-xs overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] p-10 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset]">
      <div className="absolute -top-5 -left-5 -z-10 h-40 w-40 rounded-full bg-gradient-to-b from-[#e78a53]/10 to-transparent blur-md"></div>

      <div className="leading-relaxed text-white/90">{body}</div>

      <div className="mt-5 flex items-center gap-2">
        <img src={img || '/placeholder.svg'} alt={name} height="40" width="40" className="h-10 w-10 rounded-full" />
        <div className="flex flex-col">
          <div className="leading-5 font-medium tracking-tight text-white">{name}</div>
          <div className="leading-5 tracking-tight text-white/60">{username}</div>
        </div>
      </div>
    </div>
  );
};

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="mb-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-[540px]">
          <div className="flex justify-center">
            <button
              type="button"
              className="group relative z-[60] mx-auto rounded-full border border-white/20 bg-white/5 px-6 py-1 text-xs backdrop-blur transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-100 md:text-sm"
            >
              <div className="absolute inset-x-0 -top-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-[#e78a53] to-transparent shadow-2xl transition-all duration-500 group-hover:w-3/4"></div>
              <div className="absolute inset-x-0 -bottom-px mx-auto h-0.5 w-1/2 bg-gradient-to-r from-transparent via-[#e78a53] to-transparent shadow-2xl transition-all duration-500 group-hover:h-px"></div>
              <span className="relative text-white">Testimonios</span>
            </button>
          </div>
          <h2 className="__className_bb4e88 relative z-10 mt-5 bg-gradient-to-r from-foreground/60 via-foreground to-foreground/60 bg-clip-text text-center text-4xl font-semibold tracking-tighter text-transparent md:text-[54px] md:leading-[60px] dark:from-muted-foreground/55 dark:via-foreground dark:to-muted-foreground/55">
            Lo que dicen nuestros usuarios
          </h2>

          <p className="relative z-10 mt-5 text-center text-lg text-zinc-500">
            Desde el diseño intuitivo hasta características poderosas, nuestra aplicación se ha convertido en una herramienta esencial para usuarios alrededor del mundo.
          </p>
        </div>

        <div className="my-16 flex max-h-[738px] justify-center gap-6 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)]">
          <div>
            <Marquee pauseOnHover vertical className="[--duration:20s]">
              {firstColumn.map((testimonial, index) => (
                <TestimonialCard key={`first-${index}-${testimonial.name}`} {...testimonial} />
              ))}
            </Marquee>
          </div>

          <div className="hidden md:block">
            <Marquee reverse pauseOnHover vertical className="[--duration:25s]">
              {secondColumn.map((testimonial, index) => (
                <TestimonialCard key={`second-${index}-${testimonial.name}`} {...testimonial} />
              ))}
            </Marquee>
          </div>

          <div className="hidden lg:block">
            <Marquee pauseOnHover vertical className="[--duration:30s]">
              {thirdColumn.map((testimonial, index) => (
                <TestimonialCard key={`third-${index}-${testimonial.name}`} {...testimonial} />
              ))}
            </Marquee>
          </div>
        </div>

        <div className="-mt-8 flex justify-center">
          <button className="group relative inline-flex items-center gap-2 rounded-full border border-[#e78a53]/30 bg-black/50 px-6 py-3 text-sm font-medium text-white transition-all hover:border-[#e78a53]/60 hover:bg-[#e78a53]/10 active:scale-95">
            <div className="absolute inset-x-0 -top-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-[#e78a53]/40 to-transparent"></div>
            <div className="absolute inset-x-0 -bottom-px mx-auto h-px w-3/4 bg-gradient-to-r from-transparent via-[#e78a53]/40 to-transparent"></div>
            <svg className="h-4 w-4 text-[#e78a53]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"></path>
            </svg>
            Comparte tu experiencia
          </button>
        </div>
      </div>
    </section>
  );
}
