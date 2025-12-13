'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => (prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]));
  };

  const faqs = [
    {
      question: '¿El sistema cumple con todas las normativas fiscales?',
      answer:
        'Sí, nuestro sistema POS está diseñado para cumplir con todas las normativas fiscales vigentes. Incluye facturación electrónica válida, registro de ventas, control de inventario y todos los reportes requeridos por la ley. Las facturas generadas son válidas ante la DIAN y otros organismos de control.',
    },
    {
      question: '¿Puedo gestionar múltiples negocios de mis clientes desde un solo lugar?',
      answer:
        'Absolutamente. El plan Profesional y Empresarial te permite gestionar múltiples negocios desde un panel centralizado. Como contador, puedes acceder a todos los negocios de tus clientes, generar reportes consolidados y tener control total de la información contable.',
    },
    {
      question: '¿Los reportes son compatibles con sistemas contables?',
      answer:
        'Sí, todos los reportes pueden exportarse a formatos estándar como Excel, PDF y CSV. Además, ofrecemos integraciones con los principales sistemas contables del mercado. Los datos están estructurados para facilitar la importación a cualquier software contable.',
    },
    {
      question: '¿Qué pasa si mi cliente necesita ayuda con el sistema?',
      answer:
        'Ofrecemos soporte técnico completo. En el plan Profesional incluye soporte prioritario, y en el plan Empresarial incluye soporte 24/7 y capacitación. También puedes acceder a documentación completa y videos tutoriales para ayudar a tus clientes.',
    },
    {
      question: '¿Cómo puedo recomendar este sistema a mis clientes?',
      answer:
        'Como contador, puedes crear cuentas para tus clientes y gestionarlas desde tu panel. Ofrecemos planes especiales para contadores con descuentos y herramientas adicionales. También puedes contactar a nuestro equipo de ventas para planes personalizados según tus necesidades.',
    },
  ];

  return (
    <section id="faq" className="relative overflow-hidden pt-24 pb-120">
      {/* Background blur effects */}
      <div className="absolute top-1/2 -right-20 z-[-1] h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl"></div>
      <div className="absolute top-1/2 -left-20 z-[-1] h-64 w-64 rounded-full bg-primary/20 opacity-80 blur-3xl"></div>

      <div className="z-10 container mx-auto px-4">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/40 px-3 py-1 text-primary uppercase">
            <span>✶</span>
            <span className="text-sm">Preguntas Frecuentes</span>
          </div>
        </motion.div>

        <motion.h2
          className="mx-auto mt-6 max-w-xl text-center text-4xl font-medium md:text-[54px] md:leading-[60px]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          viewport={{ once: true }}
        >
          ¿Preguntas? Tenemos
          {' '}
          <span className="bg-gradient-to-b from-foreground via-rose-200 to-primary bg-clip-text text-transparent">
            respuestas
          </span>
        </motion.h2>

        <div className="mx-auto mt-12 flex max-w-xl flex-col gap-6">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              className="cursor-pointer rounded-2xl border border-white/10 bg-gradient-to-b from-secondary/40 to-secondary/10 p-6 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.1)_inset] transition-all duration-300 hover:border-white/20"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => toggleItem(index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleItem(index);
                }
              }}
              {...(index === faqs.length - 1 && { 'data-faq': faq.question })}
            >
              <div className="flex items-start justify-between">
                <h3 className="m-0 pr-4 font-medium">{faq.question}</h3>
                <motion.div
                  animate={{ rotate: openItems.includes(index) ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className=""
                >
                  {openItems.includes(index)
                    ? (
                        <Minus className="flex-shrink-0 text-primary transition duration-300" size={24} />
                      )
                    : (
                        <Plus className="flex-shrink-0 text-primary transition duration-300" size={24} />
                      )}
                </motion.div>
              </div>
              <AnimatePresence>
                {openItems.includes(index) && (
                  <motion.div
                    className="mt-4 overflow-hidden leading-relaxed text-muted-foreground"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{
                      duration: 0.4,
                      ease: 'easeInOut',
                      opacity: { duration: 0.2 },
                    }}
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
