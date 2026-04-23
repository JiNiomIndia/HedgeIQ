import type { SVGProps } from 'react';

interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'stroke'> {
  size?: number;
  stroke?: number;
}

function Icon({ size = 16, stroke = 1.5, fill = 'none', children, ...rest }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill}
      stroke="currentColor" strokeWidth={stroke}
      strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  );
}

export const I = {
  Home:      (p: IconProps) => <Icon {...p}><path d="M3 11L12 4l9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1v-9z"/></Icon>,
  Wallet:    (p: IconProps) => <Icon {...p}><path d="M3 7h18v12H3z"/><path d="M3 7l3-3h12l3 3"/><path d="M16 13h2"/></Icon>,
  Chart:     (p: IconProps) => <Icon {...p}><path d="M3 20V5m0 15h18"/><path d="M7 16l4-4 3 3 6-7"/></Icon>,
  List:      (p: IconProps) => <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></Icon>,
  Search:    (p: IconProps) => <Icon {...p}><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></Icon>,
  Bell:      (p: IconProps) => <Icon {...p}><path d="M18 16v-5a6 6 0 0 0-12 0v5l-2 2h16l-2-2z"/><path d="M10 21h4"/></Icon>,
  Settings:  (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h.1a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></Icon>,
  Sparkle:   (p: IconProps) => <Icon {...p}><path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z"/><path d="M19 14l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7.7-2z"/></Icon>,
  Send:      (p: IconProps) => <Icon {...p}><path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/></Icon>,
  Plus:      (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12h14"/></Icon>,
  Minus:     (p: IconProps) => <Icon {...p}><path d="M5 12h14"/></Icon>,
  X:         (p: IconProps) => <Icon {...p}><path d="M18 6L6 18M6 6l12 12"/></Icon>,
  Check:     (p: IconProps) => <Icon {...p}><path d="M20 6L9 17l-5-5"/></Icon>,
  ChevD:     (p: IconProps) => <Icon {...p}><path d="M6 9l6 6 6-6"/></Icon>,
  ChevU:     (p: IconProps) => <Icon {...p}><path d="M18 15l-6-6-6 6"/></Icon>,
  ChevR:     (p: IconProps) => <Icon {...p}><path d="M9 6l6 6-6 6"/></Icon>,
  ChevL:     (p: IconProps) => <Icon {...p}><path d="M15 6l-6 6 6 6"/></Icon>,
  ArrowUp:   (p: IconProps) => <Icon {...p}><path d="M12 19V5M5 12l7-7 7 7"/></Icon>,
  ArrowDn:   (p: IconProps) => <Icon {...p}><path d="M12 5v14M5 12l7 7 7-7"/></Icon>,
  ArrowUR:   (p: IconProps) => <Icon {...p}><path d="M7 17L17 7M7 7h10v10"/></Icon>,
  Filter:    (p: IconProps) => <Icon {...p}><path d="M3 4h18l-7 9v7l-4-2v-5L3 4z"/></Icon>,
  Refresh:   (p: IconProps) => <Icon {...p}><path d="M3 12a9 9 0 0 1 15-6.7L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15 6.7L3 16"/><path d="M3 21v-5h5"/></Icon>,
  Download:  (p: IconProps) => <Icon {...p}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5M12 15V3"/></Icon>,
  Print:     (p: IconProps) => <Icon {...p}><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></Icon>,
  Dots:      (p: IconProps) => <Icon {...p}><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></Icon>,
  ExtLink:   (p: IconProps) => <Icon {...p}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6M10 14L21 3"/></Icon>,
  Expand:    (p: IconProps) => <Icon {...p}><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/></Icon>,
  Info:      (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></Icon>,
  Star:      (p: IconProps) => <Icon {...p}><path d="M12 2l3 7 7 .5-5.5 4.5 2 7.5L12 17l-6.5 4 2-7.5L2 9.5 9 9l3-7z"/></Icon>,
  Eye:       (p: IconProps) => <Icon {...p}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></Icon>,
  EyeOff:    (p: IconProps) => <Icon {...p}><path d="M17.9 17.9A10.9 10.9 0 0 1 12 20c-7 0-11-8-11-8a19 19 0 0 1 4.2-5.2"/><path d="M9.9 5.1A10.8 10.8 0 0 1 12 4c7 0 11 8 11 8a18.9 18.9 0 0 1-2.2 3.2"/><path d="M14.1 14.1a3 3 0 0 1-4.2-4.2"/><path d="M1 1l22 22"/></Icon>,
  Logo:      (p: IconProps) => <Icon {...p} viewBox="0 0 24 24"><path d="M4 20V8M12 20V4M20 20v-9"/><path d="M4 16l8-6 8 4"/></Icon>,
  User:      (p: IconProps) => <Icon {...p}><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></Icon>,
  Mail:      (p: IconProps) => <Icon {...p}><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 7l10 7 10-7"/></Icon>,
  Lock:      (p: IconProps) => <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></Icon>,
  Trend:     (p: IconProps) => <Icon {...p}><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></Icon>,
  Ai:        (p: IconProps) => <Icon {...p}><path d="M12 3v2M12 19v2M5 12H3M21 12h-2M6 6l-1.5-1.5M19.5 4.5L18 6M6 18l-1.5 1.5M19.5 19.5L18 18"/><circle cx="12" cy="12" r="5"/></Icon>,
  News:      (p: IconProps) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></Icon>,
  Calendar:  (p: IconProps) => <Icon {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></Icon>,
  Briefcase: (p: IconProps) => <Icon {...p}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></Icon>,
  Menu:      (p: IconProps) => <Icon {...p}><path d="M3 6h18M3 12h18M3 18h18"/></Icon>,
  Sidebar:   (p: IconProps) => <Icon {...p}><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/></Icon>,
  Grid:      (p: IconProps) => <Icon {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></Icon>,
  Target:    (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Icon>,
  Bolt:      (p: IconProps) => <Icon {...p}><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></Icon>,
  Shield:    (p: IconProps) => <Icon {...p}><path d="M12 2l8 3v7c0 5-4 9-8 10-4-1-8-5-8-10V5l8-3z"/></Icon>,
  Clock:     (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Icon>,
  Book:      (p: IconProps) => <Icon {...p}><path d="M4 4h12a3 3 0 0 1 3 3v14H7a3 3 0 0 1-3-3V4z"/><path d="M4 18a3 3 0 0 1 3-3h12"/></Icon>,
  Mic:       (p: IconProps) => <Icon {...p}><rect x="9" y="2" width="6" height="12" rx="3"/><path d="M19 10a7 7 0 0 1-14 0"/><path d="M12 19v3M8 22h8"/></Icon>,
  Cmd:       (p: IconProps) => <Icon {...p}><path d="M9 9H5a2 2 0 0 0 0 4h4V9zM9 9v6M15 9h4a2 2 0 0 1 0 4h-4V9zM15 9v6M9 15H5a2 2 0 0 0 0 4h4v-4zM15 15h4a2 2 0 0 1 0 4h-4v-4z"/></Icon>,
  Help:      (p: IconProps) => <Icon {...p}><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></Icon>,
};

export type IconName = keyof typeof I;
