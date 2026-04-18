// Client-side delivery helpers. No network calls, no data retention.

export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

export function downloadAsText(text, filename) {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Some mail clients (Outlook in particular) truncate mailto bodies above
// roughly 2000 characters. We do not block; we warn.
export const MAILTO_BODY_SAFE_LIMIT = 2000;

export function openMailto({ to, subject, body }) {
  const params = new URLSearchParams();
  if (subject) params.set('subject', subject);
  if (body) params.set('body', body);
  const query = params.toString().replace(/\+/g, '%20');
  const href = to ? `mailto:${to}?${query}` : `mailto:?${query}`;
  window.location.href = href;
}
