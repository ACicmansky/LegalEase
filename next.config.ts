import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin';
import { routing } from '@/i18n/routing';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: `/${routing.defaultLocale}`,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
