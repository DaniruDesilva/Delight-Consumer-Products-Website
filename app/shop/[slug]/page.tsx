import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { BASE_URL, productSchema, breadcrumbSchema } from '@/lib/seo';
import ProductInteractive from './ProductInteractive';

export const dynamic = 'force-dynamic';

interface Product {
  id: number; slug: string; name: string; description: string; short_description: string;
  long_description: string; key_features: string; price: number;
  original_price: number | null; image: string; category: string;
  stock: number; is_featured: number; is_sale: number; min_order_quantity: number;
  weight: number | null; weight_unit: string | null;
}
interface ProductImage { id: number; image_url: string; sort_order: number; }

// ─── Dynamic Metadata ─────────────────────────────────────────────────────────
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params;
  const product = db.getProductBySlug(slug) as Product | undefined;

  if (!product) {
    return { title: 'Product Not Found | Delight Consumer Products' };
  }

  const description = product.short_description || product.description ||
    `Buy ${product.name} — Premium ${product.category} product by Delight Consumer Products, crafted in Sri Lanka.`;

  const imageUrl = product.image.startsWith('http') ? product.image : `${BASE_URL}${product.image}`;
  const canonicalUrl = `${BASE_URL}/shop/${product.slug}`;

  return {
    title: product.name,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: `${product.name} | Delight Consumer Products`,
      description,
      images: [{ url: imageUrl, width: 800, height: 800, alt: product.name }],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | Delight Consumer Products`,
      description,
      images: [imageUrl],
    },
  };
}

// ─── Server Component ─────────────────────────────────────────────────────────
export default async function ProductPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // If someone arrives with a numeric ID, find its slug and 301 redirect
  const numId = parseInt(slug);
  if (!isNaN(numId) && String(numId) === slug) {
    const productById = db.getProduct(numId) as Product | undefined;
    if (productById?.slug) {
      redirect(`/shop/${productById.slug}`);
    } else if (productById) {
      // Has no slug yet (edge case) — serve by ID path
    } else {
      notFound();
    }
  }

  const product = db.getProductBySlug(slug) as Product | undefined;
  if (!product) notFound();

  // Fetch gallery images server-side
  const galleryImages = db.instance
    .prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order ASC')
    .all(product!.id) as ProductImage[];

  // ─── JSON-LD Structured Data ───────────────────────────────────────────────
  const productLd = productSchema(product!);
  const breadcrumbLd = breadcrumbSchema([
    { name: 'Home', url: BASE_URL },
    { name: 'Shop', url: `${BASE_URL}/shop` },
    { name: product!.category, url: `${BASE_URL}/shop?category=${encodeURIComponent(product!.category)}` },
    { name: product!.name, url: `${BASE_URL}/shop/${product!.slug}` },
  ]);

  return (
    <>
      {/* JSON-LD Structured Data — injected in server HTML */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Product page with interactive client component */}
      <ProductInteractive product={product!} initialImages={galleryImages} />
    </>
  );
}
