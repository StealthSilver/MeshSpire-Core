import React from "react";

const HeroIllustration: React.FC = () => {
  return (
    <div className="w-full flex justify-center mb-10">
      <svg
        viewBox="0 0 900 420"
        width="100%"
        className="max-w-3xl"
        aria-label="Animated illustration showing a student learning from chosen teachers at their own pace"
        role="img"
      >
        <defs>
          <style>{`
            @media (prefers-reduced-motion: no-preference) {
              @keyframes floatCard {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-6px); }
              }
              @keyframes pulseGlow {
                0%, 100% { opacity: 0.3; }
                50% { opacity: 0.7; }
              }
              @keyframes drawThread {
                from { stroke-dashoffset: 200; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes dotFlow {
                0% { opacity: 0; transform: translateX(0); }
                20% { opacity: 1; }
                80% { opacity: 1; }
                100% { opacity: 0; transform: translateX(120px); }
              }
              @keyframes scrubTimeline {
                0%, 100% { transform: translateX(0); }
                30% { transform: translateX(40px); }
                60% { transform: translateX(-20px); }
                80% { transform: translateX(30px); }
              }
              @keyframes completRing {
                from { stroke-dashoffset: 188; }
                to { stroke-dashoffset: 0; }
              }
              @keyframes starBurst {
                0% { transform: scale(0); opacity: 0; }
                60% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
              }
              @keyframes threadGold {
                0%, 70% { stroke: #809FFF; }
                100% { stroke: #FFD580; }
              }
              @keyframes playPulse {
                0%, 100% { transform: scale(1); opacity: 0.7; }
                50% { transform: scale(1.15); opacity: 1; }
              }
              @keyframes zoomIn {
                from { transform: scale(0.85); opacity: 0; }
                to   { transform: scale(1); opacity: 1; }
              }
              @keyframes noteFloat {
                0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.7; }
                50% { transform: translateY(-8px) rotate(5deg); opacity: 1; }
              }

              /*
                Frame cycling: 9s total, 6 frames.
                Each frame is visible for ~1.5s (fade-in 0.3s, hold ~0.9s, fade-out 0.3s).
                Spacing: frames start at 0%, ~16.7%, ~33.3%, ~50%, ~66.7%, ~83.3%
              */
              @keyframes showFrame1 {
                0%      { opacity: 0; }
                1%      { opacity: 1; }   /* 0.09s fade in */
                14%     { opacity: 1; }   /* hold until ~1.26s */
                16.67%  { opacity: 0; }   /* fade out by ~1.5s */
                100%    { opacity: 0; }
              }
              @keyframes showFrame2 {
                0%      { opacity: 0; }
                16.67%  { opacity: 0; }
                18%     { opacity: 1; }
                30.5%   { opacity: 1; }
                33.33%  { opacity: 0; }
                100%    { opacity: 0; }
              }
              @keyframes showFrame3 {
                0%      { opacity: 0; }
                33.33%  { opacity: 0; }
                35%     { opacity: 1; }
                47.5%   { opacity: 1; }
                50%     { opacity: 0; }
                100%    { opacity: 0; }
              }
              @keyframes showFrame4 {
                0%      { opacity: 0; }
                50%     { opacity: 0; }
                52%     { opacity: 1; }
                64%     { opacity: 1; }
                66.67%  { opacity: 0; }
                100%    { opacity: 0; }
              }
              @keyframes showFrame5 {
                0%      { opacity: 0; }
                66.67%  { opacity: 0; }
                68.5%   { opacity: 1; }
                80.5%   { opacity: 1; }
                83.33%  { opacity: 0; }
                100%    { opacity: 0; }
              }
              @keyframes showFrame6 {
                0%      { opacity: 0; }
                83.33%  { opacity: 0; }
                85%     { opacity: 1; }
                97%     { opacity: 1; }
                99%     { opacity: 0; }
                100%    { opacity: 0; }
              }

              #frame-1 { animation: showFrame1 9s ease-in-out infinite; }
              #frame-2 { animation: showFrame2 9s ease-in-out infinite; }
              #frame-3 { animation: showFrame3 9s ease-in-out infinite; }
              #frame-4 { animation: showFrame4 9s ease-in-out infinite; }
              #frame-5 { animation: showFrame5 9s ease-in-out infinite; }
              #frame-6 { animation: showFrame6 9s ease-in-out infinite; }

              .float-card-1 { animation: floatCard 3s ease-in-out infinite; }
              .float-card-2 { animation: floatCard 3s ease-in-out 0.4s infinite; }
              .float-card-3 { animation: floatCard 3s ease-in-out 0.8s infinite; }
              .float-card-4 { animation: floatCard 3s ease-in-out 1.2s infinite; }

              .glow-ring  { animation: pulseGlow 2s ease-in-out infinite; }
              .teacher-glow { animation: pulseGlow 2s ease-in-out infinite; }

              .draw-thread {
                stroke-dasharray: 200;
                animation: drawThread 1.2s ease-out forwards;
              }
              .dot-1 { animation: dotFlow 1.8s ease-in-out 0s infinite; }
              .dot-2 { animation: dotFlow 1.8s ease-in-out 0.3s infinite; }
              .dot-3 { animation: dotFlow 1.8s ease-in-out 0.6s infinite; }
              .dot-4 { animation: dotFlow 1.8s ease-in-out 0.9s infinite; }

              .play-btn    { animation: playPulse 1.5s ease-in-out infinite; }
              .scrub-marker { animation: scrubTimeline 3s ease-in-out infinite; }
              .deep-zoom   { animation: zoomIn 0.8s ease-out both; }

              .note-1 { animation: noteFloat 2.5s ease-in-out 0s infinite; }
              .note-2 { animation: noteFloat 2.5s ease-in-out 0.5s infinite; }
              .note-3 { animation: noteFloat 2.5s ease-in-out 1.0s infinite; }
              .note-4 { animation: noteFloat 2.5s ease-in-out 1.5s infinite; }

              .complete-ring {
                stroke-dasharray: 188;
                stroke-dashoffset: 188;
                animation: completRing 1.8s ease-out forwards;
              }
              .star-1 { animation: starBurst 0.5s ease-out 0.0s both; }
              .star-2 { animation: starBurst 0.5s ease-out 0.1s both; }
              .star-3 { animation: starBurst 0.5s ease-out 0.2s both; }
              .star-4 { animation: starBurst 0.5s ease-out 0.3s both; }
              .star-5 { animation: starBurst 0.5s ease-out 0.4s both; }
              .star-6 { animation: starBurst 0.5s ease-out 0.5s both; }

              .thread-gold {
                animation: threadGold 1.8s ease-out forwards,
                           drawThread 1.2s ease-out forwards;
                stroke-dasharray: 200;
              }
            }

            @media (prefers-reduced-motion: reduce) {
              #frame-1 { opacity: 1; }
              #frame-2, #frame-3, #frame-4,
              #frame-5, #frame-6 { opacity: 0; }
            }
          `}</style>

          <filter id="softGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <linearGradient id="bgGrad" x1="0" y1="0" x2="900" y2="420">
            <stop offset="0%" stopColor="#1A1A2E" />
            <stop offset="100%" stopColor="#16213E" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="900" height="420" rx="16" fill="url(#bgGrad)" />

        {/* ===== FRAME 1 — Discovery ===== */}
        <g id="frame-1">
          {/* Desk */}
          <rect x="370" y="300" width="160" height="8" rx="4" fill="#4A5568" />
          <rect x="430" y="308" width="8" height="60" rx="2" fill="#4A5568" />
          <rect x="462" y="308" width="8" height="60" rx="2" fill="#4A5568" />

          {/* Student */}
          <circle cx="450" cy="260" r="20" fill="#E8EAFF" />
          <rect x="435" y="282" width="30" height="18" rx="4" fill="#E8EAFF" />

          {/* Floating subject cards */}
          <g className="float-card-1">
            <rect x="290" y="180" width="56" height="36" rx="8"
              fill="none" stroke="#809FFF" strokeWidth="1.5" />
            <text x="318" y="204" textAnchor="middle" fill="#E8EAFF"
              fontSize="14" fontFamily="sans-serif">M</text>
          </g>
          <g className="float-card-2">
            <rect x="370" y="150" width="56" height="36" rx="8"
              fill="none" stroke="#809FFF" strokeWidth="1.5" />
            <text x="398" y="174" textAnchor="middle" fill="#E8EAFF"
              fontSize="14" fontFamily="sans-serif">A</text>
          </g>
          <g className="float-card-3">
            <rect x="470" y="150" width="56" height="36" rx="8"
              fill="none" stroke="#809FFF" strokeWidth="1.5" />
            <text x="498" y="174" textAnchor="middle" fill="#E8EAFF"
              fontSize="14" fontFamily="sans-serif">C</text>
          </g>
          <g className="float-card-4">
            <rect x="550" y="180" width="56" height="36" rx="8"
              fill="none" stroke="#809FFF" strokeWidth="1.5" />
            <text x="578" y="204" textAnchor="middle" fill="#E8EAFF"
              fontSize="16" fontFamily="sans-serif">♪</text>
          </g>

          <text x="450" y="395" textAnchor="middle" fill="#E8EAFF"
            fontSize="11" opacity="0.5" fontFamily="sans-serif">
            Discover subjects
          </text>
        </g>

        {/* ===== FRAME 2 — Choosing a Teacher ===== */}
        <g id="frame-2" opacity="0">
          {/* Student */}
          <circle cx="320" cy="250" r="20" fill="#E8EAFF" />
          <rect x="305" y="272" width="30" height="18" rx="4" fill="#E8EAFF" />

          {/* Tap lines */}
          <line x1="365" y1="240" x2="380" y2="235" stroke="#809FFF"
            strokeWidth="1.5" opacity="0.6" />
          <line x1="365" y1="250" x2="382" y2="250" stroke="#809FFF"
            strokeWidth="1.5" opacity="0.6" />
          <line x1="365" y1="260" x2="380" y2="265" stroke="#809FFF"
            strokeWidth="1.5" opacity="0.6" />

          {/* Teacher card */}
          <rect x="520" y="200" width="90" height="110" rx="12"
            fill="none" stroke="#809FFF" strokeWidth="2" />

          {/* Teacher avatar + glow */}
          <circle cx="565" cy="245" r="28" fill="#809FFF" opacity="0.3"
            className="teacher-glow" />
          <circle cx="565" cy="245" r="22" fill="#E8EAFF" />
          <rect x="550" y="269" width="30" height="14" rx="4" fill="#E8EAFF" />

          {/* Glow ring */}
          <circle cx="565" cy="255" r="50" fill="none" stroke="#809FFF"
            strokeWidth="1.5" opacity="0.4" className="glow-ring" />

          {/* Selected badge */}
          <circle cx="598" cy="210" r="8" fill="#809FFF" />
          <polyline points="593,210 596,213 603,207" fill="none"
            stroke="#1A1A2E" strokeWidth="1.5" strokeLinecap="round"
            strokeLinejoin="round" />

          <text x="450" y="395" textAnchor="middle" fill="#E8EAFF"
            fontSize="11" opacity="0.5" fontFamily="sans-serif">
            Choose your teacher
          </text>
        </g>

        {/* ===== FRAME 3 — Learning Begins ===== */}
        <g id="frame-3" opacity="0">
          {/* Student */}
          <circle cx="250" cy="240" r="20" fill="#E8EAFF" />
          <rect x="235" y="262" width="30" height="18" rx="4" fill="#E8EAFF" />

          {/* Teacher */}
          <circle cx="650" cy="240" r="28" fill="#809FFF" opacity="0.3"
            className="teacher-glow" />
          <circle cx="650" cy="240" r="22" fill="#E8EAFF" />
          <rect x="635" y="264" width="30" height="14" rx="4" fill="#E8EAFF" />

          {/* Thread */}
          <path d="M270 245 Q450 200 630 245" fill="none" stroke="#809FFF"
            strokeWidth="2" className="draw-thread" filter="url(#softGlow)" />

          {/* Flowing dots */}
          <circle cx="310" cy="230" r="3" fill="#809FFF" className="dot-1" />
          <circle cx="310" cy="230" r="3" fill="#809FFF" className="dot-2" />
          <circle cx="310" cy="230" r="3" fill="#809FFF" className="dot-3" />
          <circle cx="310" cy="230" r="3" fill="#809FFF" className="dot-4" />

          {/* Play button */}
          <g className="play-btn">
            <circle cx="450" cy="320" r="18" fill="none" stroke="#809FFF"
              strokeWidth="1.5" />
            <polygon points="444,311 444,329 460,320" fill="#809FFF" />
          </g>

          <text x="450" y="395" textAnchor="middle" fill="#E8EAFF"
            fontSize="11" opacity="0.5" fontFamily="sans-serif">
            Learning begins
          </text>
        </g>

        {/* ===== FRAME 4 — Own Pace ===== */}
        <g id="frame-4" opacity="0">
          {/* Student */}
          <circle cx="450" cy="180" r="20" fill="#E8EAFF" />
          <rect x="435" y="202" width="30" height="18" rx="4" fill="#E8EAFF" />

          {/* Timeline bar */}
          <rect x="250" y="280" width="400" height="4" rx="2" fill="#4A5568" />
          <rect x="250" y="280" width="200" height="4" rx="2" fill="#809FFF" />

          {/* Scrub marker */}
          <g className="scrub-marker">
            <circle cx="450" cy="282" r="8" fill="#809FFF" />
            <circle cx="450" cy="282" r="4" fill="#1A1A2E" />
          </g>

          {/* Pause icon */}
          <rect x="300" y="310" width="4" height="14" rx="1"
            fill="#E8EAFF" opacity="0.5" />
          <rect x="308" y="310" width="4" height="14" rx="1"
            fill="#E8EAFF" opacity="0.5" />

          {/* Rewind */}
          <polygon points="270,317 282,310 282,324" fill="#E8EAFF" opacity="0.5" />
          <polygon points="258,317 270,310 270,324" fill="#E8EAFF" opacity="0.5" />

          {/* Fast-forward */}
          <polygon points="590,310 590,324 602,317" fill="#E8EAFF" opacity="0.5" />
          <polygon points="602,310 602,324 614,317" fill="#E8EAFF" opacity="0.5" />

          {/* Clock */}
          <circle cx="450" cy="350" r="20" fill="none" stroke="#809FFF"
            strokeWidth="1.5" />
          <line x1="450" y1="350" x2="450" y2="336" stroke="#E8EAFF"
            strokeWidth="1.5" strokeLinecap="round" />
          <line x1="450" y1="350" x2="460" y2="350" stroke="#E8EAFF"
            strokeWidth="1" strokeLinecap="round" />

          <text x="450" y="395" textAnchor="middle" fill="#E8EAFF"
            fontSize="11" opacity="0.5" fontFamily="sans-serif">
            Learn at your own pace
          </text>
        </g>

        {/* ===== FRAME 5 — Deep Focus ===== */}
        <g id="frame-5" opacity="0">
          <g className="deep-zoom">
            <circle cx="450" cy="200" r="50" fill="#809FFF" opacity="0.15" />
            <circle cx="450" cy="200" r="40" fill="#809FFF" opacity="0.25"
              className="teacher-glow" />
            <circle cx="450" cy="200" r="32" fill="#E8EAFF" />
            <rect x="430" y="234" width="40" height="20" rx="6" fill="#E8EAFF" />
          </g>

          {/* Student (smaller, bottom-left) */}
          <circle cx="320" cy="330" r="16" fill="#E8EAFF" />
          <rect x="308" y="348" width="24" height="14" rx="3" fill="#E8EAFF" />

          {/* Dashed thread */}
          <path d="M336 330 Q400 280 440 232" fill="none" stroke="#809FFF"
            strokeWidth="1.5" strokeDasharray="4 4" opacity="0.6" />

          {/* Floating symbols */}
          <text x="540" y="160" fill="#809FFF" fontSize="14" opacity="0.7"
            fontFamily="monospace" className="note-1">{"</>"}</text>
          <text x="360" y="140" fill="#809FFF" fontSize="16" opacity="0.7"
            fontFamily="sans-serif" className="note-2">∑</text>
          <text x="530" y="260" fill="#809FFF" fontSize="18" opacity="0.7"
            fontFamily="sans-serif" className="note-3">♪</text>
          <text x="370" y="260" fill="#809FFF" fontSize="12" opacity="0.7"
            fontFamily="monospace" className="note-4">f(x)</text>

          <text x="450" y="395" textAnchor="middle" fill="#E8EAFF"
            fontSize="11" opacity="0.5" fontFamily="sans-serif">
            Deep focus mode
          </text>
        </g>

        {/* ===== FRAME 6 — Mastery ===== */}
        <g id="frame-6" opacity="0">
          {/* Student */}
          <circle cx="400" cy="240" r="22" fill="#E8EAFF" />
          <rect x="384" y="264" width="32" height="18" rx="4" fill="#E8EAFF" />

          {/* Teacher */}
          <circle cx="540" cy="240" r="22" fill="#E8EAFF" />
          <rect x="524" y="264" width="32" height="18" rx="4" fill="#E8EAFF" />
          <circle cx="540" cy="240" r="30" fill="#FFD580" opacity="0.2"
            className="teacher-glow" />

          {/* Gold thread */}
          <path d="M422 245 Q470 220 518 245" fill="none" strokeWidth="2.5"
            className="thread-gold" filter="url(#softGlow)" />

          {/* Progress ring */}
          <circle cx="470" cy="160" r="30" fill="none" stroke="#4A5568"
            strokeWidth="3" />
          <circle cx="470" cy="160" r="30" fill="none" stroke="#FFD580"
            strokeWidth="3" strokeLinecap="round" className="complete-ring"
            transform="rotate(-90, 470, 160)" />
          <polyline points="458,160 467,169 482,152" fill="none" stroke="#FFD580"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

          {/* Stars */}
          <polygon
            points="400,170 403,162 410,162 405,157 407,150 400,154 393,150 395,157 390,162 397,162"
            fill="#FFD580" className="star-1" />
          <polygon
            points="350,220 353,212 360,212 355,207 357,200 350,204 343,200 345,207 340,212 347,212"
            fill="#FFD580" className="star-2" />
          <polygon
            points="430,130 433,122 440,122 435,117 437,110 430,114 423,110 425,117 420,122 427,122"
            fill="#FFD580" className="star-3" />
          <polygon
            points="560,170 563,162 570,162 565,157 567,150 560,154 553,150 555,157 550,162 557,162"
            fill="#FFD580" className="star-4" />
          <polygon
            points="510,130 513,122 520,122 515,117 517,110 510,114 503,110 505,117 500,122 507,122"
            fill="#FFD580" className="star-5" />
          <polygon
            points="590,210 593,202 600,202 595,197 597,190 590,194 583,190 585,197 580,202 587,202"
            fill="#FFD580" className="star-6" />

          {/* Student glow */}
          <circle cx="400" cy="240" r="30" fill="#FFD580" opacity="0.15"
            className="teacher-glow" />

          <text x="470" y="395" textAnchor="middle" fill="#FFD580"
            fontSize="11" opacity="0.7" fontFamily="sans-serif">
            Mastery achieved
          </text>
        </g>
      </svg>
    </div>
  );
};

export default HeroIllustration;
