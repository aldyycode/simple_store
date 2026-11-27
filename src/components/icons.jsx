const base = "h-5 w-5";

export const CloudArrowUpIcon = ({className = base}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 16a4 4 0 0 1 .9-7.9A5.5 5.5 0 0 1 18.5 10 3.5 3.5 0 0 1 18 17h-2M12 12v7m0-7-3 3m3-3 3 3"
    />
  </svg>
);

export const PhotoIcon = ({className = base}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.6" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4 18 5-5 4 4 3-3 4 4"
    />
  </svg>
);

export const CheckCircleIcon = ({className = base}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <circle cx="12" cy="12" r="9" />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m8.5 12.5 2.5 2.5 4.5-5"
    />
  </svg>
);

export const ExclamationTriangleIcon = ({className = base}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 3 2.5 20h19L12 3Zm0 6v5m0 3.5h.01"
    />
  </svg>
);

export const ArrowPathIcon = ({className = base}) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="1.8"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 12a8 8 0 0 1 13.7-5.7M20 4v4h-4M20 12a8 8 0 0 1-13.7 5.7M4 20v-4h4"
    />
  </svg>
);
