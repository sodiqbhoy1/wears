import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

async function tryLoadProductModel() {
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    const Product = (await import('@/models/Product')).default;
    return Product;
  } catch (e) {
    console.log('⚠️ Mongoose Product model not available:', e?.message || e);
    return null;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    // Try to use Mongoose model first
    const Product = await tryLoadProductModel();
    if (Product) {
      const filter = {};
      if (category) filter.category = new RegExp(`^${category}$`, 'i');
      const items = await Product.find(filter).lean().exec();
      return NextResponse.json({ ok: true, items });
    }

    // Fallback to native driver
    const db = await getDb();
    let query = {};
    if (category) {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }
    const items = await db.collection('products').find(query).toArray();
    return NextResponse.json({ ok: true, items });
  } catch (error) {
    console.error('GET /api/public/products error:', error);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}