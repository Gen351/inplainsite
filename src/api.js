// api.js
import { add_payload_to_cache, resetCache } from './cache.js'; // Import resetCache
import { getSheetId, getSheetEndpoint, getAppKey } from './sheet.js';

export async function fetch_init_rows() {
    const SHEET_ID = getSheetId();
    const query = encodeURIComponent("SELECT A, B LIMIT 20");
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=${query}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        
        if (!data.table.rows) return;

        resetCache(); // IMPORTANT: Clear old cache before filling new one

        data.table.rows.forEach(row => {
            const payload = {
                name: row.c[0] ? row.c[0].v : "",
                data: row.c[1] ? row.c[1].v : ""
            };
            add_payload_to_cache(payload);
        });
    } catch (error) {
        console.error("Fetch init failed:", error);
    }
}
// ... keep addEntryToSheet as it is ...


export async function addEntryToSheet(name, data) {
    const deploymentUrl = getSheetEndpoint();
    const appKey = getAppKey();

    const bodyParams = new URLSearchParams();
    bodyParams.set('appKey', appKey);
    bodyParams.set('name', name);
    bodyParams.set('data', data);

    try {
        // Use 'no-cors' mode. 
        // Note: You won't be able to read the 'success' message in JS,
        // but the data WILL be saved to the sheet.
        await fetch(deploymentUrl, {
            method: 'POST',
            mode: 'no-cors', 
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: bodyParams.toString()
        });

        // Since no-cors hides the response, we assume success if no network error
        return { status: "success" }; 
    } catch (error) {
        console.error('Network error:', error);
        throw error;
    }
}
