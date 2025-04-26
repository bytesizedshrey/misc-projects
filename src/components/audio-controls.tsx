
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Headphones, HeadphonesFilled, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioControlsProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export function AudioControls({ isPlaying, onToggle }: AudioControlsProps) {
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    // Create audio element
    const audio = new Audio('/sounds/cyberpunk-beat.mp3');
    audio.loop = true;
    audio.volume = volume;
    audioRef.current = audio;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);
  
  // Handle play/pause
  useEffect(() => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.play().catch(err => console.log("Audio play failed:", err));
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying]);
  
  // Update volume
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.volume = volume;
  }, [volume]);
  
  // Volume control function - adjust as needed
  const toggleMute = () => {
    if (!audioRef.current) return;
    
    if (volume > 0) {
      setVolume(0);
    } else {
      setVolume(0.5);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Button 
        variant="outline" 
        size="icon" 
        onClick={onToggle}
        className={cn(
          "clay-button relative overflow-hidden",
          isPlaying && "border-primary"
        )}
      >
        {isPlaying ? (
          <HeadphonesFilled className="h-[1.2rem] w-[1.2rem] text-primary" />
        ) : (
          <Headphones className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>
      
      <Button 
        variant="outline" 
        size="icon" 
        onClick={toggleMute}
        className="clay-button"
      >
        {volume > 0 ? (
          <Volume2 className="h-[1.2rem] w-[1.2rem]" />
        ) : (
          <VolumeX className="h-[1.2rem] w-[1.2rem]" />
        )}
      </Button>
    </div>
  );
}
