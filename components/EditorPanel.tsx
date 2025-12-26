
import React from 'react';
import { EditorState } from '../types';
import { VISUAL_STYLES, FILTERS, OVERLAYS, PARTICLES, DEFAULT_COLORS } from '../constants';

interface EditorPanelProps {
  state: EditorState;
  updateState: (key: keyof EditorState, value: any) => void;
}

const EditorPanel: React.FC<EditorPanelProps> = ({ state, updateState }) => {
  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-left-4 pb-20">
      {/* Visual Style Grid */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 mb-4">비주얼 스타일</h3>
        <div className="grid grid-cols-2 gap-3">
          {VISUAL_STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => updateState('visualStyle', style.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${state.visualStyle === style.id ? 'bg-indigo-600 border-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.3)]' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
            >
              <span className="text-2xl mb-2">{style.icon}</span>
              <span className="text-[11px] font-bold">{style.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Filter / Vignette */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 mb-4">배경 필터 & 비네팅</h3>
        <div className="grid grid-cols-2 gap-2 mb-6">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => updateState('filterType', filter.id)}
              className={`py-3 rounded-lg text-[11px] font-bold border transition-all ${state.filterType === filter.id ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-slate-500">필터 강도</label>
              <span className="text-xs text-indigo-400 font-mono">{state.filterStrength}%</span>
            </div>
            <input 
              type="range" value={state.filterStrength} onChange={(e) => updateState('filterStrength', parseInt(e.target.value))} 
              className="w-full" min="0" max="100"
            />
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-xs font-medium text-slate-500">비네팅 세기</label>
              <span className="text-xs text-indigo-400 font-mono">{state.vignetteStrength}%</span>
            </div>
            <input 
              type="range" value={state.vignetteStrength} onChange={(e) => updateState('vignetteStrength', parseInt(e.target.value))} 
              className="w-full" min="0" max="100"
            />
          </div>
        </div>
      </section>

      {/* Overlay Effects */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 mb-4">트랜디 오버레이</h3>
        <div className="grid grid-cols-2 gap-3">
          {OVERLAYS.map((overlay) => (
            <button
              key={overlay.id}
              onClick={() => updateState('overlayType', state.overlayType === overlay.id ? null : overlay.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${state.overlayType === overlay.id ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
            >
              <span className="text-xl mb-1">{overlay.icon}</span>
              <span className="text-[11px] font-bold">{overlay.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Particle Effects */}
      <section>
        <h3 className="text-sm font-bold text-slate-400 mb-4">스타일 파티클</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {PARTICLES.map((p) => (
            <button
              key={p.id}
              onClick={() => updateState('particleType', p.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${state.particleType === p.id ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'}`}
            >
              <span className="text-xl mb-1">{p.icon}</span>
              <span className="text-[11px] font-bold">{p.label}</span>
            </button>
          ))}
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">입자 생성 밀도</label>
              <span className="text-[10px] text-indigo-400 font-mono">{state.particleDensity}%</span>
            </div>
            <input type="range" value={state.particleDensity} onChange={(e) => updateState('particleDensity', parseInt(e.target.value))} className="w-full" min="0" max="100" />
          </div>
          <div>
            <div className="flex justify-between mb-1">
              <label className="text-[10px] text-slate-500 font-bold uppercase">이동 속도</label>
              <span className="text-[10px] text-indigo-400 font-mono">{state.particleSpeed}%</span>
            </div>
            <input type="range" value={state.particleSpeed} onChange={(e) => updateState('particleSpeed', parseInt(e.target.value))} className="w-full" min="0" max="300" />
          </div>
        </div>
      </section>

      {/* Layout / Logo Adjust */}
      <section className="bg-slate-900/40 p-4 rounded-2xl border border-slate-700">
        <h3 className="text-sm font-bold italic mb-4">레이아웃 조정</h3>
        <div className="space-y-4">
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] text-slate-500 font-bold mb-1">X 위치 ({state.logoPos.x}%)</label>
               <input type="range" value={state.logoPos.x} onChange={(e) => updateState('logoPos', { ...state.logoPos, x: parseInt(e.target.value) })} className="w-full" min="0" max="100" />
             </div>
             <div>
               <label className="block text-[10px] text-slate-500 font-bold mb-1">Y 위치 ({state.logoPos.y}%)</label>
               <input type="range" value={state.logoPos.y} onChange={(e) => updateState('logoPos', { ...state.logoPos, y: parseInt(e.target.value) })} className="w-full" min="0" max="100" />
             </div>
           </div>
           <div>
             <label className="block text-[10px] text-slate-500 font-bold mb-1">로고 크기 ({state.logoSize}PX)</label>
             <input type="range" value={state.logoSize} onChange={(e) => updateState('logoSize', parseInt(e.target.value))} className="w-full" min="50" max="300" />
           </div>
        </div>

        <div className="mt-8">
           <h3 className="text-xs font-bold text-slate-500 mb-4 uppercase">사용자 지정 컬러 팔레트</h3>
           <div className="grid grid-cols-5 gap-2">
             {DEFAULT_COLORS.map(color => (
               <button 
                key={color} 
                onClick={() => updateState('effectColor', color)}
                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${state.effectColor === color ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
               />
             ))}
           </div>
           <div className="mt-4 flex items-center gap-4 bg-slate-900 rounded-lg p-2 border border-slate-800">
             <div className="w-8 h-8 rounded bg-white" style={{ backgroundColor: state.effectColor }} />
             <input 
              type="text" 
              value={state.effectColor} 
              onChange={(e) => updateState('effectColor', e.target.value)}
              className="bg-transparent text-xs font-mono uppercase focus:outline-none flex-1"
             />
           </div>
        </div>
      </section>

      {/* Spectrum Detailed Settings */}
      <section className="bg-slate-900/40 p-4 rounded-2xl border border-slate-700">
        <h3 className="text-sm font-bold italic mb-4">스펙트럼 배치 및 크기</h3>
        <div className="space-y-6">
           <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-[10px] text-slate-500 font-bold mb-1">X 위치 ({state.spectrumPos.x}%)</label>
               <input type="range" value={state.spectrumPos.x} onChange={(e) => updateState('spectrumPos', { ...state.spectrumPos, x: parseInt(e.target.value) })} className="w-full" min="0" max="100" />
             </div>
             <div>
               <label className="block text-[10px] text-slate-500 font-bold mb-1">Y 위치 ({state.spectrumPos.y}%)</label>
               <input type="range" value={state.spectrumPos.y} onChange={(e) => updateState('spectrumPos', { ...state.spectrumPos, y: parseInt(e.target.value) })} className="w-full" min="0" max="100" />
             </div>
           </div>
           <div>
             <label className="block text-[10px] text-slate-500 font-bold mb-1">반응 민감도 ({state.spectrumSensitivity})</label>
             <input type="range" value={state.spectrumSensitivity} onChange={(e) => updateState('spectrumSensitivity', parseInt(e.target.value))} className="w-full" min="0" max="255" />
           </div>
           <div>
             <label className="block text-[10px] text-slate-500 font-bold mb-1">최대 높이 ({state.spectrumMaxHeight})</label>
             <input type="range" value={state.spectrumMaxHeight} onChange={(e) => updateState('spectrumMaxHeight', parseInt(e.target.value))} className="w-full" min="1" max="100" />
           </div>
        </div>
      </section>
    </div>
  );
};

export default EditorPanel;
