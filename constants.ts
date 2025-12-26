
import { VisualStyle, FilterType, OverlayType, ParticleType } from './types';

export const VISUAL_STYLES: { id: VisualStyle; label: string }[] = [
  { id: 'none', label: '미적용' },
  { id: 'bars', label: '베이직' },
  { id: 'symmetric', label: '대칭 막대' },
  { id: 'mini', label: '미니막대' },
  { id: 'circle', label: '원형' },
  { id: 'linear', label: '선형' },
  { id: 'wave', label: '파형 (3중)' },
  { id: 'field', label: '필드 웨이브' },
];

export const FILTERS: { id: FilterType; label: string }[] = [
  { id: 'original', label: '원본' },
  { id: 'cinematic', label: '시네마틱' },
  { id: 'vintage', label: '빈티지' },
  { id: 'noir', label: '느와르' },
  { id: 'dreamy', label: '몽환적' },
  { id: 'vivid', label: '생생함' },
];

export const OVERLAYS: { id: OverlayType; label: string }[] = [
  { id: 'grain', label: '필름 그레인' },
  { id: 'vhs', label: 'VHS 글리치' },
  { id: 'light', label: '라이트 릭' },
  { id: 'rgb', label: 'RGB 시프트' },
  { id: 'pulse', label: '비트 펄스' },
  { id: 'shake', label: '카메라 쉐이크' },
];

export const PARTICLES: { id: ParticleType; label: string }[] = [
  { id: 'bubbles', label: '물방울' },
  { id: 'sparkles', label: '반짝임' },
  { id: 'neon', label: '네온 도형' },
  { id: 'hearts', label: '하트' },
  { id: 'embers', label: '불티 (+재)' },
  { id: 'snow', label: '눈 내림' },
];

export const DEFAULT_COLORS = [
  '#ff0055', '#6366f1', '#f43f5e', '#10b981', '#fbbf24',
  '#06b6d4', '#ffffff', '#f97316', '#a855f7', '#22c55e',
  '#2563eb', '#ec4899', '#eab308', '#00d1ff', '#1a1a1a',
  '#94a3b8'
];
