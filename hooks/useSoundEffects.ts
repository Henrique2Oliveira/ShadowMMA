import { Audio } from 'expo-av';
import { useEffect, useState } from 'react';

interface SoundEffects {
  sounds: Audio.Sound[];
  bellSound: Audio.Sound | null;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
  playRandomEffect: () => Promise<void>;
  playBellSound: () => Promise<void>;
  cleanup: () => void;
}

export const useSoundEffects = (): SoundEffects => {
  const [sounds, setSounds] = useState<Audio.Sound[]>([]);
  const [bellSound, setBellSound] = useState<Audio.Sound | null>(null);
  const [isMuted, setIsMuted] = useState(false);

  const soundFiles = [
    require('@/assets/audio/sfx/swoosh1.mp3'),
    require('@/assets/audio/sfx/swoosh2.mp3'),
    require('@/assets/audio/sfx/swoosh3.mp3'),
  ];

  useEffect(() => {
    const loadSounds = async () => {
      try {
        const loadedSounds = await Promise.all(
          soundFiles.map(file => Audio.Sound.createAsync(file))
        );
        setSounds(loadedSounds.map(({ sound }) => sound));

        const { sound: bell } = await Audio.Sound.createAsync(
          require('@/assets/audio/bell-sound.mp3')
        );
        setBellSound(bell);
      } catch (error) {
        console.error('Error loading sounds:', error);
      }
    };

    loadSounds();

    return () => cleanup();
  }, []);

  const cleanup = () => {
    sounds.forEach(sound => {
      if (sound) {
        try {
          sound.unloadAsync();
        } catch (error) {
          console.error('Error unloading sound:', error);
        }
      }
    });

    if (bellSound) {
      try {
        bellSound.unloadAsync();
      } catch (error) {
        console.error('Error unloading bell sound:', error);
      }
    }
  };

  const playRandomEffect = async () => {
    if (sounds.length > 0 && !isMuted) {
      const randomSound = sounds[Math.floor(Math.random() * sounds.length)];
      if (randomSound) {
        try {
          const status = await randomSound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await randomSound.stopAsync();
          }
          if (status.isLoaded) {
            await randomSound.setPositionAsync(0);
            await randomSound.playAsync();
          }
        } catch (error) {
          console.warn('Sound effect error:', error);
        }
      }
    }
  };

  const playBellSound = async () => {
    if (!isMuted && bellSound) {
      try {
        await bellSound.stopAsync();
        await bellSound.playFromPositionAsync(0);
      } catch (error) {
        console.error('Error playing bell sound:', error);
      }
    }
  };

  return {
    sounds,
    bellSound,
    isMuted,
    setIsMuted,
    playRandomEffect,
    playBellSound,
    cleanup,
  };
};
