// Simple orders API (file-based, for demo)
// GET /api/orders - list all orders
// POST /api/orders - add new order
import { NextResponse } from 'next/server';
import fs from 'fs';

const ORDERS_FILE = 'orders.json';

function loadOrders() {
  try {
    return JSON.parse(fs.readFileSync(ORDERS_FILE, 'utf8'));
  } catch {
    return [];
  }
}
function saveOrders(orders) {
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export async function GET() {
  const orders = loadOrders();
  return NextResponse.json({ ok: true, orders });
}

export async function POST(req) {
  const order = await req.json();
  const orders = loadOrders();
  orders.push(order);
  saveOrders(orders);
  return NextResponse.json({ ok: true, order });
}
