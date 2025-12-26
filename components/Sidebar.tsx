
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
    <aside className={`w-[180px] h-full flex flex-col pt-3 pb-6 px-4 border-r transition-colors ${
      isDarkMode
        ? 'bg-[#09090b] border-zinc-800/50'
        : 'bg-white border-zinc-200'
    }`}>
      {/* 로고 */}
      <div className="mb-3 flex justify-center">
        <AicrewLogo isDarkMode={isDarkMode} />
      </div>

      {/* 메뉴 버튼들 */}
      <nav className="flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'project'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : isDarkMode
                ? 'text-zinc-300 hover:bg-zinc-800/50'
                : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <CirclePlus className="w-5 h-5" />
          새프로젝트
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
            activeTab === 'editor'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : isDarkMode
                ? 'text-zinc-300 hover:bg-zinc-800/50'
                : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <LayoutGrid className="w-5 h-5" />
          편집 스튜디오
        </button>

        <button
          onClick={onExportClick}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[13px] font-semibold transition-all ${
            isDarkMode
              ? 'text-zinc-300 hover:bg-zinc-800/50'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <Upload className="w-5 h-5" />
          내보내기
        </button>
      </nav>

      {/* AdSense 광고 영역 */}
      <div className="flex-1 flex flex-col mt-4 min-h-0">
        <p className={`text-[9px] text-center mb-2 flex-shrink-0 ${
          isDarkMode ? 'text-zinc-600' : 'text-zinc-400'
        }`}>
          광고
        </p>
        <div className={`flex-1 rounded-xl overflow-hidden min-h-[300px] max-h-[600px] ${
          isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-100'
        }`}>
          <ins className="adsbygoogle"
            style={{ display: 'block', width: '100%', height: '100%' }}
            data-ad-client="ca-pub-2764784359698938"
            data-ad-slot="7217586018"
            data-ad-format="vertical"
            data-full-width-responsive="false"
          />
        </div>
      </div>

      {/* 하단: 다크모드 토글 + 도움말 */}
      <div className={`flex items-center justify-between gap-2 pt-4 mt-4 border-t ${
        isDarkMode ? 'border-zinc-800' : 'border-zinc-200'
      }`}>
        {/* 다크모드 토글 */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            isDarkMode ? 'bg-indigo-600' : 'bg-zinc-300'
          }`}
        >
          <div
            className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${
              isDarkMode ? 'translate-x-7' : 'translate-x-1'
            }`}
          >
            {isDarkMode ? (
              <Moon className="w-2.5 h-2.5 text-indigo-600" />
            ) : (
              <Sun className="w-2.5 h-2.5 text-amber-500" />
            )}
          </div>
        </button>

        {/* 도움말 버튼 */}
        <button
          onClick={onHelpClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
            isDarkMode
              ? 'border-zinc-700 text-zinc-400 hover:bg-zinc-800'
              : 'border-zinc-300 text-zinc-500 hover:bg-zinc-100'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          도움말
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
