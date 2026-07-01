import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

export default function VantaBg() {
  const ref = useRef(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaRef.current && ref.current) {
      try {
        if (typeof NET === 'function') {
          vantaRef.current = NET({
            el: ref.current,
            THREE,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200,
            minWidth: 200,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x3f82ff,
            backgroundColor: 0x080808,
            points: 11,
            maxDistance: 21,
            spacing: 17,
          });
        }
      } catch (err) {
        console.error('Failed to initialize Vanta.js background:', err);
      }
    }
    return () => {
      if (vantaRef.current) {
        try {
          if (typeof vantaRef.current.destroy === 'function') {
            vantaRef.current.destroy();
          }
        } catch (err) {
          console.error('Failed to destroy Vanta.js background:', err);
        }
        vantaRef.current = null;
      }
    };
  }, []);

  return <div ref={ref} className="vanta-bg-fill" />;
}
