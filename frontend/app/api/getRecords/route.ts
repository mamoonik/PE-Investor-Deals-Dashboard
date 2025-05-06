

// app/api/getRecords/route.ts
import { NextResponse } from 'next/server';
import { getAllDeals } from '../../../lib/db';

export async function GET() {
  try {
    const records = await getAllDeals();
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// //////////////////////////
// ////////////////////////////////
// //// above code was working WItHOUT DYNAMIC FIELD ADJUSTMENT in COLUMNS
// //// IF code breaks, just uncomment the above
// ///////////////////////

// import { NextResponse } from 'next/server';
// import { Client } from 'pg';

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
// });

// export async function GET() {
//   try {
//     await client.connect();
//     const { rows } = await client.query('SELECT * FROM extracted_data');
//     await client.end();

//     // 🧠 Extract all unique column names from first row
//     const keys = rows.length > 0 ? Object.keys(rows[0]) : [];

//     return NextResponse.json({ records: rows, keys });
//   } catch (error) {
//     console.error('❌ Failed to fetch records:', error);
//     return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
//   }
// }

