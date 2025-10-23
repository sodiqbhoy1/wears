import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { verifyAdminToken } from '@/lib/auth';

async function tryLoadProductModel() {
  try {
    const { connectMongoose } = await import('@/lib/mongoose');
    await connectMongoose();
    const Product = (await import('@/models/Product')).default;
    return Product;
  } catch (e) {
    return null;
  }
}

export async function GET() {
  try {
    const Product = await tryLoadProductModel();
    if (Product) {
      const items = await Product.find({}).lean().exec();
      return NextResponse.json({ ok: true, items });
    }
    const db = await getDb();
    const items = await db.collection('products').find({}).toArray();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  // Verify admin authentication
  const auth = verifyAdminToken(req);
  if (!auth.valid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    if (!body.name || !body.basePrice) {
      return NextResponse.json({ ok: false, error: 'Name and base price are required' }, { status: 400 });
    }
    const itemData = {
      name: body.name,
      basePrice: body.basePrice,
      category: body.category || 'general',
      images: body.images || [],
      description: body.description || '',
      variants: body.variants || [],
      status: 'available', // Set default status
    };

    const Product = await tryLoadProductModel();
    if (Product) {
      const created = await Product.create(itemData);
      return NextResponse.json({ ok: true, item: created });
    }

    const db = await getDb();
    const result = await db.collection('products').insertOne(itemData);
    itemData._id = result.insertedId;
    return NextResponse.json({ ok: true, item: itemData });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  // Verify admin authentication
  const auth = verifyAdminToken(req);
  if (!auth.valid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const id = body._id || body.id;
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });
    const update = { ...body };
    delete update._id;
    delete update.id;

    const Product = await tryLoadProductModel();
    if (Product) {
      await Product.updateOne({ _id: id }, { $set: update });
      const item = await Product.findOne({ _id: id }).lean().exec();
      return NextResponse.json({ ok: true, item });
    }

    const db = await getDb();
    await db.collection('products').updateOne({ _id: new ObjectId(id) }, { $set: update });
    const item = await db.collection('products').findOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  // Verify admin authentication
  const auth = verifyAdminToken(req);
  if (!auth.valid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ ok: false, error: 'Missing id' }, { status: 400 });

    const Product = await tryLoadProductModel();
    if (Product) {
      await Product.deleteOne({ _id: id });
      return NextResponse.json({ ok: true });
    }

    const db = await getDb();
    await db.collection('products').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
