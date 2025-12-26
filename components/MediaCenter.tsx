
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

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTimeline = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTrackName = (filename: string): string => {
    return filename.replace(/\.[^/.]+$/, '');
  };

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

  const moveTrackUp = (index: number) => {
    if (index === 0) return;
    const newTracks = [...assets.audioTracks];
    [newTracks[index - 1], newTracks[index]] = [newTracks[index], newTracks[index - 1]];
    updateAsset('audioTracks', newTracks);
  };

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

  const getTotalDuration = (): number => {
    return assets.audioTracks.reduce((total, track) => {
      return total + (trackDurations[track.id] || 0);
    }, 0);
  };

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
      isDarkMode ? 'bg-zinc-900' : 'bg-amber-50'
    }`}>
      {/* 상단 헤더 - 네오브루탈 */}
      <header
        className={`h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b-4 transition-colors ${
          isDarkMode ? 'bg-zinc-800 border-black' : 'bg-white border-black'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <span
            className={`hidden sm:inline text-xs md:text-sm font-black tracking-[0.15em] uppercase px-3 py-1.5 rounded border-black ${
              isDarkMode ? 'bg-pink-500 text-white' : 'bg-pink-400 text-black'
            }`}
            style={{ borderWidth: '2px' }}
          >프로젝트</span>
          <div className="h-2.5 w-2.5 rounded-sm bg-lime-400 border-2 border-black" />
          <span className="text-sm md:text-base font-black uppercase">미디어 센터</span>
        </div>

        <button
          onClick={onEnterStudio}
          disabled={assets.audioTracks.length === 0}
          className={`
            px-6 md:px-10 py-3 md:py-4 rounded-lg font-black text-sm md:text-base uppercase
            transition-all flex items-center gap-2 md:gap-3 border-black
            ${assets.audioTracks.length === 0
              ? 'bg-zinc-300 text-zinc-500 cursor-not-allowed'
              : 'bg-lime-400 text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]'
            }
          `}
          style={{ borderWidth: '3px' }}
        >
          <span className="hidden sm:inline">스튜디오 입장</span>
          <span className="sm:hidden">스튜디오</span>
          <ArrowRight className="w-5 h-5 stroke-[2.5]" />
        </button>
      </header>

      {/* 메인 컨텐츠 */}
      <div className="flex-1 p-4 md:p-6 w-full overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">

          {/* 섹션 1: 비주얼 자산 */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section>
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <span
                  className="text-xs md:text-sm font-black uppercase tracking-widest px-3 py-1.5 bg-violet-500 text-white rounded border-2 border-black"
                >01. 비주얼</span>
                <span className="h-[3px] flex-1 bg-black" />
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* 배경 이미지 - 네오브루탈 */}
                <div className="space-y-2 md:space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-xs md:text-sm font-black uppercase">배경 이미지</label>
                    <span
                      className="text-xs md:text-sm font-black uppercase px-3 py-1.5 bg-cyan-400 text-black rounded border-2 border-black"
                    >16:9 HD</span>
                  </div>
                  <div
                    className={`relative aspect-video rounded-lg overflow-hidden group border-black ${
                      isDarkMode ? 'bg-zinc-800' : 'bg-white'
                    }`}
                    style={{ borderWidth: '3px' }}
                  >
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, 'background')} />
                    {assets.background ? (
                      <img src={assets.background} alt="배경" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <ImageIcon className={`w-10 md:w-12 h-10 md:h-12 mb-2 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-300'}`} />
                        <span className="text-xs md:text-sm font-black uppercase tracking-widest">업로드</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                      <span className="px-4 md:px-5 py-2 md:py-2.5 bg-lime-400 text-black text-xs md:text-sm font-black rounded border-2 border-black uppercase">변경</span>
                    </div>
                  </div>
                </div>

                {/* 로고 - 네오브루탈 */}
                <div className="space-y-2 md:space-y-3">
                  <label className="text-xs md:text-sm font-black uppercase px-1">브랜드 로고</label>
                  <div
                    className={`flex gap-4 md:gap-5 p-4 md:p-5 items-center rounded-lg border-black ${
                      isDarkMode ? 'bg-zinc-800' : 'bg-white'
                    }`}
                    style={{ borderWidth: '3px' }}
                  >
                    <div
                      className={`relative w-20 h-20 md:w-28 md:h-28 rounded-lg flex-shrink-0 group overflow-hidden border-black ${
                        isDarkMode ? 'bg-zinc-900' : 'bg-zinc-100'
                      }`}
                      style={{ borderWidth: '2px' }}
                    >
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} />
                      {assets.logo ? (
                        <img src={assets.logo} alt="로고" className="w-full h-full object-contain p-2 md:p-3" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Settings2 className={`w-6 md:w-8 h-6 md:h-8 ${isDarkMode ? 'text-zinc-700' : 'text-zinc-400'}`} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none text-white text-xs md:text-sm font-black uppercase">편집</div>
                    </div>
                    <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
                      <p className="text-sm md:text-base font-black">브랜드 심볼</p>
                      <p className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>PNG 투명 배경</p>
                      <button
                        className="text-xs md:text-sm font-black uppercase px-3 py-1.5 bg-rose-500 text-white rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >초기화</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* 섹션 2: 오디오 라이브러리 */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section className="flex flex-col">
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <span
                  className="text-xs md:text-sm font-black uppercase tracking-widest px-3 py-1.5 bg-cyan-500 text-white rounded border-2 border-black"
                >02. 오디오</span>
                <div className="flex items-center gap-2 flex-1">
                  {assets.audioTracks.length > 0 && (
                    <button
                      onClick={copyTimeline}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs md:text-sm font-black uppercase transition-all border-black ${
                        copied
                          ? 'bg-green-400 text-black'
                          : 'bg-amber-400 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]'
                      }`}
                      style={{ borderWidth: '2px' }}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '복사됨!' : '타임라인'}
                    </button>
                  )}
                  <span className="h-[3px] flex-1 bg-black" />
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 flex flex-col">
                {/* 업로드 영역 - 네오브루탈 */}
                <div className="relative group">
                  <input
                    type="file" multiple accept="audio/*" onChange={handleAudioUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`border-4 border-dashed rounded-lg p-5 md:p-8 text-center transition-all border-black ${
                      isDarkMode ? 'bg-zinc-800' : 'bg-white'
                    } group-hover:bg-lime-100`}
                  >
                    <CloudUpload className={`w-8 md:w-10 h-8 md:h-10 mx-auto mb-2 md:mb-3 ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`} />
                    <p className="text-sm md:text-base font-black uppercase tracking-[0.15em]">트랙 추가</p>
                    <p className={`text-xs md:text-sm mt-1 uppercase font-bold ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>WAV, MP3, FLAC</p>
                  </div>
                </div>

                {/* 트랙 리스트 - 네오브루탈 */}
                <div className="space-y-2 max-h-[200px] md:max-h-[300px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                  {assets.audioTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-4 rounded-lg transition-all border-black ${
                        isDarkMode ? 'bg-zinc-800' : 'bg-white'
                      }`}
                      style={{ borderWidth: '2px' }}
                    >
                      <span
                        className="text-xs md:text-sm font-black w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-indigo-500 text-white rounded border-2 border-black"
                      >{String(index + 1).padStart(2, '0')}</span>
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded flex items-center justify-center flex-shrink-0 border-black ${
                          isDarkMode ? 'bg-zinc-700' : 'bg-zinc-100'
                        }`}
                        style={{ borderWidth: '2px' }}
                      >
                        <Music className="w-4 md:w-5 h-4 md:h-5 text-pink-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm md:text-base font-black truncate pr-2">{track.file.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm font-black tabular-nums text-cyan-500">
                            {formatTime(getTrackStartTime(index))}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>|</span>
                          <span className={`text-xs md:text-sm font-bold tabular-nums ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            {track.duration}
                          </span>
                        </div>
                      </div>
                      {/* 순서 변경 버튼 */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveTrackUp(index)}
                          disabled={index === 0}
                          className={`p-1.5 rounded transition-colors border-black ${
                            index === 0
                              ? 'opacity-30'
                              : 'bg-zinc-200 hover:bg-lime-400'
                          }`}
                          style={{ borderWidth: '1px' }}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveTrackDown(index)}
                          disabled={index === assets.audioTracks.length - 1}
                          className={`p-1.5 rounded transition-colors border-black ${
                            index === assets.audioTracks.length - 1
                              ? 'opacity-30'
                              : 'bg-zinc-200 hover:bg-lime-400'
                          }`}
                          style={{ borderWidth: '1px' }}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeTrack(track.id)}
                        className="p-2 md:p-2.5 bg-rose-500 text-white rounded border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                      >
                        <Trash2 className="w-4 md:w-5 h-4 md:h-5" />
                      </button>
                    </div>
                  ))}
                  {assets.audioTracks.length === 0 && (
                    <div
                      className={`flex items-center justify-center py-10 md:py-14 rounded-lg border-4 border-dashed border-black ${
                        isDarkMode ? 'bg-zinc-800' : 'bg-white'
                      }`}
                    >
                      <p className="text-xs md:text-sm font-black uppercase tracking-[0.2em]">트랙 없음</p>
                    </div>
                  )}
                </div>

                {/* 트랙 요약 - 네오브루탈 */}
                {assets.audioTracks.length > 0 && (
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-lg border-black ${
                      isDarkMode ? 'bg-zinc-700' : 'bg-zinc-100'
                    }`}
                    style={{ borderWidth: '2px' }}
                  >
                    <span className="text-xs md:text-sm font-black">
                      {assets.audioTracks.length}개 트랙
                    </span>
                    <span className="text-sm md:text-base font-black tabular-nums px-3 py-1 bg-lime-400 text-black rounded border-2 border-black">
                      {formatTime(getTotalDuration())}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* 섹션 3: 인코딩 설정 */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section>
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <span
                  className="text-xs md:text-sm font-black uppercase tracking-widest px-3 py-1.5 bg-amber-500 text-black rounded border-2 border-black"
                >03. 인코딩</span>
                <span className="h-[3px] flex-1 bg-black" />
              </div>

              <div
                className={`rounded-lg p-5 md:p-7 space-y-5 md:space-y-6 border-black ${
                  isDarkMode ? 'bg-zinc-800' : 'bg-white'
                }`}
                style={{ borderWidth: '3px' }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 md:w-5 h-4 md:h-5 text-indigo-500" />
                    <h4 className="text-xs md:text-sm font-black uppercase tracking-wider">출력 설정</h4>
                  </div>
                  <span className="text-xs md:text-sm font-black uppercase px-2 py-1 bg-zinc-200 rounded border-2 border-black">V4.1</span>
                </div>

                <div className="space-y-4 md:space-y-5">
                  {/* 반복 횟수 - 네오브루탈 */}
                  <div
                    className={`p-4 md:p-6 rounded-lg space-y-4 md:space-y-5 border-black ${
                      isDarkMode ? 'bg-zinc-900' : 'bg-zinc-50'
                    }`}
                    style={{ borderWidth: '2px' }}
                  >
                    <div className="flex justify-between items-center">
                      <label className="text-xs md:text-sm font-black uppercase">영상 반복</label>
                      <span className="px-2 py-1 bg-indigo-500 text-white text-xs md:text-sm font-black rounded border-2 border-black">{assets.repeatCount}회</span>
                    </div>
                    <div className="flex gap-3">
                      {[1, 2, 3].map(count => (
                        <button
                          key={count}
                          onClick={() => updateAsset('repeatCount', count)}
                          className={`flex-1 py-3 text-sm md:text-base font-black rounded transition-all border-black ${
                            assets.repeatCount === count
                              ? 'bg-cyan-400 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                              : isDarkMode
                                ? 'bg-zinc-700 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-400 hover:text-black'
                                : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-100'
                          }`}
                          style={{ borderWidth: '2px' }}
                        >
                          {count}회
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 비트레이트 - 네오브루탈 */}
                  <div
                    className={`p-4 md:p-6 rounded-lg space-y-4 md:space-y-5 border-black ${
                      isDarkMode ? 'bg-zinc-900' : 'bg-zinc-50'
                    }`}
                    style={{ borderWidth: '2px' }}
                  >
                    <div className="flex justify-between items-center">
                      <label className="text-xs md:text-sm font-black uppercase">오디오 비트레이트</label>
                      <span className="px-2 py-1 bg-lime-400 text-black text-xs md:text-sm font-black rounded border-2 border-black">{assets.bitrate.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-3">
                      {['96kbps', '128kbps', '192kbps'].map(rate => (
                        <button
                          key={rate}
                          onClick={() => updateAsset('bitrate', rate)}
                          className={`flex-1 py-3 text-sm md:text-base font-black rounded transition-all border-black ${
                            assets.bitrate === rate
                              ? 'bg-pink-500 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                              : isDarkMode
                                ? 'bg-zinc-700 text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-500'
                                : 'bg-white text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-100'
                          }`}
                          style={{ borderWidth: '2px' }}
                        >
                          {rate.split('k')[0]}K
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 md:pt-5 border-t-4 border-black">
                  <div
                    className="flex items-center justify-between p-4 md:p-5 bg-lime-400 rounded-lg border-black"
                    style={{ borderWidth: '2px' }}
                  >
                    <div>
                      <p className="text-sm md:text-base font-black uppercase">GPU 가속</p>
                      <p className="text-xs md:text-sm font-bold mt-0.5">하드웨어 렌더링</p>
                    </div>
                    <div
                      className="w-12 h-7 bg-white rounded border-2 border-black relative shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-lime-400 rounded border-2 border-black" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* 하단 푸터 - 네오브루탈 */}
      <footer
        className={`hidden md:flex h-14 border-t-4 border-black items-center px-6 justify-between mt-auto ${
          isDarkMode ? 'bg-zinc-800' : 'bg-white'
        }`}
      >
        <div className="flex gap-4">
          <span className="text-xs font-black uppercase px-3 py-1.5 bg-lime-400 text-black rounded border-2 border-black">준비됨</span>
          <span className="text-xs font-black uppercase px-3 py-1.5 bg-cyan-400 text-black rounded border-2 border-black">V4.1.0</span>
        </div>
        <p className="text-xs font-black uppercase tracking-[0.3em]">스펙트럼 비주얼라이저</p>
      </footer>
    </div>
  );
};

export default MediaCenter;
