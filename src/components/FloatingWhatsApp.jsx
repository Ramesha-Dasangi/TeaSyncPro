import React from 'react';

const WHATSAPP_NUMBER = '94725603073';
const WHATSAPP_DISPLAY = '+94 72 560 3073';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello TeaSyncPro Support, I need assistance.')}`;

export default function FloatingWhatsApp() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="floating-whatsapp no-print"
      aria-label={`Chat on WhatsApp (${WHATSAPP_DISPLAY})`}
      title={`Chat on WhatsApp (${WHATSAPP_DISPLAY})`}
    >
      <span className="floating-whatsapp-tooltip">WhatsApp: {WHATSAPP_DISPLAY}</span>
      <svg
        viewBox="0 0 32 32"
        width="28"
        height="28"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16.004 2.667C8.64 2.667 2.667 8.64 2.667 16.004c0 2.352.616 4.648 1.787 6.672L2.56 29.44l6.944-1.821A13.28 13.28 0 0 0 16.004 29.34c7.364 0 13.337-5.973 13.337-13.336 0-7.364-5.973-13.337-13.337-13.337zm7.768 18.856c-.326.917-1.612 1.678-2.642 1.899-.704.149-1.622.268-4.716-1.014-3.96-1.64-6.51-5.656-6.708-5.918-.19-.262-1.6-2.13-1.6-4.063 0-1.933 1.01-2.883 1.37-3.277.36-.394.785-.492 1.046-.492.262 0 .523.002.752.014.242.012.566-.092.885.676.326.787 1.11 2.712 1.208 2.908.098.197.163.427.032.689-.13.262-.196.426-.392.656-.197.23-.413.513-.59.689-.197.196-.402.409-.172.802.229.394 1.021 1.685 2.192 2.728 1.506 1.343 2.775 1.759 3.168 1.956.394.197.624.164.853-.098.23-.262.984-1.147 1.246-1.54.262-.394.524-.328.885-.197.36.131 2.294 1.082 2.687 1.278.394.197.656.295.754.459.098.164.098.95-.228 1.867z" />
      </svg>
    </a>
  );
}
