// api.js
import { add_payload_to_cache, resetCache } from './cache.js';
import { getSheetId, getSheetEndpoint } from './sheet.js';

const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

export async function fetch_init_rows() {
    // Reading remains completely open and public
    const SHEET_ID = getSheetId();
    const query = encodeURIComponent("SELECT A, B LIMIT 20");
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&tq=${query}`;

    try {
        const response = await fetch(url);
        const text = await response.text();
        const jsonString = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);
        const data = JSON.parse(jsonString);
        
        if (!data.table.rows) return;

        resetCache();
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

export async function addEntryToSheet(name, data) {
    const deploymentUrl = getSheetEndpoint();

    return new Promise((resolve, reject) => {
        // 1. Check for the Enterprise namespace
        if (typeof grecaptcha === 'undefined' || typeof grecaptcha.enterprise === 'undefined') {
            reject(new Error("reCAPTCHA Enterprise failed to load. Please verify your Vercel deployment and that your site key is active."));
            return;
        }

        // 2. Call the enterprise namespace
        grecaptcha.enterprise.ready(async () => {
            try {
                // 3. Execute using the enterprise namespace
                const token = await grecaptcha.enterprise.execute(RECAPTCHA_SITE_KEY, { action: 'add_entry' });

                const bodyParams = new URLSearchParams();
                bodyParams.set('recaptchaToken', token);
                bodyParams.set('name', name);
                bodyParams.set('data', data);

                const response = await fetch(deploymentUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: bodyParams.toString()
                });

                const result = await response.json();

                if (result.status === "error") {
                    throw new Error(result.message);
                }

                resolve(result);
            } catch (error) {
                console.error('Request failed:', error);
                reject(error);
            }
        });
    });
}