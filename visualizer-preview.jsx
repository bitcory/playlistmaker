import React, { useEffect, useRef, useState } from 'react';

export default function AudioVisualizerDemo() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const [settings, setSettings] = useState({
    barCount: 48,
    barWidth: 4,
    barGap: 3,
    sensitivity: 1.2,
    colorMode: 'gradient',
    primaryColor: '#6366f1',
    secondaryColor: '#06b6d4',
    style: 'mirror',
  });

  const generateFakeAudioData = (length, time) => {
    const data = new Array(length);
    for (let i = 0; i < length; i++) {
      const bass = Math.sin(time * 2 + i * 0.1) * 0.5 + 0.5;
      const mid = Math.sin(time * 4 + i * 0.3) * 0.3 + 0.5;
      const high = Math.sin(time * 8 + i * 0.5) * 0.2 + 0.3;
      const noise = Math.random() * 0.1;
      const freqFalloff = 1 - (i / length) * 0.6;
      data[i] = Math.min(1, (bass * 0.5 + mid * 0.3 + high * 0.2 + noise) * freqFalloff);
    }
    return data;
  };

  useEffect(() => {
    if (!isAnimating) {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let startTime = Date.now();

    const draw = () => {
      const time = (Date.now() - startTime) / 1000;
      const { barCount, barWidth, barGap, sensitivity, colorMode, primaryColor, secondaryColor, style } = settings;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const audioData = generateFakeAudioData(barCount, time);
      const totalWidth = barCount * (barWidth + barGap);
      const startX = (canvas.width - totalWidth) / 2;
      const maxHeight = canvas.height * 0.8;

      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(0.5, secondaryColor);
      gradient.addColorStop(1, primaryColor);

      for (let i = 0; i < barCount; i++) {
        const value = audioData[i] * sensitivity;
        const barHeight = Math.max(4, value * maxHeight);
        const x = startX + i * (barWidth + barGap);

        if (colorMode === 'rainbow') {
          const hue = (i / barCount) * 360 + time * 50;
          ctx.fillStyle = `hsl(${hue % 360}, 70%, 60%)`;
        } else if (colorMode === 'gradient') {
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = primaryColor;
        }

        if (style === 'mirror') {
          const centerY = canvas.height / 2;
          ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight / 2);
          ctx.globalAlpha = 0.4;
          ctx.fillRect(x, centerY, barWidth, barHeight / 2);
          ctx.globalAlpha = 1;
        } else if (style === 'bottom') {
          ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        } else {
          ctx.fillRect(x, 0, barWidth, barHeight);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isAnimating, settings]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-lg font-bold text-white tracking-wider">🎵 Audio Visualizer</h1>
      
      <div className="relative w-full max-w-xl">
        <canvas
          ref={canvasRef}
          width={500}
          height={150}
          className="w-full bg-zinc-950/80 rounded-xl border border-zinc-800"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-base font-bold tracking-[0.3em] text-white/20 uppercase">
            Made of Rumors
          </span>
        </div>
      </div>

      <div className="w-full max-w-xl bg-zinc-900/90 rounded-xl border border-zinc-800 p-4">
        <div className="flex justify-center mb-4">
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
              isAnimating 
                ? 'bg-red-500/20 text-red-400 border border-red-500/30' 
                : 'bg-indigo-500 text-white'
            }`}
          >
            {isAnimating ? '⏸ 정지' : '▶ 재생'}
          </button>
        </div>

        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">비주얼 스타일</label>
          <div className="flex gap-2">
            {[
              { id: 'mirror', label: '⬍ 미러' },
              { id: 'bottom', label: '▲ 하단' },
              { id: 'top', label: '▼ 상단' },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => setSettings(prev => ({ ...prev, style: s.id }))}
                className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                  settings.style === s.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-zinc-500 uppercase tracking-wider block mb-2">컬러 모드</label>
          <div className="flex gap-2">
            {[
              { id: 'solid', label: '단색' },
              { id: 'gradient', label: '그라디언트' },
              { id: 'rainbow', label: '레인보우' },
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSettings(prev => ({ ...prev, colorMode: mode.id }))}
                className={`flex-1 py-2 rounded-lg text-xs transition-all ${
                  settings.colorMode === mode.id
                    ? 'bg-indigo-500 text-white'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-zinc-500">막대 개수</label>
              <span className="text-xs text-indigo-400">{settings.barCount}</span>
            </div>
            <input
              type="range"
              min="16"
              max="96"
              value={settings.barCount}
              onChange={(e) => setSettings(s => ({ ...s, barCount: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-zinc-500">민감도</label>
              <span className="text-xs text-indigo-400">{settings.sensitivity}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={settings.sensitivity}
              onChange={(e) => setSettings(s => ({ ...s, sensitivity: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-zinc-500">막대 너비</label>
              <span className="text-xs text-indigo-400">{settings.barWidth}px</span>
            </div>
            <input
              type="range"
              min="2"
              max="12"
              value={settings.barWidth}
              onChange={(e) => setSettings(s => ({ ...s, barWidth: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-zinc-500">막대 간격</label>
              <span className="text-xs text-indigo-400">{settings.barGap}px</span>
            </div>
            <input
              type="range"
              min="1"
              max="8"
              value={settings.barGap}
              onChange={(e) => setSettings(s => ({ ...s, barGap: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {settings.colorMode !== 'rainbow' && (
          <div className="flex gap-4 mt-4 pt-3 border-t border-zinc-800">
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-500">메인</label>
              <input
                type="color"
                value={settings.primaryColor}
                onChange={(e) => setSettings(s => ({ ...s, primaryColor: e.target.value }))}
                className="w-8 h-8 rounded cursor-pointer border border-zinc-700"
              />
            </div>
            {settings.colorMode === 'gradient' && (
              <div className="flex items-center gap-2">
                <label className="text-xs text-zinc-500">서브</label>
                <input
                  type="color"
                  value={settings.secondaryColor}
                  onChange={(e) => setSettings(s => ({ ...s, secondaryColor: e.target.value }))}
                  className="w-8 h-8 rounded cursor-pointer border border-zinc-700"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
