// Data fetchers ported 1:1 from .github/workflows/fetch-and-update-data.yml.
//
// Each fetcher returns the RAW response body as text on success, or null if the
// response was not valid JSON (mirroring the workflow's `fetch_json` guard,
// which discarded non-JSON bodies so an HTML error page could never poison the
// committed data). A null result means "keep the previously stored value".

const FLOW_URL = 'https://azf-eai-denodo-proxies.azurewebsites.net/api/riverflow';
const WEATHER_URL =
  'https://api.open-meteo.com/v1/forecast?latitude=51.051798892149094&longitude=-115.0190595210664&hourly=temperature_2m&daily=sunrise,sunset&timezone=America%2FDenver';
const RIVERS_ROOT = 'https://rivers.alberta.ca/';
const RIVERS_DATA = 'https://rivers.alberta.ca/DataService/WaterlevelRecords';

/** Return `text` if it parses as JSON, otherwise null (with a warning). */
function jsonOrNull(label, text) {
  try {
    JSON.parse(text);
    return text;
  } catch {
    console.warn(`${label} fetch returned invalid JSON; keeping previous version`);
    return null;
  }
}

/** fetch() with curl-style --retry semantics (retries connect + all errors). */
async function fetchWithRetry(url, opts = {}, { retries = 0, retryDelayMs = 0, timeoutMs = 30000 } = {}) {
  for (let attempt = 0; ; attempt++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, { ...opts, signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      if (attempt >= retries) throw err;
      console.warn(`${url} attempt ${attempt + 1} failed (${err.message}); retrying`);
      await new Promise((r) => setTimeout(r, retryDelayMs));
    } finally {
      clearTimeout(timer);
    }
  }
}

// --max-time 600 --retry 3 --retry-delay 10 --retry-connrefused --retry-all-errors --fail
export async function fetchFlow() {
  const res = await fetchWithRetry(FLOW_URL, {}, { retries: 3, retryDelayMs: 10000, timeoutMs: 600000 });
  return jsonOrNull('flowData', await res.text());
}

export async function fetchWeather() {
  const res = await fetchWithRetry(WEATHER_URL, {}, { timeoutMs: 60000 });
  return jsonOrNull('weatherData', await res.text());
}

// rivers.alberta.ca uses ASP.NET MVC anti-forgery (double-submit token):
// GET the root page to receive the __RequestVerificationToken cookie + a
// matching hidden form field, then POST with both.
export async function fetchHistorical() {
  let cookieHeader = '';
  let token = '';
  try {
    const root = await fetchWithRetry(RIVERS_ROOT, {}, { timeoutMs: 60000 });
    cookieHeader = root.headers
      .getSetCookie()
      .map((c) => c.split(';')[0])
      .join('; ');
    const html = await root.text();
    const m = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/);
    token = m?.[1] ?? '';
  } catch (err) {
    // If the token handshake fails the POST still fires (without a token) and
    // the JSON guard rejects the resulting HTML error, preserving prior data.
    console.warn(`rivers.alberta.ca token handshake failed (${err.message})`);
  }

  const body = new URLSearchParams({
    stationNumber: '05BF024',
    stationType: 'L',
    dataType: 'HG',
    __RequestVerificationToken: token,
  });

  try {
    const res = await fetchWithRetry(
      RIVERS_DATA,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          ...(cookieHeader ? { Cookie: cookieHeader } : {}),
        },
        body,
      },
      { timeoutMs: 60000 }
    );
    return jsonOrNull('historicalFlowData', await res.text());
  } catch (err) {
    console.warn(`historicalFlowData fetch failed (${err.message}); keeping previous version`);
    return null;
  }
}
