import { useState } from 'react';
import { buildSharePayload, copyShareText, openLineShare, openXShare } from '@/lib/share';
import type { SummarizeResult } from '@/lib/ai/types';

interface ShareBarProps {
  title: string;
  url: string;
  result: SummarizeResult;
}

export function ShareBar({ title, url, result }: ShareBarProps) {
  const [copied, setCopied] = useState(false);
  const { full, short } = buildSharePayload(title, result, url);

  const handleCopy = async () => {
    await copyShareText(full);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="share-bar">
      <p className="share-bar__label">共有</p>
      <div className="share-bar__actions">
        <button type="button" className="btn btn-sm" onClick={() => void handleCopy()}>
          {copied ? '✓ コピー済' : '全文コピー'}
        </button>
        <button type="button" className="btn btn-sm" onClick={() => openLineShare(full)}>
          LINE
        </button>
        <button type="button" className="btn btn-sm" onClick={() => openXShare(short, url)}>
          X
        </button>
      </div>
    </div>
  );
}
