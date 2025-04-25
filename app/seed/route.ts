import { sql } from '@vercel/postgres';
import {
  invoices,
  customers,
  revenue,
  users,
} from '../lib/placeholder-data';
import { hash } from 'bcrypt';

export async function GET() {
  try {
    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();
    
    return new Response(JSON.stringify({ message: 'Database seeded!' }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return new Response(JSON.stringify({ error: 'Failed to seed database' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    await sql.end(); // ✅ Cleanly close the connection
  }
}

async function seedUsers() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`;

    const hashedPassword = await hash('123456', 10);
    const insertedUsers = await Promise.all(
      users.map(async (user) => {
        return sql`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );

    console.log(`Seeded ${insertedUsers.length} users`);
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
}

async function seedCustomers() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL,
      image_url TEXT NOT NULL
    )`;

    const insertedCustomers = await Promise.all(
      customers.map(async (customer) => {
        return sql`
          INSERT INTO customers (id, name, email, image_url)
          VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );

    console.log(`Seeded ${insertedCustomers.length} customers`);
  } catch (error) {
    console.error('Error seeding customers:', error);
    throw error;
  }
}

async function seedInvoices() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    )`;

    const insertedInvoices = await Promise.all(
      invoices.map(async (invoice) => {
        return sql`
          INSERT INTO invoices (id, customer_id, amount, status, date)
          VALUES (${invoice.id}, ${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
          ON CONFLICT (id) DO NOTHING;
        `;
      }),
    );

    console.log(`Seeded ${insertedInvoices.length} invoices`);
  } catch (error) {
    console.error('Error seeding invoices:', error);
    throw error;
  }
}

async function seedRevenue() {
  try {
    await sql`CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    )`;

    const insertedRevenue = await Promise.all(
      revenue.map(async (rev) => {
        return sql`
          INSERT INTO revenue (month, revenue)
          VALUES (${rev.month}, ${rev.revenue})
          ON CONFLICT (month) DO NOTHING;
        `;
      }),
    );

    console.log(`Seeded ${insertedRevenue.length} revenue items`);
  } catch (error) {
    console.error('Error seeding revenue:', error);
    throw error;
  }
}
