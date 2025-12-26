
import React, { useEffect, useRef } from 'react';
import {
  CirclePlus,
  LayoutGrid,
  Upload,
  HelpCircle,
  Moon,
  Sun
} from 'lucide-react';

interface SidebarProps {
  activeTab: 'project' | 'editor';
  setActiveTab: (tab: 'project' | 'editor') => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
  onHelpClick: () => void;
  onExportClick: () => void;
}

// Aicrew 로고 컴포넌트
const AicrewLogo: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <img
    src="/aicrew-logo.png"
    alt="Aicrew"
    className={`w-28 h-auto object-contain transition-all ${
      isDarkMode ? '' : 'invert'
    }`}
  />
);

const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  setIsDarkMode,
  onHelpClick,
  onExportClick
}) => {
  const adInitialized = useRef(false);

  // AdSense 광고 초기화
  useEffect(() => {
    if (!adInitialized.current) {
      try {
        // @ts-ignore
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        adInitialized.current = true;
      } catch (e) {
        console.log('AdSense error:', e);
      }
    }
  }, []);

  return (
    <aside className={`w-[180px] h-full flex flex-col pt-3 pb-6 px-4 border-r-4 transition-colors ${
      isDarkMode
        ? 'bg-zinc-900 border-black'
        : 'bg-amber-50 border-black'
    }`}>
      {/* 로고 */}
      <div className="mb-3 flex justify-center">
        <AicrewLogo isDarkMode={isDarkMode} />
      </div>

      {/* 메뉴 버튼들 - 네오브루탈 스타일 */}
      <nav className="flex flex-col gap-3">
        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-black uppercase tracking-wide transition-all border-3 ${
            activeTab === 'project'
              ? 'bg-indigo-500 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0 translate-y-0 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
              : isDarkMode
                ? 'bg-zinc-800 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-indigo-600'
                : 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-indigo-100'
          }`}
          style={{ borderWidth: '3px' }}
        >
          <CirclePlus className="w-5 h-5" />
          프로젝트
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-black uppercase tracking-wide transition-all border-3 ${
            activeTab === 'editor'
              ? 'bg-cyan-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0 translate-y-0 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
              : isDarkMode
                ? 'bg-zinc-800 text-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-cyan-400 hover:text-black'
                : 'bg-white text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-cyan-100'
          }`}
          style={{ borderWidth: '3px' }}
        >
          <LayoutGrid className="w-5 h-5" />
          스튜디오
        </button>

        <button
          onClick={onExportClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-[13px] font-black uppercase tracking-wide transition-all ${
            isDarkMode
              ? 'bg-lime-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
              : 'bg-lime-400 text-black border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
          }`}
          style={{ borderWidth: '3px' }}
        >
          <Upload className="w-5 h-5" />
          내보내기
        </button>
      </nav>

      {/* AdSense 광고 영역 - 네오브루탈 프레임 */}
      <div className="flex-1 flex flex-col mt-4 min-h-0">
        <p className={`text-xs text-center mb-2 flex-shrink-0 font-black uppercase ${
          isDarkMode ? 'text-zinc-500' : 'text-zinc-600'
        }`}>
          ADS
        </p>
        <div className={`flex-1 rounded-lg overflow-hidden min-h-[300px] max-h-[600px] border-black ${
          isDarkMode ? 'bg-zinc-800' : 'bg-white'
        }`}
        style={{ borderWidth: '3px' }}
        >
          <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client="ca-pub-2764784359698938"
            data-ad-slot="7217586018"
            data-ad-format="vertical"
            data-full-width-responsive="false"
          />
        </div>
      </div>

      {/* 하단: 다크모드 토글 + 도움말 - 네오브루탈 스타일 */}
      <div className={`flex items-center justify-between gap-2 pt-4 mt-4 border-t-4 ${
        isDarkMode ? 'border-black' : 'border-black'
      }`}>
        {/* 다크모드 토글 - 네오브루탈 */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative w-14 h-8 rounded-lg transition-colors border-black ${
            isDarkMode ? 'bg-indigo-500' : 'bg-amber-300'
          }`}
          style={{ borderWidth: '3px' }}
        >
          <div
            className={`absolute top-0.5 w-5 h-5 rounded bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform flex items-center justify-center ${
              isDarkMode ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          >
            {isDarkMode ? (
              <Moon className="w-3 h-3 text-indigo-600" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </button>

        {/* 도움말 버튼 - 네오브루탈 */}
        <button
          onClick={onHelpClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-black uppercase border-black transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] ${
            isDarkMode
              ? 'bg-pink-500 text-white'
              : 'bg-pink-400 text-black'
          }`}
          style={{ borderWidth: '2px' }}
        >
          <HelpCircle className="w-4 h-4" />
          HELP
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
