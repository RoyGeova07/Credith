import './BrandMark.css'

export default function BrandMark({ className = '', compact = false }) {
  const classes = ['brand-mark', compact ? 'brand-mark-compact' : '', className]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes} aria-label="Inversiones ServiCredith">
      <div className="brand-mark-top">Inversiones</div>

      <svg
        className="brand-mark-symbol"
        viewBox="0 0 130 92"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          d="M39 54V34L66 9L96 36V53"
          stroke="url(#brandRoof)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M39 54V68H82V55"
          stroke="url(#brandBody)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <rect x="64" y="43" width="21" height="30" rx="2" fill="#e7332a" />
        <path
          d="M26 69C45 57 65 61 86 67C98 70 109 72 120 64"
          stroke="url(#brandWaveGold)"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M13 74C34 53 63 58 92 67C104 71 115 72 126 66"
          stroke="url(#brandWaveBlue)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="brandRoof" x1="34" y1="49" x2="95" y2="18">
            <stop stopColor="#1bd4a2" />
            <stop offset="1" stopColor="#0b8f35" />
          </linearGradient>
          <linearGradient id="brandBody" x1="37" y1="58" x2="89" y2="58">
            <stop stopColor="#19caa2" />
            <stop offset="1" stopColor="#1e9b72" />
          </linearGradient>
          <linearGradient id="brandWaveBlue" x1="13" y1="64" x2="126" y2="64">
            <stop stopColor="#68d7ea" />
            <stop offset="0.5" stopColor="#277bea" />
            <stop offset="1" stopColor="#1129cc" />
          </linearGradient>
          <linearGradient id="brandWaveGold" x1="26" y1="63" x2="120" y2="63">
            <stop stopColor="#55c4e7" stopOpacity="0" />
            <stop offset="0.75" stopColor="#1331d4" />
            <stop offset="1" stopColor="#d8a22a" />
          </linearGradient>
        </defs>
      </svg>

      <div className="brand-mark-name">
        Servi<span>Credith</span>
      </div>
      <div className="brand-mark-tagline">Creciendo Juntos</div>
    </div>
  )
}
