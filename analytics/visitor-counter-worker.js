/**
 * Cloudflare Worker: lightweight self-hosted visit counter for IRR and SI.
 *
 * Required binding:
 * - KV namespace binding named VISIT_COUNTER
 *
 * Optional environment variables:
 * - ALLOWED_ORIGIN: exact site origin, e.g. https://wangchenpei.github.io
 * - READ_TOKEN: token required for GET /stats?token=...
 */

var DEFAULT_ALLOWED_ORIGIN = "https://wangchenpei.github.io";

function jsonResponse(data, status, origin) {
  return new Response(JSON.stringify(data, null, 2), {
    status: status || 200,
    headers: corsHeaders(origin, "application/json;charset=UTF-8"),
  });
}

function corsHeaders(origin, contentType) {
  return {
    "Access-Control-Allow-Origin": origin || DEFAULT_ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Content-Type": contentType || "text/plain;charset=UTF-8",
    "Cache-Control": "no-store",
  };
}

function isAllowedOrigin(request, env) {
  var expected = env.ALLOWED_ORIGIN || DEFAULT_ALLOWED_ORIGIN;
  var origin = request.headers.get("Origin") || "";
  return origin === expected || origin === expected + "/";
}

function ymd(date) {
  return date.toISOString().slice(0, 10);
}

async function incrementKV(env, key) {
  var raw = await env.VISIT_COUNTER.get(key);
  var current = parseInt(raw || "0", 10);
  if (!Number.isFinite(current) || current < 0) current = 0;
  var next = current + 1;
  await env.VISIT_COUNTER.put(key, String(next));
  return next;
}

function normalizePath(value) {
  var path = String(value || "/").trim();
  if (!path || path.charAt(0) !== "/") return "/";
  return path.slice(0, 120);
}

async function readPayload(request) {
  var text = await request.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch (e) {
    return {};
  }
}

async function handleHit(request, env) {
  if (!isAllowedOrigin(request, env)) {
    return jsonResponse({ ok: false, error: "origin_not_allowed" }, 403, env.ALLOWED_ORIGIN);
  }

  var payload = await readPayload(request);
  var date = ymd(new Date());
  var path = normalizePath(payload.path);
  var pathKey = encodeURIComponent(path);

  await incrementKV(env, "total");
  var today = await incrementKV(env, "day:" + date);
  await incrementKV(env, "path:" + pathKey);
  await incrementKV(env, "path-day:" + pathKey + ":" + date);

  return jsonResponse({ ok: true, today: today }, 200, env.ALLOWED_ORIGIN);
}

async function handleStats(request, env) {
  var url = new URL(request.url);
  if (env.READ_TOKEN && url.searchParams.get("token") !== env.READ_TOKEN) {
    return jsonResponse({ ok: false, error: "unauthorized" }, 401, env.ALLOWED_ORIGIN);
  }

  var date = ymd(new Date());
  var total = parseInt((await env.VISIT_COUNTER.get("total")) || "0", 10);
  var today = parseInt((await env.VISIT_COUNTER.get("day:" + date)) || "0", 10);

  return jsonResponse(
    {
      ok: true,
      total: Number.isFinite(total) ? total : 0,
      today: Number.isFinite(today) ? today : 0,
      date: date,
    },
    200,
    env.ALLOWED_ORIGIN
  );
}

export default {
  async fetch(request, env) {
    var url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(env.ALLOWED_ORIGIN),
      });
    }

    if (!env.VISIT_COUNTER) {
      return jsonResponse({ ok: false, error: "missing_kv_binding" }, 500, env.ALLOWED_ORIGIN);
    }

    if (url.pathname === "/hit" && request.method === "POST") {
      return handleHit(request, env);
    }

    if (url.pathname === "/stats" && request.method === "GET") {
      return handleStats(request, env);
    }

    return jsonResponse({ ok: false, error: "not_found" }, 404, env.ALLOWED_ORIGIN);
  },
};
