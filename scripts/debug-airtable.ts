import Airtable from 'airtable';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_PRODUCT_BASE_ID || process.env.AIRTABLE_BASE_ID;

console.log('Testing Airtable connection...');
console.log('API Key present:', !!apiKey);
console.log('Base ID:', baseId);

if (!apiKey || !baseId) {
    console.error('Missing credentials');
    process.exit(1);
}

const base = new Airtable({ apiKey }).base(baseId);

const testEmail = 'rafaelhobrum@gmail.com'; // From user screenshot

async function test() {
    console.log(`Searching for ${testEmail}...`);
    try {
        // Try table names or ID
        const tables = ['Acessos', 'tbljUc8sptfa7QnAE'];

        for (const tableName of tables) {
            console.log(`Trying table: ${tableName}`);
            try {
                const records = await base(tableName).select({
                    filterByFormula: `LOWER({mail}) = LOWER('${testEmail}')`,
                    maxRecords: 1
                }).all();

                console.log(`Found ${records.length} records in ${tableName}`);
                if (records.length > 0) {
                    console.log('Fields:', JSON.stringify(records[0].fields, null, 2));
                }
            } catch (e: any) {
                console.warn(`Failed table ${tableName}:`, e.message);
            }
        }
    } catch (err: any) {
        console.error('Fatal error:', err.message);
    }
}

test();
