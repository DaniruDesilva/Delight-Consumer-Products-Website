// ─── Shared SEO Helpers ────────────────────────────────────────────────────────
// Single source of truth for base URL, structured data schemas, and metadata
// utilities. Import from here — never hard-code the domain elsewhere.

export const BASE_URL = 'https://www.delightconsumerproducts.lk';

// ─── Slug Helpers ─────────────────────────────────────────────────────────────

/**
 * Convert a product name into a URL-friendly slug.
 * e.g. "Lavender Incense Sticks 50g" → "lavender-incense-sticks-50g"
 */
export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')     // strip non-word characters except hyphens
    .replace(/[\s_]+/g, '-')      // spaces/underscores → hyphens
    .replace(/-+/g, '-')          // collapse multiple hyphens
    .replace(/^-+|-+$/g, '');     // trim leading/trailing hyphens
}

// ─── Organization / WebSite Schema ───────────────────────────────────────────

export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${BASE_URL}/#organization`,
        name: 'Delight Consumer Products',
        legalName: 'Delight Consumer Products Private Limited',
        url: BASE_URL,
        logo: {
          '@type': 'ImageObject',
          url: `${BASE_URL}/Logo.webp`,
          width: 220,
          height: 75,
        },
        foundingDate: '2025',
        description:
          'Pioneer manufacturer of premium incense sticks, air fresheners, candles, wax matches and aromatic products in Sri Lanka. Distributed across all provinces and global markets.',
        address: {
          '@type': 'PostalAddress',
          streetAddress: "No 99/A 'Rohana' Heenatiya",
          addressLocality: 'Balapitiya',
          addressCountry: 'LK',
        },
        contactPoint: {
          '@type': 'ContactPoint',
          telephone: '+94-11-234-5678',
          contactType: 'customer service',
          availableLanguage: ['English', 'Sinhala'],
        },
        sameAs: [],
      },
      {
        '@type': 'WebSite',
        '@id': `${BASE_URL}/#website`,
        url: BASE_URL,
        name: 'Delight Consumer Products',
        description: 'Premium aromatic solutions crafted in Sri Lanka since 2025.',
        publisher: { '@id': `${BASE_URL}/#organization` },
        potentialAction: {
          '@type': 'SearchAction',
          target: { '@type': 'EntryPoint', urlTemplate: `${BASE_URL}/shop?search={search_term_string}` },
          'query-input': 'required name=search_term_string',
        },
      },
    ],
  };
}

// ─── LocalBusiness Schema ──────────────────────────────────────────────────────

export function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${BASE_URL}/#localbusiness`,
    name: 'Delight Consumer Products',
    description:
      'Pioneer manufacturer of premium incense sticks, air fresheners, candles, and aromatic products in Sri Lanka.',
    url: BASE_URL,
    telephone: '+94-11-234-5678',
    email: 'info@delightconsumerproducts.lk',
    foundingDate: '2025',
    image: `${BASE_URL}/Logo.webp`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: "No 99/A 'Rohana' Heenatiya",
      addressLocality: 'Balapitiya',
      addressRegion: 'Southern Province',
      addressCountry: 'LK',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 6.4716167,
      longitude: 80.0381623,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '17:00',
      },
    ],
    priceRange: 'Rs. 450 – Rs. 5,000',
  };
}

// ─── BreadcrumbList Schema ────────────────────────────────────────────────────

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── Product Schema ───────────────────────────────────────────────────────────

export interface ProductSchemaInput {
  id: number;
  slug: string;
  name: string;
  description: string;
  image: string;
  price: number;
  original_price: number | null;
  stock: number;
  category: string;
}

export function productSchema(product: ProductSchemaInput) {
  const imageUrl = product.image.startsWith('http')
    ? product.image
    : `${BASE_URL}${product.image}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `Premium ${product.category} product by Delight Consumer Products, Sri Lanka.`,
    image: [imageUrl],
    sku: `DLT-${String(product.id).padStart(4, '0')}`,
    mpn: `DLT-${String(product.id).padStart(4, '0')}`,
    brand: {
      '@type': 'Brand',
      name: 'Delight',
    },
    manufacturer: {
      '@type': 'Organization',
      name: 'Delight Consumer Products Private Limited',
    },
    category: product.category,
    url: `${BASE_URL}/shop/${product.slug}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'LKR',
      price: product.price.toFixed(2),
      ...(product.original_price
        ? { priceValidUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] }
        : {}),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      url: `${BASE_URL}/shop/${product.slug}`,
      seller: {
        '@type': 'Organization',
        name: 'Delight Consumer Products',
      },
    },
  };
}

// ─── Article Schema ───────────────────────────────────────────────────────────

export interface ArticleSchemaInput {
  title: string;
  slug: string;
  excerpt?: string;
  image_url: string;
  published_at: string;
  updated_at?: string;
}

export function articleSchema(article: ArticleSchemaInput) {
  const imageUrl = article.image_url.startsWith('http')
    ? article.image_url
    : `${BASE_URL}${article.image_url}`;

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt || article.title,
    image: {
      '@type': 'ImageObject',
      url: imageUrl,
    },
    url: `${BASE_URL}/news/${article.slug}`,
    datePublished: article.published_at,
    dateModified: article.updated_at || article.published_at,
    author: {
      '@type': 'Organization',
      name: 'Delight Consumer Products',
      url: BASE_URL,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Delight Consumer Products',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/Logo.webp`,
        width: 220,
        height: 75,
      },
    },
  };
}

// ─── FAQPage Schema ───────────────────────────────────────────────────────────

export interface FAQItem {
  question: string;
  answer: string;
}

export function faqPageSchema(faqs: FAQItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}
