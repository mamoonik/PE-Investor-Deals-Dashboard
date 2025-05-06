


import { Pool } from 'pg';

// 📦 Connect using DATABASE_URL from your .env.local
console.log('📦 Connecting to:', process.env.DATABASE_URL);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// ✅ Normalize any JSON stringified field to its proper form
function normalizeField(field: any): any {
  if (typeof field === 'string') {
    try {
      const parsed = JSON.parse(field);
      return parsed;
    } catch {
      return field;
    }
  }
  return field;
}

// ✅ Insert parsed data safely into Postgres (expects JSONB columns)
export async function insertExtractedData(data: {
  document: string;
  company_name?: any;
  company_description?: any;
  industry?: any;
  management_team?: any;
  revenue?: any;
  revenue_growth?: any;
  gross_profit?: any;
  ebitda?: any;
  business_model?: any;
}) {
  const query = `
    INSERT INTO extracted_data (
      document, company_name, company_description, industry,
      management_team, revenue, revenue_growth, gross_profit, ebitda,
      business_model
    )
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
  `;

  const values = [
    data.document,
    normalizeField(data.company_name),
    normalizeField(data.company_description),
    normalizeField(data.industry),
    normalizeField(data.management_team),
    normalizeField(data.revenue),
    normalizeField(data.revenue_growth),
    normalizeField(data.gross_profit),
    normalizeField(data.ebitda),
    normalizeField(data.business_model),
  ];

  try {
    await pool.query(query, values);
  } catch (err) {
    console.error('❌ Failed inserting into DB:', err);
    throw err;
  }
}

// ✅ Get all rows (already normalized to parse JSONB)
// export async function getAllDeals() {
//   const res = await pool.query('SELECT * FROM extracted_data ORDER BY created_at DESC');

//   return res.rows.map((row) => {
//     const cleaned: any = { ...row };
//     for (const key in cleaned) {
//       cleaned[key] = normalizeField(cleaned[key]);
//     }
//     return cleaned;
//   });
// }
export async function getAllDeals() {
    const client = await pool.connect();
  
    try {
      const result = await client.query('SELECT * FROM extracted_data ORDER BY created_at DESC');
  
      // Convert fields to structured format expected by frontend
      return result.rows.map(row => ({
        // document: row.file_name,
        document: row.document, 
        company_name: row.company_name,
        company_description: row.company_description,
        business_model: row.business_model,
        industry: row.industry,
        management_team: row.management_team,
        revenue: row.revenue,
        revenue_growth: row.revenue_growth,
        gross_profit: row.gross_profit,
        ebitda: row.ebitda,
      }));
    } catch (err) {
      console.error('❌ DB Fetch Error:', err);
      throw err;
    } finally {
      client.release();
    }
  }
export { pool };
