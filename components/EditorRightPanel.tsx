
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { EditorState, ColorMode } from '../types';
import { DEFAULT_COLORS } from '../constants';

const COLOR_MODES: { id: ColorMode; label: string }[] = [
  { id: 'solid', label: '단색' },
  { id: 'gradient', label: '그라디언트' },
  { id: 'rainbow', label: '레인보우' },
];

interface EditorRightPanelProps {
  state: EditorState;
  updateState: (key: keyof EditorState, value: any) => void;
  isDarkMode?: boolean;
}

// 접을 수 있는 섹션 컴포넌트
const CollapsibleSection: React.FC<{
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  isDarkMode?: boolean;
}> = ({ title, isOpen, onToggle, children, isDarkMode = true }) => (
  <section className={`border rounded-xl overflow-hidden ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
    <button
      onClick={onToggle}
      className={`w-full flex items-center justify-between p-4 transition-colors ${
        isDarkMode ? 'hover:bg-zinc-900/50' : 'hover:bg-zinc-100'
      }`}
    >
      <h3 className={`text-[10px] font-bold uppercase tracking-widest ${isDarkMode ? 'text-zinc-200' : 'text-zinc-700'}`}>{title}</h3>
      <ChevronDown
        className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}
      />
    </button>
    <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
      <div className="p-4 pt-0 space-y-4">
        {children}
      </div>
    </div>
  </section>
);

const EditorRightPanel: React.FC<EditorRightPanelProps> = ({ state, updateState, isDarkMode = true }) => {
  // 각 섹션의 열림/닫힘 상태 (디폴트: 모두 닫힘)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    logo: false,
    spectrum: false,
    colorMode: false,
    mainColor: false,
    subColor: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  return (
    <div className="p-4 space-y-3 overflow-y-auto">
      {/* 채널 로고 배치 섹션 */}
      <CollapsibleSection
        title="채널 로고 배치"
        isOpen={openSections.logo}
        onToggle={() => toggleSection('logo')}
        isDarkMode={isDarkMode}
      >
        <div className="space-y-4">
          {/* X/Y 위치 */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">X 위치</label>
                <span className="text-[9px] text-indigo-400 font-bold">{Math.round(state.logoPos.x)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(state.logoPos.x)}
                onChange={(e) => updateState('logoPos', { ...state.logoPos, x: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">Y 위치</label>
                <span className="text-[9px] text-indigo-400 font-bold">{Math.round(state.logoPos.y)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(state.logoPos.y)}
                onChange={(e) => updateState('logoPos', { ...state.logoPos, y: Number(e.target.value) })}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>

          {/* 로고 크기 */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-[9px] text-zinc-300 font-medium">로고 크기</label>
              <span className="text-[9px] text-indigo-400 font-bold">{Math.round(state.logoSize)}PX</span>
            </div>
            <input
              type="range"
              min="30"
              max="500"
              value={Math.round(state.logoSize)}
              onChange={(e) => updateState('logoSize', Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* 로고 배경 제거 체크박스 */}
          <div className="flex items-center justify-between py-2 border-t border-zinc-800">
            <label className="text-[9px] text-zinc-300 font-medium">로고 배경 제거</label>
            <button
              onClick={() => updateState('removeLogoBg', !state.removeLogoBg)}
              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                state.removeLogoBg
                  ? 'bg-indigo-600 border-indigo-500'
                  : 'bg-transparent border-zinc-600'
              }`}
            >
              {state.removeLogoBg && (
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* 제거 오차 - 배경 제거가 활성화된 경우에만 표시 */}
          {state.removeLogoBg && (
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">제거 오차</label>
                <span className="text-[9px] text-indigo-400 font-bold">{Math.round(state.logoBgThreshold)}%</span>
              </div>
              <input
                type="range"
                min="50"
                max="100"
                value={Math.round(state.logoBgThreshold)}
                onChange={(e) => updateState('logoBgThreshold', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* 스펙트럼 배치 및 크기 섹션 - 스타일이 none이 아닐 때만 표시 */}
      {state.visualStyle !== 'none' && (
        <CollapsibleSection
          title="스펙트럼 배치 및 크기"
          isOpen={openSections.spectrum}
          onToggle={() => toggleSection('spectrum')}
          isDarkMode={isDarkMode}
        >
          <div className="space-y-4">
            {/* 정중앙 정렬 체크박스 */}
            <div className="flex items-center justify-between">
              <label className="text-[9px] text-zinc-300 font-medium">정중앙 정렬</label>
              <button
                onClick={() => updateState('spectrumPos', {
                  ...state.spectrumPos,
                  centered: !state.spectrumPos.centered,
                  x: !state.spectrumPos.centered ? 50 : state.spectrumPos.x,
                  y: state.spectrumPos.y
                })}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  state.spectrumPos.centered
                    ? 'bg-indigo-600 border-indigo-500'
                    : 'bg-transparent border-zinc-600'
                }`}
              >
                {state.spectrumPos.centered && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* X/Y 위치 */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[9px] text-zinc-300 font-medium">X 위치</label>
                  <span className="text-[9px] text-indigo-400 font-bold">{Math.round(state.spectrumPos.x)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(state.spectrumPos.x)}
                  onChange={(e) => updateState('spectrumPos', { ...state.spectrumPos, x: Number(e.target.value), centered: false })}
                  disabled={state.spectrumPos.centered}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 disabled:opacity-50"
                />
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-[9px] text-zinc-300 font-medium">Y 위치</label>
                  <span className="text-[9px] text-indigo-400 font-bold">{Math.round(state.spectrumPos.y)}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={Math.round(state.spectrumPos.y)}
                  onChange={(e) => updateState('spectrumPos', { ...state.spectrumPos, y: Number(e.target.value) })}
                  className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>

            {/* 전체 폭 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">전체 폭 (WIDTH)</label>
                <span className="text-[9px] text-indigo-400 font-bold">{Math.round(state.spectrumWidth)}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={Math.round(state.spectrumWidth)}
                onChange={(e) => updateState('spectrumWidth', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* 반응 속도 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">반응 속도</label>
                <span className="text-[9px] text-indigo-400 font-bold">{state.spectrumSpeed}</span>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={state.spectrumSpeed}
                onChange={(e) => updateState('spectrumSpeed', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* 반응 민감도 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">반응 민감도</label>
                <span className="text-[9px] text-indigo-400 font-bold">{state.spectrumSensitivity}</span>
              </div>
              <input
                type="range"
                min="20"
                max="200"
                value={state.spectrumSensitivity}
                onChange={(e) => updateState('spectrumSensitivity', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* 주파수 대역 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">주파수 대역</label>
                <span className="text-[9px] text-indigo-400 font-bold">{state.spectrumBands}</span>
              </div>
              <input
                type="range"
                min="16"
                max="256"
                value={state.spectrumBands}
                onChange={(e) => updateState('spectrumBands', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* 최대 높이 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">최대 높이</label>
                <span className="text-[9px] text-indigo-400 font-bold">{state.spectrumMaxHeight}</span>
              </div>
              <input
                type="range"
                min="10"
                max="200"
                value={state.spectrumMaxHeight}
                onChange={(e) => updateState('spectrumMaxHeight', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* 선 두께 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">선 두께</label>
                <span className="text-[9px] text-indigo-400 font-bold">{state.spectrumThickness}</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={state.spectrumThickness}
                onChange={(e) => updateState('spectrumThickness', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* 투명도 */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-[9px] text-zinc-300 font-medium">투명도</label>
                <span className="text-[9px] text-indigo-400 font-bold">{state.spectrumOpacity}</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={state.spectrumOpacity}
                onChange={(e) => updateState('spectrumOpacity', Number(e.target.value))}
                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>
          </div>
        </CollapsibleSection>
      )}

      {/* 컬러 모드 섹션 */}
      <CollapsibleSection
        title="컬러 모드"
        isOpen={openSections.colorMode}
        onToggle={() => toggleSection('colorMode')}
        isDarkMode={isDarkMode}
      >
        <div className="flex gap-2">
          {COLOR_MODES.map((mode) => (
            <button
              key={mode.id}
              onClick={() => updateState('colorMode', mode.id)}
              className={`flex-1 py-2.5 rounded-lg text-[9px] font-bold transition-all border ${
                state.colorMode === mode.id
                  ? 'bg-indigo-600 text-white border-indigo-500'
                  : 'bg-transparent border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* 메인 컬러 섹션 */}
      <CollapsibleSection
        title={state.colorMode === 'rainbow' ? '브랜드 컬러' : '메인 컬러'}
        isOpen={openSections.mainColor}
        onToggle={() => toggleSection('mainColor')}
        isDarkMode={isDarkMode}
      >
        <div className="grid grid-cols-4 gap-2">
          {DEFAULT_COLORS.slice(0, 16).map(color => (
            <button
              key={color}
              onClick={() => updateState('effectColor', color)}
              className={`w-full aspect-square rounded-lg transition-all hover:scale-105 ${state.effectColor === color ? 'ring-2 ring-offset-2 ring-offset-[#121214] ring-white' : ''}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">HEX</span>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black tabular-nums tracking-tighter uppercase">{state.effectColor}</span>
            <input
              type="color"
              value={state.effectColor}
              onChange={(e) => updateState('effectColor', e.target.value)}
              className="w-5 h-5 rounded cursor-pointer border border-zinc-700"
            />
          </div>
        </div>
      </CollapsibleSection>

      {/* 서브 컬러 섹션 - 그라디언트 모드일 때만 표시 */}
      {state.colorMode === 'gradient' && (
        <CollapsibleSection
          title="서브 컬러"
          isOpen={openSections.subColor}
          onToggle={() => toggleSection('subColor')}
          isDarkMode={isDarkMode}
        >
          <div className="grid grid-cols-4 gap-2">
            {DEFAULT_COLORS.slice(0, 16).map(color => (
              <button
                key={`sec-${color}`}
                onClick={() => updateState('secondaryColor', color)}
                className={`w-full aspect-square rounded-lg transition-all hover:scale-105 ${state.secondaryColor === color ? 'ring-2 ring-offset-2 ring-offset-[#121214] ring-white' : ''}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
            <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">HEX</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black tabular-nums tracking-tighter uppercase">{state.secondaryColor}</span>
              <input
                type="color"
                value={state.secondaryColor}
                onChange={(e) => updateState('secondaryColor', e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border border-zinc-700"
              />
            </div>
          </div>
        </CollapsibleSection>
      )}
    </div>
  );
};

export default EditorRightPanel;
