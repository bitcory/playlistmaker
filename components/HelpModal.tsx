
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
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 모달 콘텐츠 */}
      <div className={`relative w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden ${
        isDarkMode ? 'bg-zinc-900' : 'bg-white'
      }`}>
        {/* 헤더 */}
        <div className={`flex items-center justify-between p-5 border-b ${
          isDarkMode ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-2">
            <HelpCircle className={`w-5 h-5 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
            <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-zinc-900'}`}>
              사용 가이드
            </h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-zinc-800 text-zinc-400' : 'hover:bg-zinc-100 text-zinc-500'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-5 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* 1. 미디어 업로드 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Upload className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h3 className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                1. 미디어 업로드
              </h3>
            </div>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              MP3, WAV 등의 오디오 파일과 1920x1080 해상도의 배경 이미지를 업로드하세요.
              업로드된 리스트에서 화살표 버튼을 이용해 재생 순서를 변경할 수 있습니다.
            </p>
          </section>

          {/* 2. 편집 스튜디오 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h3 className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                2. 편집 스튜디오
              </h3>
            </div>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              오디오 스펙트럼 비주얼라이저의 종류, 색상, 위치를 자유롭게 조정하세요.
              '비주얼 스타일' 탭에서 다양한 효과(물방울, 반짝임)와 필터를 적용하여 영상의 분위기를 연출할 수 있습니다.
            </p>
          </section>

          {/* 3. 내보내기 */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <FileOutput className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h3 className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                3. 내보내기
              </h3>
            </div>
            <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
              모든 설정이 완료되면 '비디오 내보내기' 버튼을 눌러 MP4 파일로 렌더링합니다.
              브라우저 내에서 고속 인코딩(WebCodecs)이 진행되며, 완료 후 파일을 다운로드할 수 있습니다.
            </p>
          </section>

          {/* 4. 권장 사용 환경 */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Monitor className={`w-4 h-4 ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`} />
              <h3 className={`font-bold ${isDarkMode ? 'text-indigo-400' : 'text-indigo-600'}`}>
                4. 권장 사용 환경
              </h3>
            </div>

            <div className={`rounded-xl p-4 space-y-3 ${
              isDarkMode ? 'bg-zinc-800/50' : 'bg-indigo-50'
            }`}>
              {/* 안내 문구 */}
              <div className={`flex items-start gap-2 pb-3 border-b ${
                isDarkMode ? 'border-zinc-700' : 'border-indigo-200'
              }`}>
                <Info className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? 'text-indigo-400' : 'text-indigo-600'
                }`} />
                <p className={`text-xs font-medium ${
                  isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
                }`}>
                  이 앱은 서버가 아닌 사용자의 PC에서 직접 작동합니다.
                </p>
              </div>

              {/* RAM */}
              <div className="flex items-start gap-2">
                <HardDrive className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                }`} />
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    RAM (메모리)
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    최소 8GB, 권장 16GB 이상 (긴 영상 렌더링 시 브라우저 메모리 사용량이 높습니다)
                  </p>
                </div>
              </div>

              {/* GPU */}
              <div className="flex items-start gap-2">
                <Cpu className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                }`} />
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    GPU (그래픽카드)
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    WebCodecs 하드웨어 가속을 위한 외장 그래픽 권장 (NVIDIA/AMD)
                  </p>
                </div>
              </div>

              {/* 브라우저 */}
              <div className="flex items-start gap-2">
                <Globe className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
                  isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                }`} />
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>
                    브라우저
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                    최신 버전의 Chrome, Edge, Whale (WebCodecs 지원 필수)
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* 푸터 */}
        <div className={`p-5 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
          >
            알겠습니다
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
