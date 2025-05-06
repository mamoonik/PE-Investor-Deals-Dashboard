// // // frontend/app/api/saveRecord/route.ts
// // import { NextRequest, NextResponse } from 'next/server';
// // import { insertExtractedData } from '../../../lib/db';

// // export async function POST(req: NextRequest) {
// //   try {
// //     const body = await req.json();
// //     await insertExtractedData(body);

// //     return NextResponse.json({ message: 'Data saved successfully' });
// //   } catch (err) {
// //     console.error('Error saving to DB:', err);
// //     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
// //   }
// // }


// // frontend/app/api/saveRecord/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { insertExtractedData } from '../../../lib/db';

// export async function POST(req: NextRequest) {
//   try {
//     const body = await req.json();

//     // Clean up any stringified JSON fields
//     const cleanedBody: Record<string, any> = {};
//     for (const key in body) {
//       const val = body[key];
//       if (typeof val === 'string') {
//         try {
//           const parsed = JSON.parse(val);
//           // Wrap single object with "value" key into array
//           if (parsed && typeof parsed === 'object' && !Array.isArray(parsed) && parsed.value) {
//             cleanedBody[key] = [parsed];
//           } else if (Array.isArray(parsed)) {
//             cleanedBody[key] = parsed;
//           } else {
//             cleanedBody[key] = val; // leave original
//           }
//         } catch {
//           cleanedBody[key] = val; // not parsable JSON string
//         }
//       } else {
//         cleanedBody[key] = val; // already object or other
//       }
//     }

//     await insertExtractedData(cleanedBody);
//     return NextResponse.json({ message: 'Data saved successfully' });
//   } catch (err) {
//     console.error('❌ Error saving to DB:', err);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
// app/api/saveRecord/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

// Normalize each field: parse strings if possible
function normalizeField(value: any) {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return value;
    }
  }
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log("Received record to save:", JSON.stringify(body, null, 2)); // 👈 Add this line

    const values = [
      body.document,
      normalizeField(body.company_name),
      normalizeField(body.company_description),
      normalizeField(body.industry),
      normalizeField(body.management_team),
      normalizeField(body.revenue),
      normalizeField(body.revenue_growth),
      normalizeField(body.gross_profit),
      normalizeField(body.ebitda),
      normalizeField(body.business_model),
    ];

    await sql`
      INSERT INTO extracted_data (
        document,
        company_name,
        company_description,
        industry,
        management_team,
        revenue,
        revenue_growth,
        gross_profit,
        ebitda,
        business_model
      ) VALUES (
        ${values[0]}, ${values[1]}, ${values[2]}, ${values[3]}, ${values[4]},
        ${values[5]}, ${values[6]}, ${values[7]}, ${values[8]}, ${values[9]}
      )
    `;

    return NextResponse.json({ message: '✅ Data saved successfully' });
  } catch (err) {
    console.error('❌ Error saving to DB:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
