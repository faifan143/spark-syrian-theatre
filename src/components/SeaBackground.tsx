export default function SeaBackground() {
  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden -z-10">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1600 900"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full block animate-ocean"
      >
        <defs>
          {/* 🌊 Deep gradient layers */}
          <radialGradient id="seaGradient" cx="50%" cy="50%" r="70%">
            <stop offset="0%" stopColor="#5fb4e2" />
            <stop offset="40%" stopColor="#2b76b8" />
            <stop offset="80%" stopColor="#103d66" />
            <stop offset="100%" stopColor="#072238" />
          </radialGradient>

          {/* 🌫️ Moving Perlin-like texture */}
          <filter id="seaTexture">
            <feTurbulence
              id="turb"
              type="fractalNoise"
              baseFrequency="0.015 0.025"
              numOctaves="3"
              seed="6"
              result="noise"
            >
              <animate
                attributeName="baseFrequency"
                dur="40s"
                values="0.015 0.025; 0.02 0.018; 0.015 0.025"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="35"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* 💡 Animated sunlight reflection */}
          <radialGradient id="seaReflection" cx="55%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.35)">
              <animate
                attributeName="stop-color"
                values="rgba(255,255,255,0.35); rgba(255,255,255,0.1); rgba(255,255,255,0.35)"
                dur="20s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="70%" stopColor="rgba(255,255,255,0)" />
          </radialGradient>

          {/* 🌓 Dark vignette edges */}
          <radialGradient id="vignette" cx="50%" cy="50%" r="80%">
            <stop offset="65%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.6)" />
          </radialGradient>
        </defs>

        {/* Base blue ocean */}
        <rect width="1600" height="900" fill="url(#seaGradient)" />

        {/* Subtle shimmer reflection synced with light */}
        <rect
          width="1600"
          height="900"
          fill="url(#seaReflection)"
          opacity="0.35"
          filter="url(#seaTexture)"
        >
          <animateTransform
            attributeName="transform"
            type="translate"
            values="0,0; 20,10; -10,15; 0,0"
            dur="60s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Texture overlay */}
        <rect
          width="1600"
          height="900"
          fill="url(#seaGradient)"
          opacity="0.65"
          filter="url(#seaTexture)"
        />

        {/* Vignette to focus viewer's eyes */}
        <rect width="1600" height="900" fill="url(#vignette)" />
      </svg>
    </div>
  );
}
