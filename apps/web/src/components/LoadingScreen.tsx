import { useRef } from 'react';

// Pick a random scene once per mount (stable via ref)
function useScene() {
  const ref = useRef(Math.floor(Math.random() * 3));
  return ref.current;
}

// ── Scene 1: Writing ────────────────────────────────────────────────────────
function SceneWriting() {
  return (
    <div className="relative w-[180px] h-[180px]">
      {/* Stars */}
      <span className="absolute top-3 left-4 animate-[starBlink_2.4s_.4s_ease-in-out_infinite]">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="#FBBF24"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      </span>
      <span className="absolute top-1 right-6 animate-[starBlink_2.4s_1.1s_ease-in-out_infinite]">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="#34D399"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      </span>
      <span className="absolute top-8 right-2 animate-[starBlink_2.4s_1.8s_ease-in-out_infinite]">
        <svg width="8" height="8" viewBox="0 0 24 24" fill="#38BDF8"><path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/></svg>
      </span>

      {/* Paper */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 w-[88px] h-[108px] bg-white rounded-md shadow-md">
        <div className="absolute top-2 left-2 right-2 h-3 bg-[#ECEBFD] rounded-sm" />
        <div className="absolute top-6 left-3 right-3 flex flex-col gap-2.5">
          {[0, 0.3, 0.6, 0.9].map((delay, i) => (
            <div
              key={i}
              className="h-[2px] rounded-full bg-[#E8E6FF] animate-[lineDraw_2.4s_ease-out_infinite]"
              style={{ animationDelay: `${delay}s`, width: i === 3 ? '55%' : '100%' }}
            />
          ))}
        </div>
      </div>

      {/* Pencil */}
      <div
        className="absolute bottom-[120px] left-1/2 animate-[pencilWrite_2.4s_ease-in-out_infinite]"
        style={{ transformOrigin: 'bottom center' }}
      >
        <svg width="14" height="60" viewBox="0 0 14 60">
          <rect x="1" y="8" width="12" height="44" rx="2" fill="#FBBF24"/>
          <rect x="1" y="8" width="12" height="10" rx="2" fill="#E85D3A"/>
          <polygon points="1,52 13,52 7,60" fill="#ECEBFD"/>
          <polygon points="4,56 10,56 7,60" fill="#4A4A4A"/>
          <rect x="3" y="10" width="3" height="38" rx="1.5" fill="rgba(255,255,255,.3)"/>
        </svg>
      </div>

      {/* Desk */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-[140px] h-3 bg-[rgba(255,255,255,.25)] rounded" />
    </div>
  );
}

// ── Scene 2: Backpack ───────────────────────────────────────────────────────
function SceneBackpack() {
  return (
    <div className="relative w-[180px] h-[180px]">
      <div className="absolute inset-0 flex items-center justify-center animate-[bagBounce_1.4s_cubic-bezier(.36,.07,.19,.97)_infinite]">
        {/* Sparks */}
        <span className="absolute -top-2 -left-5 w-2 h-2 rounded-full bg-[#FBBF24] animate-[sparkFly_1.4s_.1s_ease-out_infinite]" />
        <span className="absolute -top-4 -right-2 w-2 h-2 rounded-full bg-[#34D399] animate-[sparkFly_1.4s_.4s_ease-out_infinite]" />
        <span className="absolute top-2 -right-6 w-2 h-2 rounded-full bg-[#38BDF8] animate-[sparkFly_1.4s_.7s_ease-out_infinite]" />
        <svg width="100" height="120" viewBox="0 0 100 120">
          <ellipse cx="50" cy="118" rx="30" ry="5" fill="rgba(0,0,0,.15)"/>
          <rect x="12" y="28" width="76" height="74" rx="16" fill="rgba(255,255,255,.95)"/>
          <rect x="12" y="28" width="76" height="74" rx="16" fill="url(#bagG)"/>
          <rect x="22" y="64" width="56" height="32" rx="10" fill="rgba(255,255,255,.25)" stroke="rgba(255,255,255,.4)" strokeWidth="1.5"/>
          <line x1="30" y1="76" x2="70" y2="76" stroke="rgba(255,255,255,.5)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 3"/>
          <circle cx="70" cy="76" r="3" fill="rgba(255,255,255,.7)"/>
          <path d="M38 28 Q38 16 50 16 Q62 16 62 28" fill="none" stroke="rgba(255,255,255,.6)" strokeWidth="5" strokeLinecap="round"/>
          <rect x="24" y="28" width="8" height="36" rx="4" fill="rgba(255,255,255,.3)"/>
          <rect x="68" y="28" width="8" height="36" rx="4" fill="rgba(255,255,255,.3)"/>
          <rect x="20" y="34" width="10" height="30" rx="5" fill="rgba(255,255,255,.15)"/>
          <text x="50" y="58" textAnchor="middle" fontSize="18" fill="rgba(255,255,255,.6)">⭐</text>
          <defs>
            <linearGradient id="bagG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,.35)"/>
              <stop offset="100%" stopColor="rgba(255,255,255,.05)"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
}

// ── Scene 3: Books stacking ─────────────────────────────────────────────────
function SceneBooks() {
  const books = [
    { bg: 'rgba(255,255,255,.35)', delay: '0s',    bottom: 36 },
    { bg: '#FBBF24',               delay: '.5s',   bottom: 54 },
    { bg: '#34D399',               delay: '1s',    bottom: 72 },
    { bg: '#38BDF8',               delay: '1.5s',  bottom: 90 },
  ];
  return (
    <div className="relative w-[180px] h-[180px]">
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
        {/* shadow */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-[90px] h-2.5 rounded-full bg-[rgba(0,0,0,.18)]" />
        <div className="animate-[stackWobble_3.6s_2s_ease-in-out_infinite]" style={{ transformOrigin: 'bottom center' }}>
          {books.map((b, i) => (
            <div
              key={i}
              className="absolute left-1/2 -translate-x-1/2 h-[18px] rounded-[4px] animate-[bookLand_3.6s_ease-in-out_infinite]"
              style={{
                width: [78, 72, 80, 68][i],
                background: b.bg,
                bottom: b.bottom,
                animationDelay: b.delay,
              }}
            >
              <div className="absolute left-[5px] top-[5px] bottom-[5px] right-[5px] border-l-2 border-[rgba(255,255,255,.25)] rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Loading Screen ──────────────────────────────────────────────────────────
export function LoadingScreen() {
  const scene = useScene();
  const scenes = [<SceneWriting />, <SceneBackpack />, <SceneBooks />];

  return (
    <>
      {/* Keyframe definitions injected once */}
      <style>{`
        @keyframes starBlink   { 0%,100%{opacity:0;transform:scale(0) rotate(0deg)} 50%{opacity:1;transform:scale(1) rotate(20deg)} }
        @keyframes lineDraw    { 0%,100%{clip-path:inset(0 100% 0 0);opacity:0} 10%{opacity:1} 30%,80%{clip-path:inset(0 0% 0 0);opacity:1} 95%{opacity:0} }
        @keyframes pencilWrite { 0%{transform:translateX(-10px) rotate(-35deg)} 15%{transform:translateX(16px) rotate(-30deg)} 30%{transform:translateX(-8px) rotate(-38deg)} 45%{transform:translateX(20px) rotate(-28deg)} 60%{transform:translateX(-5px) rotate(-35deg)} 75%{transform:translateX(18px) rotate(-32deg)} 90%{transform:translateX(-12px) rotate(-36deg) translateY(-20px)} 100%{transform:translateX(-10px) rotate(-35deg)} }
        @keyframes bagBounce   { 0%,100%{transform:translateY(0)} 45%{transform:translateY(-28px) scaleX(1.04) scaleY(.96)} 55%{transform:translateY(-28px) scaleX(.98) scaleY(1.02)} 80%{transform:translateY(4px) scaleX(1.06) scaleY(.94)} 88%{transform:translateY(0) scaleX(.98) scaleY(1.04)} }
        @keyframes sparkFly    { 0%{transform:scale(0);opacity:0} 30%{transform:scale(1);opacity:1} 100%{transform:scale(0) translateY(-12px);opacity:0} }
        @keyframes bookLand    { 0%,15%{transform:translateX(-50%) translateY(-160px);opacity:0} 20%{opacity:1} 30%{transform:translateX(-50%) translateY(0) scaleY(.9) scaleX(1.04)} 36%{transform:translateX(-50%) translateY(-6px)} 42%,90%{transform:translateX(-50%) translateY(0)} 96%,100%{transform:translateX(-50%) translateY(-160px);opacity:0} }
        @keyframes stackWobble { 0%,40%,100%{transform:rotate(0deg)} 45%{transform:rotate(2deg)} 55%{transform:rotate(-1.5deg)} 65%{transform:rotate(1deg)} 75%{transform:rotate(0)} }
        @keyframes dotPulse    { 0%,80%,100%{transform:scale(.8);opacity:.35} 40%{transform:scale(1.2);opacity:1} }
      `}</style>

      <div
        className="flex flex-col items-center justify-center min-h-screen px-6"
        style={{ background: 'linear-gradient(140deg,#5B53E0 0%,#7A5AF0 100%)' }}
      >
        <div className="flex flex-col items-center gap-0">
          {/* Logo badge */}
          <div className="w-10 h-10 rounded-[12px] bg-[rgba(255,255,255,.22)] flex items-center justify-center mb-7">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5"/>
            </svg>
          </div>

          {/* Animation scene */}
          {scenes[scene]}

          {/* Text */}
          <div className="mt-6 text-[13px] font-bold text-white/80 tracking-[.02em]">
            กำลังโหลดการบ้าน…
          </div>
          <div className="mt-1 text-[11px] font-semibold text-white/40 tracking-[.06em] uppercase">
            Loading Homework
          </div>

          {/* Dots */}
          <div className="flex gap-1.5 mt-5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-white/35 animate-[dotPulse_1.2s_ease-in-out_infinite]"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
