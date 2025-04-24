import postgres from 'postgres';
import bcrypt from 'bcryptjs';
import { users, customers, invoices } from '../lib/placeholder-data';

// ✅ SQL client setup with Neon
const sql = postgres(process.env.POSTGRES_URL || 'postgres://localhost:5432/yourdb', {
    ssl: { rejectUnauthorized: false },
    transform: postgres.camel,
});


async function seed() {
  try {
    // ✅ Test connection
    await sql`SELECT 1`;

    // ✅ Enable uuid-ossp extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;

    // ✅ Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
      )
    `;

    // ✅ Insert users with hashed passwords
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // ✅ Create customers table
    await sql`
      CREATE TABLE IF NOT EXISTS customers (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        image_url VARCHAR(255) NOT NULL
      )
    `;

    // ✅ Insert customers
    for (const customer of customers) {
      await sql`
        INSERT INTO customers (id, name, email, image_url)
        VALUES (${customer.id}, ${customer.name}, ${customer.email}, ${customer.image_url})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    // ✅ Create invoices table
    await sql`
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
        customer_id UUID NOT NULL,
        amount INT NOT NULL,
        status VARCHAR(255) NOT NULL,
        date DATE NOT NULL
      )
    `;

    // ✅ Insert invoices
    for (const invoice of invoices) {
      await sql`
        INSERT INTO invoices (id, customer_id, amount, status, date)
        VALUES (uuid_generate_v4(), ${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})
        ON CONFLICT (id) DO NOTHING
      `;
    }

    return true;
  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
}

export async function GET() {
  try {
    await seed();
    return Response.json({ message: '✅ Database seeded successfully' });
  } catch (error) {
    return Response.json(
      {
        error: '❌ Seeding failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  } finally {
    await sql.end(); // ✅ Cleanly close the connection
  }
}
