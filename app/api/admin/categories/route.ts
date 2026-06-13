import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { apiCache } from '@/lib/cache';

// Setup default categories if the setting is empty
const defaultCategories = ["Incense", "Perfume", "Air Care", "Candles", "Matches", "Gift Pack"];

function getMasterCategories() {
  const settingsObj = db.getSettings();
  const catValue = settingsObj['product_categories'];
  if (catValue) {
    try {
      return JSON.parse(catValue) as string[];
    } catch {
      return defaultCategories;
    }
  }
  return defaultCategories;
}

export async function GET() {
  const settingsObj = db.getSettings();
  const catImagesStr = settingsObj['category_images'];
  const category_images = catImagesStr ? JSON.parse(catImagesStr) : {};
  return NextResponse.json({ categories: getMasterCategories(), category_images });
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { category } = await request.json();
    if (!category || typeof category !== 'string') return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    const categories = getMasterCategories();
    if (categories.includes(category)) {
      return NextResponse.json({ error: 'Category already exists' }, { status: 400 });
    }

    categories.push(category);
    categories.sort();
    db.updateSetting('product_categories', JSON.stringify(categories));

    apiCache.invalidate('categories');
    apiCache.invalidate('products');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/api/categories');

    return NextResponse.json({ success: true, categories });
  } catch {
    return NextResponse.json({ error: 'Failed to add category' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    if (!category) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    // Safety check - as requested by user
    if (db.isCategoryInUse(category)) {
      return NextResponse.json({ error: `Cannot delete: The category "${category}" is currently used by one or more products. Please reassign those products first.` }, { status: 400 });
    }

    const categories = getMasterCategories();
    const updated = categories.filter(c => c !== category);
    db.updateSetting('product_categories', JSON.stringify(updated));

    apiCache.invalidate('categories');
    apiCache.invalidate('products');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/api/categories');

    return NextResponse.json({ success: true, categories: updated });
  } catch {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { category, image_url } = await request.json();
    if (!category) return NextResponse.json({ error: 'Invalid category' }, { status: 400 });

    const settingsObj = db.getSettings();
    const catImagesStr = settingsObj['category_images'];
    const category_images = catImagesStr ? JSON.parse(catImagesStr) : {};

    if (image_url) {
      category_images[category] = image_url;
    } else {
      delete category_images[category];
    }

    db.updateSetting('category_images', JSON.stringify(category_images));

    apiCache.invalidate('categories');
    apiCache.invalidate('products');
    revalidatePath('/');
    revalidatePath('/shop');
    revalidatePath('/api/categories');

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to update category image' }, { status: 500 });
  }
}
