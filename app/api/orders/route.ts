import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';
import { getErrorMessage } from '@/lib/errors';
import { getProducts } from '@/lib/products';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { createShiprocketOrder, getShiprocketCreatedOrderId, ShiprocketError } from '@/lib/shiprocket';

type CountRow = { count: string };
type MaxOrderRow = { max: number | null };
type OrderRow = {
  id: number;
  order_number: string;
  date_str: string;
  customer: string;
  channel: string;
  total_price: string;
  payment_status: string;
  fulfillment_status: string;
  items_count: string;
  delivery_status: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  shipping_address?: string | null;
  billing_address?: string | null;
  notes?: string | null;
  order_items?: string | null;
  subtotal?: string | null;
  delivery_charge?: string | null;
  cod_fee?: string | null;
  advance_paid?: string | null;
  remaining_cod?: string | null;
  payment_method?: string | null;
  shiprocket_sync_status?: string | null;
  shiprocket_order_id?: string | null;
};

type PurchasedItem = {
  product_id?: unknown;
  quantity?: unknown;
};

async function decrementPurchasedInventory(items: unknown) {
  if (!Array.isArray(items)) return;

  const quantities = new Map<number, number>();
  for (const item of items as PurchasedItem[]) {
    const productId = Number(item.product_id);
    const quantity = Number(item.quantity);
    if (!Number.isInteger(productId) || productId <= 0 || !Number.isFinite(quantity) || quantity <= 0) continue;
    quantities.set(productId, (quantities.get(productId) || 0) + Math.floor(quantity));
  }

  for (const [productId, quantity] of quantities) {
    await sql`
      UPDATE products
      SET inventory = GREATEST(0, COALESCE(inventory, 10) - ${quantity})
      WHERE id = ${productId}
    `;
  }
}

const ensureOrdersTable = async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      order_number VARCHAR(50) NOT NULL,
      date_str VARCHAR(100) NOT NULL,
      customer VARCHAR(255) NOT NULL,
      channel VARCHAR(255) NOT NULL,
      total_price VARCHAR(50) NOT NULL,
      payment_status VARCHAR(50) NOT NULL,
      fulfillment_status VARCHAR(50) NOT NULL,
      items_count VARCHAR(50) NOT NULL,
      delivery_status VARCHAR(50),
      customer_email VARCHAR(255),
      customer_phone VARCHAR(50),
      shipping_address TEXT,
      billing_address TEXT,
      notes TEXT,
      order_items TEXT,
      subtotal VARCHAR(50),
      delivery_charge VARCHAR(50),
      cod_fee VARCHAR(50),
      advance_paid VARCHAR(50),
      remaining_cod VARCHAR(50),
      payment_method VARCHAR(50)
      ,shiprocket_sync_status VARCHAR(50)
      ,shiprocket_order_id VARCHAR(100)
      ,shiprocket_response TEXT
      ,shiprocket_error TEXT
      ,shiprocket_synced_at TIMESTAMPTZ
    )
  `;

  const migrations = [
    'customer_email', 'customer_phone', 'shipping_address', 'billing_address', 'notes', 'order_items',
    'subtotal', 'delivery_charge', 'cod_fee', 'advance_paid', 'remaining_cod', 'payment_method', 'shiprocket_sync_status', 'shiprocket_order_id', 'shiprocket_response', 'shiprocket_error', 'shiprocket_synced_at'
  ];
  for (const migration of migrations) {
    try {
      if (migration === 'customer_email') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(255)`;
      if (migration === 'customer_phone') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)`;
      if (migration === 'shipping_address') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT`;
      if (migration === 'billing_address') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS billing_address TEXT`;
      if (migration === 'notes') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes TEXT`;
      if (migration === 'order_items') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_items TEXT`;
      if (migration === 'subtotal') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal VARCHAR(50)`;
      if (migration === 'delivery_charge') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivery_charge VARCHAR(50)`;
      if (migration === 'cod_fee') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS cod_fee VARCHAR(50)`;
      if (migration === 'advance_paid') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS advance_paid VARCHAR(50)`;
      if (migration === 'remaining_cod') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS remaining_cod VARCHAR(50)`;
      if (migration === 'payment_method') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)`;
      if (migration === 'shiprocket_sync_status') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_sync_status VARCHAR(50)`;
      if (migration === 'shiprocket_order_id') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_order_id VARCHAR(100)`;
      if (migration === 'shiprocket_response') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_response TEXT`;
      if (migration === 'shiprocket_error') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_error TEXT`;
      if (migration === 'shiprocket_synced_at') await sql`ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_synced_at TIMESTAMPTZ`;
    } catch (error) {
      console.error('Order migration error for ' + migration + ':', error);
    }
  }

  try {
    await sql`UPDATE orders SET channel = REPLACE(channel, 'Deeksha', 'DeeraGlow') WHERE channel LIKE '%Deeksha%'`;
  } catch {}
};

const buildFallbackItems = async (order: OrderRow, index: number) => {
  if ((parseInt(order.items_count, 10) || 0) <= 0) {
    return [];
  }

  const products = await getProducts();
  const product = products[index % Math.max(products.length, 1)];
  const itemTotal = order.total_price && order.total_price !== '₹0.00' ? order.total_price : product ? `₹${product.price}` : '₹0';

  if (!product) {
    return [];
  }

  return [{
    product_id: product.id,
    name: product.name,
    image_url: product.image_url,
    quantity: Math.max(parseInt(order.items_count, 10) || 1, 1),
    selected_fragrance: product.fragrances || product.features || 'Default',
    price: `₹${product.price}`,
    total: itemTotal
  }];
};

export async function GET() {
  try {
    await ensureOrdersTable();

    // 2. Check if table is empty
    const checkCount = await sql`SELECT COUNT(*) FROM orders` as unknown as CountRow[];
    const count = parseInt(checkCount[0].count, 10);

    if (count === 0) {
      // Seed orders matching screenshot exactly
      const seedOrders = [
        { num: '#1034', date: 'Jun 25 at 11:58 pm', cust: 'Jyoti Soni', chan: 'DeeraGlow<>Gokwik', total: '₹1,798.50', pay: 'Payment pending', fulfill: 'In progress', items: '4 items', del: '' },
        { num: '#1033', date: 'Jun 8 at 1:48 pm', cust: 'Akshay Agrawal', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1032', date: 'Jun 5 at 11:32 pm', cust: 'Shan Mohd', chan: 'DeeraGlow<>Gokwik', total: '₹399.00', pay: 'Paid', fulfill: 'Fulfilled', items: '1 item', del: 'Delivered' },
        { num: '#1031', date: 'May 28 at 1:18 pm', cust: 'Shantanu Ghosh', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1030', date: 'May 20 at 3:31 pm', cust: 'Akshay Agrawal', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1029', date: 'May 11 at 12:16 pm', cust: 'Jyoti Soni', chan: 'DeeraGlow<>Gokwik', total: '₹1,091.55', pay: 'Paid', fulfill: 'Fulfilled', items: '2 items', del: 'Delivered' },
        { num: '#1028', date: 'May 9 at 3:52 pm', cust: 'Farmida Mir', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1027', date: 'May 7 at 1:09 pm', cust: 'Vereesha Sachan', chan: 'DeeraGlow<>Gokwik', total: '₹1,889.10', pay: 'Payment pending', fulfill: 'Not required', items: '1 item', del: '' },
        { num: '#1026', date: 'Apr 25 at 5:04 pm', cust: 'Jyoti Soni', chan: 'DeeraGlow<>Gokwik', total: '₹2,975.00', pay: 'Paid', fulfill: 'Fulfilled', items: '1 item', del: 'Delivered' },
        { num: '#1025', date: 'Apr 24 at 10:27 pm', cust: 'Rakesh Kumar', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1024', date: 'Apr 24 at 10:20 pm', cust: 'Akshay Agrawal', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1023', date: 'Apr 24 at 2:05 pm', cust: 'Akshay Agrawal', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1022', date: 'Apr 12 at 10:32 pm', cust: 'Jyoti Soni', chan: 'Online Store', total: '₹4,749.00', pay: 'Paid', fulfill: 'Fulfilled', items: '1 item', del: 'Delivered' },
        { num: '#1021', date: 'Apr 12 at 8:40 pm', cust: 'Snigdha Chamaria', chan: 'DeeraGlow<>Gokwik', total: '₹0.00', pay: 'Payment pending', fulfill: 'Not required', items: '0 items', del: '' },
        { num: '#1020', date: 'Apr 9 at 10:34 pm', cust: 'NISHA MONTEEN', chan: 'DeeraGlow<>Gokwik', total: '₹1,970.00', pay: 'Paid', fulfill: 'Fulfilled', items: '1 item', del: 'Delivered' },
        { num: '#1019', date: 'Apr 6 at 12:34 pm', cust: 'Dipti Karnawat', chan: 'DeeraGlow<>Gokwik', total: '₹850.00', pay: 'Paid', fulfill: 'Fulfilled', items: '1 item', del: 'Delivered' }
      ];

      for (const order of seedOrders) {
        await sql`
          INSERT INTO orders (order_number, date_str, customer, channel, total_price, payment_status, fulfillment_status, items_count, delivery_status)
          VALUES (${order.num}, ${order.date}, ${order.cust}, ${order.chan}, ${order.total}, ${order.pay}, ${order.fulfill}, ${order.items}, ${order.del})
        `;
      }
      console.log('Seeded orders table successfully.');
    }

    let orders = await sql`SELECT * FROM orders ORDER BY id DESC` as unknown as OrderRow[];
    const zeroItemOrders = orders.filter(order => (parseInt(order.items_count, 10) || 0) <= 0 && order.order_items !== '[]');
    for (const order of zeroItemOrders) {
      await sql`UPDATE orders SET order_items = '[]' WHERE id = ${order.id}`;
    }
    if (zeroItemOrders.length > 0) {
      orders = await sql`SELECT * FROM orders ORDER BY id DESC` as unknown as OrderRow[];
    }

    const ordersNeedingItems = orders.filter(order => !order.order_items);
    for (let i = 0; i < ordersNeedingItems.length; i++) {
      const order = ordersNeedingItems[i];
      const fallbackItems = await buildFallbackItems(order, i);
      await sql`
        UPDATE orders
        SET order_items = ${JSON.stringify(fallbackItems)},
            customer_email = COALESCE(customer_email, ${`${order.customer.toLowerCase().replace(/\s+/g, '.')}@example.com`}),
            customer_phone = COALESCE(customer_phone, ''),
            shipping_address = COALESCE(shipping_address, 'Address not captured'),
            billing_address = COALESCE(billing_address, 'Same as shipping address'),
            notes = COALESCE(notes, '')
        WHERE id = ${order.id}
      `;
    }

    if (ordersNeedingItems.length > 0) {
      orders = await sql`SELECT * FROM orders ORDER BY id DESC` as unknown as OrderRow[];
    }

    return NextResponse.json(orders);
  } catch (error: unknown) {
    console.error('Error in orders API:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await ensureOrdersTable();
    const {
      customer, total_price, payment_status, items_count, channel,
      customer_email, customer_phone, shipping_address, billing_address, notes, order_items,
      subtotal, delivery_charge, cod_fee, advance_paid, remaining_cod, payment_method
    } = body;
    
    // Generate order number
    const rows = await sql`SELECT MAX(id) FROM orders` as unknown as MaxOrderRow[];
    const maxId = rows[0]?.max || 1034;
    const nextNumber = maxId + 1;
    const order_number = `#${nextNumber}`;

    // Get current date string: "Jul 4 at 12:20 am"
    const date = new Date();
    const formattedDate = date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).replace(',', ' at').toLowerCase();

    await sql`
      INSERT INTO orders (
        order_number, date_str, customer, channel, total_price, payment_status, fulfillment_status, items_count, delivery_status,
        customer_email, customer_phone, shipping_address, billing_address, notes, order_items,
        subtotal, delivery_charge, cod_fee, advance_paid, remaining_cod, payment_method
      )
      VALUES (
        ${order_number}, 
        ${formattedDate}, 
        ${customer}, 
        ${channel || 'Online Store'}, 
        ${total_price}, 
        ${payment_status || 'Paid'}, 
        'In progress', 
        ${items_count}, 
        'Shipped',
        ${customer_email || ''},
        ${customer_phone || ''},
        ${shipping_address || ''},
        ${billing_address || shipping_address || ''},
        ${notes || ''},
        ${JSON.stringify(Array.isArray(order_items) ? order_items : [])},
        ${subtotal || ''},
        ${delivery_charge || ''},
        ${cod_fee || ''},
        ${advance_paid || ''},
        ${remaining_cod || ''},
        ${payment_method || ''}
      )
    `;

    await decrementPurchasedInventory(order_items);

    // A local order is durable before sync. Shiprocket failures are persisted and logged,
    // so a successful checkout is never silently lost and can be retried safely.
    let shiprocketSynced = false;
    try {
      console.info('[Shiprocket] Starting Shiprocket sync', { localOrderNumber: order_number });
      const shiprocketResponse = await createShiprocketOrder({
        orderNumber: order_number,
        customerName: customer || '',
        email: customer_email || '',
        phone: customer_phone || '',
        address: shipping_address || '',
        paymentMethod: payment_method || '',
        subtotal: subtotal || total_price || '',
        items: Array.isArray(order_items) ? order_items : [],
      });
      const shiprocketOrderId = getShiprocketCreatedOrderId(shiprocketResponse);
      await sql`UPDATE orders SET shiprocket_sync_status = 'synced', shiprocket_order_id = ${shiprocketOrderId}, shiprocket_response = ${JSON.stringify(shiprocketResponse)}, shiprocket_error = NULL, shiprocket_synced_at = NOW() WHERE order_number = ${order_number}`;
      shiprocketSynced = true;
      console.info('[Shiprocket] order synced', { localOrderNumber: order_number, shiprocketOrderId });
    } catch (error) {
      const details = error instanceof ShiprocketError ? { message: error.message, status: error.status, response: error.response } : error;
      console.error('[Shiprocket] order sync failed', { localOrderNumber: order_number, details });
      await sql`UPDATE orders SET shiprocket_sync_status = 'failed', shiprocket_error = ${JSON.stringify(details)} WHERE order_number = ${order_number}`;
    }

    // Trigger Order Confirmation Email to Customer & Admin Notification Email via Gmail SMTP
    try {
      await sendOrderConfirmationEmail({
        orderNumber: order_number,
        customerName: customer,
        customerEmail: customer_email || '',
        customerPhone: customer_phone || '',
        shippingAddress: shipping_address || '',
        paymentMethod: payment_method || '',
        subtotal: subtotal || '',
        deliveryCharge: delivery_charge || '',
        codFee: cod_fee || '',
        totalPrice: total_price || '',
        advancePaid: advance_paid || '',
        remainingCod: remaining_cod || '',
        items: Array.isArray(order_items) ? order_items : [],
      });
    } catch (e) {
      console.error('Error sending order email:', e);
    }

    return NextResponse.json({ success: true, order_number, shiprocket_synced: shiprocketSynced });
  } catch (error: unknown) {
    console.error('Error creating order:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    await ensureOrdersTable();

    const {
      id, order_number, date_str, customer, channel, total_price,
      payment_status, fulfillment_status, items_count, delivery_status,
      customer_email, customer_phone, shipping_address, billing_address, notes, order_items,
      subtotal, delivery_charge, cod_fee, advance_paid, remaining_cod, payment_method
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }

    await sql`
      UPDATE orders
      SET order_number = ${order_number},
          date_str = ${date_str},
          customer = ${customer},
          channel = ${channel},
          total_price = ${total_price},
          payment_status = ${payment_status},
          fulfillment_status = ${fulfillment_status},
          items_count = ${items_count},
          delivery_status = ${delivery_status || ''},
          customer_email = ${customer_email || ''},
          customer_phone = ${customer_phone || ''},
          shipping_address = ${shipping_address || ''},
          billing_address = ${billing_address || ''},
          notes = ${notes || ''},
          order_items = ${JSON.stringify(Array.isArray(order_items) ? order_items : [])},
          subtotal = ${subtotal || ''},
          delivery_charge = ${delivery_charge || ''},
          cod_fee = ${cod_fee || ''},
          advance_paid = ${advance_paid || ''},
          remaining_cod = ${remaining_cod || ''},
          payment_method = ${payment_method || ''}
      WHERE id = ${parseInt(id, 10)}
    `;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error updating order:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Missing order ID' }, { status: 400 });
    }
    await ensureOrdersTable();
    await sql`DELETE FROM orders WHERE id = ${parseInt(id, 10)}`;
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error deleting order:', error);
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';
