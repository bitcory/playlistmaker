
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { EditorState, ProjectAsset, ParticleType, OverlayType } from '../types';

// 오버레이 효과 렌더링 함수들
const drawGrainOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, strength: number) => {
  const intensity = strength / 100;

  ctx.save();
  // 노이즈 패턴 그리기
  const noiseCount = Math.floor(5000 * intensity);
  for (let i = 0; i < noiseCount; i++) {
    const x = Math.random() * width;
    const y = Math.random() * height;
    const gray = Math.random() > 0.5 ? 255 : 0;
    const alpha = Math.random() * 0.25 * intensity + 0.05 * intensity;
    ctx.fillStyle = `rgba(${gray}, ${gray}, ${gray}, ${alpha})`;
    ctx.fillRect(x, y, Math.random() * 2 + 1, Math.random() * 2 + 1);
  }
  ctx.restore();
};

const drawVHSOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, strength: number, time: number) => {
  const intensity = strength / 100;

  // 스캔라인 (고정)
  ctx.save();
  ctx.fillStyle = `rgba(0, 0, 0, ${0.2 * intensity})`;
  for (let y = 0; y < height; y += 2) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.restore();

  // 색수차 (좌우 흔들림만)
  ctx.save();
  const shift = Math.sin(time * 3) * 4 * intensity;
  ctx.globalAlpha = 0.35 * intensity;
  ctx.fillStyle = 'rgba(255, 0, 0, 0.15)';
  ctx.fillRect(shift + 3 * intensity, 0, width, height);
  ctx.fillStyle = 'rgba(0, 255, 255, 0.15)';
  ctx.fillRect(-shift - 3 * intensity, 0, width, height);
  ctx.restore();

  // 랜덤 글리치 블록 (고정 위치에 깜빡임)
  if (Math.random() < 0.4 * intensity) {
    ctx.save();
    const blockX = Math.random() * width * 0.8;
    const blockY = Math.random() * height;
    const blockW = 60 + Math.random() * 120;
    const blockH = 5 + Math.random() * 15;
    ctx.globalAlpha = 0.5 * intensity;
    ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.35)`;
    ctx.fillRect(blockX, blockY, blockW, blockH);
    ctx.restore();
  }

  // 랜덤 노이즈 라인 (고정 위치)
  ctx.save();
  ctx.globalAlpha = 0.25 * intensity;
  for (let i = 0; i < 5 * intensity; i++) {
    const lineY = (Math.sin(i * 123.456) * 0.5 + 0.5) * height; // 고정 위치
    ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + Math.random() * 0.2})`;
    ctx.fillRect(0, lineY, width, 1);
  }
  ctx.restore();
};

const drawLightLeakOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, strength: number, time: number) => {
  const intensity = strength / 100;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = 0.7 * intensity;

  // 움직이는 빛 누출 효과 - 더 강하게
  const x = (Math.sin(time * 0.5) + 1) * width * 0.4;
  const y = (Math.cos(time * 0.3) + 1) * height * 0.3;

  const gradient = ctx.createRadialGradient(x, y, 0, x, y, width * 0.6);
  gradient.addColorStop(0, `rgba(255, 180, 80, ${0.9 * intensity})`);
  gradient.addColorStop(0.3, `rgba(255, 120, 50, ${0.5 * intensity})`);
  gradient.addColorStop(0.6, `rgba(255, 60, 60, ${0.2 * intensity})`);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 두 번째 빛 소스 (반대편)
  const x2 = width - x * 0.5;
  const y2 = height - y * 0.3;
  const gradient2 = ctx.createRadialGradient(x2, y2, 0, x2, y2, width * 0.5);
  gradient2.addColorStop(0, `rgba(80, 180, 255, ${0.8 * intensity})`);
  gradient2.addColorStop(0.3, `rgba(150, 80, 255, ${0.4 * intensity})`);
  gradient2.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient2;
  ctx.fillRect(0, 0, width, height);

  // 모서리 빛 효과
  ctx.globalAlpha = 0.5 * intensity;
  const cornerGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, width * 0.4);
  cornerGrad.addColorStop(0, `rgba(255, 200, 150, ${0.6 * intensity})`);
  cornerGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = cornerGrad;
  ctx.fillRect(0, 0, width, height);

  ctx.restore();
};

const drawRGBShiftOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, strength: number, time: number) => {
  const intensity = strength / 100;
  const shift = Math.sin(time * 2) * 8 * intensity + 5 * intensity;

  ctx.save();

  // RGB 분리 효과 - 더 잘 보이도록
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 0.35 * intensity;

  // 빨간색 레이어 (오른쪽으로)
  ctx.fillStyle = `rgba(255, 0, 50, 0.4)`;
  ctx.fillRect(shift, 0, width, height);

  // 파란색/청록 레이어 (왼쪽으로)
  ctx.fillStyle = `rgba(0, 200, 255, 0.4)`;
  ctx.fillRect(-shift, 0, width, height);

  ctx.restore();

  // 수평 색상 줄무늬 효과
  ctx.save();
  ctx.globalAlpha = 0.2 * intensity;
  const stripeCount = 8;
  for (let i = 0; i < stripeCount; i++) {
    const lineY = ((time * 80 + i * height / stripeCount) % height);
    const hue = (i * 45 + time * 50) % 360;
    ctx.fillStyle = `hsla(${hue}, 100%, 50%, 0.4)`;
    ctx.fillRect(0, lineY, width, 3);
  }
  ctx.restore();

  // 테두리 RGB 효과
  ctx.save();
  ctx.globalAlpha = 0.4 * intensity;
  ctx.strokeStyle = 'rgba(255, 0, 100, 0.5)';
  ctx.lineWidth = 3;
  ctx.strokeRect(shift, shift, width - shift * 2, height - shift * 2);
  ctx.strokeStyle = 'rgba(0, 255, 200, 0.5)';
  ctx.strokeRect(-shift + 2, -shift + 2, width + shift * 2 - 4, height + shift * 2 - 4);
  ctx.restore();
};

const drawPulseOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number, strength: number, audioLevel: number, time: number = 0) => {
  const intensity = strength / 100;
  // 오디오가 없을 때도 기본 펄스 효과 제공
  const basePulse = Math.sin(time * 3) * 0.4 + 0.6;
  const pulse = audioLevel > 0.1 ? audioLevel * intensity * 1.5 : basePulse * intensity * 0.6;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.globalAlpha = pulse * 0.5;

  // 중앙에서 퍼지는 펄스
  const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, width * 0.7);
  gradient.addColorStop(0, `rgba(255, 255, 255, ${0.6 * intensity})`);
  gradient.addColorStop(0.3, `rgba(255, 255, 255, ${0.3 * intensity})`);
  gradient.addColorStop(0.6, `rgba(255, 255, 255, ${0.1 * intensity})`);
  gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // 테두리 글로우
  ctx.globalAlpha = pulse * 0.5;
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.lineWidth = 8 + pulse * 30;
  ctx.strokeRect(0, 0, width, height);

  // 비트에 맞춘 플래시 효과
  if (audioLevel > 0.6) {
    ctx.globalAlpha = (audioLevel - 0.6) * intensity * 0.8;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
};

// 색상 밝기 조절 헬퍼 함수
const adjustColorBrightness = (hex: string, factor: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  const newR = Math.min(255, Math.round(r * factor));
  const newG = Math.min(255, Math.round(g * factor));
  const newB = Math.min(255, Math.round(b * factor));

  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// 파티클 인터페이스
interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  life: number;
  maxLife: number;
  type: ParticleType;
  color: string;
  // 특수 효과용 추가 속성
  twinkle?: number;
  shape?: 'circle' | 'triangle' | 'square' | 'diamond';
}

// 파티클 생성 함수
const createParticle = (
  type: ParticleType,
  width: number,
  height: number,
  color: string,
  sizeMultiplier: number = 1
): Particle => {
  const baseSize = (Math.random() * 8 + 4) * sizeMultiplier;

  const base: Particle = {
    x: Math.random() * width,
    y: Math.random() * height,
    size: baseSize,
    speedX: 0,
    speedY: 0,
    opacity: Math.random() * 0.5 + 0.3,
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.02,
    life: 0,
    maxLife: Math.random() * 200 + 100,
    type,
    color,
  };

  switch (type) {
    case 'bubbles':
      return {
        ...base,
        y: height + baseSize,
        speedY: -(Math.random() * 1.5 + 0.5),
        speedX: (Math.random() - 0.5) * 0.5,
        size: baseSize * 1.5,
        opacity: Math.random() * 0.3 + 0.1,
      };
    case 'sparkles':
      return {
        ...base,
        twinkle: Math.random() * Math.PI * 2,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
      };
    case 'neon':
      return {
        ...base,
        shape: ['circle', 'triangle', 'square', 'diamond'][Math.floor(Math.random() * 4)] as any,
        speedX: (Math.random() - 0.5) * 1,
        speedY: (Math.random() - 0.5) * 1,
        size: baseSize * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.05,
      };
    case 'hearts':
      return {
        ...base,
        y: height + baseSize,
        speedY: -(Math.random() * 1 + 0.3),
        speedX: (Math.random() - 0.5) * 0.8,
        rotationSpeed: (Math.random() - 0.5) * 0.03,
      };
    case 'embers':
      return {
        ...base,
        y: height + baseSize,
        speedY: -(Math.random() * 2 + 1),
        speedX: (Math.random() - 0.5) * 1.5,
        size: baseSize * 0.7,
        // effectColor 사용 (밝기 변형)
        color: Math.random() > 0.5 ? color : adjustColorBrightness(color, 1.3),
      };
    case 'snow':
      return {
        ...base,
        y: -baseSize,
        speedY: Math.random() * 1 + 0.5,
        speedX: (Math.random() - 0.5) * 0.5,
        // effectColor 사용
        color: color,
        opacity: Math.random() * 0.6 + 0.4,
      };
    default:
      return base;
  }
};

// 파티클 그리기 함수
const drawParticle = (ctx: CanvasRenderingContext2D, p: Particle) => {
  ctx.save();
  ctx.globalAlpha = p.opacity;
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);

  switch (p.type) {
    case 'bubbles':
      // 물방울 - 원형 + 하이라이트
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      // 하이라이트
      ctx.beginPath();
      ctx.arc(-p.size * 0.3, -p.size * 0.3, p.size * 0.2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.fill();
      break;

    case 'sparkles':
      // 반짝임 - 4방향 별
      const twinkleScale = 0.5 + Math.sin(p.twinkle || 0) * 0.5;
      ctx.fillStyle = p.color;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * twinkleScale, p.size * 0.15 * twinkleScale, (Math.PI / 2) * i, 0, Math.PI * 2);
        ctx.fill();
      }
      // 중앙 원
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.3 * twinkleScale, 0, Math.PI * 2);
      ctx.fillStyle = '#ffffff';
      ctx.fill();
      break;

    case 'neon':
      // 네온 도형
      ctx.strokeStyle = p.color;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = p.color;

      if (p.shape === 'triangle') {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.866, p.size * 0.5);
        ctx.lineTo(-p.size * 0.866, p.size * 0.5);
        ctx.closePath();
        ctx.stroke();
      } else if (p.shape === 'square') {
        ctx.strokeRect(-p.size / 2, -p.size / 2, p.size, p.size);
      } else if (p.shape === 'diamond') {
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size, 0);
        ctx.closePath();
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;

    case 'hearts':
      // 하트 모양
      ctx.fillStyle = p.color;
      ctx.beginPath();
      const s = p.size * 0.5;
      ctx.moveTo(0, s * 0.3);
      ctx.bezierCurveTo(-s, -s * 0.5, -s * 2, s * 0.5, 0, s * 1.5);
      ctx.bezierCurveTo(s * 2, s * 0.5, s, -s * 0.5, 0, s * 0.3);
      ctx.fill();
      break;

    case 'embers':
      // 불티 - 작은 원 + 글로우
      ctx.shadowBlur = 8;
      ctx.shadowColor = p.color;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fill();
      // 꼬리 효과
      ctx.globalAlpha = p.opacity * 0.3;
      ctx.beginPath();
      ctx.arc(0, p.size * 2, p.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      break;

    case 'snow':
      // 눈 - 6방향 결정
      ctx.strokeStyle = p.color;
      ctx.fillStyle = p.color;
      ctx.lineWidth = 1;
      for (let i = 0; i < 6; i++) {
        ctx.save();
        ctx.rotate((Math.PI / 3) * i);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -p.size);
        ctx.stroke();
        // 작은 가지
        ctx.beginPath();
        ctx.moveTo(0, -p.size * 0.5);
        ctx.lineTo(p.size * 0.3, -p.size * 0.7);
        ctx.moveTo(0, -p.size * 0.5);
        ctx.lineTo(-p.size * 0.3, -p.size * 0.7);
        ctx.stroke();
        ctx.restore();
      }
      // 중앙 점
      ctx.beginPath();
      ctx.arc(0, 0, p.size * 0.15, 0, Math.PI * 2);
      ctx.fill();
      break;
  }

  ctx.restore();
};

// 파티클 업데이트 함수
const updateParticle = (p: Particle, width: number, height: number, speedMultiplier: number): boolean => {
  p.x += p.speedX * speedMultiplier;
  p.y += p.speedY * speedMultiplier;
  p.rotation += p.rotationSpeed * speedMultiplier;
  p.life++;

  // 반짝임 업데이트
  if (p.twinkle !== undefined) {
    p.twinkle += 0.15 * speedMultiplier;
  }

  // 범위 체크
  if (p.type === 'bubbles' || p.type === 'hearts' || p.type === 'embers') {
    if (p.y < -p.size * 2) return false;
  } else if (p.type === 'snow') {
    if (p.y > height + p.size * 2) return false;
  } else {
    // sparkles, neon - 화면 경계 반사
    if (p.x < 0 || p.x > width) p.speedX *= -1;
    if (p.y < 0 || p.y > height) p.speedY *= -1;
    p.x = Math.max(0, Math.min(width, p.x));
    p.y = Math.max(0, Math.min(height, p.y));
  }

  // 수명 체크
  if (p.life > p.maxLife) {
    p.opacity -= 0.02;
    if (p.opacity <= 0) return false;
  }

  return true;
};

interface VisualizerPreviewProps {
  state: EditorState;
  assets: ProjectAsset & { audio: File | null };
  audioRef: React.RefObject<HTMLAudioElement | null>;
  isPlaying: boolean;
  updateState: (key: keyof EditorState, value: any) => void;
  canvasRef?: React.RefObject<HTMLCanvasElement | null>;
}

const VisualizerPreview: React.FC<VisualizerPreviewProps> = ({ state, assets, audioRef, isPlaying, updateState, canvasRef: externalCanvasRef }) => {
  const internalCanvasRef = useRef<HTMLCanvasElement>(null);
  const canvasRef = externalCanvasRef || internalCanvasRef;
  const containerRef = useRef<HTMLDivElement>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const logoImageRef = useRef<HTMLImageElement | null>(null);
  const processedLogoRef = useRef<HTMLCanvasElement | null>(null); // 배경 제거된 로고
  const [logoAspectRatio, setLogoAspectRatio] = useState(1); // 로고 종횡비 상태 추가
  const [bgImageLoaded, setBgImageLoaded] = useState(false); // 배경 이미지 로드 상태
  const [logoImageLoaded, setLogoImageLoaded] = useState(false); // 로고 이미지 로드 상태

  // 파티클 시스템
  const particlesRef = useRef<Particle[]>([]);
  const lastParticleTimeRef = useRef<number>(0);

  // 베이직 스타일용 히스토리 버퍼 (왼쪽→오른쪽 흐름)
  const audioHistoryRef = useRef<number[]>([]);

  const [isInteractionActive, setIsInteractionActive] = useState(false);
  const [canvasRect, setCanvasRect] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const updateCanvasRect = () => {
    if (canvasRef.current) {
      setCanvasRect(canvasRef.current.getBoundingClientRect());
    }
  };

  useEffect(() => {
    updateCanvasRect();
    const handleResize = () => updateCanvasRect();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (assets.background) {
      setBgImageLoaded(false);
      const img = new Image();
      img.src = assets.background;
      img.onload = () => {
        bgImageRef.current = img;
        setBgImageLoaded(true); // 로드 완료 시 상태 업데이트
      };
    } else {
      bgImageRef.current = null;
      setBgImageLoaded(false);
    }
  }, [assets.background]);

  useEffect(() => {
    if (assets.logo) {
      setLogoImageLoaded(false);
      const img = new Image();
      img.src = assets.logo;
      img.onload = () => {
        logoImageRef.current = img;
        setLogoAspectRatio(img.naturalWidth / img.naturalHeight); // 종횡비 저장
        setLogoImageLoaded(true); // 로드 완료 시 상태 업데이트
      };
    } else {
      logoImageRef.current = null;
      processedLogoRef.current = null;
      setLogoAspectRatio(1);
      setLogoImageLoaded(false);
    }
  }, [assets.logo]);

  // 로고 배경 제거 처리
  useEffect(() => {
    if (!logoImageRef.current || !logoImageLoaded) {
      processedLogoRef.current = null;
      return;
    }

    if (!state.removeLogoBg) {
      processedLogoRef.current = null;
      return;
    }

    const img = logoImageRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 이미지 그리기
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    // 코너 픽셀에서 배경색 추출 (좌상단, 우상단, 좌하단, 우하단)
    const corners = [
      { x: 0, y: 0 },
      { x: canvas.width - 1, y: 0 },
      { x: 0, y: canvas.height - 1 },
      { x: canvas.width - 1, y: canvas.height - 1 }
    ];

    let bgR = 0, bgG = 0, bgB = 0;
    for (const corner of corners) {
      const idx = (corner.y * canvas.width + corner.x) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
    }
    bgR = Math.round(bgR / 4);
    bgG = Math.round(bgG / 4);
    bgB = Math.round(bgB / 4);

    // 임계값 계산 (50-100% -> 색상 차이 허용 범위)
    const threshold = ((100 - state.logoBgThreshold) / 100) * 150 + 20; // 20-170 범위

    // 배경 제거
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // 배경색과의 차이 계산
      const diff = Math.sqrt(
        Math.pow(r - bgR, 2) +
        Math.pow(g - bgG, 2) +
        Math.pow(b - bgB, 2)
      );

      // 차이가 임계값보다 작으면 투명하게
      if (diff < threshold) {
        // 부드러운 엣지를 위해 투명도 그라디언트 적용
        const alpha = Math.min(255, Math.max(0, (diff / threshold) * 255));
        data[i + 3] = Math.round(alpha);
      }
    }

    ctx.putImageData(imageData, 0, 0);
    processedLogoRef.current = canvas;
  }, [logoImageLoaded, state.removeLogoBg, state.logoBgThreshold]);

  const dragRef = useRef<{
    type: 'move' | 'resize' | null,
    startX: number,
    startY: number,
    initialX: number,
    initialY: number,
    initialSize: number
  }>({
    type: null, startX: 0, startY: 0, initialX: state.logoPos.x, initialY: state.logoPos.y, initialSize: state.logoSize
  });

  // 핸들러 함수를 ref로 저장하여 안정적인 참조 유지
  const handlersRef = useRef<{
    move: (e: MouseEvent) => void;
    up: () => void;
  } | null>(null);

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'resize') => {
    e.stopPropagation();
    setIsInteractionActive(true);
    updateCanvasRect();
    dragRef.current = {
      type,
      startX: e.clientX,
      startY: e.clientY,
      initialX: state.logoPos.x,
      initialY: state.logoPos.y,
      initialSize: state.logoSize
    };

    // 핸들러 함수를 생성하고 ref에 저장
    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current.type || !canvasRef.current) return;

      const rect = canvasRef.current.getBoundingClientRect();

      if (dragRef.current.type === 'move') {
        const deltaX = (e.clientX - dragRef.current.startX) / rect.width * 100;
        const deltaY = (e.clientY - dragRef.current.startY) / rect.height * 100;
        updateState('logoPos', {
          x: Math.max(-50, Math.min(100, dragRef.current.initialX + deltaX)),
          y: Math.max(-50, Math.min(100, dragRef.current.initialY + deltaY))
        });
      } else if (dragRef.current.type === 'resize') {
        const pixelDelta = e.clientX - dragRef.current.startX;
        const scale = rect.width / 1280;
        updateState('logoSize', Math.max(20, Math.min(1000, dragRef.current.initialSize + (pixelDelta / scale))));
      }
    };

    const handleUp = () => {
      setIsInteractionActive(false);
      dragRef.current.type = null;
      if (handlersRef.current) {
        window.removeEventListener('mousemove', handlersRef.current.move);
        window.removeEventListener('mouseup', handlersRef.current.up);
        handlersRef.current = null;
      }
    };

    handlersRef.current = { move: handleMove, up: handleUp };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
  };

  // 컴포넌트 언마운트 시 이벤트 리스너 정리
  useEffect(() => {
    return () => {
      if (handlersRef.current) {
        window.removeEventListener('mousemove', handlersRef.current.move);
        window.removeEventListener('mouseup', handlersRef.current.up);
      }
    };
  }, []);

  // 파티클 타입 변경 시 파티클 초기화
  useEffect(() => {
    particlesRef.current = [];
    lastParticleTimeRef.current = 0;
  }, [JSON.stringify(state.particleTypes)]);

  useEffect(() => {
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!audioRef.current || audioContextRef.current) return;

    const initAudio = () => {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyzerNode = audioCtx.createAnalyser();
      analyzerNode.fftSize = 256;
      
      const source = audioCtx.createMediaElementSource(audioRef.current!);
      source.connect(analyzerNode);
      analyzerNode.connect(audioCtx.destination);
      
      audioContextRef.current = audioCtx;
      setAnalyser(analyzerNode);
      setDataArray(new Uint8Array(analyzerNode.frequencyBinCount));
    };

    if (isPlaying) {
      initAudio();
    } else {
      const startInit = () => {
        initAudio();
        window.removeEventListener('mousedown', startInit);
      };
      window.addEventListener('mousedown', startInit);
      return () => window.removeEventListener('mousedown', startInit);
    }
  }, [audioRef, isPlaying]);

  // 정적 프레임 그리기 (오디오 없이도 이미지 표시)
  const drawStaticFrame = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // 배경 이미지 그리기
    if (bgImageRef.current) {
      ctx.save();
      let filterStr = '';
      switch(state.filterType) {
        case 'cinematic': filterStr = `contrast(1.2) saturate(0.8) sepia(0.1)`; break;
        case 'vintage': filterStr = `sepia(0.5) contrast(0.9) brightness(1.1)`; break;
        case 'noir': filterStr = `grayscale(1) contrast(1.3)`; break;
        case 'dreamy': filterStr = `blur(1px) saturate(1.5) contrast(1.1)`; break;
        case 'vivid': filterStr = `saturate(2) contrast(1.1)`; break;
      }
      ctx.filter = `${filterStr} brightness(${state.filterStrength / 100})`;
      ctx.drawImage(bgImageRef.current, 0, 0, width, height);
      ctx.restore();
    }

    // 비네트 효과
    const grad = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width/0.8);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, `rgba(0,0,0,${state.vignetteStrength/100})`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    // 로고 그리기
    if (logoImageRef.current) {
      ctx.save();
      const logoX = (width * state.logoPos.x) / 100;
      const logoY = (height * state.logoPos.y) / 100;
      const logoW = state.logoSize;
      const logoH = logoW / logoAspectRatio;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      // 배경 제거된 로고가 있으면 사용, 아니면 원본 사용
      const logoSource = processedLogoRef.current || logoImageRef.current;
      ctx.drawImage(logoSource, logoX, logoY, logoW, logoH);
      ctx.restore();
    }
  };

  // 이미지 로드 시 정적 프레임 그리기
  useEffect(() => {
    if (!analyser) {
      drawStaticFrame();
    }
  }, [bgImageLoaded, logoImageLoaded, state, logoAspectRatio]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // analyser가 없으면 파티클/오버레이 애니메이션 (또는 정적 프레임)
    const particleTypes = state.particleTypes || [];
    const overlayTypes = state.overlayTypes || [];
    if (!analyser || !dataArray) {
      // 파티클과 오버레이가 없으면 정적 프레임만 그리고 종료
      if (particleTypes.length === 0 && overlayTypes.length === 0) {
        drawStaticFrame();
        return;
      }

      // 파티클/오버레이 있으면 애니메이션 루프
      let particleAnimationId: number;
      const drawWithEffects = () => {
        const { width, height } = canvas;
        const time = Date.now() / 1000;

        // Shake 효과
        ctx.save();
        if (overlayTypes.includes('shake')) {
          const shakeIntensity = state.shakeStrength / 100 * 5;
          const shakeX = (Math.random() - 0.5) * shakeIntensity;
          const shakeY = (Math.random() - 0.5) * shakeIntensity;
          ctx.translate(shakeX, shakeY);
        }

        drawStaticFrame();

        const now = Date.now();
        const spawnInterval = Math.max(50, 500 - state.particleDensity * 4);
        const sizeMultiplier = state.particleSize / 100;
        const speedMultiplier = state.particleSpeed / 100;
        const opacityMultiplier = state.particleOpacity / 100;

        if (particleTypes.length > 0 && now - lastParticleTimeRef.current > spawnInterval) {
          const particlesToAdd = Math.ceil(state.particleDensity / 20 / particleTypes.length);
          for (const pType of particleTypes) {
            for (let i = 0; i < particlesToAdd; i++) {
              particlesRef.current.push(
                createParticle(pType, width, height, state.particleColor || state.effectColor, sizeMultiplier)
              );
            }
          }
          lastParticleTimeRef.current = now;
        }

        particlesRef.current = particlesRef.current.filter(p => {
          const alive = updateParticle(p, width, height, speedMultiplier);
          if (alive) {
            ctx.save();
            ctx.globalAlpha = p.opacity * opacityMultiplier;
            drawParticle(ctx, p);
            ctx.restore();
          }
          return alive;
        });

        if (particlesRef.current.length > 300) {
          particlesRef.current = particlesRef.current.slice(-300);
        }

        // 오버레이 효과 렌더링
        if (overlayTypes.includes('light')) {
          drawLightLeakOverlay(ctx, width, height, state.lightStrength, time);
        }
        if (overlayTypes.includes('rgb')) {
          drawRGBShiftOverlay(ctx, width, height, state.rgbStrength, time);
        }
        if (overlayTypes.includes('pulse')) {
          drawPulseOverlay(ctx, width, height, state.pulseStrength, 0, time);
        }
        if (overlayTypes.includes('vhs')) {
          drawVHSOverlay(ctx, width, height, state.vhsStrength, time);
        }
        if (overlayTypes.includes('grain')) {
          drawGrainOverlay(ctx, width, height, state.grainStrength);
        }

        ctx.restore();
        particleAnimationId = requestAnimationFrame(drawWithEffects);
      };

      drawWithEffects();
      return () => cancelAnimationFrame(particleAnimationId);
    }

    let animationFrameId: number;

    const draw = () => {
      const { width, height } = canvas;
      const time = Date.now() / 1000;
      const overlayTypes = state.overlayTypes || [];

      // Shake 효과 적용 (캔버스 변환)
      ctx.save();
      if (overlayTypes.includes('shake')) {
        const shakeIntensity = state.shakeStrength / 100 * 5;
        const shakeX = (Math.random() - 0.5) * shakeIntensity;
        const shakeY = (Math.random() - 0.5) * shakeIntensity;
        ctx.translate(shakeX, shakeY);
      }

      ctx.clearRect(-10, -10, width + 20, height + 20);
      analyser.getByteFrequencyData(dataArray);

      // 오디오 레벨 계산 (pulse 효과용)
      const audioLevel = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255;

      if (bgImageRef.current) {
        ctx.save();
        let filterStr = '';
        switch(state.filterType) {
          case 'cinematic': filterStr = `contrast(1.2) saturate(0.8) sepia(0.1)`; break;
          case 'vintage': filterStr = `sepia(0.5) contrast(0.9) brightness(1.1)`; break;
          case 'noir': filterStr = `grayscale(1) contrast(1.3)`; break;
          case 'dreamy': filterStr = `blur(1px) saturate(1.5) contrast(1.1)`; break;
          case 'vivid': filterStr = `saturate(2) contrast(1.1)`; break;
        }
        ctx.filter = `${filterStr} brightness(${state.filterStrength / 100})`;
        ctx.drawImage(bgImageRef.current, 0, 0, width, height);
        ctx.restore();
      }

      const grad = ctx.createRadialGradient(width/2, height/2, width/4, width/2, height/2, width/0.8);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(1, `rgba(0,0,0,${state.vignetteStrength/100})`);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      if (state.visualStyle !== 'none') {
        const totalBars = Math.min(state.spectrumBands, dataArray.length);
        const visualWidth = (width * state.spectrumWidth) / 100;
        const centerY = (height * state.spectrumPos.y) / 100;
        const time = Date.now() / 1000;

        // 공통 주파수 처리 함수
        const skipLowFreq = Math.floor(dataArray.length * 0.02);
        const usableRange = Math.floor(dataArray.length * 0.75);

        const getFrequencyValue = (index: number, count: number): number => {
          const freqPosition = index / count;
          const logPosition = Math.pow(freqPosition, 0.7);
          const dataIndex = skipLowFreq + Math.floor(logPosition * usableRange);

          const rangeSize = Math.max(1, Math.floor(usableRange / count / 2));
          let sum = 0;
          let sampleCount = 0;
          for (let j = dataIndex; j < Math.min(dataIndex + rangeSize, dataArray.length); j++) {
            sum += dataArray[j];
            sampleCount++;
          }
          const rawValue = sampleCount > 0 ? sum / sampleCount : 0;

          // 주파수 보정: 저주파 감쇠, 고주파 부스트
          const freqCompensation = 0.3 + freqPosition * 0.9;
          return rawValue * freqCompensation;
        };

        // 그라디언트 생성
        const startX = state.spectrumPos.centered
          ? (width - visualWidth) / 2
          : (width * state.spectrumPos.x) / 100 - visualWidth / 2;
        const gradient = ctx.createLinearGradient(startX, 0, startX + visualWidth, 0);
        gradient.addColorStop(0, state.effectColor);
        gradient.addColorStop(0.5, state.secondaryColor);
        gradient.addColorStop(1, state.effectColor);

        // 대칭 스타일: 좌우 미러 (중앙에서 양쪽으로 동일한 막대)
        if (state.visualStyle === 'symmetric') {
          const halfBarsCount = Math.floor(state.spectrumBands / 2);
          const barWidth = state.spectrumBarWidth;
          const barGap = state.spectrumBarGap;

          // 한쪽의 총 너비 계산
          const halfWidth = halfBarsCount * barWidth + (halfBarsCount - 1) * barGap;
          const totalSymWidth = halfWidth * 2 + barGap; // 양쪽 + 중앙 간격

          const scale = totalSymWidth > visualWidth ? visualWidth / totalSymWidth : 1;
          const actualBarWidth = Math.max(1, barWidth * scale);
          const actualGap = barGap * scale;

          // 중앙 X 위치
          const centerXSym = state.spectrumPos.centered
            ? width / 2
            : (width * state.spectrumPos.x) / 100;

          if (audioHistoryRef.current.length !== halfBarsCount) {
            audioHistoryRef.current = new Array(halfBarsCount).fill(0);
          }

          ctx.globalAlpha = state.spectrumOpacity / 100;

          for (let i = 0; i < halfBarsCount; i++) {
            const rawValue = getFrequencyValue(i, halfBarsCount);

            const smoothing = (state.spectrumSpeed / 100) * 0.7 + 0.15;
            const currentValue = audioHistoryRef.current[i];
            const newValue = currentValue + (rawValue - currentValue) * smoothing;
            audioHistoryRef.current[i] = newValue;

            const sensitivity = state.spectrumSensitivity / 100;
            const maxHeight = state.spectrumMaxHeight / 100;
            const barHeight = Math.max(4, (newValue / 255) * height * maxHeight * sensitivity * 0.5);

            // 중앙에서 바깥쪽으로의 거리
            const offset = (i + 0.5) * (actualBarWidth + actualGap);

            // 색상 설정
            if (state.colorMode === 'rainbow') {
              const hue = (i / halfBarsCount) * 180 - time * 50;
              ctx.fillStyle = `hsl(${((hue % 360) + 360) % 360}, 85%, 55%)`;
            } else if (state.colorMode === 'gradient') {
              const t = i / halfBarsCount;
              const r1 = parseInt(state.effectColor.slice(1, 3), 16);
              const g1 = parseInt(state.effectColor.slice(3, 5), 16);
              const b1 = parseInt(state.effectColor.slice(5, 7), 16);
              const r2 = parseInt(state.secondaryColor.slice(1, 3), 16);
              const g2 = parseInt(state.secondaryColor.slice(3, 5), 16);
              const b2 = parseInt(state.secondaryColor.slice(5, 7), 16);
              ctx.fillStyle = `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
            } else {
              ctx.fillStyle = state.effectColor;
            }

            ctx.shadowBlur = 6;
            ctx.shadowColor = ctx.fillStyle as string;

            // 오른쪽 막대
            ctx.fillRect(centerXSym + offset - actualBarWidth / 2, centerY - barHeight, actualBarWidth, barHeight);
            // 왼쪽 막대 (미러)
            ctx.fillRect(centerXSym - offset - actualBarWidth / 2, centerY - barHeight, actualBarWidth, barHeight);
          }
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }

        // 미니막대: 컴팩트한 스펙트럼
        if (state.visualStyle === 'mini') {
          const miniBarCount = Math.min(32, Math.max(16, Math.floor(state.spectrumBands / 3)));
          const miniBarWidth = state.spectrumBarWidth;
          const miniBarGap = state.spectrumBarGap;
          const totalMiniWidth = miniBarCount * miniBarWidth + (miniBarCount - 1) * miniBarGap;
          const miniVisualWidth = visualWidth * 0.5;

          const miniScale = totalMiniWidth > miniVisualWidth ? miniVisualWidth / totalMiniWidth : 1;
          const actualMiniBarWidth = Math.max(2, miniBarWidth * miniScale);
          const actualMiniGap = miniBarGap * miniScale;
          const actualTotalWidth = miniBarCount * actualMiniBarWidth + (miniBarCount - 1) * actualMiniGap;

          const miniMaxHeight = height * (state.spectrumMaxHeight / 100) * 0.6;
          const miniStartX = state.spectrumPos.centered
            ? (width - actualTotalWidth) / 2
            : (width * state.spectrumPos.x) / 100 - actualTotalWidth / 2;
          const miniStartY = centerY;

          if (audioHistoryRef.current.length !== miniBarCount) {
            audioHistoryRef.current = new Array(miniBarCount).fill(0);
          }

          ctx.globalAlpha = state.spectrumOpacity / 100;

          for (let i = 0; i < miniBarCount; i++) {
            const rawValue = getFrequencyValue(i, miniBarCount);

            const smoothing = 0.4;
            const currentValue = audioHistoryRef.current[i] || 0;
            const newValue = currentValue + (rawValue - currentValue) * smoothing;
            audioHistoryRef.current[i] = newValue;

            const sensitivity = state.spectrumSensitivity / 100;
            const miniBarHeight = Math.max(3, (newValue / 255) * miniMaxHeight * sensitivity * 0.6);
            const x = miniStartX + i * (actualMiniBarWidth + actualMiniGap);

            if (state.colorMode === 'rainbow') {
              const hue = (i / miniBarCount) * 300 - time * 40;
              ctx.fillStyle = `hsl(${((hue % 360) + 360) % 360}, 85%, 55%)`;
            } else if (state.colorMode === 'gradient') {
              const t = i / miniBarCount;
              const r1 = parseInt(state.effectColor.slice(1, 3), 16);
              const g1 = parseInt(state.effectColor.slice(3, 5), 16);
              const b1 = parseInt(state.effectColor.slice(5, 7), 16);
              const r2 = parseInt(state.secondaryColor.slice(1, 3), 16);
              const g2 = parseInt(state.secondaryColor.slice(3, 5), 16);
              const b2 = parseInt(state.secondaryColor.slice(5, 7), 16);
              ctx.fillStyle = `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
            } else {
              ctx.fillStyle = state.effectColor;
            }

            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.fillStyle as string;
            ctx.fillRect(x, miniStartY - miniBarHeight, actualMiniBarWidth, miniBarHeight);
          }
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        }

        // 베이직 스타일: 자연스러운 오디오 반응 막대
        if (state.visualStyle === 'bars') {
          const barsCount = state.spectrumBands;
          const barWidth = state.spectrumBarWidth;
          const barGap = state.spectrumBarGap;
          const requestedTotalWidth = barsCount * barWidth + (barsCount - 1) * barGap;

          const scale = requestedTotalWidth > visualWidth ? visualWidth / requestedTotalWidth : 1;
          const actualBarWidth = Math.max(1, barWidth * scale);
          const actualGap = barGap * scale;
          const totalBarsWidth = barsCount * actualBarWidth + (barsCount - 1) * actualGap;

          const actualStartX = state.spectrumPos.centered
            ? (width - totalBarsWidth) / 2
            : (width * state.spectrumPos.x) / 100 - totalBarsWidth / 2;

          if (audioHistoryRef.current.length !== barsCount) {
            audioHistoryRef.current = new Array(barsCount).fill(0);
          }

          ctx.globalAlpha = state.spectrumOpacity / 100;

          for (let i = 0; i < barsCount; i++) {
            const rawValue = getFrequencyValue(i, barsCount);

            const smoothing = (state.spectrumSpeed / 100) * 0.7 + 0.15;
            const currentValue = audioHistoryRef.current[i];
            const newValue = currentValue + (rawValue - currentValue) * smoothing;
            audioHistoryRef.current[i] = newValue;

            const sensitivity = state.spectrumSensitivity / 100;
            const maxHeight = state.spectrumMaxHeight / 100;
            const normalizedHeight = Math.max(2, (newValue / 255) * height * maxHeight * sensitivity * 0.5);

            const x = actualStartX + i * (actualBarWidth + actualGap);

            if (state.colorMode === 'rainbow') {
              const hue = (i / barsCount) * 360 - time * 50;
              ctx.fillStyle = `hsl(${((hue % 360) + 360) % 360}, 85%, 55%)`;
            } else if (state.colorMode === 'gradient') {
              const t = i / barsCount;
              const r1 = parseInt(state.effectColor.slice(1, 3), 16);
              const g1 = parseInt(state.effectColor.slice(3, 5), 16);
              const b1 = parseInt(state.effectColor.slice(5, 7), 16);
              const r2 = parseInt(state.secondaryColor.slice(1, 3), 16);
              const g2 = parseInt(state.secondaryColor.slice(3, 5), 16);
              const b2 = parseInt(state.secondaryColor.slice(5, 7), 16);
              ctx.fillStyle = `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
            } else {
              ctx.fillStyle = state.effectColor;
            }

            ctx.fillRect(x, centerY - normalizedHeight, actualBarWidth, normalizedHeight);
          }
          ctx.globalAlpha = 1;
        }

        // 원형 스타일: 360도 원형 비주얼라이저
        if (state.visualStyle === 'circle') {
          const centerXCircle = state.spectrumPos.centered
            ? width / 2
            : (width * state.spectrumPos.x) / 100;
          const centerYCircle = (height * state.spectrumPos.y) / 100;

          // 원이 화면 내에 맞도록 반지름 계산
          const maxRadius = Math.min(width, height) * 0.3 * (state.spectrumWidth / 100);
          const baseRadius = maxRadius * 0.5;
          const maxBarLength = maxRadius * (state.spectrumMaxHeight / 100) * 0.6;

          const arcBars = Math.min(state.spectrumBands, 90);

          if (audioHistoryRef.current.length !== arcBars) {
            audioHistoryRef.current = new Array(arcBars).fill(0);
          }

          ctx.globalAlpha = state.spectrumOpacity / 100;
          ctx.lineCap = 'round';

          // 360도 원형 - 위에서 시작해서 시계방향
          for (let i = 0; i < arcBars; i++) {
            const rawValue = getFrequencyValue(i, arcBars);

            const smoothing = 0.35;
            const currentValue = audioHistoryRef.current[i] || 0;
            const newValue = currentValue + (rawValue - currentValue) * smoothing;
            audioHistoryRef.current[i] = newValue;

            const sensitivity = state.spectrumSensitivity / 100;
            const barLen = Math.max(3, (newValue / 255) * maxBarLength * sensitivity * 0.5);

            // 360도: 위(12시)에서 시작해서 시계방향
            const angle = (i / arcBars) * Math.PI * 2 - Math.PI / 2;

            const x1 = centerXCircle + Math.cos(angle) * baseRadius;
            const y1 = centerYCircle + Math.sin(angle) * baseRadius;
            const x2 = centerXCircle + Math.cos(angle) * (baseRadius + barLen);
            const y2 = centerYCircle + Math.sin(angle) * (baseRadius + barLen);

            if (state.colorMode === 'rainbow') {
              const hue = (i / arcBars) * 360 - time * 50;
              ctx.strokeStyle = `hsl(${((hue % 360) + 360) % 360}, 85%, 55%)`;
            } else if (state.colorMode === 'gradient') {
              const t = i / arcBars;
              const r1 = parseInt(state.effectColor.slice(1, 3), 16);
              const g1 = parseInt(state.effectColor.slice(3, 5), 16);
              const b1 = parseInt(state.effectColor.slice(5, 7), 16);
              const r2 = parseInt(state.secondaryColor.slice(1, 3), 16);
              const g2 = parseInt(state.secondaryColor.slice(3, 5), 16);
              const b2 = parseInt(state.secondaryColor.slice(5, 7), 16);
              ctx.strokeStyle = `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
            } else {
              ctx.strokeStyle = state.effectColor;
            }

            ctx.lineWidth = Math.max(2, state.spectrumBarWidth);
            ctx.shadowBlur = 8;
            ctx.shadowColor = ctx.strokeStyle as string;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }

          // 내부 원 글로우
          ctx.shadowBlur = 15;
          ctx.shadowColor = state.colorMode === 'rainbow'
            ? `hsl(${(time * 50) % 360}, 70%, 50%)`
            : state.effectColor;
          ctx.strokeStyle = state.colorMode === 'rainbow'
            ? `hsla(${(time * 50) % 360}, 70%, 50%, 0.3)`
            : `${state.effectColor}44`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerXCircle, centerYCircle, baseRadius * 0.9, 0, Math.PI * 2);
          ctx.stroke();

          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        } else if (state.visualStyle === 'linear') {
          // 선형: 부드러운 웨이브 라인 (참조 이미지처럼)
          const linearStartX = state.spectrumPos.centered
            ? (width - visualWidth) / 2
            : startX;
          const lineY = centerY;
          const maxWaveHeight = height * (state.spectrumMaxHeight / 100) * 0.4;
          const pointCount = Math.min(totalBars, 64);

          if (audioHistoryRef.current.length !== pointCount) {
            audioHistoryRef.current = new Array(pointCount).fill(0);
          }

          ctx.save();
          ctx.globalAlpha = state.spectrumOpacity / 100;
          ctx.lineWidth = state.spectrumThickness || 3;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.shadowBlur = 12;
          ctx.shadowColor = state.effectColor;

          const points: {x: number, y: number}[] = [];
          for (let i = 0; i <= pointCount; i++) {
            const rawValue = getFrequencyValue(i, pointCount);

            const smoothing = 0.3;
            const currentValue = audioHistoryRef.current[i] || 0;
            const newValue = currentValue + (rawValue - currentValue) * smoothing;
            if (i < pointCount) audioHistoryRef.current[i] = newValue;

            const sensitivity = state.spectrumSensitivity / 100;
            const waveHeight = (newValue / 255) * maxWaveHeight * sensitivity * 0.6;
            const x = linearStartX + (i / pointCount) * visualWidth;
            const y = lineY - waveHeight;
            points.push({x, y});
          }

          ctx.beginPath();
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length - 1; i++) {
            const cpX = (points[i].x + points[i + 1].x) / 2;
            const cpY = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, cpX, cpY);
          }
          ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

          if (state.colorMode === 'rainbow') {
            const rainbowGrad = ctx.createLinearGradient(linearStartX, 0, linearStartX + visualWidth, 0);
            for (let i = 0; i <= 10; i++) {
              const hue = (i / 10) * 360 - time * 50;
              rainbowGrad.addColorStop(i / 10, `hsl(${((hue % 360) + 360) % 360}, 75%, 55%)`);
            }
            ctx.strokeStyle = rainbowGrad;
          } else if (state.colorMode === 'gradient') {
            ctx.strokeStyle = gradient;
          } else {
            ctx.strokeStyle = state.effectColor;
          }
          ctx.stroke();
          ctx.restore();

        } else if (state.visualStyle === 'wave') {
          // 파형: 3중 웨이브 (부드럽고 자연스러운 파형)
          const waveStartX = state.spectrumPos.centered
            ? (width - visualWidth) / 2
            : startX;
          const baseLineY = centerY;
          const maxWaveHeight = height * (state.spectrumMaxHeight / 100) * 0.35;
          const waveCount = 3;
          const waveSpacing = 10;

          for (let w = 0; w < waveCount; w++) {
            ctx.save();
            const opacity = w === 1 ? 1 : 0.6;
            ctx.globalAlpha = opacity * (state.spectrumOpacity / 100);
            ctx.lineWidth = (state.spectrumThickness || 3) * (w === 1 ? 1.3 : 0.9);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = w === 1 ? 15 : 8;
            ctx.shadowColor = state.effectColor;

            const yOffset = (w - 1) * waveSpacing;

            ctx.beginPath();
            for (let i = 0; i <= totalBars; i++) {
              const rawValue = getFrequencyValue(i, totalBars);
              const sensitivity = state.spectrumSensitivity / 100;
              const waveHeight = (rawValue / 255) * maxWaveHeight * sensitivity * 0.5;
              const x = waveStartX + (i / totalBars) * visualWidth;
              const y = baseLineY + yOffset - waveHeight;

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                const prevX = waveStartX + ((i - 1) / totalBars) * visualWidth;
                const prevRawValue = getFrequencyValue(i - 1, totalBars);
                const prevHeight = (prevRawValue / 255) * maxWaveHeight * sensitivity * 0.5;
                const prevY = baseLineY + yOffset - prevHeight;
                const cpX = (prevX + x) / 2;
                const cpY = (prevY + y) / 2;
                ctx.quadraticCurveTo(prevX, prevY, cpX, cpY);
              }
            }

            if (state.colorMode === 'rainbow') {
              const rainbowGrad = ctx.createLinearGradient(waveStartX, 0, waveStartX + visualWidth, 0);
              for (let i = 0; i <= 10; i++) {
                const hue = (i / 10) * 360 - time * 50 + w * 40;
                rainbowGrad.addColorStop(i / 10, `hsl(${((hue % 360) + 360) % 360}, 75%, 55%)`);
              }
              ctx.strokeStyle = rainbowGrad;
            } else if (state.colorMode === 'gradient') {
              ctx.strokeStyle = gradient;
            } else {
              ctx.strokeStyle = state.effectColor;
            }
            ctx.stroke();
            ctx.restore();
          }

        } else if (state.visualStyle === 'field') {
          // 필드 웨이브: 현란한 다중 웨이브 애니메이션
          const fieldStartX = state.spectrumPos.centered
            ? (width - visualWidth) / 2
            : startX;
          const fieldHeight = height * (state.spectrumMaxHeight / 100) * 2;
          // Y 위치에서 위쪽으로 웨이브가 펼쳐지도록
          const fieldY = (height * state.spectrumPos.y) / 100;
          const lineCount = 12;

          // 전체 오디오 레벨 계산
          let totalAudioLevel = 0;
          for (let j = 0; j < Math.min(32, totalBars); j++) {
            totalAudioLevel += getFrequencyValue(j, 32);
          }
          const avgAudioLevel = totalAudioLevel / 32 / 255;

          for (let line = 0; line < lineCount; line++) {
            ctx.save();
            const lineProgress = line / (lineCount - 1);
            ctx.globalAlpha = (0.4 + lineProgress * 0.6) * (state.spectrumOpacity / 100);
            ctx.lineWidth = (state.spectrumThickness || 2) * (0.8 + lineProgress * 0.8);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ctx.shadowBlur = 15 + avgAudioLevel * 20;
            ctx.shadowColor = state.effectColor;

            const yOffset = -fieldHeight * lineProgress;
            const sensitivity = state.spectrumSensitivity / 100;

            ctx.beginPath();
            for (let i = 0; i <= totalBars; i++) {
              const rawValue = getFrequencyValue(i, totalBars);
              // 오디오 반응 증폭
              const audioBoost = 1 + avgAudioLevel * 2;
              const baseAmplitude = 20 + (rawValue / 255) * 60 * sensitivity;
              const amplitude = baseAmplitude * audioBoost;

              const x = fieldStartX + (i / totalBars) * visualWidth;
              // 더 빠르고 복잡한 웨이브 패턴
              const wavePhase1 = (i / totalBars) * Math.PI * 8 - time * 4 + line * 0.8;
              const wavePhase2 = (i / totalBars) * Math.PI * 3 + time * 2 - line * 0.3;
              const combinedWave = Math.sin(wavePhase1) * 0.7 + Math.sin(wavePhase2) * 0.3;
              const y = fieldY + yOffset + combinedWave * amplitude * (1 - lineProgress * 0.4);

              if (i === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }

            if (state.colorMode === 'rainbow') {
              const rainbowGrad = ctx.createLinearGradient(fieldStartX, 0, fieldStartX + visualWidth, 0);
              for (let c = 0; c <= 10; c++) {
                const hue = (c / 10) * 360 + lineProgress * 60 - time * 80;
                rainbowGrad.addColorStop(c / 10, `hsl(${((hue % 360) + 360) % 360}, 85%, ${50 + lineProgress * 15}%)`);
              }
              ctx.strokeStyle = rainbowGrad;
            } else if (state.colorMode === 'gradient') {
              const t = lineProgress;
              const r1 = parseInt(state.effectColor.slice(1, 3), 16);
              const g1 = parseInt(state.effectColor.slice(3, 5), 16);
              const b1 = parseInt(state.effectColor.slice(5, 7), 16);
              const r2 = parseInt(state.secondaryColor.slice(1, 3), 16);
              const g2 = parseInt(state.secondaryColor.slice(3, 5), 16);
              const b2 = parseInt(state.secondaryColor.slice(5, 7), 16);
              ctx.strokeStyle = `rgb(${Math.round(r1 + (r2 - r1) * t)}, ${Math.round(g1 + (g2 - g1) * t)}, ${Math.round(b1 + (b2 - b1) * t)})`;
            } else {
              ctx.strokeStyle = state.effectColor;
            }
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.shadowBlur = 0;
      }

      if (logoImageRef.current) {
        ctx.save();
        const logoX = (width * state.logoPos.x) / 100;
        const logoY = (height * state.logoPos.y) / 100;
        const logoW = state.logoSize;
        const logoH = logoW / logoAspectRatio; // 종횡비 반영

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        // 배경 제거된 로고가 있으면 사용, 아니면 원본 사용
        const logoSource = processedLogoRef.current || logoImageRef.current;
        ctx.drawImage(logoSource, logoX, logoY, logoW, logoH);
        ctx.restore();
      }

      // 파티클 시스템 렌더링
      const activeParticleTypes = state.particleTypes || [];
      if (activeParticleTypes.length > 0) {
        const now = Date.now();
        const spawnInterval = Math.max(50, 500 - state.particleDensity * 4); // 밀도에 따른 생성 간격
        const sizeMultiplier = state.particleSize / 100;
        const speedMultiplier = state.particleSpeed / 100;
        const opacityMultiplier = state.particleOpacity / 100;

        // 새 파티클 생성
        if (now - lastParticleTimeRef.current > spawnInterval) {
          const particlesToAdd = Math.ceil(state.particleDensity / 20 / activeParticleTypes.length);
          for (const pType of activeParticleTypes) {
            for (let i = 0; i < particlesToAdd; i++) {
              particlesRef.current.push(
                createParticle(pType, width, height, state.particleColor || state.effectColor, sizeMultiplier)
              );
            }
          }
          lastParticleTimeRef.current = now;
        }

        // 파티클 업데이트 및 그리기
        particlesRef.current = particlesRef.current.filter(p => {
          const alive = updateParticle(p, width, height, speedMultiplier);
          if (alive) {
            ctx.save();
            ctx.globalAlpha = p.opacity * opacityMultiplier;
            drawParticle(ctx, p);
            ctx.restore();
          }
          return alive;
        });

        // 파티클 수 제한 (성능)
        if (particlesRef.current.length > 300) {
          particlesRef.current = particlesRef.current.slice(-300);
        }
      }

      // 오버레이 효과 렌더링
      if (overlayTypes.includes('light')) {
        drawLightLeakOverlay(ctx, width, height, state.lightStrength, time);
      }
      if (overlayTypes.includes('rgb')) {
        drawRGBShiftOverlay(ctx, width, height, state.rgbStrength, time);
      }
      if (overlayTypes.includes('pulse')) {
        drawPulseOverlay(ctx, width, height, state.pulseStrength, audioLevel, time);
      }
      if (overlayTypes.includes('vhs')) {
        drawVHSOverlay(ctx, width, height, state.vhsStrength, time);
      }
      if (overlayTypes.includes('grain')) {
        drawGrainOverlay(ctx, width, height, state.grainStrength);
      }

      // Shake 효과 복원
      ctx.restore();

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrameId);
  }, [state, analyser, dataArray, logoAspectRatio, bgImageLoaded, logoImageLoaded]);

  const currentScale = canvasRect.width / 1280;

  return (
    <div ref={containerRef} className="w-full h-full relative select-none overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="w-full h-full object-cover z-0"
      />
      
      {/* 로고가 있을 때만 드래그 UI 표시 */}
      {assets.logo && logoImageLoaded && (
        <div
          className="absolute z-10 pointer-events-none"
          style={{
            width: canvasRect.width,
            height: canvasRect.height,
            left: canvasRect.left - (containerRef.current?.getBoundingClientRect().left || 0),
            top: canvasRect.top - (containerRef.current?.getBoundingClientRect().top || 0),
          }}
        >
          <div
            className={`absolute pointer-events-auto border-2 transition-all ${isInteractionActive ? 'border-indigo-500' : 'border-transparent hover:border-white/40'}`}
            style={{
              left: `${state.logoPos.x}%`,
              top: `${state.logoPos.y}%`,
              width: `${state.logoSize * currentScale}px`,
              height: `${(state.logoSize / logoAspectRatio) * currentScale}px`,
              cursor: isInteractionActive ? 'grabbing' : 'grab'
            }}
            onMouseDown={(e) => handleMouseDown(e, 'move')}
          >
            <div
              className="absolute -right-2 -bottom-2 w-5 h-5 bg-white rounded-full shadow-2xl cursor-nwse-resize pointer-events-auto border-2 border-indigo-500 hover:scale-125 transition-all flex items-center justify-center"
              style={{
                opacity: isInteractionActive ? 1 : 0,
                pointerEvents: isInteractionActive ? 'auto' : 'none'
              }}
              onMouseDown={(e) => handleMouseDown(e, 'resize')}
            >
               <div className="w-1 h-1 bg-indigo-500 rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VisualizerPreview;
