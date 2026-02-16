import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
}

const DEFAULT_TITLE = 'Grójec Na Cito - Rozkład Jazdy i Apteki';
const DEFAULT_DESCRIPTION = 'Najświeższe rozkłady jazdy PKS Grójec, dyżury aptek i ważne komunikaty miejskie w jednej aplikacji';
const DEFAULT_KEYWORDS = 'Grójec, PKS Grójec, rozkład jazdy, apteki, dyżur aptek, informator miejski, odpady, wywóz śmieci, nabożeństwa';

export function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS
}: SEOProps) {
  useEffect(() => {
    const fullTitle = title ? `${title} | Grójec Na Cito` : DEFAULT_TITLE;
    document.title = fullTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description);
    }

    const metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords);
    }

    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', fullTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]');
    if (ogDescription) {
      ogDescription.setAttribute('content', description);
    }

    const twitterTitle = document.querySelector('meta[name="twitter:title"]');
    if (twitterTitle) {
      twitterTitle.setAttribute('content', fullTitle);
    }

    const twitterDescription = document.querySelector('meta[name="twitter:description"]');
    if (twitterDescription) {
      twitterDescription.setAttribute('content', description);
    }
  }, [title, description, keywords]);

  return null;
}

export const SEO_CONFIGS = {
  home: {
    title: undefined,
    description: DEFAULT_DESCRIPTION,
  },
  admin: {
    title: 'Panel Administracyjny',
    description: 'Panel zarządzania aplikacją Grójec na Cito - rozkłady jazdy, apteki, odpady i komunikaty',
  },
  privacy: {
    title: 'Polityka Prywatności',
    description: 'Polityka prywatności i RODO dla aplikacji Grójec na Cito',
  },
} as const;
