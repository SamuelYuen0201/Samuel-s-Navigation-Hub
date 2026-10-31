export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 處理 POST /api/telemetry
    if (url.pathname === '/api/telemetry' && request.method === 'POST') {
      try {
        const body = await request.json();
        const clientIp = request.headers.get('CF-Connecting-IP') || 'Unknown';
        const country = request.cf?.country || 'Unknown';
        const city = request.cf?.city || 'Unknown';

        if (env.DB) {
          await env.DB.prepare(`
            INSERT INTO visits (
              ip_address, country, city, device_uuid, screen_res, color_depth,
              device_pixel_ratio, timezone, language, cpu_cores, device_memory,
              touch_support, battery_status, webrtc_ip, canvas_hash, audio_hash,
              webgl_vendor, webgl_renderer, gpc_enabled, dnt_enabled,
              cookies_enabled, local_storage, gps_lat, gps_lon, gps_accuracy, user_agent
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `).bind(
            clientIp, country, city,
            body.device_uuid ?? null,
            body.screen_res ?? null,
            body.color_depth ?? null,
            body.device_pixel_ratio ?? null,
            body.timezone ?? null,
            body.language ?? null,
            body.cpu_cores ?? null,
            body.device_memory ?? null,
            body.touch_support ?? null,
            body.battery_status ?? null,
            body.webrtc_ip ?? null,
            body.canvas_hash ?? null,
            body.audio_hash ?? null,
            body.webgl_vendor ?? null,
            body.webgl_renderer ?? null,
            body.gpc_enabled ?? null,
            body.dnt_enabled ?? null,
            body.cookies_enabled ?? null,
            body.local_storage ?? null,
            body.gps_lat ?? null,
            body.gps_lon ?? null,
            body.gps_accuracy ?? null,
            body.user_agent ?? null
          ).run();
        }

        return new Response(JSON.stringify({ status: 'ok' }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (err) {
        return new Response(JSON.stringify({ status: 'error', message: err.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 2. 處理 GET /api/logs
    if (url.pathname === '/api/logs' && request.method === 'GET') {
      const key = url.searchParams.get('key');
      if (!env.ADMIN_KEY || key !== env.ADMIN_KEY) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      if (!env.DB) {
        return new Response(JSON.stringify({ error: 'D1 Database (DB) binding not configured yet' }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      const { results } = await env.DB.prepare(
        `SELECT * FROM visits ORDER BY id DESC LIMIT 100`
      ).all();

      return new Response(JSON.stringify(results, null, 2), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 3. 其他請求透過 Cloudflare Static Assets 提供
    return env.ASSETS.fetch(request);
  }
};
