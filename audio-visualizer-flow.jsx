import React, { useEffect, useRef, useState } from 'react';

export default function AudioVisualizerFlow() {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const historyRef = useRef([]);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const [settings, setSettings] = useState({
    barCount: 48,
    barWidth: 4,
    barGap: 3,
    sensitivity: 1.2,
    flowSpeed: 1,  // 흐르는 속도
    colorMode: 'gradient',
    primaryColor: '#6366f1',
    secondaryColor: '#06b6d4',
    style: 'mirror',
  });

  // 새로운 오디오 값 생성 (실제로는 Web Audio API에서 가져옴)
  const generateNewAudioValue = (time) => {
    const bass = Math.sin(time * 3) * 0.5 + 0.5;
    const mid = Math.sin(time * 5) * 0.3 + 0.5;
    const high = Math.sin(time * 8) * 0.2 + 0.3;
    const noise = Math.random() * 0.15;
    return Math.min(1, bass * 0.5 + mid * 0.3 + high * 0.2 + noise);
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
    let lastUpdate = 0;

    // 히스토리 초기화
    if (historyRef.current.length === 0) {
      historyRef.current = new Array(settings.barCount).fill(0);
    }

    const draw = () => {
      const currentTime = Date.now();
      const time = (currentTime - startTime) / 1000;
      const { barCount, barWidth, barGap, sensitivity, flowSpeed, colorMode, primaryColor, secondaryColor, style } = settings;
      
      // 흐름 속도에 따라 새 데이터 추가 (왼쪽에서)
      const updateInterval = 50 / flowSpeed; // ms
      if (currentTime - lastUpdate > updateInterval) {
        // 새 값을 왼쪽(배열 시작)에 추가
        const newValue = generateNewAudioValue(time);
        historyRef.current.unshift(newValue);
        
        // 배열 크기 유지 (오래된 값은 오른쪽에서 제거)
        if (historyRef.current.length > barCount) {
          historyRef.current.pop();
        }
        
        lastUpdate = currentTime;
      }

      // 캔버스 클리어
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const totalWidth = barCount * (barWidth + barGap);
      const startX = (canvas.width - totalWidth) / 2;
      const maxHeight = canvas.height * 0.8;

      // 그라디언트 생성
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      gradient.addColorStop(0, primaryColor);
      gradient.addColorStop(0.5, secondaryColor);
      gradient.addColorStop(1, primaryColor);

      // 막대 그리기 (왼쪽이 최신, 오른쪽이 과거)
      for (let i = 0; i < Math.min(barCount, historyRef.current.length); i++) {
        const value = historyRef.current[i] * sensitivity;
        const barHeight = Math.max(4, value * maxHeight);
        const x = startX + i * (barWidth + barGap);

        // 색상 설정
        if (colorMode === 'rainbow') {
          const hue = (i / barCount) * 360 + time * 50;
          ctx.fillStyle = `hsl(${hue % 360}, 70%, 60%)`;
        } else if (colorMode === 'gradient') {
          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = primaryColor;
        }

        // 스타일에 따른 렌더링
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

  // 설정 변경시 히스토리 리셋
  useEffect(() => {
    historyRef.current = [];
  }, [settings.barCount]);

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-lg font-bold text-white tracking-wider">🎵 Audio Visualizer (L → R Flow)</h1>
      
      {/* 방향 표시 */}
      <div className="text-xs text-zinc-500 flex items-center gap-2">
        <span className="text-indigo-400">◀ 새 데이터</span>
        <span>━━━━━━━━━━━━━━━</span>
        <span className="text-zinc-600">오래된 데이터 ▶</span>
      </div>
      
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

        {/* 비주얼 스타일 */}
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

        {/* 컬러 모드 */}
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

        {/* 슬라이더 컨트롤 */}
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

          {/* 흐름 속도 - 새로 추가! */}
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-xs text-zinc-500">흐름 속도 🌊</label>
              <span className="text-xs text-indigo-400">{settings.flowSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.5"
              value={settings.flowSpeed}
              onChange={(e) => setSettings(s => ({ ...s, flowSpeed: Number(e.target.value) }))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>
        </div>

        {/* 색상 선택 */}
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
