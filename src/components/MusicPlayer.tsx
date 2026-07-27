import React, { useState, useRef, useEffect } from 'react';
import { Music, Play, Pause, Volume2, VolumeX, SkipForward, Sparkles } from 'lucide-react';

interface Track {
  id: string;
  title: string;
  artist: string;
  src: string;
}

const TRACKS: Track[] = [
  {
    id: 'lofi-1',
    title: 'Lofi Chill Study',
    artist: 'Royalty Free Audio',
    src: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3'
  },
  {
    id: 'lofi-2',
    title: 'Relaxing Ambient Glow',
    artist: 'Chill Beats',
    src: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73199.mp3?filename=soft-ambient-111154.mp3'
  },
  {
    id: 'lofi-3',
    title: 'Midnight Coding Flow',
    artist: 'TRL Audio Lab',
    src: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=ambient-piano-10781.mp3'
  }
];

export const MusicPlayer: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.35);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const currentTrack = TRACKS[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    setHasError(false);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn('Audio play error:', err);
          setHasError(true);
          setIsPlaying(false);
        });
    }
  };

  const nextTrack = () => {
    const nextIdx = (currentTrackIndex + 1) % TRACKS.length;
    setCurrentTrackIndex(nextIdx);
    setIsPlaying(false);
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(() => setHasError(true));
      }
    }, 150);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  return (
    <div className="relative inline-block">
      <audio
        ref={audioRef}
        src={currentTrack.src}
        loop
        onError={() => setHasError(true)}
      />

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
          isPlaying
            ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30 animate-pulse'
            : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
        }`}
        title="Background Music Player"
      >
        <Music className={`w-3.5 h-3.5 ${isPlaying ? 'text-purple-400 animate-spin-slow' : 'text-slate-400'}`} />
        <span className="hidden sm:inline">
          {isPlaying ? currentTrack.title : 'Relaxing Music'}
        </span>
      </button>

      {/* Player Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900/95 dark:bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-xl z-50 text-slate-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2.5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-semibold tracking-wide text-slate-200">
                TRL Background Music
              </span>
            </div>
            <span className="text-[10px] bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 py-0.5 rounded font-mono">
              Copyright-Free
            </span>
          </div>

          <div className="mb-3">
            <p className="text-xs font-medium text-purple-300 truncate">{currentTrack.title}</p>
            <p className="text-[11px] text-slate-400 truncate">{currentTrack.artist}</p>
          </div>

          {hasError && (
            <p className="text-[11px] text-amber-400 bg-amber-500/10 p-1.5 rounded mb-2 text-center">
              Click play to start audio playback.
            </p>
          )}

          {/* Controls */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <button
              onClick={toggleMute}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={togglePlay}
              className="p-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-full shadow-lg transition transform active:scale-95"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              onClick={nextTrack}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition"
              title="Next Track"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Volume Slider */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Volume2 className="w-3 h-3 text-slate-500" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={(e) => {
                setIsMuted(false);
                setVolume(parseFloat(e.target.value));
              }}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
            />
            <span className="text-[10px] w-6 font-mono text-right">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
