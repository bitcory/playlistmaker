
import React from 'react';
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

const AicrewLogo: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => (
  <img
    src="/aicrew-logo.png"
    alt="Aicrew"
    className={`w-full h-auto object-contain transition-all ${
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
  return (
    <aside className={`w-[180px] h-full flex flex-col pt-4 pb-6 px-3 border-r transition-colors ${
      isDarkMode
        ? 'bg-zinc-950 border-zinc-800'
        : 'bg-white border-zinc-200'
    }`}>
      {/* Logo */}
      <div className="mb-6">
        <AicrewLogo isDarkMode={isDarkMode} />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2">
        <button
          onClick={() => setActiveTab('project')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'project'
              ? isDarkMode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : isDarkMode
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <CirclePlus className="w-4 h-4" />
          프로젝트
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            activeTab === 'editor'
              ? isDarkMode
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
              : isDarkMode
                ? 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          스튜디오
        </button>

        <button
          onClick={onExportClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
            isDarkMode
              ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
              : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
          }`}
        >
          <Upload className="w-4 h-4" />
          내보내기
        </button>
      </nav>

      <div className="flex-1" />

      {/* Bottom controls */}
      <div className={`flex items-center justify-between gap-2 pt-4 mt-4 border-t ${
        isDarkMode ? 'border-zinc-800' : 'border-zinc-200'
      }`}>
        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`relative w-12 h-7 rounded-full transition-colors ${
            isDarkMode ? 'bg-indigo-600' : 'bg-zinc-300'
          }`}
        >
          <div
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${
              isDarkMode ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          >
            {isDarkMode ? (
              <Moon className="w-3.5 h-3.5 text-indigo-600" />
            ) : (
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            )}
          </div>
        </button>

        {/* Help */}
        <button
          onClick={onHelpClick}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isDarkMode
              ? 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
              : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <HelpCircle className="w-5 h-5" />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
