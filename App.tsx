
import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Play,
  Pause,
  Music,
  Settings2,
  Palette,
  X,
  SkipBack,
  SkipForward
} from 'lucide-react';
import Sidebar from './components/Sidebar';
import MediaCenter from './components/MediaCenter';
import EditorLeftPanel from './components/EditorLeftPanel';
import EditorRightPanel from './components/EditorRightPanel';
import VisualizerPreview from './components/VisualizerPreview';
import HelpModal from './components/HelpModal';
import ExportModal from './components/ExportModal';
import { EditorState, ProjectAsset, AudioTrack } from './types';

// 비주얼 스타일별 프리셋 설정
const VISUAL_STYLE_PRESETS: Record<string, Partial<EditorState>> = {
  none: {
    spectrumPos: { x: 50, y: 75, centered: true },
    spectrumWidth: 100,
    spectrumSpeed: 50,
    spectrumSensitivity: 120,
    spectrumBands: 64,
    spectrumMaxHeight: 40,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 2,
    spectrumOpacity: 90
  },
  bars: {
    // 베이직 (막대)
    spectrumPos: { x: 50, y: 98, centered: false },
    spectrumWidth: 100,
    spectrumSpeed: 60,
    spectrumSensitivity: 120,
    spectrumBands: 246,
    spectrumMaxHeight: 40,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 2,
    spectrumOpacity: 90
  },
  symmetric: {
    // 대칭막대
    spectrumPos: { x: 50, y: 100, centered: true },
    spectrumWidth: 100,
    spectrumSpeed: 50,
    spectrumSensitivity: 200,
    spectrumBands: 130,
    spectrumMaxHeight: 24,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 1,
    spectrumOpacity: 100
  },
  mini: {
    // 미니막대
    spectrumPos: { x: 6, y: 8, centered: false },
    spectrumWidth: 10,
    spectrumSpeed: 50,
    spectrumSensitivity: 113,
    spectrumBands: 16,
    spectrumMaxHeight: 34,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 1,
    spectrumOpacity: 100
  },
  circle: {
    // 원형
    spectrumPos: { x: 50, y: 87, centered: true },
    spectrumWidth: 50,
    spectrumSpeed: 100,
    spectrumSensitivity: 200,
    spectrumBands: 256,
    spectrumMaxHeight: 200,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 1,
    spectrumOpacity: 100
  },
  linear: {
    // 선형
    spectrumPos: { x: 50, y: 100, centered: true },
    spectrumWidth: 100,
    spectrumSpeed: 100,
    spectrumSensitivity: 200,
    spectrumBands: 256,
    spectrumMaxHeight: 100,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 1,
    spectrumOpacity: 100
  },
  wave: {
    // 파형
    spectrumPos: { x: 50, y: 100, centered: true },
    spectrumWidth: 100,
    spectrumSpeed: 100,
    spectrumSensitivity: 200,
    spectrumBands: 256,
    spectrumMaxHeight: 100,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 1,
    spectrumOpacity: 100
  },
  field: {
    // 필드웨이브
    spectrumPos: { x: 50, y: 100, centered: true },
    spectrumWidth: 100,
    spectrumSpeed: 100,
    spectrumSensitivity: 200,
    spectrumBands: 256,
    spectrumMaxHeight: 10,
    spectrumBarWidth: 3,
    spectrumBarGap: 2,
    spectrumThickness: 1,
    spectrumOpacity: 100
  }
};

const INITIAL_EDITOR_STATE: EditorState = {
  visualStyle: 'bars',
  filterType: 'original',
  filterStrength: 100,
  vignetteStrength: 70,
  overlayTypes: [],
  overlayStrength: 50,
  grainStrength: 18,
  vhsStrength: 20,
  lightStrength: 50,
  rgbStrength: 20,
  pulseStrength: 30,
  shakeStrength: 20,
  particleTypes: ['heart'],
  particleColor: '#ffffff',
  particleDensity: 20,
  particleOpacity: 50,
  particleSpeed: 205,
  particleSize: 118,
  effectColor: '#6366f1',
  secondaryColor: '#06b6d4',
  colorMode: 'rainbow',
  logoPos: { x: 5, y: 5 },
  logoSize: 150,
  removeLogoBg: false,
  logoBgThreshold: 90,
  customPalette: [],
  spectrumPos: { x: 50, y: 75, centered: true },
  spectrumWidth: 100,
  spectrumBarWidth: 3,
  spectrumBarGap: 2,
  spectrumSpeed: 50,
  spectrumSensitivity: 120,
  spectrumBands: 64,
  spectrumMaxHeight: 40,
  spectrumThickness: 2,
  spectrumOpacity: 90
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'project' | 'editor'>('project');
  const [projectAssets, setProjectAssets] = useState<ProjectAsset>({
    audioTracks: [],
    logo: null,
    background: null,
    repeatCount: 1,
    bitrate: '192kbps'
  });
  const [editorState, setEditorState] = useState<EditorState>(INITIAL_EDITOR_STATE);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [trackDurations, setTrackDurations] = useState<number[]>([]);

  // 모바일 패널 상태
  const [mobilePanel, setMobilePanel] = useState<'none' | 'left' | 'right'>('none');

  // 다크모드 및 도움말 모달 상태
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const audioSrc = useMemo(() => {
    const file = projectAssets.audioTracks[currentTrackIndex]?.file;
    if (file) {
      return URL.createObjectURL(file);
    }
    return undefined;
  }, [projectAssets.audioTracks, currentTrackIndex]);

  // 시간 포맷팅 함수
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 각 트랙의 duration 계산
  useEffect(() => {
    const calculateDurations = async () => {
      const durations: number[] = [];
      for (const track of projectAssets.audioTracks) {
        const dur = await getAudioDuration(track.file);
        durations.push(dur);
      }
      setTrackDurations(durations);
    };

    if (projectAssets.audioTracks.length > 0) {
      calculateDurations();
    } else {
      setTrackDurations([]);
    }
  }, [projectAssets.audioTracks]);

  // 오디오 파일 길이 가져오기
  const getAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      };
      audio.onerror = () => resolve(0);
    });
  };

  // 전체 플레이리스트 총 시간
  const totalPlaylistDuration = useMemo(() => {
    return trackDurations.reduce((sum, dur) => sum + dur, 0);
  }, [trackDurations]);

  // 현재 트랙 이전까지의 누적 시간
  const getPreviousTracksDuration = (trackIndex: number): number => {
    return trackDurations.slice(0, trackIndex).reduce((sum, dur) => sum + dur, 0);
  };

  // 전체 플레이리스트 기준 현재 시간
  const totalCurrentTime = useMemo(() => {
    return getPreviousTracksDuration(currentTrackIndex) + currentTime;
  }, [currentTrackIndex, currentTime, trackDurations]);

  // 트랙 인덱스가 범위를 벗어나면 조정
  useEffect(() => {
    if (currentTrackIndex >= projectAssets.audioTracks.length && projectAssets.audioTracks.length > 0) {
      setCurrentTrackIndex(projectAssets.audioTracks.length - 1);
    } else if (projectAssets.audioTracks.length === 0) {
      setCurrentTrackIndex(0);
    }
  }, [projectAssets.audioTracks.length]);

  // 이전/다음 트랙 이동
  const handlePrevTrack = () => {
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(prev => prev - 1);
    }
  };

  const handleNextTrack = () => {
    if (currentTrackIndex < projectAssets.audioTracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
    }
  };

  // 트랙 종료 시 자동으로 다음 트랙 재생
  const handleTrackEnded = () => {
    if (currentTrackIndex < projectAssets.audioTracks.length - 1) {
      setCurrentTrackIndex(prev => prev + 1);
      // 다음 트랙 자동 재생
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
      }, 100);
    } else {
      // 마지막 트랙이면 재생 중지
      setIsPlaying(false);
    }
  };

  // 프로그레스 바 클릭으로 시간 이동 (전체 플레이리스트 기준)
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (totalPlaylistDuration === 0) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const targetTime = percentage * totalPlaylistDuration;

    // 어느 트랙에 해당하는지 찾기
    let accumulatedTime = 0;
    for (let i = 0; i < trackDurations.length; i++) {
      if (targetTime < accumulatedTime + trackDurations[i]) {
        // 이 트랙으로 이동
        const timeInTrack = targetTime - accumulatedTime;
        if (i !== currentTrackIndex) {
          setCurrentTrackIndex(i);
          // 트랙 변경 후 시간 설정
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.currentTime = timeInTrack;
              if (isPlaying) {
                audioRef.current.play().catch(() => {});
              }
            }
          }, 100);
        } else {
          if (audioRef.current) {
            audioRef.current.currentTime = timeInTrack;
          }
        }
        setCurrentTime(timeInTrack);
        return;
      }
      accumulatedTime += trackDurations[i];
    }
  };

  useEffect(() => {
    return () => {
      if (audioSrc) URL.revokeObjectURL(audioSrc);
    };
  }, [audioSrc]);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioSrc]);

  const handleTogglePlay = () => {
    if (!audioRef.current || !audioSrc) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.error("Playback failed:", err);
          setIsPlaying(false);
        });
    }
  };

  const updateEditor = (key: keyof EditorState, value: any) => {
    // 비주얼 스타일 변경 시 해당 스타일의 프리셋 적용
    if (key === 'visualStyle' && VISUAL_STYLE_PRESETS[value]) {
      setEditorState(prev => ({
        ...prev,
        visualStyle: value,
        ...VISUAL_STYLE_PRESETS[value]
      }));
    } else {
      setEditorState(prev => ({ ...prev, [key]: value }));
    }
  };

  const updateProject = (key: keyof ProjectAsset, value: any) => {
    setProjectAssets(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`flex h-screen h-[100dvh] overflow-hidden transition-colors ${
      isDarkMode
        ? 'bg-[#09090b] text-zinc-100'
        : 'bg-gray-50 text-zinc-900'
    }`}>
      {/* 데스크톱 사이드바 */}
      <div className="hidden md:block h-full">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          onHelpClick={() => setShowHelp(true)}
          onExportClick={() => setShowExport(true)}
        />
      </div>

      {activeTab === 'project' ? (
        <div className={`flex-1 overflow-y-auto transition-colors ${
          isDarkMode ? 'bg-[#0b0f1a]' : 'bg-gray-100'
        }`}>
          <MediaCenter
            assets={projectAssets}
            updateAsset={updateProject}
            onEnterStudio={() => setActiveTab('editor')}
            isDarkMode={isDarkMode}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* 헤더 - 전체 상단 */}
          <header className={`h-10 md:h-12 flex items-center justify-between px-3 md:px-4 border-b backdrop-blur-xl z-20 transition-colors ${
            isDarkMode
              ? 'border-zinc-800/50 bg-[#09090b]/50'
              : 'border-zinc-200 bg-white/80'
          }`}>
            {/* 좌측: 모바일 효과 버튼 + 타이틀 */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* 모바일: 효과 아이콘 버튼 */}
              <button
                onClick={() => setMobilePanel(mobilePanel === 'left' ? 'none' : 'left')}
                className={`md:hidden p-2 rounded-lg transition-all ${
                  mobilePanel === 'left'
                    ? 'bg-indigo-600 text-white'
                    : isDarkMode
                      ? 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                      : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900'
                }`}
              >
                <Settings2 className="w-5 h-5" />
              </button>
              <span className={`hidden sm:inline text-[10px] md:text-[11px] font-black tracking-[0.2em] uppercase ${
                isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
              }`}>Workflow</span>
              <div className="h-1 w-1 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-xs md:text-sm font-bold">Studio Preview</span>
            </div>

            {/* 우측: 모바일 컬러 버튼 */}
            <button
              onClick={() => setMobilePanel(mobilePanel === 'right' ? 'none' : 'right')}
              className={`md:hidden p-2 rounded-lg transition-all ${
                mobilePanel === 'right'
                  ? 'bg-indigo-600 text-white'
                  : isDarkMode
                    ? 'bg-zinc-800/80 text-zinc-400 hover:text-white'
                    : 'bg-zinc-200 text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Palette className="w-5 h-5" />
            </button>
          </header>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* 데스크톱: 좌측 패널 */}
            <div className={`hidden md:block w-[240px] border-r overflow-y-auto custom-scrollbar transition-colors ${
              isDarkMode
                ? 'bg-[#121214] border-zinc-800/50'
                : 'bg-white border-zinc-200'
            }`}>
              <EditorLeftPanel state={editorState} updateState={updateEditor} isDarkMode={isDarkMode} />
            </div>

            {/* Hero Preview Section */}
            <main className={`flex-1 flex flex-col relative transition-colors ${
              isDarkMode ? 'bg-black' : 'bg-gray-200'
            }`}>
              {/* 프리뷰 영역 */}
              <div className="flex-1 p-2 md:p-3 flex flex-col gap-2 md:gap-3 overflow-hidden min-h-0">
                <div className={`w-full aspect-video max-h-full relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] border group ${
                  isDarkMode
                    ? 'bg-black border-zinc-800/50'
                    : 'bg-zinc-100 border-zinc-300'
                }`}>
                <VisualizerPreview
                  state={editorState}
                  assets={{
                    audio: projectAssets.audioTracks[currentTrackIndex]?.file || null,
                    logo: projectAssets.logo,
                    background: projectAssets.background
                  }}
                  audioRef={audioRef}
                  isPlaying={isPlaying}
                  updateState={updateEditor}
                  canvasRef={canvasRef}
                />
              </div>

              {/* Audio Deck */}
              <div className={`h-16 md:h-20 border rounded-lg flex items-center px-3 md:px-5 gap-2 md:gap-4 shadow-xl transition-colors ${
                isDarkMode
                  ? 'bg-[#121214] border-zinc-800/50'
                  : 'bg-white border-zinc-200'
              }`}>
                {/* 이전 트랙 버튼 */}
                <button
                  onClick={handlePrevTrack}
                  disabled={currentTrackIndex === 0 || projectAssets.audioTracks.length === 0}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-90 ${
                    isDarkMode
                      ? 'bg-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-300 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <SkipBack className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                {/* 재생/일시정지 버튼 */}
                <button
                  onClick={handleTogglePlay}
                  disabled={!audioSrc}
                  className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-transform hover:scale-105 active:scale-90 ${
                    isDarkMode
                      ? 'bg-zinc-100 disabled:bg-zinc-800 disabled:text-zinc-600 text-black'
                      : 'bg-indigo-600 disabled:bg-zinc-300 disabled:text-zinc-500 text-white'
                  }`}
                >
                  {isPlaying ? <Pause className="w-5 h-5 md:w-6 md:h-6 fill-current" /> : <Play className="w-5 h-5 md:w-6 md:h-6 fill-current ml-0.5" />}
                </button>

                {/* 다음 트랙 버튼 */}
                <button
                  onClick={handleNextTrack}
                  disabled={currentTrackIndex >= projectAssets.audioTracks.length - 1 || projectAssets.audioTracks.length === 0}
                  className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all hover:scale-105 active:scale-90 ${
                    isDarkMode
                      ? 'bg-zinc-800 disabled:bg-zinc-900 disabled:text-zinc-700 text-zinc-300 hover:bg-zinc-700'
                      : 'bg-zinc-100 disabled:bg-zinc-50 disabled:text-zinc-300 text-zinc-600 hover:bg-zinc-200'
                  }`}
                >
                  <SkipForward className="w-4 h-4 md:w-5 md:h-5" />
                </button>

                <div className="flex-1 flex flex-col gap-2 md:gap-3 min-w-0">
                  {/* 트랙 정보 */}
                  <div className="flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Music className={`w-3 h-3 flex-shrink-0 ${isDarkMode ? 'text-zinc-400' : 'text-zinc-500'}`} />
                      <span className="text-[10px] md:text-xs font-bold tracking-tight truncate">
                        {projectAssets.audioTracks[currentTrackIndex]?.file?.name || '선택된 파일 없음'}
                      </span>
                    </div>
                    <span className={`text-[9px] md:text-[10px] font-black tabular-nums uppercase tracking-tighter flex-shrink-0 ${
                      isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
                    }`}>
                      Track {String(currentTrackIndex + 1).padStart(2, '0')}/{String(projectAssets.audioTracks.length || 0).padStart(2, '0')}
                    </span>
                  </div>

                  {/* 프로그레스 바 (전체 플레이리스트 기준) */}
                  <div
                    className={`relative h-1.5 md:h-2 rounded-full overflow-hidden cursor-pointer group ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`}
                    onClick={handleSeek}
                  >
                    {/* 트랙 구분선 */}
                    {trackDurations.map((_, idx) => {
                      if (idx === 0) return null;
                      const position = (getPreviousTracksDuration(idx) / totalPlaylistDuration) * 100;
                      return (
                        <div
                          key={idx}
                          className={`absolute top-0 bottom-0 w-0.5 ${isDarkMode ? 'bg-zinc-600' : 'bg-zinc-400'}`}
                          style={{ left: `${position}%` }}
                        />
                      );
                    })}
                    {/* 진행 바 */}
                    <div
                      className={`h-full transition-all duration-150 group-hover:shadow-lg ${
                        isDarkMode
                          ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]'
                          : 'bg-indigo-600 shadow-[0_0_8px_rgba(99,102,241,0.4)]'
                      }`}
                      style={{ width: `${(totalCurrentTime / totalPlaylistDuration) * 100 || 0}%` }}
                    />
                  </div>

                  {/* 시간 표시 (전체 플레이리스트 기준) */}
                  <div className="flex justify-between items-center">
                    <span className={`text-[9px] md:text-[10px] font-bold tabular-nums ${
                      isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {formatTime(totalCurrentTime)}
                    </span>
                    <span className={`text-[9px] md:text-[10px] font-bold tabular-nums ${
                      isDarkMode ? 'text-zinc-500' : 'text-zinc-400'
                    }`}>
                      {formatTime(totalPlaylistDuration)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </main>

            {/* 데스크톱: 우측 패널 */}
            <div className={`hidden md:block w-[240px] border-l overflow-y-auto custom-scrollbar transition-colors ${
              isDarkMode
                ? 'bg-[#121214] border-zinc-800/50'
                : 'bg-white border-zinc-200'
            }`}>
              <EditorRightPanel state={editorState} updateState={updateEditor} isDarkMode={isDarkMode} />
            </div>
          </div>

          {/* 모바일: 슬라이드 패널 */}
          {mobilePanel !== 'none' && (
            <div className="md:hidden fixed inset-0 z-50 flex">
              {/* 배경 오버레이 */}
              <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={() => setMobilePanel('none')}
              />

              {/* 패널 */}
              <div className={`relative w-[85%] max-w-[320px] h-full overflow-y-auto transition-colors ${
                mobilePanel === 'right' ? 'ml-auto' : ''
              } ${isDarkMode ? 'bg-[#121214]' : 'bg-white'}`}>
                {/* 패널 헤더 */}
                <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b transition-colors ${
                  isDarkMode ? 'bg-[#121214] border-zinc-800' : 'bg-white border-zinc-200'
                }`}>
                  <h2 className="text-sm font-bold">
                    {mobilePanel === 'left' ? '효과 설정' : '컬러 설정'}
                  </h2>
                  <button
                    onClick={() => setMobilePanel('none')}
                    className={`p-2 rounded-lg transition-colors ${
                      isDarkMode ? 'hover:bg-zinc-800' : 'hover:bg-zinc-100'
                    }`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 패널 내용 */}
                {mobilePanel === 'left' ? (
                  <EditorLeftPanel state={editorState} updateState={updateEditor} isDarkMode={isDarkMode} />
                ) : (
                  <EditorRightPanel state={editorState} updateState={updateEditor} isDarkMode={isDarkMode} />
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 모바일 하단 네비게이션 */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around z-40 transition-colors ${
        isDarkMode
          ? 'bg-[#121214] border-zinc-800'
          : 'bg-white border-zinc-200'
      }`}>
        <button
          onClick={() => setActiveTab('project')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'project'
              ? 'text-indigo-500'
              : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          <Music className="w-5 h-5" />
          <span className="text-[10px] font-bold">프로젝트</span>
        </button>
        <button
          onClick={() => setActiveTab('editor')}
          className={`flex flex-col items-center gap-1 px-6 py-2 rounded-lg transition-colors ${
            activeTab === 'editor'
              ? 'text-indigo-500'
              : isDarkMode ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          <Settings2 className="w-5 h-5" />
          <span className="text-[10px] font-bold">편집</span>
        </button>
      </div>

      <audio
        ref={audioRef}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={handleTrackEnded}
        src={audioSrc}
      />

      {/* 도움말 모달 */}
      <HelpModal
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
        isDarkMode={isDarkMode}
      />

      {/* 내보내기 모달 */}
      <ExportModal
        isOpen={showExport}
        onClose={() => setShowExport(false)}
        isDarkMode={isDarkMode}
        canvasRef={canvasRef}
        audioRef={audioRef}
        audioFile={projectAssets.audioTracks[currentTrackIndex]?.file || null}
        duration={duration}
        repeatCount={projectAssets.repeatCount}
        audioBitrate={projectAssets.bitrate}
      />
    </div>
  );
};

export default App;
