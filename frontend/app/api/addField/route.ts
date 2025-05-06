// // File: frontend/app/api/addField/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { Client } from 'pg';
// import { OpenAI } from 'openai';

// const client = new Client({
//   connectionString: process.env.DATABASE_URL,
// });
// const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

// export async function POST(req: NextRequest) {
//   const { field_name, purpose } = await req.json();

//   if (!field_name || !purpose) {
//     return NextResponse.json({ error: 'Missing field name or purpose' }, { status: 400 });
//   }

// //   try {
// //     await client.connect(); // ✅ connect to DB

// //     // 1. Get all records with raw_text
// //     const { rows } = await client.query('SELECT id, document, raw_text FROM extracted_data');

// //     for (const row of rows) {
// //       const prompt = `Document: ${row.raw_text}
// // Instruction: Based on the above document, extract information for this custom field: "${field_name}". Purpose: ${purpose}.
// // Respond with a short, clear value as a single line of text. Do not explain.`;

// //       const completion = await openai.chat.completions.create({
// //         model: 'gpt-4o',
// //         temperature: 0.3,
// //         messages: [{ role: 'user', content: prompt }],
// //       });

// //       const field_value = completion.choices[0].message.content?.trim() || 'N/A';

// //       // 3. Add the new field (assumes column already added to DB!)
// //       await client.query(
// //         `UPDATE extracted_data SET ${field_name} = $1 WHERE id = $2`,
// //         [field_value, row.id]
// //       );
// //     }

// //     await client.end(); // ✅ close connection

// //     return NextResponse.json({ success: true });
// //   } catch (error) {
// //     console.error(' Failed to add field:', error);
// //     return NextResponse.json({ error: 'Server error', details: error }, { status: 500 });
// //   }

//   try {
//     await client.connect();
  
//     // ✅ Add the column to the table if it doesn't exist
//     const checkColumn = await client.query(`
//       SELECT column_name FROM information_schema.columns 
//       WHERE table_name = 'extracted_data' AND column_name = $1
//     `, [field_name]);
  
//     if (checkColumn.rows.length === 0) {
//       console.log(`Adding new column '${field_name}' to extracted_data table`);
//       await client.query(`ALTER TABLE extracted_data ADD COLUMN "${field_name}" TEXT`);
//     }
  
//     // 🔍 Get all records
//     const { rows } = await client.query('SELECT id, document, raw_text FROM extracted_data');
  
//     for (const row of rows) {
//       const prompt = `Document: ${row.raw_text}
//   Instruction: Based on the above document, extract information for this custom field: "${field_name}". Purpose: ${purpose}.
//   Respond with a short, clear value as a single line of text. Do not explain.`;
  
//       const completion = await openai.chat.completions.create({
//         model: 'gpt-4o',
//         temperature: 0.3,
//         messages: [{ role: 'user', content: prompt }],
//       });
  
//       const field_value = completion.choices[0].message.content?.trim() || 'N/A';
  
//       await client.query(
//         `UPDATE extracted_data SET "${field_name}" = $1 WHERE id = $2`,
//         [field_value, row.id]
//       );
//       console.log(`🧠 Updating ID ${row.id} with ${field_name} = ${field_value}`);

//     }
  
//     await client.end();
  
//     return NextResponse.json({ success: true });
//   } catch (error) {
//     console.error(' Failed to add field:', error);
//     return NextResponse.json({ error: 'Server error', details: error }, { status: 500 });
//   }
  
// }



////////

import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

export async function POST(req: NextRequest) {
  const { field_name, purpose } = await req.json();

  if (!field_name || !purpose) {
    return NextResponse.json({ error: 'Missing field name or purpose' }, { status: 400 });
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();

    // Check if column already exists
    const checkColumn = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'extracted_data' AND column_name = $1
    `, [field_name]);

    if (checkColumn.rows.length === 0) {
      console.log(`🛠 Adding new column '${field_name}' to extracted_data table`);
      await client.query(`ALTER TABLE extracted_data ADD COLUMN "${field_name}" TEXT`);
    }

    // Get all records
    const { rows } = await client.query('SELECT id, document, raw_text FROM extracted_data');

    for (const row of rows) {
      const prompt = `Document: ${row.raw_text}
Instruction: Based on the above document, extract information for this custom field: "${field_name}". Purpose: ${purpose}.
Respond with a short, clear value as a single line of text. Do not explain.`;

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }],
      });

      const field_value = completion.choices[0].message.content?.trim() || 'N/A';

      await client.query(
        `UPDATE extracted_data SET "${field_name}" = $1 WHERE id = $2`,
        [field_value, row.id]
      );
    }

    await client.end();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('🛑 Failed to add field:', error);
    return NextResponse.json({ error: 'Server error', details: error }, { status: 500 });
  }
}
