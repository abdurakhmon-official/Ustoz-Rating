import { defineRouting } from 'next-intl/routing';
import { LOCALES, DEFAULT_LOCALE } from '@repo/contracts';

export const routing = defineRouting({
  locales: LOCALES,
  defaultLocale: DEFAULT_LOCALE,
  localePrefix: 'always',

  pathnames: {
    '/': '/',
    '/sign-in': '/sign-in',
    '/sign-up': '/sign-up',
    '/verify-email': '/verify-email',
    '/profile': '/profile',
    '/admin': '/admin',
    '/admin/users': '/admin/users',
    '/admin/subjects': '/admin/subjects',
    '/admin/geo': '/admin/geo',
    '/admin/tests': '/admin/tests',
    '/admin/tests/new': '/admin/tests/new',
    '/admin/tests/[testId]': '/admin/tests/[testId]',
    '/tests': '/tests',
    '/tests/[testId]': '/tests/[testId]',
    '/attempts': '/attempts',
    '/attempts/[attemptId]': '/attempts/[attemptId]',
  },
});

export type AppPathname = keyof typeof routing.pathnames;
