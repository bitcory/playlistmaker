
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
    <div className={`min-h-full flex flex-col pb-16 md:pb-0 transition-colors duration-300 ${
      isDarkMode ? 'bg-zinc-950' : 'bg-zinc-50'
    }`}>
      {/* Header */}
      <header
        className={`h-16 md:h-20 flex items-center justify-between px-4 md:px-6 border-b transition-colors duration-300 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <span
            className={`hidden sm:inline text-xs md:text-sm font-medium tracking-wide px-3 py-1.5 rounded-full ${
              isDarkMode ? 'bg-indigo-600/20 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
            }`}
          >프로젝트</span>
          <div className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className={`text-sm md:text-base font-semibold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>미디어 센터</span>
        </div>

        <button
          onClick={onEnterStudio}
          disabled={assets.audioTracks.length === 0}
          className={`
            px-6 md:px-10 py-2.5 md:py-3 rounded-lg font-semibold text-sm md:text-base
            transition-all duration-200 flex items-center gap-2 md:gap-3
            ${assets.audioTracks.length === 0
              ? isDarkMode
                ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                : 'bg-zinc-100 text-zinc-400 cursor-not-allowed'
              : 'bg-indigo-600 text-white hover:bg-indigo-500 active:scale-[0.98]'
            }
          `}
        >
          <span className="hidden sm:inline">스튜디오 입장</span>
          <span className="sm:hidden">스튜디오</span>
          <ArrowRight className="w-5 h-5 stroke-[2]" />
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 md:p-6 w-full overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">

          {/* Section 1: Visual Assets */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section>
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <span
                  className={`text-xs font-medium tracking-wide px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-violet-500/15 text-violet-400' : 'bg-violet-50 text-violet-600'
                  }`}
                >01. 비주얼</span>
                <span className={`h-px flex-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
              </div>

              <div className="space-y-4 md:space-y-6">
                {/* Background Image */}
                <div className="space-y-2 md:space-y-3">
                  <div
                    className={`relative aspect-video rounded-xl overflow-hidden group border transition-colors duration-200 ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, 'background')} />
                    {assets.background ? (
                      <img src={assets.background} alt="배경" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center">
                        <ImageIcon className={`w-10 md:w-12 h-10 md:h-12 mb-2 ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`} />
                        <span className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-500' : 'text-zinc-400'}`}>클릭하여 업로드</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none">
                      <span className="px-4 md:px-5 py-2 md:py-2.5 bg-indigo-600 text-white text-xs md:text-sm font-medium rounded-lg">변경</span>
                    </div>
                  </div>
                </div>

                {/* Logo */}
                <div className="space-y-2 md:space-y-3">
                  <label className={`text-xs md:text-sm font-medium px-1 ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>브랜드 로고</label>
                  <div
                    className={`flex gap-4 md:gap-5 p-4 md:p-5 items-center rounded-xl border transition-colors duration-200 ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <div
                      className={`relative w-20 h-20 md:w-28 md:h-28 rounded-xl flex-shrink-0 group overflow-hidden border transition-colors duration-200 ${
                        isDarkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
                      }`}
                    >
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10 cursor-pointer" onChange={(e) => handleImageUpload(e, 'logo')} />
                      {assets.logo ? (
                        <img src={assets.logo} alt="로고" className="w-full h-full object-contain p-2 md:p-3" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Settings2 className={`w-6 md:w-8 h-6 md:h-8 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none">
                        <span className="text-white text-xs md:text-sm font-medium">편집</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-1.5 md:space-y-2 min-w-0">
                      <p className={`text-sm md:text-base font-semibold ${isDarkMode ? 'text-zinc-100' : 'text-zinc-900'}`}>브랜드 심볼</p>
                      <p className={`text-xs md:text-sm ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>PNG 투명 배경</p>
                      <button
                        className="text-xs md:text-sm font-medium px-3 py-1.5 bg-rose-600/10 text-rose-500 rounded-lg hover:bg-rose-600/20 transition-colors duration-200"
                      >초기화</button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Section 2: Audio Library */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section className="flex flex-col">
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <span
                  className={`text-xs font-medium tracking-wide px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-cyan-500/15 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                  }`}
                >02. 오디오</span>
                <div className="flex items-center gap-2 flex-1">
                  {assets.audioTracks.length > 0 && (
                    <button
                      onClick={copyTimeline}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-all duration-200 ${
                        copied
                          ? 'bg-emerald-500/15 text-emerald-400'
                          : isDarkMode
                            ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                            : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
                      }`}
                    >
                      {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied ? '복사됨!' : '타임라인'}
                    </button>
                  )}
                  <span className={`h-px flex-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
                </div>
              </div>

              <div className="space-y-3 md:space-y-4 flex flex-col">
                {/* Upload Area */}
                <div className="relative group">
                  <input
                    type="file" multiple accept="audio/*" onChange={handleAudioUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div
                    className={`border border-dashed rounded-xl p-5 md:p-8 text-center transition-all duration-200 ${
                      isDarkMode
                        ? 'border-zinc-700 bg-zinc-900 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/5'
                        : 'border-zinc-300 bg-white group-hover:border-indigo-400 group-hover:bg-indigo-50/50'
                    }`}
                  >
                    <CloudUpload className={`w-8 md:w-10 h-8 md:h-10 mx-auto mb-2 md:mb-3 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`} />
                    <p className={`text-sm md:text-base font-semibold ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>트랙 추가</p>
                    <p className={`text-xs md:text-sm mt-1 ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>WAV, MP3, FLAC</p>
                  </div>
                </div>

                {/* Track List */}
                <div className="space-y-1.5 max-h-[200px] md:max-h-[300px] overflow-y-auto pr-1 md:pr-2 custom-scrollbar">
                  {assets.audioTracks.map((track, index) => (
                    <div
                      key={track.id}
                      className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-3 md:py-3.5 rounded-xl transition-all duration-200 border ${
                        isDarkMode
                          ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'
                          : 'bg-white border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <span
                        className="text-xs md:text-sm font-semibold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center bg-indigo-600 text-white rounded-lg"
                      >{String(index + 1).padStart(2, '0')}</span>
                      <div
                        className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isDarkMode ? 'bg-zinc-800' : 'bg-zinc-100'
                        }`}
                      >
                        <Music className="w-4 md:w-5 h-4 md:h-5 text-indigo-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm md:text-base font-medium truncate pr-2 ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>{track.file.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs md:text-sm font-semibold tabular-nums text-cyan-500">
                            {formatTime(getTrackStartTime(index))}
                          </span>
                          <span className={`text-xs ${isDarkMode ? 'text-zinc-700' : 'text-zinc-300'}`}>/</span>
                          <span className={`text-xs md:text-sm tabular-nums ${isDarkMode ? 'text-zinc-500' : 'text-zinc-500'}`}>
                            {track.duration}
                          </span>
                        </div>
                      </div>
                      {/* Reorder Buttons */}
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => moveTrackUp(index)}
                          disabled={index === 0}
                          className={`p-1 rounded-md transition-colors duration-200 ${
                            index === 0
                              ? 'opacity-20 cursor-not-allowed'
                              : isDarkMode
                                ? 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
                          }`}
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => moveTrackDown(index)}
                          disabled={index === assets.audioTracks.length - 1}
                          className={`p-1 rounded-md transition-colors duration-200 ${
                            index === assets.audioTracks.length - 1
                              ? 'opacity-20 cursor-not-allowed'
                              : isDarkMode
                                ? 'text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200'
                                : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      </div>
                      <button
                        onClick={() => removeTrack(track.id)}
                        className="p-2 md:p-2.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors duration-200"
                      >
                        <Trash2 className="w-4 md:w-5 h-4 md:h-5" />
                      </button>
                    </div>
                  ))}
                  {assets.audioTracks.length === 0 && (
                    <div
                      className={`flex items-center justify-center py-10 md:py-14 rounded-xl border border-dashed ${
                        isDarkMode ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-white'
                      }`}
                    >
                      <p className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>트랙 없음</p>
                    </div>
                  )}
                </div>

                {/* Track Summary */}
                {assets.audioTracks.length > 0 && (
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                      isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                    }`}
                  >
                    <span className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      {assets.audioTracks.length}개 트랙
                    </span>
                    <span className={`text-sm md:text-base font-semibold tabular-nums px-3 py-1 rounded-lg ${
                      isDarkMode ? 'bg-indigo-600/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                      {formatTime(getTotalDuration())}
                    </span>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Section 3: Encoding Settings */}
          <div className="lg:col-span-4 space-y-4 md:space-y-6">
            <section>
              <div className="flex items-center gap-3 mb-4 md:mb-5">
                <span
                  className={`text-xs font-medium tracking-wide px-3 py-1 rounded-full ${
                    isDarkMode ? 'bg-amber-500/15 text-amber-400' : 'bg-amber-50 text-amber-600'
                  }`}
                >03. 인코딩</span>
                <span className={`h-px flex-1 ${isDarkMode ? 'bg-zinc-800' : 'bg-zinc-200'}`} />
              </div>

              <div
                className={`rounded-xl p-5 md:p-7 space-y-5 md:space-y-6 border transition-colors duration-200 ${
                  isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 md:w-5 h-4 md:h-5 text-indigo-500" />
                    <h4 className={`text-xs md:text-sm font-semibold ${isDarkMode ? 'text-zinc-200' : 'text-zinc-800'}`}>출력 설정</h4>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                    isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
                  }`}>V4.1</span>
                </div>

                <div className="space-y-4 md:space-y-5">
                  {/* Repeat Count */}
                  <div
                    className={`p-4 md:p-6 rounded-xl space-y-4 md:space-y-5 border ${
                      isDarkMode ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <label className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>영상 반복</label>
                      <span className={`px-2.5 py-1 text-xs md:text-sm font-semibold rounded-full ${
                        isDarkMode ? 'bg-indigo-600/15 text-indigo-400' : 'bg-indigo-50 text-indigo-600'
                      }`}>{assets.repeatCount}회</span>
                    </div>
                    <div className="flex gap-2">
                      {[1, 2, 3].map(count => (
                        <button
                          key={count}
                          onClick={() => updateAsset('repeatCount', count)}
                          className={`flex-1 py-3 text-sm md:text-base font-semibold rounded-lg transition-all duration-200 ${
                            assets.repeatCount === count
                              ? 'bg-indigo-600 text-white'
                              : isDarkMode
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {count}회
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bitrate */}
                  <div
                    className={`p-4 md:p-6 rounded-xl space-y-4 md:space-y-5 border ${
                      isDarkMode ? 'bg-zinc-800/50 border-zinc-800' : 'bg-zinc-50 border-zinc-100'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <label className={`text-xs md:text-sm font-medium ${isDarkMode ? 'text-zinc-300' : 'text-zinc-700'}`}>오디오 비트레이트</label>
                      <span className={`px-2.5 py-1 text-xs md:text-sm font-semibold rounded-full ${
                        isDarkMode ? 'bg-cyan-500/15 text-cyan-400' : 'bg-cyan-50 text-cyan-600'
                      }`}>{assets.bitrate.toUpperCase()}</span>
                    </div>
                    <div className="flex gap-2">
                      {['96kbps', '128kbps', '192kbps'].map(rate => (
                        <button
                          key={rate}
                          onClick={() => updateAsset('bitrate', rate)}
                          className={`flex-1 py-3 text-sm md:text-base font-semibold rounded-lg transition-all duration-200 ${
                            assets.bitrate === rate
                              ? 'bg-cyan-500 text-white'
                              : isDarkMode
                                ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                                : 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-100'
                          }`}
                        >
                          {rate.split('k')[0]}K
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`pt-4 md:pt-5 border-t ${isDarkMode ? 'border-zinc-800' : 'border-zinc-200'}`}>
                  <div
                    className={`flex items-center justify-between p-4 md:p-5 rounded-xl ${
                      isDarkMode ? 'bg-emerald-500/10' : 'bg-emerald-50'
                    }`}
                  >
                    <div>
                      <p className={`text-sm md:text-base font-semibold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>GPU 가속</p>
                      <p className={`text-xs md:text-sm mt-0.5 ${isDarkMode ? 'text-emerald-500/60' : 'text-emerald-600/70'}`}>하드웨어 렌더링</p>
                    </div>
                    <div
                      className={`w-11 h-6 rounded-full relative transition-colors duration-200 ${
                        isDarkMode ? 'bg-emerald-500' : 'bg-emerald-500'
                      }`}
                    >
                      <div className="absolute right-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-200" />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer
        className={`hidden md:flex h-14 border-t items-center px-6 justify-between mt-auto transition-colors duration-300 ${
          isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
        }`}
      >
        <div className="flex gap-3">
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            isDarkMode ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
          }`}>준비됨</span>
          <span className={`text-xs font-medium px-3 py-1.5 rounded-full ${
            isDarkMode ? 'bg-zinc-800 text-zinc-400' : 'bg-zinc-100 text-zinc-500'
          }`}>V4.1.0</span>
        </div>
        <p className={`text-xs font-medium tracking-wider ${isDarkMode ? 'text-zinc-600' : 'text-zinc-400'}`}>스펙트럼 비주얼라이저</p>
      </footer>
    </div>
  );
};

export default MediaCenter;
