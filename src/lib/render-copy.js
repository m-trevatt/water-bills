// Tiny copy renderer: markdown subset + {{var}} + [^N] citation chips.
// Returns an array of HTML blocks, split on ::marker:: lines so the page can
// interleave Astro components (rates table, action panel, etc).

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inline(s) {
  // Citation chips: [^N]
  s = s.replace(/\[\^(\d+)\]/g, (_, n) =>
    `<a class="cite" href="/sources#${n}" aria-label="Source ${n}">${n}</a>`
  );
  // Links: [text](url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, url) => {
    const external = /^https?:/.test(url);
    const rel = external ? ' rel="noopener noreferrer"' : '';
    return `<a href="${url}"${rel}>${text}</a>`;
  });
  // Bold: **text**
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Italic: *text*
  s = s.replace(/(^|[^*])\*([^*]+)\*/g, '$1<em>$2</em>');
  return s;
}

function renderBlock(block) {
  const lines = block.split('\n');
  const first = lines[0];

  if (first.startsWith('# ')) {
    const title = inline(escapeHtmlExceptCites(first.slice(2)));
    const rest = lines.slice(1).join(' ').trim();
    const sub = rest ? `<span class="small">${inline(escapeHtmlExceptCites(rest))}</span>` : '';
    return `<h1 class="hed">${title}${sub}</h1>`;
  }
  if (first.startsWith('## ')) {
    return `<h2>${inline(escapeHtmlExceptCites(first.slice(3)))}</h2>`;
  }
  if (first.startsWith('> ')) {
    const text = lines.map(l => l.replace(/^>\s?/, '')).join(' ');
    return `<p class="callout">${inline(escapeHtmlExceptCites(text))}</p>`;
  }
  if (lines.every(l => l.startsWith('- '))) {
    const items = lines.map(l => `<li>${inline(escapeHtmlExceptCites(l.slice(2)))}</li>`).join('');
    return `<ul>${items}</ul>`;
  }
  let cls = '';
  let bodyLines = lines;
  const last = lines[lines.length - 1];
  const m = last && last.match(/^\{\.([a-z0-9-]+)\}$/);
  if (m) {
    cls = ` class="${m[1]}"`;
    bodyLines = lines.slice(0, -1);
  }
  const text = bodyLines.join(' ');
  return `<p${cls}>${inline(escapeHtmlExceptCites(text))}</p>`;
}

// Escape HTML everywhere except inside [^N] and [text](url) tokens, which
// inline() consumes. We do the escape *first* on raw text, which is safe
// because [^N], [text](url), **, and * survive HTML entity escaping unchanged.
function escapeHtmlExceptCites(s) {
  return escapeHtml(s);
}

export function renderCopy(source, vars = {}) {
  // Substitute {{var}} first.
  const substituted = source.replace(/\{\{(\w+)\}\}/g, (_, k) => {
    return k in vars ? String(vars[k]) : `{{${k}}}`;
  });

  // Split on ::marker:: lines into [html, marker, html, marker, ...].
  const segments = [];
  const parts = substituted.split(/\n::([a-z0-9-]+)::\n/);
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) {
      const blocks = parts[i].split(/\n{2,}/).map(b => b.trim()).filter(Boolean);
      const html = blocks.map(renderBlock).join('\n');
      segments.push({ type: 'html', html });
    } else {
      segments.push({ type: 'marker', name: parts[i] });
    }
  }
  return segments;
}
