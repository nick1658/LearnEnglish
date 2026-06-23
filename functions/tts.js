export async function onRequest(context) {
  const url = new URL(context.request.url);
  const text = url.searchParams.get('text');
  if (!text || text.length > 1000) {
    return new Response('text required (max 1000 chars)', { status: 400 });
  }

  try {
    const resp = await fetch('https://freetts.org/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, voice: 'en-US-JennyNeural' }),
    });
    if (!resp.ok) return new Response('tts api error', { status: 502 });
    const { file_id } = await resp.json();
    const audio = await fetch(`https://freetts.org/api/audio/${file_id}`);
    return new Response(await audio.blob(), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch {
    return new Response('proxy error', { status: 502 });
  }
}
