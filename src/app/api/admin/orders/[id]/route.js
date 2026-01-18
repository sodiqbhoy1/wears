import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getDb } from '@/lib/mongodb';
import { verifyAdminToken } from '@/lib/auth';

// This route is for admins to get a single, fully resolved order
export async function GET(req, { params }) {
  // 1. Verify Admin Token
  const auth = verifyAdminToken(req);
  if (!auth.valid) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = params;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'Order ID is required' }, { status: 400 });
  }

  try {
    const db = await getDb();
    const oid = new ObjectId(id);

    // 2. Fetch the Order
    const order = await db.collection('orders').findOne({ _id: oid });
    if (!order) {
      return NextResponse.json({ ok: false, error: 'Order not found' }, { status: 404 });
    }

    // 3. Resolve Product and Variant Details for each item in the order
    if (order.items && order.items.length > 0) {
      const productIds = order.items
        .map(item => {
          try {
            // Handle both string and ObjectId representations
            const productId = item.id || item.productId || item._id;
            if (!productId) return null;
            
            // If it's already an ObjectId, return it
            if (productId instanceof ObjectId) return productId;
            
            // Try to convert string to ObjectId
            return new ObjectId(String(productId));
          } catch (e) {
            console.error('Invalid product ID:', item, e);
            return null; // Invalid ObjectId string
          }
        })
        .filter(id => id !== null);

      const products = await db.collection('products').find({ _id: { $in: productIds } }).toArray();
      const productsById = {};
      products.forEach(p => { productsById[p._id.toString()] = p; });

      order.resolvedItems = order.items.map(item => {
        const productId = String(item.id || item.productId || item._id || '');
        const product = productsById[productId];
        let variantInfo = null;

        if (product && product.variants && product.variants.length > 0) {
          variantInfo = product.variants.find(v => {
            // Try to match by variant _id first
            if (v._id && item.variantId) {
              return v._id.toString() === String(item.variantId);
            }
            // Then try size and color match
            if (item.size && item.color) {
              return v.size === item.size && v.color === item.color;
            }
            // If only size is provided, match by size
            if (item.size && v.size === item.size) {
              return true;
            }
            return false;
          });
        }
        
        return {
          ...item,
          productName: product ? product.name : (item.name || 'Unknown Product'),
          productImage: product ? (product.images && product.images[0]) : null,
          variant: variantInfo,
        };
      });
    }

    return NextResponse.json({ ok: true, order });

  } catch (err) {
    console.error(`[ADMIN GET ORDER ${id}]`, err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    if (errorMessage.toLowerCase().includes('invalid objectid')) {
        return NextResponse.json({ ok: false, error: 'Invalid Order ID format.' }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: errorMessage }, { status: 500 });
  }
}
