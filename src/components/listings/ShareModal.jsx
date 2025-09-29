import React, { useState } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShareModal({ isOpen, onClose, listingTitle, listingId }) {
  const [copied, setCopied] = useState(false);
  
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/listing?id=${listingId}`;
  
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToSocial = (platform) => {
    const encodedTitle = encodeURIComponent(`Check out this bounce house: ${listingTitle}`);
    const encodedUrl = encodeURIComponent(shareUrl);
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      instagram: `https://www.instagram.com/` // Instagram doesn't support direct sharing URLs
    };
    
    if (platform === 'instagram') {
      alert('Please copy the link and share manually on Instagram');
      return;
    }
    
    window.open(urls[platform], '_blank', 'width=600,height=400');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold">Share this listing</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Copy Link */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Link</label>
          <div className="flex">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 text-sm"
            />
            <Button
              onClick={copyToClipboard}
              className="px-4 py-2 bg-gray-900 text-white rounded-r-lg hover:bg-gray-800 flex items-center"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          {copied && <p className="text-sm text-green-600 mt-1">Link copied!</p>}
        </div>

        {/* Social Share Buttons */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Share on social media</p>
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => shareToSocial('facebook')}
              className="flex items-center justify-center space-x-2 py-3"
            >
              <span>Facebook</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial('twitter')}
              className="flex items-center justify-center space-x-2 py-3"
            >
              <span>Twitter</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial('linkedin')}
              className="flex items-center justify-center space-x-2 py-3"
            >
              <span>LinkedIn</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => shareToSocial('instagram')}
              className="flex items-center justify-center space-x-2 py-3"
            >
              <span>Instagram</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}