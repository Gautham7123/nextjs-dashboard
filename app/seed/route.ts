import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { hash } from 'bcryptjs'; // Changed from bcrypt to bcryptjs
import { customers, invoices, revenue, users } from '../lib/placeholder-data';

export async function GET() {
  try {
    // Validate data before proceeding
    if (!users?.length || !customers?.length || !invoices?.length || !revenue?.length) {
      throw new Error('Missing required seed data');
    }

    // Create tables if they don't exist
    await sql`CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS customers (
      id UUID PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL,
      image_url TEXT NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS invoices (
      id UUID PRIMARY KEY,
      customer_id UUID NOT NULL,
      amount INT NOT NULL,
      status VARCHAR(255) NOT NULL,
      date DATE NOT NULL
    )`;

    await sql`CREATE TABLE IF NOT EXISTS revenue (
      month VARCHAR(4) NOT NULL UNIQUE,
      revenue INT NOT NULL
    )`;

    // Insert data sequentially to ensure proper order
    const hashedPassword = await hash('123456', 10);

    // Insert users
    for (const user of users) {
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Insert customers
    for (const customer of customers) {
      await sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Insert invoices
    for (const invoice of invoices) {
      await sql`
        INSERT INTO invoices (id, customer_id, amount, status, date)
        VALUES (${invoice.id}, ${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // Insert revenue
    for (const rev of revenue) {
      await sql`
        INSERT INTO revenue (month, revenue)
        VALUES (${rev.month}, ${rev.revenue})
        ON CONFLICT (month) DO NOTHING
      `;
    }

    return NextResponse.json({ message: 'Database seeded successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error seeding database:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message
      : 'An unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to seed database: ${errorMessage}` },
      { status: 500 }
    );
  }
}
