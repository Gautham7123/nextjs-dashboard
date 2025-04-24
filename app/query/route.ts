import postgres from 'postgres';

// ✅ Correct SQL client setup with Neon
const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: { rejectUnauthorized: false },
  transform: postgres.camel,
});

async function listInvoices() {
  // ✅ Properly formatted SQL query
  return await sql`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666
  `;
}

export async function GET() {
  try {
    const data = await listInvoices();
    return Response.json({ message: '✅ Query executed successfully', data });
  } catch (error) {
    console.error('❌ Query failed:', error);
    return Response.json({ error: '❌ Query failed', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  } finally {
    await sql.end(); // ✅ Always close connection
  }
}
