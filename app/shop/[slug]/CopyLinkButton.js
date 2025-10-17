'use client';

import { useState } from 'react';

export default function CopyLinkButton({ slug }) {
  const [copied, setCopied] = useState(false);

  const buildUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/shop/${slug}`;
    }
    return `/shop/${slug}`;
  };

  const handleCopy = async () => {
    const text = buildUrl();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error('Failed to copy shop link:', err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`inline-flex items-center px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
        copied
          ? 'bg-green-600 border-green-600 text-white'
          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
      aria-label="দোকানের লিংক কপি করুন"
    >
      {copied ? 'কপি হয়েছে' : 'দোকানের লিংক কপি করুন'}
    </button>
  );
}
