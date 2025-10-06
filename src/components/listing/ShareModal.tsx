import React, { useState } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  LinkedinShareButton,
  EmailShareButton,
} from 'react-share';
import {
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  Copy,
  Check,
  MessageSquare,
} from 'lucide-react';
import Modal from '../admin/Modal';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  };

  const shareOptions = [
    {
      ButtonComponent: FacebookShareButton,
      Icon: Facebook,
      label: 'Facebook',
      color: 'text-blue-600',
      props: { url, quote: `Check out this amazing experience: ${title}` }
    },
    {
      ButtonComponent: TwitterShareButton,
      Icon: Twitter,
      label: 'Twitter',
      color: 'text-sky-500',
      props: { url, title: `Check out: ${title}` }
    },
    {
      ButtonComponent: WhatsappShareButton,
      Icon: MessageSquare,
      label: 'WhatsApp',
      color: 'text-green-500',
      props: { url, title: `Check out: ${title}` }
    },
    {
      ButtonComponent: LinkedinShareButton,
      Icon: Linkedin,
      label: 'LinkedIn',
      color: 'text-blue-700',
      props: { url, title, summary: `I found this amazing experience on Ziarazetu: ${title}` }
    },
    {
      ButtonComponent: EmailShareButton,
      Icon: Mail,
      label: 'Email',
      color: 'text-gray-600',
      props: { url, subject: `Check out: ${title}`, body: `I thought you might be interested in this experience from Ziarazetu:\n\n` }
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share this experience">
      <div className="space-y-6">
        <p className="text-gray-600">Share this link via</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 text-center">
          {shareOptions.map(({ ButtonComponent, Icon, label, color, props }) => (
            <ButtonComponent {...props} key={label}>
              <div className="flex flex-col items-center space-y-2 group cursor-pointer">
                <div className="p-4 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-colors">
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <span className="text-xs text-gray-700">{label}</span>
              </div>
            </ButtonComponent>
          ))}
        </div>
        <div className="relative pt-4">
          <p className="text-gray-600 mb-2">Or copy link</p>
          <div className="flex items-center">
            <input
              type="text"
              value={url}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-l-lg bg-gray-50 focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-red-600 text-white rounded-r-lg hover:bg-red-700 flex items-center disabled:bg-red-400"
              disabled={copied}
            >
              {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          {copied && (
            <p className="text-sm text-green-600 mt-2 animate-pulse">Link copied to clipboard!</p>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
