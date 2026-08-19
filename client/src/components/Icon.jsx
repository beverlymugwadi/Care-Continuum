// Small stroke-based icon set used throughout the app (nav items, icon
// squares leading list rows, inline meta). Kept as one component so every
// icon shares the same stroke width / cap style instead of drifting.
const paths = {
  home: (
    <>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 9.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19c0-3.4 2.5-6 5.5-6s5.5 2.6 5.5 6" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M15.8 13.3c2.4.5 4.2 2.6 4.2 5.2" />
    </>
  ),
  bell: (
    <>
      <path d="M6.5 9a5.5 5.5 0 0 1 11 0c0 4.2 1.5 5.6 1.8 6.3.2.4-.1.9-.6.9H5.3c-.5 0-.8-.5-.6-.9C5 14.6 6.5 13.2 6.5 9z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="3" />
      <path d="M3.5 10h17" />
      <path d="M8 3v4" />
      <path d="M16 3v4" />
    </>
  ),
  vial: (
    <>
      <rect x="8" y="3" width="8" height="7" rx="1.5" />
      <path d="M9 10v8a3 3 0 0 0 6 0v-8" />
      <path d="M12 14v4" />
      <path d="M10 16h4" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19V9" />
      <path d="M10 19V5" />
      <path d="M16 19v-7" />
      <path d="M20 19V12" />
    </>
  ),
  heart: <path d="M12 20s-7.5-4.6-9.8-9.4C.6 7 2.4 3.8 5.7 3.3c2-.3 3.7.7 4.7 2.2C11.4 3 13.1 2 15.1 2.3c3.3.5 5.1 3.7 3.5 7.3C16.3 15.4 12 20 12 20z" />,
  check: <path d="M5 13l4 4 10-10" />,
  plus: <path d="M12 5v14M5 12h14" />,
  chevronRight: <path d="M9 5l7 7-7 7" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-7.4 7-12a7 7 0 1 0-14 0c0 4.6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.4" />
    </>
  ),
  phone: (
    <path d="M6.6 10.8a15 15 0 0 0 6.6 6.6l2.2-2.2a1.2 1.2 0 0 1 1.2-.3c1.3.4 2.7.6 4.1.6a1.2 1.2 0 0 1 1.2 1.2V20a1.2 1.2 0 0 1-1.2 1.2C11.4 21.2 2.8 12.6 2.8 2.4A1.2 1.2 0 0 1 4 1.2h3.3a1.2 1.2 0 0 1 1.2 1.2c0 1.4.2 2.8.6 4.1.1.4 0 .9-.3 1.2z" />
  ),
  logout: (
    <>
      <path d="M9 21H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </>
  ),
  baby: (
    <>
      <circle cx="12" cy="8.5" r="4" />
      <path d="M5.5 20c0-3.6 3-6.2 6.5-6.2S18.5 16.4 18.5 20" />
    </>
  ),
  send: (
    <>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </>
  ),
  refresh: (
    <>
      <path d="M3 12a9 9 0 0 1 15.3-6.4L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-15.3 6.4L3 16" />
      <path d="M3 21v-5h5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
    </>
  ),
  x: <path d="M6 6l12 12M18 6 6 18" />,
  wifiOff: (
    <>
      <path d="M2 8.5c1.8-1.7 4-2.9 6.4-3.6" />
      <path d="M15.6 4.9c2.4.7 4.6 1.9 6.4 3.6" />
      <path d="M5.5 12.5a10.6 10.6 0 0 1 4-2.2" />
      <path d="M14.5 10.3c1.5.5 2.9 1.2 4 2.2" />
      <path d="M9 16.3a5 5 0 0 1 6 0" />
      <path d="M12 20h.01" />
      <path d="M2 2l20 20" />
    </>
  ),
};

export default function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.75, style }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {d}
    </svg>
  );
}
