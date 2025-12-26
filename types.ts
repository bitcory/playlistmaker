
export type VisualStyle = 'none' | 'bars' | 'symmetric' | 'mini' | 'circle' | 'linear' | 'wave' | 'field';
export type FilterType = 'original' | 'cinematic' | 'vintage' | 'noir' | 'dreamy' | 'vivid';
export type OverlayType = 'grain' | 'vhs' | 'light' | 'rgb' | 'pulse' | 'shake';
export type ParticleType = 'bubbles' | 'sparkles' | 'neon' | 'hearts' | 'embers' | 'snow';
export type ColorMode = 'solid' | 'gradient' | 'rainbow';

export interface EditorState {
  visualStyle: VisualStyle;
  filterType: FilterType;
  filterStrength: number;
  vignetteStrength: number;
  overlayTypes: OverlayType[];
  overlayStrength: number;
  // 개별 오버레이 강도
  grainStrength: number;
  vhsStrength: number;
  lightStrength: number;
  rgbStrength: number;
  pulseStrength: number;
  shakeStrength: number;
  particleTypes: ParticleType[];
  particleColor: string;
  particleDensity: number;
  particleOpacity: number;
  particleSpeed: number;
  particleSize: number;
  effectColor: string;
  secondaryColor: string;
  colorMode: ColorMode;
  logoPos: { x: number, y: number };
  logoSize: number;
  removeLogoBg: boolean;
  logoBgThreshold: number;
  customPalette: string[];
  spectrumPos: { x: number, y: number, centered: boolean };
  spectrumWidth: number;
  spectrumBarWidth: number;
  spectrumBarGap: number;
  spectrumSpeed: number;
  spectrumSensitivity: number;
  spectrumBands: number;
  spectrumMaxHeight: number;
  spectrumThickness: number;
  spectrumOpacity: number;
}

export interface AudioTrack {
  id: string;
  file: File;
  duration: string;
}

export interface ProjectAsset {
  audioTracks: AudioTrack[];
  logo: string | null;
  background: string | null;
  repeatCount: 1 | 2 | 3;
  bitrate: '96kbps' | '128kbps' | '192kbps';
}
