
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EditorState, VisualStyle, OverlayType, ParticleType } from '../types';
import { VISUAL_STYLES, FILTERS, OVERLAYS, PARTICLES, DEFAULT_COLORS } from '../constants';

interface EditorLeftPanelProps {
  state: EditorState;
  updateState: (key: keyof EditorState, value: any) => void;
  isDarkMode?: boolean;
}

// 접을 수 있는 섹션 컴포넌트 - 모던 다크 글래스모피즘 스타일
const CollapsibleSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isDarkMode?: boolean;
}> = ({ title, isOpen, onToggle, children, isDarkMode = true }) => (
  <section className="rounded-lg overflow-hidden bg-zinc-900/80 border border-zinc-800">
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between px-4 py-3 transition-colors ${
        isOpen
          ? 'bg-indigo-600/20'
          : 'bg-zinc-800/50 hover:bg-zinc-800'
      }`}
    >
      <h3 className={`text-base font-semibold tracking-wide ${
        isOpen ? 'text-indigo-300' : 'text-zinc-300'
      }`}>{title}</h3>
      <ChevronDown
        className={`w-5 h-5 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-zinc-500`}
      />
    </button>
    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  </section>
);

const EditorLeftPanel: React.FC<EditorLeftPanelProps> = ({ state, updateState, isDarkMode = true }) => {
  // 각 섹션의 열림/닫힘 상태 (디폴트: 모두 닫힘)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    visualStyle: false,
    filter: false,
    overlay: false,
    particle: false,
    effectColor: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // 오버레이 토글 함수
  const toggleOverlay = (id: OverlayType) => {
    const current = state.overlayTypes || [];
    if (current.includes(id)) {
      updateState('overlayTypes', current.filter(t => t !== id));
    } else {
      updateState('overlayTypes', [...current, id]);
    }
  };

  // 파티클 토글 함수
  const toggleParticle = (id: ParticleType) => {
    const current = state.particleTypes || [];
    if (current.includes(id)) {
      updateState('particleTypes', current.filter(t => t !== id));
    } else {
      updateState('particleTypes', [...current, id]);
    }
  };

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      {/* 비주얼 스타일 섹션 */}
      <CollapsibleSection
        title="비주얼 스타일"
        isOpen={openSections.visualStyle}
        onToggle={() => toggleSection('visualStyle')}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-2 gap-3">
          {VISUAL_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => updateState('visualStyle', style.id as VisualStyle)}
              className={`py-3 px-4 rounded-lg text-sm font-semibold tracking-tight transition-all ${
                state.visualStyle === style.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 배경 필터 & 비네팅 섹션 */}
      <CollapsibleSection
        title="배경 필터 & 비네팅"
        isOpen={openSections.filter}
        onToggle={() => toggleSection('filter')}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-2 gap-3">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => updateState('filterType', filter.id)}
              className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                state.filterType === filter.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="space-y-4 pt-3">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-zinc-400">필터 강도</label>
              <span className="text-sm font-medium text-indigo-400">{state.filterStrength}%</span>
            </div>
            <input
              type="range"
              value={state.filterStrength}
              onChange={(e) => updateState('filterStrength', parseInt(e.target.value))}
              className="w-full"
              min="0"
              max="100"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-zinc-400">비네팅 세기</label>
              <span className="text-sm font-medium text-indigo-400">{state.vignetteStrength}%</span>
            </div>
            <input
              type="range"
              value={state.vignetteStrength}
              onChange={(e) => updateState('vignetteStrength', parseInt(e.target.value))}
              className="w-full"
              min="0"
              max="100"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 트렌디 오버레이 섹션 */}
      <CollapsibleSection
        title="트렌디 오버레이"
        isOpen={openSections.overlay}
        onToggle={() => toggleSection('overlay')}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-2 gap-3">
          {OVERLAYS.map((overlay) => (
            <button
              key={overlay.id}
              onClick={() => toggleOverlay(overlay.id)}
              className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                (state.overlayTypes || []).includes(overlay.id)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {overlay.label}
            </button>
          ))}
        </div>

        {(state.overlayTypes || []).length > 0 && (
          <div className="space-y-4 pt-3">
            {(state.overlayTypes || []).includes('grain') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-400">필름 노이즈 강도</label>
                  <span className="text-sm font-medium text-indigo-400">{state.grainStrength}%</span>
                </div>
                <input
                  type="range"
                  value={state.grainStrength}
                  onChange={(e) => updateState('grainStrength', parseInt(e.target.value))}
                  className="w-full"
                  min="0"
                  max="100"
                />
              </div>
            )}
            {(state.overlayTypes || []).includes('vhs') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-400">글리치 빈도</label>
                  <span className="text-sm font-medium text-indigo-400">{state.vhsStrength}%</span>
                </div>
                <input
                  type="range"
                  value={state.vhsStrength}
                  onChange={(e) => updateState('vhsStrength', parseInt(e.target.value))}
                  className="w-full"
                  min="0"
                  max="100"
                />
              </div>
            )}
            {(state.overlayTypes || []).includes('light') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-400">빛 번짐 강도</label>
                  <span className="text-sm font-medium text-indigo-400">{state.lightStrength}%</span>
                </div>
                <input
                  type="range"
                  value={state.lightStrength}
                  onChange={(e) => updateState('lightStrength', parseInt(e.target.value))}
                  className="w-full"
                  min="0"
                  max="100"
                />
              </div>
            )}
            {(state.overlayTypes || []).includes('rgb') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-400">색상 분리 강도</label>
                  <span className="text-sm font-medium text-indigo-400">{state.rgbStrength}%</span>
                </div>
                <input
                  type="range"
                  value={state.rgbStrength}
                  onChange={(e) => updateState('rgbStrength', parseInt(e.target.value))}
                  className="w-full"
                  min="0"
                  max="100"
                />
              </div>
            )}
            {(state.overlayTypes || []).includes('pulse') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-400">박자 반응 강도</label>
                  <span className="text-sm font-medium text-indigo-400">{state.pulseStrength}%</span>
                </div>
                <input
                  type="range"
                  value={state.pulseStrength}
                  onChange={(e) => updateState('pulseStrength', parseInt(e.target.value))}
                  className="w-full"
                  min="0"
                  max="100"
                />
              </div>
            )}
            {(state.overlayTypes || []).includes('shake') && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm font-medium text-zinc-400">흔들림 강도</label>
                  <span className="text-sm font-medium text-indigo-400">{state.shakeStrength}%</span>
                </div>
                <input
                  type="range"
                  value={state.shakeStrength}
                  onChange={(e) => updateState('shakeStrength', parseInt(e.target.value))}
                  className="w-full"
                  min="0"
                  max="100"
                />
              </div>
            )}
          </div>
        )}
      </CollapsibleSection>

      {/* 스타일 파티클 섹션 */}
      <CollapsibleSection
        title="스타일 파티클"
        isOpen={openSections.particle}
        onToggle={() => toggleSection('particle')}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-2 gap-3">
          {PARTICLES.map((particle) => (
            <button
              key={particle.id}
              onClick={() => toggleParticle(particle.id)}
              className={`py-3 px-4 rounded-lg text-sm font-semibold transition-all ${
                (state.particleTypes || []).includes(particle.id)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {particle.label}
            </button>
          ))}
        </div>

        {(state.particleTypes || []).length > 0 && (
          <div className="space-y-4 pt-3">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-400">입자 생성 밀도</label>
                <span className="text-sm font-medium text-indigo-400">{state.particleDensity}%</span>
              </div>
              <input
                type="range"
                value={state.particleDensity}
                onChange={(e) => updateState('particleDensity', parseInt(e.target.value))}
                className="w-full"
                min="0"
                max="100"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-400">입자 투명도</label>
                <span className="text-sm font-medium text-indigo-400">{state.particleOpacity}%</span>
              </div>
              <input
                type="range"
                value={state.particleOpacity}
                onChange={(e) => updateState('particleOpacity', parseInt(e.target.value))}
                className="w-full"
                min="0"
                max="100"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-400">이동 속도</label>
                <span className="text-sm font-medium text-indigo-400">{state.particleSpeed}%</span>
              </div>
              <input
                type="range"
                value={state.particleSpeed}
                onChange={(e) => updateState('particleSpeed', parseInt(e.target.value))}
                className="w-full"
                min="10"
                max="300"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-zinc-400">입자 크기</label>
                <span className="text-sm font-medium text-indigo-400">{state.particleSize}%</span>
              </div>
              <input
                type="range"
                value={state.particleSize}
                onChange={(e) => updateState('particleSize', parseInt(e.target.value))}
                className="w-full"
                min="50"
                max="300"
              />
            </div>
          </div>
        )}
      </CollapsibleSection>

      {/* 효과 컬러 섹션 (파티클용) */}
      <CollapsibleSection
        title="효과 컬러"
        isOpen={openSections.effectColor}
        onToggle={() => toggleSection('effectColor')}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-4 gap-3">
          {DEFAULT_COLORS.slice(0, 8).map(color => (
            <button
              key={color}
              onClick={() => updateState('particleColor', color)}
              className={`w-full aspect-square rounded-lg transition-all hover:scale-105 ${
                state.particleColor === color ? 'ring-2 ring-indigo-500' : ''
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="rounded-lg p-4 flex items-center justify-between bg-zinc-800/60 border border-zinc-700">
          <span className="text-sm font-semibold uppercase tracking-wide text-zinc-400">HEX</span>
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold tabular-nums tracking-tight uppercase text-zinc-300">{state.particleColor}</span>
            <input
              type="color"
              value={state.particleColor}
              onChange={(e) => updateState('particleColor', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer"
            />
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
};

export default EditorLeftPanel;
