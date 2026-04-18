/**
 * Lightweight markdown renderer for Claude responses.
 * Handles headings, bold, bullets, numbered lists, and paragraphs.
 */
import React from 'react';

function renderInline(text: string, keyPrefix: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let k = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIdx) parts.push(text.slice(lastIdx, match.index));
    const m = match[0];
    if (m.startsWith('**')) parts.push(<strong key={`${keyPrefix}-b-${k++}`} style={{ color: '#E8EAF0' }}>{m.slice(2, -2)}</strong>);
    else if (m.startsWith('`')) parts.push(<code key={`${keyPrefix}-c-${k++}`} className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: '#1F2937', color: '#00D4FF' }}>{m.slice(1, -1)}</code>);
    else parts.push(<em key={`${keyPrefix}-i-${k++}`}>{m.slice(1, -1)}</em>);
    lastIdx = match.index + m.length;
  }
  if (lastIdx < text.length) parts.push(text.slice(lastIdx));
  return parts;
}

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n');
  const out: React.ReactNode[] = [];
  let listBuffer: React.ReactNode[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushList = (i: number) => {
    if (listBuffer.length === 0) return;
    if (listType === 'ol') {
      out.push(<ol key={`ol-${i}`} className="list-decimal ml-5 my-1 space-y-0.5">{listBuffer}</ol>);
    } else {
      out.push(<ul key={`ul-${i}`} className="list-disc ml-5 my-1 space-y-0.5">{listBuffer}</ul>);
    }
    listBuffer = [];
    listType = null;
  };

  lines.forEach((raw, i) => {
    const line = raw.replace(/\r$/, '');
    const trimmed = line.trim();

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList(i);
      out.push(<h4 key={i} className="font-bold text-sm mt-2 mb-1" style={{ color: '#00D4FF' }}>{renderInline(trimmed.slice(4), `h-${i}`)}</h4>);
    } else if (trimmed.startsWith('## ')) {
      flushList(i);
      out.push(<h3 key={i} className="font-bold text-sm mt-3 mb-1" style={{ color: '#00D4FF' }}>{renderInline(trimmed.slice(3), `h-${i}`)}</h3>);
    } else if (trimmed.startsWith('# ')) {
      flushList(i);
      out.push(<h2 key={i} className="font-bold text-base mt-3 mb-2" style={{ color: '#00D4FF' }}>{renderInline(trimmed.slice(2), `h-${i}`)}</h2>);
    }
    // Bulleted list items
    else if (/^[-*]\s/.test(trimmed)) {
      if (listType !== 'ul') { flushList(i); listType = 'ul'; }
      listBuffer.push(<li key={`li-${i}`}>{renderInline(trimmed.replace(/^[-*]\s/, ''), `li-${i}`)}</li>);
    }
    // Numbered list items
    else if (/^\d+\.\s/.test(trimmed)) {
      if (listType !== 'ol') { flushList(i); listType = 'ol'; }
      listBuffer.push(<li key={`li-${i}`}>{renderInline(trimmed.replace(/^\d+\.\s/, ''), `li-${i}`)}</li>);
    }
    // Horizontal rule
    else if (trimmed === '---') {
      flushList(i);
      out.push(<hr key={i} className="my-2" style={{ borderColor: '#1F2937' }} />);
    }
    // Empty line
    else if (trimmed === '') {
      flushList(i);
      out.push(<div key={i} className="h-2" />);
    }
    // Paragraph
    else {
      flushList(i);
      out.push(<p key={i} className="my-1">{renderInline(trimmed, `p-${i}`)}</p>);
    }
  });
  flushList(lines.length);

  return <div className="text-left leading-relaxed">{out}</div>;
}
