
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
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/50">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 bg-zinc-900 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-semibold text-white">Help Guide</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* 1. 미디어 업로드 */}
          <section className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white font-semibold text-xs rounded-full">1</span>
              <h3 className="font-semibold text-white">Upload</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              MP3, WAV 등의 오디오 파일과 1920x1080 해상도의 배경 이미지를 업로드하세요.
              화살표 버튼으로 재생 순서를 변경할 수 있습니다.
            </p>
          </section>

          {/* 2. 편집 스튜디오 */}
          <section className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white font-semibold text-xs rounded-full">2</span>
              <h3 className="font-semibold text-white">Studio</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              오디오 스펙트럼 비주얼라이저의 종류, 색상, 위치를 자유롭게 조정하세요.
              다양한 효과와 필터로 영상의 분위기를 연출할 수 있습니다.
            </p>
          </section>

          {/* 3. 내보내기 */}
          <section className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white font-semibold text-xs rounded-full">3</span>
              <h3 className="font-semibold text-white">Export</h3>
            </div>
            <p className="text-sm leading-relaxed text-zinc-400">
              모든 설정이 완료되면 '비디오 내보내기' 버튼을 눌러 MP4 파일로 렌더링합니다.
              브라우저 내에서 고속 인코딩이 진행됩니다.
            </p>
          </section>

          {/* 4. 권장 사용 환경 */}
          <section className="p-4 rounded-xl bg-zinc-800/50 border border-zinc-700/50">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-6 h-6 flex items-center justify-center bg-indigo-600 text-white font-semibold text-xs rounded-full">!</span>
              <h3 className="font-semibold text-white">Requirements</h3>
            </div>

            <div className="space-y-3">
              {/* 안내 문구 */}
              <div className="flex items-start gap-2 pb-3 border-b border-zinc-700/50">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-indigo-400" />
                <p className="text-xs font-medium text-zinc-300">
                  이 앱은 서버가 아닌 사용자의 PC에서 직접 작동합니다.
                </p>
              </div>

              {/* RAM */}
              <div className="flex items-start gap-2">
                <HardDrive className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-500" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">RAM</p>
                  <p className="text-xs text-zinc-500">최소 8GB, 권장 16GB 이상</p>
                </div>
              </div>

              {/* GPU */}
              <div className="flex items-start gap-2">
                <Cpu className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-500" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">GPU</p>
                  <p className="text-xs text-zinc-500">외장 그래픽 권장 (NVIDIA/AMD)</p>
                </div>
              </div>

              {/* 브라우저 */}
              <div className="flex items-start gap-2">
                <Globe className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-500" />
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Browser</p>
                  <p className="text-xs text-zinc-500">Chrome, Edge, Whale (최신 버전)</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors"
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
