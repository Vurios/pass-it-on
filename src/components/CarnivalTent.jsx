export function CarnivalTent({ className = '' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 220 150"
      role="img"
      aria-labelledby="tent-title tent-description"
    >
      <title id="tent-title">Carnival tent entrance</title>
      <desc id="tent-description">A cheerful striped carnival tent with its front flaps pulled open.</desc>
      <path d="M28 129 49 42h122l21 87Z" fill="#FFC53D" stroke="#1A1A1A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M49 42 73 129h29L93 42Z" fill="#FF5A5F" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round" />
      <path d="m127 42-9 87h29l24-87Z" fill="#2E86AB" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M91 129c0-35 8-58 19-58s19 23 19 58Z" fill="#FFF8ED" stroke="#1A1A1A" strokeWidth="5" />
      <path d="M110 71 91 129h19Z" fill="#FF5A5F" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round" />
      <path d="m110 71 19 58h-19Z" fill="#8BC34A" stroke="#1A1A1A" strokeWidth="3" strokeLinejoin="round" />
      <path d="M44 42h132L160 19H60Z" fill="#FF5A5F" stroke="#1A1A1A" strokeWidth="5" strokeLinejoin="round" />
      <path d="M110 19V5" stroke="#1A1A1A" strokeWidth="5" strokeLinecap="round" />
      <path d="m110 6 25 8-25 9Z" fill="#FFC53D" stroke="#1A1A1A" strokeWidth="4" strokeLinejoin="round" />
      <circle cx="28" cy="130" r="7" fill="#8BC34A" stroke="#1A1A1A" strokeWidth="4" />
      <circle cx="192" cy="130" r="7" fill="#8BC34A" stroke="#1A1A1A" strokeWidth="4" />
    </svg>
  )
}
