
import React, { useState, useEffect } from 'react';
import {
  CloudUpload,
  Music,
  Trash2,
  ArrowRight,
  Settings2,
  Image as ImageIcon,
  ChevronUp,
  ChevronDown,
  Copy,
  Check
} from 'lucide-react';
import { ProjectAsset, AudioTrack } from '../types';

interface MediaCenterProps {
  assets: ProjectAsset;
  updateAsset: (key: keyof ProjectAsset, value: any) => void;
  onEnterStudio: () => void;
  isDarkMode: boolean;
}

const MediaCenter: React.FC<MediaCenterProps> = ({ assets, updateAsset, onEnterStudio, isDarkMode }) => {
  const [copied, setCopied] = useState(false);
  const [trackDurations, setTrackDurations] = useState<Record<string, number>>({});

  // 오디오 파일 업로드 시 실제 duration 계산
  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []) as File[];
    const newTracks: AudioTrack[] = [];

    for (const file of files) {
      const id = Math.random().toString(36).substring(2, 11);
      const duration = await getAudioDuration(file);
      newTracks.push({
        id,
        file,
        duration: formatTime(duration)
      });
      setTrackDurations(prev => ({ ...prev, [id]: duration }));
    }

    updateAsset('audioTracks', [...assets.audioTracks, ...newTracks]);
  };

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

  // 시간 포맷팅 (초 -> HH:MM:SS 또는 MM:SS)
  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // 타임라인 형식으로 포맷팅 (HH:MM:SS)
  const formatTimeline = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 파일명에서 확장자 제거
  const getTrackName = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '');
  };

  // 타임라인 텍스트 생성 및 복사
  const copyTimeline = async () => {
    let currentTime = 0;
    const lines: string[] = [];

    for (const track of assets.audioTracks) {
      const trackName = getTrackName(track.file.name);
      lines.push(`${formatTimeline(currentTime)} ${trackName}`);
      const duration = trackDurations[track.id] || 0;
      currentTime += duration;
    }

    const timelineText = lines.join('\n');

    try {
      await navigator.clipboard.writeText(timelineText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy timeline:', err);
    }
  };

  // 트랙 순서 위로 이동
  const moveTrackUp = (index: number) => {
    if (index === 0) return;
    const newTracks = [...assets.audioTracks];
    [newTracks[index - 1], newTracks[index]] = [newTracks[index], newTracks[index - 1]];
    updateAsset('audioTracks', newTracks);
  };

  // 트랙 순서 아래로 이동
  const moveTrackDown = (index: number) => {
    if (index === assets.audioTracks.length - 1) return;
    const newTracks = [...assets.audioTracks];
    [newTracks[index], newTracks[index + 1]] = [newTracks[index + 1], newTracks[index]];
    updateAsset('audioTracks', newTracks);
  };

  const removeTrack = (id: string) => {
    updateAsset('audioTracks', assets.audioTracks.filter(t => t.id !== id));
    setTrackDurations(prev => {
      const newDurations = { ...prev };
      delete newDurations[id];
      return newDurations;
    });
  };

  // 총 재생 시간 계산
  const getTotalDuration = (): number => {
    return assets.audioTracks.reduce((total, track) => {
      return total + (trackDurations[track.id] || 0);
    }, 0);
  };

  // 특정 트랙의 타임라인 시작 시간 계산 (이전 트랙들의 duration 합)
  const getTrackStartTime = (trackIndex: number): number => {
    let startTime = 0;
    for (let i = 0; i < trackIndex; i++) {
      const trackId = assets.audioTracks[i]?.id;
      if (trackId) {
        startTime += trackDurations[trackId] || 0;
      }
    }
    return startTime;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, key: 'logo' | 'background') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => updateAsset(key, event.target?.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className={`min-h-full flex flex-col pb-16 md:pb-0 transition-colors ${
      isDarkMode ? 'bg-[#09090b]' : 'bg-gray-50'
    }`}>
      {/* 상단 헤더 */}
      <header className={`h-14 md:h-16 flex items-center justify-between px-4 md:px-6 border-b transition-colors ${
        isDarkMode
          ? 'border-zinc-800/50 bg-[#121214]/50'
          : 'border-zinc-200 bg-white/80'
      }`}>
        <div className="flex items-center gap-2 md:gap-3">
          <span className={`hidden sm:inline text-[9px] md:text-[10px] font-black tracking-[0.15em] md:tracking-[0.2em] uppercase ${
            isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
          }`}>프로젝트</span>
          <div className={`h-1 w-1 rounded-full ${isDarkMode ? 'bg-zinc-700' : 'bg-zinc-400'}`} />
          <span className={`text-xs md:text-sm font-bold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>미디어 센터</span>
        </div>

        <button
          onClick={onEnterStudio}
          disabled={assets.audioTracks.length === 0}
          className={`
            relative overflow-hidden px-5 md:px-8 py-2.5 md:py-3 rounded-xl font-bold text-xs md:text-sm
            transition-all duration-300 active:scale-[0.97] flex items-center gap-2 md:gap-3 group
            ${assets.audioTracks.length === 0
              ? 'bg-zinc-800/60 text-zinc-500 cursor-not-allowed border border-zinc-700/50'
              : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_100%] hover:bg-right text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-105 border border-indigo-400/30'
            }
          `}
        >
          {assets.audioTracks.length > 0 && (
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          )}
          <span className="relative hidden sm:inline">스튜디오 입장하기</span>
          <span className="relative sm:hidden">스튜디오</span>
          <ArrowRight className="relative w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-4 md:p-6 w-full overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">

          {/* 섹션 1: 비주얼 자산 */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                }`}>01. 비주얼 자산</h3>
                <span className={`h-[1px] flex-1 ml-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* 배경 이미지 */}
                <div className="space-y-2 md:space-y-2.5">
                  <div className="flex justify-between items-center px-1">
                    <label className={`text-[8px] md:text-[9px] font-bold uppercase ${
                      isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                    }`}>배경 이미지</label>
                    <span className="text-[7px] md:text-[8px] font-black text-indigo-400 uppercase tracking-tighter">16:9 HD</span>
                  </div>
                  <div className={`relative aspect-video rounded-xl md:rounded-2xl overflow-hidden border group shadow-xl ${
                    isDarkMode
                      ? 'border-zinc-800 bg-zinc-900/50'
                      : 'border-zinc-300 bg-zinc-100'
                  }`}>
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, 'background')} />
                    {assets.background ? (
                      <img src={assets.background} alt="배경" className="w-full h-full object-cover" />
                    ) : (
                      <div className={`w-full h-full flex flex-col items-center justify-center ${
                        isDarkMode ? 'text-zinc-700' : 'text-zinc-400'
                      }`}>
                        <ImageIcon className="w-8 md:w-10 h-8 md:h-10 mb-2 opacity-20" />
                        <span className="text-[8px] md:text-[9px] font-black uppercase tracking-widest">배경 업로드</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-3 md:px-4 py-1.5 md:py-2 bg-white text-black text-[8px] md:text-[9px] font-black rounded-full uppercase shadow-2xl">배경 교체</span>
                    </div>
                  </div>
                </div>

                {/* 로고 */}
                <div className="space-y-2 md:space-y-2.5">
                  <label className={`text-[8px] md:text-[9px] font-bold uppercase px-1 ${
                    isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                  }`}>브랜드 로고</label>
                  <div className={`flex gap-3 md:gap-4 p-3 md:p-4 border rounded-xl md:rounded-2xl items-center shadow-md ${
                    isDarkMode
                      ? 'bg-[#121214] border-zinc-800/50'
                      : 'bg-white border-zinc-200'
                  }`}>
                    <div className={`relative w-16 h-16 md:w-24 md:h-24 rounded-lg md:rounded-xl border flex-shrink-0 group overflow-hidden ${
                      isDarkMode
                        ? 'border-zinc-800 bg-black'
                        : 'border-zinc-300 bg-zinc-100'
                    }`}>
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} />
                      {assets.logo ? (
                        <img src={assets.logo} alt="로고" className="w-full h-full object-contain p-2 md:p-3" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Settings2 className={`w-5 md:w-6 h-5 md:h-6 ${isDarkMode ? 'text-zinc-800' : 'text-zinc-400'}`} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none text-white text-[8px] md:text-[9px] font-black uppercase">변경</div>
                    </div>
                    <div className="flex-1 space-y-1 md:space-y-1.5 min-w-0">
                      <p className={`text-[11px] md:text-[12px] font-black ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>브랜드 심볼</p>
                      <p className={`text-[9px] md:text-[10px] leading-snug font-medium italic ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>투명 PNG 파일 권장</p>
                      <button className="text-[8px] md:text-[9px] font-black text-rose-500 uppercase tracking-widest hover:text-rose-400 transition-colors">초기화</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 섹션 2: 오디오 라이브러리 */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section className="flex flex-col">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                }`}>02. 오디오 라이브러리</h3>
                <div className="flex items-center gap-2 ml-4">
                  {assets.audioTracks.length > 0 && (
                    <button
                      onClick={copyTimeline}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[8px] md:text-[9px] font-bold transition-all ${
                        copied
                          ? 'bg-green-500/20 text-green-400 ring-1 ring-green-500/30'
                          : isDarkMode
                            ? 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-300'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? '복사됨!' : '타임라인 복사'}
                    </button>
                  )}
                  <span className={`h-[1px] flex-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 flex flex-col">
                <div className="relative group">
                  <input
                    type="file" multiple accept="audio/*" onChange={handleAudioUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className={`border-2 border-dashed rounded-xl md:rounded-2xl p-4 md:p-6 text-center group-hover:border-indigo-500/50 transition-all shadow-inner ${
                    isDarkMode
                      ? 'border-zinc-800 bg-[#121214]/60 group-hover:bg-zinc-800/30'
                      : 'border-zinc-300 bg-zinc-100/60 group-hover:bg-zinc-200/50'
                  }`}>
                    <CloudUpload className={`w-6 md:w-8 h-6 md:h-8 mx-auto mb-2 md:mb-3 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
                    <p className={`text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] ${
                      isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                    }`}>새 음악 트랙 추가</p>
                    <p className={`text-[7px] md:text-[8px] mt-1 uppercase ${isDarkMode ? 'text-zinc-300' : 'text-zinc-500'}`}>WAV, MP3, FLAC 지원</p>
                  </div>
                </div>

                <div className="space-y-2 max-h-[200px] md:max-h-[300px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                  {assets.audioTracks.map((track, index) => (
                    <div key={track.id} className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2.5 md:py-3 border rounded-lg md:rounded-xl group hover:border-indigo-500/30 transition-all shadow-sm ${
                      isDarkMode
                        ? 'bg-[#121214] border-zinc-800/50'
                        : 'bg-white border-zinc-200'
                    }`}>
                      <span className={`text-[9px] md:text-[10px] font-black w-4 ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'}`}>{String(index + 1).padStart(2, '0')}</span>
                      <div className={`w-7 h-7 md:w-8 md:h-8 rounded-md md:rounded-lg border flex items-center justify-center flex-shrink-0 ${
                        isDarkMode
                          ? 'bg-zinc-900 border-zinc-800'
                          : 'bg-zinc-100 border-zinc-200'
                      }`}>
                        <Music className="w-3.5 md:w-4 h-3.5 md:h-4 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-[10px] md:text-[11px] font-bold truncate pr-2 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{track.file.name}</p>
                        <div className="flex items-center gap-2">
                          <span className={`text-[7px] md:text-[8px] font-black tabular-nums text-indigo-400`}>
                            {formatTime(getTrackStartTime(index))}
                          </span>
                          <span className={`text-[7px] md:text-[8px] ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>|</span>
                          <span className={`text-[7px] md:text-[8px] font-medium tabular-nums ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>
                            길이 {track.duration}
                          </span>
                        </div>
                      </div>
                      {/* 순서 변경 버튼 */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveTrackUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded transition-colors ${
                            index === 0
                              ? isDarkMode ? 'text-zinc-800' : 'text-zinc-300'
                              : isDarkMode
                                ? 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
                                : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          <ChevronUp className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => moveTrackDown(index)}
                          disabled={index === assets.audioTracks.length - 1}
                          className={`p-1 rounded transition-colors ${
                            index === assets.audioTracks.length - 1
                              ? isDarkMode ? 'text-zinc-800' : 'text-zinc-300'
                              : isDarkMode
                                ? 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
                                : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100'
                          }`}
                        >
                          <ChevronDown className="w-3 h-3" />
                        </button>
                      </div>
                      <button onClick={() => removeTrack(track.id)} className={`p-1.5 md:p-2 transition-colors rounded-md md:rounded-lg ${
                        isDarkMode
                          ? 'text-zinc-700 hover:text-rose-500 bg-black/40'
                          : 'text-zinc-400 hover:text-rose-500 bg-zinc-100'
                      }`}>
                        <Trash2 className="w-3 md:w-3.5 h-3 md:h-3.5" />
                      </button>
                    </div>
                  ))}
                  {assets.audioTracks.length === 0 && (
                    <div className={`flex items-center justify-center border rounded-xl md:rounded-2xl py-8 md:py-12 ${
                      isDarkMode ? 'border-zinc-900' : 'border-zinc-200'
                    }`}>
                      <p className={`text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] ${
                        isDarkMode ? 'text-zinc-700' : 'text-zinc-400'
                      }`}>트랙 목록이 비어있습니다</p>
                    </div>
                  )}
                </div>

                {/* 트랙 요약 정보 */}
                {assets.audioTracks.length > 0 && (
                  <div className={`flex items-center justify-between px-3 py-2 rounded-lg ${
                    isDarkMode ? 'bg-zinc-900/50' : 'bg-zinc-100'
                  }`}>
                    <span className={`text-[8px] md:text-[9px] font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                      {assets.audioTracks.length}개 트랙
                    </span>
                    <span className={`text-[9px] md:text-[10px] font-black tabular-nums ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      총 {formatTime(getTotalDuration())}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 섹션 3: 인코딩 설정 */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section>
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest ${
                  isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                }`}>03. 인코딩 마스터</h3>
                <span className={`h-[1px] flex-1 ml-4 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-300'}`} />
              </div>

              <div className={`border rounded-xl md:rounded-2xl p-4 md:p-6 space-y-4 md:space-y-6 shadow-2xl ${
                isDarkMode
                  ? 'bg-[#121214] border-zinc-800/50'
                  : 'bg-white border-zinc-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3.5 md:w-4 h-3.5 md:h-4 text-indigo-500" />
                    <h4 className={`text-[9px] md:text-[10px] font-black uppercase tracking-wider md:tracking-widest ${
                      isDarkMode ? 'text-zinc-300' : 'text-zinc-600'
                    }`}>출력 프리셋</h4>
                  </div>
                  <span className={`text-[7px] md:text-[8px] font-black uppercase ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>V.4.1.0</span>
                </div>

                <div className="space-y-3 md:space-y-4">
                  {/* 반복 횟수 */}
                  <div className={`border p-3 md:p-5 rounded-xl md:rounded-2xl space-y-3 md:space-y-4 ${
                    isDarkMode
                      ? 'bg-black border-zinc-800/50'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <label className={`text-[8px] md:text-[9px] font-black uppercase tracking-tighter ${
                        isDarkMode ? 'text-zinc-200' : 'text-zinc-700'
                      }`}>비디오 반복</label>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[9px] md:text-[10px] font-black rounded-md ring-1 ring-indigo-500/20">{assets.repeatCount}X</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(count => (
                        <button
                          key={count}
                          onClick={() => updateAsset('repeatCount', count)}
                          className={`flex-1 py-2 text-[8px] md:text-[9px] font-black rounded-lg md:rounded-xl border transition-all ${
                            assets.repeatCount === count
                              ? isDarkMode
                                ? 'bg-white text-black border-white shadow-lg'
                                : 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                              : isDarkMode
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-600'
                                : 'bg-white border-zinc-300 text-zinc-500 hover:border-zinc-400'
                          }`}
                        >
                          {count}회
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 비트레이트 */}
                  <div className={`border p-3 md:p-5 rounded-xl md:rounded-2xl space-y-3 md:space-y-4 ${
                    isDarkMode
                      ? 'bg-black border-zinc-800/50'
                      : 'bg-zinc-50 border-zinc-200'
                  }`}>
                    <div className="flex justify-between items-center">
                      <label className={`text-[8px] md:text-[9px] font-black uppercase tracking-tighter ${
                        isDarkMode ? 'text-zinc-200' : 'text-zinc-700'
                      }`}>오디오 비트레이트</label>
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-[9px] md:text-[10px] font-black rounded-md ring-1 ring-emerald-500/20">{assets.bitrate.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2">
                      {['96kbps', '128kbps', '192kbps'].map(rate => (
                        <button
                          key={rate}
                          onClick={() => updateAsset('bitrate', rate)}
                          className={`flex-1 py-2 text-[8px] md:text-[9px] font-black rounded-lg md:rounded-xl border transition-all ${
                            assets.bitrate === rate
                              ? isDarkMode
                                ? 'bg-white text-black border-white shadow-lg'
                                : 'bg-indigo-600 text-white border-indigo-600 shadow-lg'
                              : isDarkMode
                                ? 'bg-zinc-900 border-zinc-800 text-zinc-600 hover:border-zinc-600'
                                : 'bg-white border-zinc-300 text-zinc-500 hover:border-zinc-400'
                          }`}
                        >
                          {rate.split('k')[0]}K
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`pt-3 md:pt-4 border-t ${isDarkMode ? 'border-zinc-800/50' : 'border-zinc-200'}`}>
                  <div className="flex items-center justify-between p-3 md:p-4 bg-indigo-500/5 rounded-lg md:rounded-xl border border-indigo-500/10">
                    <div>
                      <p className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-wider md:tracking-widest">GPU 가속</p>
                      <p className={`text-[7px] md:text-[8px] font-medium mt-0.5 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-600'}`}>하드웨어 렌더링</p>
                    </div>
                    <div className="w-7 md:w-8 h-3.5 md:h-4 bg-indigo-500 rounded-full relative shadow-lg shadow-indigo-500/20">
                      <div className="absolute right-0.5 md:right-1 top-0.5 md:top-1 w-2 h-2 bg-white rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* 하단 정보 바 - 데스크톱만 */}
      <footer className={`hidden md:flex h-10 border-t items-center px-6 justify-between mt-auto ${
        isDarkMode ? 'border-zinc-800/50' : 'border-zinc-200'
      }`}>
        <div className="flex gap-6">
          <span className={`text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>STATUS: READY</span>
          <span className={`text-[8px] font-black uppercase tracking-tighter ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>ENGINE: V4.1.0</span>
        </div>
        <p className={`text-[8px] font-black uppercase tracking-[0.3em] ${isDarkMode ? 'text-zinc-800' : 'text-zinc-300'}`}>SPECTRUM VISUALIZER SUITE</p>
      </footer>
    </div>
  );
};

export default MediaCenter;
