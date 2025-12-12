'use client';

import type { ChangeEventHandler } from 'react';
import { useRouter } from 'next/navigation';
import { routing } from '@/libs/I18nRouting';

type LocaleSwitcherProps = {
  locale: string;
  pathname?: string;
};

export const LocaleSwitcher = ({ locale, pathname = '' }: LocaleSwitcherProps) => {
  const router = useRouter();

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    const newLocale = event.target.value;
    const newPath = pathname.startsWith(`/${locale}`)
      ? pathname.replace(`/${locale}`, `/${newLocale}`)
      : `/${newLocale}${pathname}`;

    router.push(newPath);
    router.refresh(); // Ensure the page takes the new locale into account related to the issue #395
  };

  return (
    <select
      defaultValue={locale}
      onChange={handleChange}
      className="border border-gray-300 font-medium focus:outline-hidden focus-visible:ring-3"
      aria-label="lang-switcher"
    >
      {routing.locales.map(elt => (
        <option key={elt} value={elt}>
          {elt.toUpperCase()}
        </option>
      ))}
    </select>
  );
};
