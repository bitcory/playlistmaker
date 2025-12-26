
import React, { useState, useRef, useEffect } from 'react';
import { X, Download, Loader2, CheckCircle, AlertCircle, Rocket, Clapperboard } from 'lucide-react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  audioFile: File | null;
  duration: number;
  repeatCount: 1 | 2 | 3;
  audioBitrate: '96kbps' | '128kbps' | '192kbps';
}

type ExportStatus = 'idle' | 'preparing' | 'recording' | 'processing' | 'complete' | 'error';

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  isDarkMode,
  canvasRef,
  audioRef,
  audioFile,
  duration,
  repeatCount,
  audioBitrate
}) => {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  const [quality, setQuality] = useState<'standard' | 'high'>('high');
  const [currentRepeat, setCurrentRepeat] = useState(1);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const abortRef = useRef(false);

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle');
      setProgress(0);
      setStatusMessage('');
      setErrorMessage('');
      setCurrentRepeat(1);
      abortRef.current = false;
    }
  }, [isOpen]);

  // 오디오 비트레이트를 숫자로 변환
  const getAudioBitsPerSecond = () => {
    switch (audioBitrate) {
      case '96kbps': return 96000;
      case '128kbps': return 128000;
      case '192kbps': return 192000;
      default: return 128000;
    }
  };

  // 총 녹화 시간 (반복 포함)
  const totalDuration = duration * repeatCount;

  const handleExport = async () => {
    if (!canvasRef.current || !audioFile) {
      setStatus('error');
      setErrorMessage('오디오 파일과 캔버스가 필요합니다.');
      return;
    }

    try {
      setStatus('preparing');
      setProgress(0);
      setStatusMessage('녹화 준비 중...');
      abortRef.current = false;
      chunksRef.current = [];

      const canvas = canvasRef.current;

      // 내보내기용 별도의 오디오 엘리먼트 생성
      const exportAudio = new Audio();
      exportAudio.src = URL.createObjectURL(audioFile);
      await new Promise((resolve) => {
        exportAudio.onloadedmetadata = resolve;
      });

      // 캔버스 스트림 생성
      const fps = quality === 'high' ? 60 : 30;
      const videoBitrate = quality === 'high' ? 8000000 : 4000000;

      // @ts-ignore
      const canvasStream: MediaStream = canvas.captureStream(fps);

      // 오디오 컨텍스트 생성 및 오디오 스트림 획득
      const audioContext = new AudioContext();
      const source = audioContext.createMediaElementSource(exportAudio);
      const destination = audioContext.createMediaStreamDestination();
      source.connect(destination);

      // 비디오와 오디오 스트림 합치기
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...destination.stream.getAudioTracks()
      ]);

      // MediaRecorder 설정 (WebM)
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus')
        ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')
          ? 'video/webm;codecs=vp8,opus'
          : 'video/webm';

      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType,
        videoBitsPerSecond: videoBitrate,
        audioBitsPerSecond: getAudioBitsPerSecond()
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (abortRef.current) {
          setStatus('idle');
          return;
        }

        setStatus('processing');
        setStatusMessage('파일 생성 중...');
        setProgress(95);

        try {
          const blob = new Blob(chunksRef.current, { type: mimeType });

          // 다운로드
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `visualizer_${Date.now()}.webm`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);

          setProgress(100);
          setStatus('complete');
        } catch (err) {
          console.error('Processing error:', err);
          setStatus('error');
          setErrorMessage('파일 생성 중 오류가 발생했습니다.');
        }

        // 정리
        audioContext.close();
      };

      mediaRecorder.onerror = (e) => {
        console.error('MediaRecorder error:', e);
        setStatus('error');
        setErrorMessage('녹화 중 오류가 발생했습니다.');
        audioContext.close();
        URL.revokeObjectURL(exportAudio.src);
      };

      // 녹화 시작
      setStatus('recording');
      setStatusMessage('영상 녹화 중...');

      // 메인 오디오도 리셋하고 재생
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => {});
      }

      exportAudio.currentTime = 0;
      mediaRecorder.start(100);
      await exportAudio.play();

      let currentLoop = 1;

      // 진행률 업데이트
      const progressInterval = setInterval(() => {
        if (exportAudio && totalDuration > 0) {
          const elapsedInCurrentLoop = exportAudio.currentTime;
          const totalElapsed = (currentLoop - 1) * duration + elapsedInCurrentLoop;
          const currentProgress = (totalElapsed / totalDuration) * 90;
          setProgress(Math.min(currentProgress, 90));
          setCurrentRepeat(currentLoop);
        }
      }, 100);

      const cleanup = () => {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
        }
        URL.revokeObjectURL(exportAudio.src);
      };

      exportAudio.onended = () => {
        if (abortRef.current) {
          clearInterval(progressInterval);
          cleanup();
          return;
        }

        if (currentLoop < repeatCount) {
          currentLoop++;
          exportAudio.currentTime = 0;
          exportAudio.play().catch(() => {});

          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(() => {});
          }
        } else {
          clearInterval(progressInterval);
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
          cleanup();
        }
      };

      const maxRecordingTime = (totalDuration + 2) * 1000;
      setTimeout(() => {
        clearInterval(progressInterval);
        if (mediaRecorder.state === 'recording') {
          exportAudio.pause();
          mediaRecorder.stop();
          cleanup();
        }
      }, maxRecordingTime);

    } catch (err) {
      console.error('Export error:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : '내보내기를 시작할 수 없습니다.');
    }
  };

  const handleCancel = () => {
    abortRef.current = true;
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    onClose();
  };

  if (!isOpen) return null;

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 진행 중 화면 (녹화/처리)
  if (status === 'preparing' || status === 'recording' || status === 'processing') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm" />

        <div className="relative w-full max-w-md text-center space-y-6 px-6">
          {/* 아이콘 */}
          <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-600/20 flex items-center justify-center">
            <Clapperboard className="w-10 h-10 text-indigo-400" />
          </div>

          {/* 타이틀 */}
          <div>
            <h2 className="text-3xl font-black text-white mb-2">내보내기(WebM)</h2>
            <p className="text-zinc-400 text-sm">
              VP9/Opus 코덱을 사용하여 고품질 영상을 제작합니다.
            </p>
          </div>

          {/* 상태 */}
          <div className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-left">
                <p className="text-xs text-indigo-400 font-medium">상태</p>
                <p className="text-white text-sm">
                  {statusMessage}
                  {status === 'recording' && repeatCount > 1 && ` (${currentRepeat}/${repeatCount})`}
                </p>
              </div>
              <span className="text-4xl font-black text-white">{Math.round(progress)}%</span>
            </div>

            {/* 진행률 바 */}
            <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800">
              <div
                className="h-full bg-indigo-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* 버튼들 */}
          <div className="space-y-3 pt-4">
            <button
              disabled
              className="w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 bg-indigo-600/50 text-indigo-200 cursor-not-allowed"
            >
              <Rocket className="w-5 h-5" />
              {status === 'processing' ? '파일 생성 중...' : '녹화 진행 중...'}
            </button>

            <button
              onClick={handleCancel}
              className="w-full py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              편집 스튜디오로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 완료 화면
  if (status === 'complete') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm" />

        <div className="relative w-full max-w-md text-center space-y-6 px-6">
          <CheckCircle className="w-20 h-20 mx-auto text-green-500" />

          <div>
            <h2 className="text-3xl font-black text-white mb-2">내보내기 완료!</h2>
            <p className="text-zinc-400 text-sm">
              WebM 영상이 다운로드되었습니다.
            </p>
          </div>

          <button
            onClick={handleCancel}
            className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            편집 스튜디오로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  // 에러 화면
  if (status === 'error') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[#0a0a0f]/95 backdrop-blur-sm" />

        <div className="relative w-full max-w-md text-center space-y-6 px-6">
          <AlertCircle className="w-20 h-20 mx-auto text-red-500" />

          <div>
            <h2 className="text-3xl font-black text-white mb-2">오류 발생</h2>
            <p className="text-zinc-400 text-sm">{errorMessage}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setStatus('idle')}
              className="w-full py-4 rounded-xl font-bold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              다시 시도
            </button>
            <button
              onClick={handleCancel}
              className="w-full py-3 rounded-xl font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition-colors"
            >
              편집 스튜디오로 돌아가기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 초기 설정 화면
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleCancel}
      />

      <div className={`relative w-full max-w-md rounded-2xl shadow-2xl transition-colors ${
        isDarkMode ? 'bg-[#18181b]' : 'bg-white'
      }`}>
        {/* 헤더 */}
        <div className={`flex items-center justify-between p-4 border-b ${
          isDarkMode ? 'border-zinc-800' : 'border-zinc-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold">내보내기 (WebM)</h2>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                VP9/Opus 코덱
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="p-6 space-y-5">
          {/* 파일 정보 */}
          <div className={`p-4 rounded-xl ${
            isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                오디오 파일
              </span>
              <span className="text-sm font-medium truncate max-w-[200px]">
                {audioFile?.name || '없음'}
              </span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                총 길이
              </span>
              <span className="text-sm font-medium">
                {formatDuration(totalDuration)} {repeatCount > 1 && `(${repeatCount}회 반복)`}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className={`text-sm ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                오디오 비트레이트
              </span>
              <span className="text-sm font-medium">{audioBitrate}</span>
            </div>
          </div>

          {/* 해상도 선택 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              해상도
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['720p', '1080p'] as const).map((res) => (
                <button
                  key={res}
                  onClick={() => setResolution(res)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    resolution === res
                      ? 'bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {res === '720p' ? '720p (HD)' : '1080p (Full HD)'}
                </button>
              ))}
            </div>
          </div>

          {/* 품질 선택 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${
              isDarkMode ? 'text-zinc-300' : 'text-zinc-700'
            }`}>
              품질
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['standard', 'high'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setQuality(q)}
                  className={`py-2.5 px-4 rounded-xl text-sm font-medium transition-all ${
                    quality === q
                      ? 'bg-indigo-600 text-white'
                      : isDarkMode
                        ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200'
                  }`}
                >
                  {q === 'standard' ? '표준 (30fps)' : '고화질 (60fps)'}
                </button>
              ))}
            </div>
          </div>

          {/* 알림 */}
          <div className={`p-3 rounded-xl text-xs ${
            isDarkMode ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700'
          }`}>
            내보내기 중에는 오디오가 재생됩니다. 브라우저 탭을 닫지 마세요.
          </div>

          {/* 내보내기 버튼 */}
          <button
            onClick={handleExport}
            disabled={!audioFile || duration <= 0}
            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition-all ${
              audioFile && duration > 0
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : isDarkMode
                  ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            <Download className="w-5 h-5" />
            WebM 내보내기 시작
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
