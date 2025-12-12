'use client';

import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { useState } from 'react';

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'Perfect for getting started with v0',
    features: ['5 components per month', 'Basic templates', 'Community support', 'Standard components'],
    popular: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    monthlyPrice: 29,
    annualPrice: 24,
    description: 'For professionals building serious projects',
    features: [
      'Unlimited components',
      'Premium templates',
      'Priority support',
      'Advanced animations',
      'Custom themes',
      'Export to GitHub',
    ],
    popular: true,
    cta: 'Start Free Trial',
  },
  {
    name: 'Team',
    monthlyPrice: 99,
    annualPrice: 79,
    description: 'For teams collaborating on projects',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'Shared component library',
      'Advanced analytics',
      'Custom integrations',
      'Dedicated support',
    ],
    popular: false,
    cta: 'Contact Sales',
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <section className="relative px-4 py-24">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
          >
            <Sparkles className="h-4 w-4 text-[#e78a53]" />
            <span className="text-sm font-medium text-white/80">Pricing</span>
          </motion.div>

          <h2 className="mb-4 bg-gradient-to-r from-white via-white to-white/60 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
            Choose your plan
          </h2>

          <p className="mx-auto mb-8 max-w-2xl text-lg text-white/60">
            Start building beautiful components today. Upgrade anytime as your needs grow.
          </p>

          {/* Monthly/Annual Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mx-auto flex w-fit items-center justify-center gap-4 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-sm"
          >
            <button
              onClick={() => setIsAnnual(false)}
              className={`rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
                !isAnnual ? 'bg-[#e78a53] text-white shadow-lg' : 'text-white/60 hover:text-white/80'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`relative rounded-full px-6 py-2 text-sm font-medium transition-all duration-200 ${
                isAnnual ? 'bg-[#e78a53] text-white shadow-lg' : 'text-white/60 hover:text-white/80'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 rounded-full bg-green-500 px-2 py-0.5 text-xs text-white">
                Save 20%
              </span>
            </button>
          </motion.div>
        </motion.div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-3">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`relative rounded-2xl border p-8 backdrop-blur-sm transition-all duration-300 ${
                plan.popular
                  ? 'border-[#e78a53]/30 bg-gradient-to-b from-[#e78a53]/10 to-transparent shadow-lg shadow-[#e78a53]/10'
                  : 'border-white/10 bg-white/5 hover:border-white/20'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 transform">
                  <div className="rounded-full bg-gradient-to-r from-[#e78a53] to-[#e78a53]/80 px-4 py-2 text-sm font-medium text-white">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="mb-8 text-center">
                <h3 className="mb-2 text-xl font-bold text-white">{plan.name}</h3>
                <div className="mb-2 flex items-baseline justify-center gap-1">
                  {plan.price
                    ? (
                        <span className="text-4xl font-bold text-white">{plan.price}</span>
                      )
                    : (
                        <>
                          <span className="text-4xl font-bold text-white">
                            $
                            {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                          </span>
                          <span className="text-lg text-white/60">{isAnnual ? '/year' : '/month'}</span>
                        </>
                      )}
                </div>
                <p className="text-sm text-white/60">{plan.description}</p>
              </div>

              <ul className="mb-8 space-y-4">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="h-5 w-5 flex-shrink-0 text-[#e78a53]" />
                    <span className="text-sm text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full rounded-lg px-6 py-3 font-medium transition-all duration-200 ${
                  plan.popular
                    ? 'bg-gradient-to-r from-[#e78a53] to-[#e78a53]/80 text-white shadow-lg shadow-[#e78a53]/25 hover:shadow-[#e78a53]/40'
                    : 'border border-white/20 bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {plan.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <p className="mb-4 text-white/60">Need a custom solution? We're here to help.</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="font-medium text-[#e78a53] transition-colors hover:text-[#e78a53]/80"
          >
            Contact our sales team →
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
