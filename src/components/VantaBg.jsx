import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import NET from 'vanta/dist/vanta.net.min';

export default function VantaBg() {
  const ref = useRef(null);
  const vantaRef = useRef(null);

  useEffect(() => {
    if (!vantaRef.current && ref.current) {
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
    return () => {
      if (vantaRef.current) {
        vantaRef.current.destroy();
        vantaRef.current = null;
      }
    };
  }, []);

  return <div ref={ref} className="vanta-bg-fill" />;
}
