
import React from 'react';
import {
  X,
  HelpCircle,
  Upload,
  BarChart3,
  FileOutput,
  Monitor,
  Info,
  HardDrive,
  Cpu,
  Globe
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, isDarkMode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 배경 오버레이 */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 - 네오브루탈 */}
      <div
        className={`relative w-full max-w-lg rounded-lg overflow-hidden border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] ${
          isDarkMode ? 'bg-zinc-800' : 'bg-white'
        }`}
        style={{ borderWidth: '4px' }}
      >
        {/* 헤더 - 네오브루탈 */}
        <div className="flex items-center justify-between p-4 bg-violet-500 border-b-4 border-black">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-white" />
            <h2 className="text-lg font-black text-white uppercase">HELP GUIDE</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 1. 미디어 업로드 */}
          <section
            className={`p-4 rounded-lg border-black ${isDarkMode ? 'bg-zinc-700' : 'bg-amber-50'}`}
            style={{ borderWidth: '2px' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center bg-cyan-400 text-black font-black text-xs rounded border-2 border-black">1</span>
              <h3 className="font-black uppercase">UPLOAD</h3>
            </div>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
              MP3, WAV 등의 오디오 파일과 1920x1080 해상도의 배경 이미지를 업로드하세요.
              화살표 버튼으로 재생 순서를 변경할 수 있습니다.
            </p>
          </section>

          {/* 2. 편집 스튜디오 */}
          <section
            className={`p-4 rounded-lg border-black ${isDarkMode ? 'bg-zinc-700' : 'bg-lime-50'}`}
            style={{ borderWidth: '2px' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center bg-lime-400 text-black font-black text-xs rounded border-2 border-black">2</span>
              <h3 className="font-black uppercase">STUDIO</h3>
            </div>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
              오디오 스펙트럼 비주얼라이저의 종류, 색상, 위치를 자유롭게 조정하세요.
              다양한 효과와 필터로 영상의 분위기를 연출할 수 있습니다.
            </p>
          </section>

          {/* 3. 내보내기 */}
          <section
            className={`p-4 rounded-lg border-black ${isDarkMode ? 'bg-zinc-700' : 'bg-pink-50'}`}
            style={{ borderWidth: '2px' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center bg-pink-500 text-white font-black text-xs rounded border-2 border-black">3</span>
              <h3 className="font-black uppercase">EXPORT</h3>
            </div>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
              모든 설정이 완료되면 '비디오 내보내기' 버튼을 눌러 MP4 파일로 렌더링합니다.
              브라우저 내에서 고속 인코딩이 진행됩니다.
            </p>
          </section>

          {/* 4. 권장 사용 환경 */}
          <section
            className={`p-4 rounded-lg border-black ${isDarkMode ? 'bg-zinc-900' : 'bg-indigo-50'}`}
            style={{ borderWidth: '2px' }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 flex items-center justify-center bg-indigo-500 text-white font-black text-xs rounded border-2 border-black">!</span>
              <h3 className="font-black uppercase">REQUIREMENTS</h3>
            </div>

            <div className="space-y-3">
              {/* 안내 문구 */}
              <div className="flex items-start gap-2 pb-3 border-b-2 border-black">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-500" />
                <p className={`text-xs font-bold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                  이 앱은 서버가 아닌 사용자의 PC에서 직접 작동합니다.
                </p>
              </div>

              {/* RAM */}
              <div className="flex items-start gap-2">
                <HardDrive className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                <div>
                  <p className={`text-xs font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>RAM</p>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>최소 8GB, 권장 16GB 이상</p>
                </div>
              </div>

              {/* GPU */}
              <div className="flex items-start gap-2">
                <Cpu className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                <div>
                  <p className={`text-xs font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>GPU</p>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>외장 그래픽 권장 (NVIDIA/AMD)</p>
                </div>
              </div>

              {/* 브라우저 */}
              <div className="flex items-start gap-2">
                <Globe className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                <div>
                  <p className={`text-xs font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>BROWSER</p>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>Chrome, Edge, Whale (최신 버전)</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 푸터 - 네오브루탈 */}
        <div className="p-4 border-t-4 border-black">
          <button
            onClick={onClose}
            className="w-full py-3 bg-lime-400 text-black rounded-lg text-sm font-black uppercase border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            style={{ borderWidth: '3px' }}
          >
            GOT IT!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
