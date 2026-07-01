import React, { useRef, useEffect, useState, useCallback } from 'react';
import './MusicReactiveHero.css';

export const MusicReactiveHero = () => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const beamRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [audioProgress, setAudioProgress] = useState(0);
  const [fps, setFps] = useState(60);

  // Film grain generator class
  class FilmGrain {
    constructor(width, height) {
      this.width = width;
      this.height = height;
      this.grainCanvas = document.createElement('canvas');
      this.grainCanvas.width = width;
      this.grainCanvas.height = height;
      this.grainCtx = this.grainCanvas.getContext('2d');
      this.grainData = null;
      this.frame = 0;
      this.generateGrainPattern();
    }

    generateGrainPattern() {
      const imageData = this.grainCtx.createImageData(this.width, this.height);
      const data = imageData.data;
      
      for (let i = 0; i < data.length; i += 4) {
        const grain = Math.random();
        const value = grain * 255;
        data[i] = value;     // R
        data[i + 1] = value; // G
        data[i + 2] = value; // B
        data[i + 3] = 255;   // A
      }
      
      this.grainData = imageData;
    }

    update() {
      this.frame++;
      
      if (this.frame % 2 === 0) {
        const data = this.grainData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const grain = Math.random();
          const time = this.frame * 0.01;
          const x = (i / 4) % this.width;
          const y = Math.floor((i / 4) / this.width);
          
          const pattern = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 - time);
          const value = (grain * 0.8 + pattern * 0.2) * 255;
          
          data[i] = value;
          data[i + 1] = value;
          data[i + 2] = value;
        }
        
        this.grainCtx.putImageData(this.grainData, 0, 0);
      }
    }

    apply(ctx, intensity = 0.05, colorize = true, hue = 217) {
      ctx.save();
      
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = intensity * 0.4;
      ctx.drawImage(this.grainCanvas, 0, 0);
      
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha = Math.max(0, 1 - (intensity * 0.25));
      ctx.drawImage(this.grainCanvas, 0, 0);
      
      if (colorize) {
        ctx.globalCompositeOperation = 'overlay';
        ctx.globalAlpha = intensity * 0.2;
        ctx.fillStyle = `hsla(${hue}, 50%, 50%, 1)`;
        ctx.fillRect(0, 0, this.width, this.height);
      }
      
      ctx.restore();
    }

    resize(width, height) {
      this.width = width;
      this.height = height;
      this.grainCanvas.width = width;
      this.grainCanvas.height = height;
      this.generateGrainPattern();
    }
  }

  // Initialize audio
  const initAudio = useCallback(() => {
    if (!audioRef.current || audioContextRef.current) return;
    
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaElementSource(audioRef.current);
      source.connect(analyser);
      analyser.connect(audioContext.destination);
    } catch (error) {
      console.error('Error initializing audio:', error);
    }
  }, []);

  // Initialize canvas and animation
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (beam.filmGrain) {
        beam.filmGrain.resize(canvas.width, canvas.height);
      }
    };
    
    const filmGrain = new FilmGrain(window.innerWidth, window.innerHeight);
    
    const beam = {
      bassIntensity: 0,
      midIntensity: 0,
      trebleIntensity: 0,
      time: 0,
      filmGrain: filmGrain,
      colorState: {
        hue: 217, // Start at Ahmad's portfolio blue
        targetHue: 217,
        saturation: 90,
        targetSaturation: 90,
        lightness: 60,
        targetLightness: 60
      },
      waves: [
        { 
          amplitude: 28, 
          frequency: 0.0025, 
          speed: 0.015, 
          offset: 0,
          opacity: 0.85
        },
        { 
          amplitude: 22, 
          frequency: 0.0035, 
          speed: 0.012, 
          offset: Math.PI * 0.5,
          opacity: 0.65
        },
        { 
          amplitude: 18, 
          frequency: 0.0045, 
          speed: 0.02, 
          offset: Math.PI,
          opacity: 0.45
        },
        { 
          amplitude: 32, 
          frequency: 0.0018, 
          speed: 0.008, 
          offset: Math.PI * 1.5,
          opacity: 0.55
        }
      ],
      particles: [],
      bassHistory: new Array(20).fill(0),
      postProcessing: {
        filmGrainIntensity: 0.03,
        vignetteIntensity: 0.5,
        chromaticAberration: 0.6,
        scanlineIntensity: 0.015
      }
    };
    beamRef.current = beam;
    
    resizeCanvas();
    
    let lastFrameTime = performance.now();
    let frameCount = 0;

    const animate = () => {
      animationRef.current = requestAnimationFrame(animate);
      
      const now = performance.now();
      frameCount++;
      if (now > lastFrameTime + 1000) {
        setFps(Math.round((frameCount * 1000) / (now - lastFrameTime)));
        frameCount = 0;
        lastFrameTime = now;
      }

      ctx.fillStyle = 'rgba(8, 8, 8, 0.90)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      let bassAmplitude = 0;
      let midAmplitude = 0;
      let trebleAmplitude = 0;
      
      if (analyserRef.current && isPlaying) {
        const bufferLength = analyserRef.current.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let bassSum = 0;
        for (let i = 0; i < 30; i++) {
          bassSum += dataArray[i];
        }
        bassAmplitude = bassSum / (30 * 255);
        
        let midSum = 0;
        for (let i = 30; i < 200; i++) {
          midSum += dataArray[i];
        }
        midAmplitude = midSum / (170 * 255);
        
        let trebleSum = 0;
        for (let i = 200; i < 800; i++) {
          trebleSum += dataArray[i];
        }
        trebleAmplitude = trebleSum / (600 * 255);
        
        beam.bassHistory.shift();
        beam.bassHistory.push(bassAmplitude);
        const avgBass = beam.bassHistory.reduce((a, b) => a + b) / beam.bassHistory.length;
        
        beam.bassIntensity = avgBass;
        beam.midIntensity = midAmplitude;
        beam.trebleIntensity = trebleAmplitude;
        
        // Custom HSL target tailored to blue/purple portfolio palette
        if (bassAmplitude > midAmplitude && bassAmplitude > trebleAmplitude) {
          beam.colorState.targetHue = 210 + bassAmplitude * 20; // Slate blue
          beam.colorState.targetSaturation = 85 + bassAmplitude * 15;
          beam.colorState.targetLightness = 50 + bassAmplitude * 10;
        } else if (midAmplitude > trebleAmplitude) {
          beam.colorState.targetHue = 230 + midAmplitude * 40; // Royal purple
          beam.colorState.targetSaturation = 75 + midAmplitude * 20;
          beam.colorState.targetLightness = 55 + midAmplitude * 10;
        } else {
          beam.colorState.targetHue = 190 + trebleAmplitude * 30; // Bright cyan
          beam.colorState.targetSaturation = 80 + trebleAmplitude * 20;
          beam.colorState.targetLightness = 60 + trebleAmplitude * 10;
        }
        
        beam.postProcessing.filmGrainIntensity = 0.03 + bassAmplitude * 0.15;
        beam.postProcessing.chromaticAberration = trebleAmplitude * 0.4;
        
      } else {
        // Tech blue/purple color sweep demo
        beam.bassIntensity = 0.4 + Math.sin(beam.time * 0.01) * 0.25;
        beam.midIntensity = 0.3 + Math.sin(beam.time * 0.015) * 0.15;
        beam.trebleIntensity = 0.2 + Math.sin(beam.time * 0.02) * 0.08;
        
        beam.colorState.targetHue = 217 + Math.sin(beam.time * 0.005) * 35; // Cycles between cyan, blue, purple
        beam.colorState.targetSaturation = 80 + Math.sin(beam.time * 0.01) * 15;
        beam.colorState.targetLightness = 52 + Math.sin(beam.time * 0.008) * 10;
      }
      
      beam.colorState.hue += (beam.colorState.targetHue - beam.colorState.hue) * 0.05;
      beam.colorState.saturation += (beam.colorState.targetSaturation - beam.colorState.saturation) * 0.15;
      beam.colorState.lightness += (beam.colorState.targetLightness - beam.colorState.lightness) * 0.1;
      
      beam.time++;
      
      const centerY = canvas.height / 2;
      
      // Draw waves
      beam.waves.forEach((wave, waveIndex) => {
        wave.offset += wave.speed * (1 + beam.bassIntensity * 0.7);
        
        const freqInfluence = waveIndex < 2 ? beam.bassIntensity : beam.midIntensity;
        const dynamicAmplitude = wave.amplitude * (1 + freqInfluence * 4.5);
        
        const waveHue = beam.colorState.hue + waveIndex * 12;
        const waveSaturation = beam.colorState.saturation - waveIndex * 4;
        const waveLightness = beam.colorState.lightness + waveIndex * 4;
        
        const gradient = ctx.createLinearGradient(0, centerY - dynamicAmplitude, 0, centerY + dynamicAmplitude);
        const alpha = wave.opacity * (0.45 + beam.bassIntensity * 0.55);
        
        gradient.addColorStop(0, `hsla(${waveHue}, ${waveSaturation}%, ${waveLightness}%, 0)`);
        gradient.addColorStop(0.5, `hsla(${waveHue}, ${waveSaturation}%, ${Math.min(90, waveLightness + 10)}%, ${alpha})`);
        gradient.addColorStop(1, `hsla(${waveHue}, ${waveSaturation}%, ${waveLightness}%, 0)`);
        
        ctx.beginPath();
        for (let x = -50; x <= canvas.width + 50; x += 2) {
          const y1 = Math.sin(x * wave.frequency + wave.offset) * dynamicAmplitude;
          const y2 = Math.sin(x * wave.frequency * 2 + wave.offset * 1.5) * (dynamicAmplitude * 0.28 * beam.midIntensity);
          const y3 = Math.sin(x * wave.frequency * 0.5 + wave.offset * 0.7) * (dynamicAmplitude * 0.45);
          const y = centerY + y1 + y2 + y3;
          
          if (x === -50) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.lineTo(canvas.width + 50, canvas.height);
        ctx.lineTo(-50, canvas.height);
        ctx.closePath();
        
        ctx.fillStyle = gradient;
        ctx.fill();
      });
      
      // Post processing
      beam.filmGrain.update();
      beam.filmGrain.apply(ctx, beam.postProcessing.filmGrainIntensity, true, beam.colorState.hue);
      
      // Scanlines
      ctx.strokeStyle = `rgba(0, 0, 0, ${beam.postProcessing.scanlineIntensity})`;
      ctx.lineWidth = 1;
      for (let y = 0; y < canvas.height; y += 3) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      // Chromatic aberration
      if (beam.postProcessing.chromaticAberration > 0.05) {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.globalAlpha = 0.07;
        ctx.drawImage(canvas, -beam.postProcessing.chromaticAberration * 4, 0);
        ctx.drawImage(canvas, beam.postProcessing.chromaticAberration * 4, 0);
        ctx.restore();
      }
      
      // Vignette
      const vignette = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, canvas.width * 0.25,
        canvas.width / 2, canvas.height / 2, canvas.width * 0.85
      );
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(0.5, `rgba(0, 0, 0, ${beam.postProcessing.vignetteIntensity * 0.25})`);
      vignette.addColorStop(0.8, `rgba(0, 0, 0, ${beam.postProcessing.vignetteIntensity * 0.55})`);
      vignette.addColorStop(1, `rgba(0, 0, 0, ${beam.postProcessing.vignetteIntensity})`);
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Film dust
      if (Math.random() < 0.02) {
        const dustCount = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < dustCount; i++) {
          const x = Math.random() * canvas.width;
          const y = Math.random() * canvas.height;
          const size = Math.random() * 1.5 + 0.5;
          
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.25})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      // Flicker
      const flicker = Math.sin(beam.time * 0.3) * 0.015 + Math.random() * 0.007;
      ctx.fillStyle = `rgba(255, 255, 255, ${flicker})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Color grading
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.globalAlpha = 0.07;
      const colorGradeGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      colorGradeGradient.addColorStop(0, 'rgb(255, 240, 220)');
      colorGradeGradient.addColorStop(0.5, 'rgb(255, 255, 255)');
      colorGradeGradient.addColorStop(1, 'rgb(220, 230, 255)');
      ctx.fillStyle = colorGradeGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
      
      // Film scratches
      if (Math.random() < 0.004) {
        ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.15 + 0.05})`;
        ctx.lineWidth = Math.random() * 1.2 + 0.4;
        ctx.beginPath();
        const scratchX = Math.random() * canvas.width;
        ctx.moveTo(scratchX, 0);
        ctx.lineTo(scratchX + (Math.random() - 0.5) * 15, canvas.height);
        ctx.stroke();
      }
    };
    
    animate();
    
    window.addEventListener('resize', resizeCanvas);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isPlaying]);

  // Toggle playback
  const togglePlayback = useCallback(() => {
    if (!audioRef.current) return;
    
    if (!audioContextRef.current) {
      initAudio();
    }
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (audioContextRef.current?.state === 'suspended') {
        audioContextRef.current.resume();
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(error => {
        console.warn('Audio play failed, playing demo visualizer:', error);
        setIsPlaying(true);
      });
    }
  }, [isPlaying, initAudio]);

  // Update progress
  const updateProgress = useCallback(() => {
    if (audioRef.current && audioRef.current.duration) {
      const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
      setAudioProgress(progress);
    }
  }, []);

  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      const handleCanPlay = () => setIsLoading(false);
      const handleError = () => {
        setIsLoading(false);
      };
      
      audio.addEventListener('canplay', handleCanPlay);
      audio.addEventListener('error', handleError);
      audio.addEventListener('timeupdate', updateProgress);
      
      const checkTimeout = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      
      return () => {
        clearTimeout(checkTimeout);
        audio.removeEventListener('canplay', handleCanPlay);
        audio.removeEventListener('error', handleError);
        audio.removeEventListener('timeupdate', updateProgress);
      };
    }
  }, [updateProgress]);

  return (
    <div className="music-reactive-hero">
      <canvas ref={canvasRef} className="visualization-canvas" />
      
      <div className="hero-content">
        <p className="hero-tagline">Front-End Developer · IoT Engineer</p>
        <h1 className="hero-title">
          <span className="title-line">Ahmad</span>
          <span className="title-line title-outline">AL Batayneh</span>
        </h1>
        <p className="hero-subtitle">
          Combining React.js expertise with embedded systems to build web interfaces
          that connect browsers to real-world hardware.
        </p>
        <p className="hero-credit">Based in Amman, Jordan · Open to remote internships</p>
      </div>
      
      <button 
        className={`play-button ${isPlaying ? 'playing' : ''}`}
        onClick={togglePlayback}
        disabled={isLoading}
      >
        {isLoading ? 'LOADING' : (isPlaying ? 'STOP EXPERIMENT' : 'PLAY EXPERIMENT')}
      </button>
      
      <div className="audio-progress">
        <div 
          className="progress-bar" 
          style={{ width: `${audioProgress}%` }}
        />
      </div>
      
      <div className="corner-info">
        <span className="fps-counter">SYS_FPS: {fps}</span>
      </div>
      
      <div className="bottom-info">
        <div className="artist-avatar">AB</div>
        <span className="artist-name">Ahmad Batayneh</span>
        <span className="social-handle">@iot-ahmad</span>
      </div>
      
      <audio 
        ref={audioRef}
        src=""
        crossOrigin="anonymous"
        preload="auto"
      />
    </div>
  );
};

export const Component = MusicReactiveHero;
export default MusicReactiveHero;
