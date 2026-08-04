import { prisma } from '@/lib/prisma';
import { DEMO_PRODUCTS } from '@/lib/demo-data';

export type CatalogProduct = {
  id: string;
  title: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string | null;
  category?: string;
  source: 'db' | 'demo';
};

export async function listProducts(): Promise<CatalogProduct[]> {
  try {
    const rows = await prisma.product.findMany({
      where: { published: true, visibility: 'public' },
      orderBy: { createdAt: 'desc' },
    });
    if (rows.length > 0) {
      return rows.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        price: Number(p.price),
        stock: p.stock,
        imageUrl: p.imageUrl,
        source: 'db' as const,
      }));
    }
  } catch {
    /* no db */
  }

  return DEMO_PRODUCTS.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.price,
    stock: p.stock,
    imageUrl: p.imageUrl ?? null,
    category: p.category,
    source: 'demo' as const,
  }));
}

export async function getProduct(id: string): Promise<CatalogProduct | null> {
  try {
    const p = await prisma.product.findFirst({
      where: { id, published: true },
    });
    if (p) {
      return {
        id: p.id,
        title: p.title,
        description: p.description,
        price: Number(p.price),
        stock: p.stock,
        imageUrl: p.imageUrl,
        source: 'db',
      };
    }
  } catch {
    /* no db */
  }

  const demo = DEMO_PRODUCTS.find((d) => d.id === id);
  if (!demo) return null;
  return {
    id: demo.id,
    title: demo.title,
    description: demo.description,
    price: demo.price,
    stock: demo.stock,
    imageUrl: demo.imageUrl ?? null,
    category: demo.category,
    source: 'demo',
  };
}
