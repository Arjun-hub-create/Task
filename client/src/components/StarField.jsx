import { useEffect, useRef } from 'react';

const StarField = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    let particles = [];
    let shootingStars = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticle = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 1.5 + 0.3,
      speedY: Math.random() * 0.3 + 0.05,
      speedX: (Math.random() - 0.5) * 0.1,
      opacity: Math.random() * 0.8 + 0.1,
      twinkle: Math.random() > 0.7,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
    });

    const createShootingStar = () => ({
      x: Math.random() * canvas.width,
      y: -10,
      length: Math.random() * 120 + 60,
      speed: Math.random() * 8 + 6,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 60 + 40,
    });

    resize();
    window.addEventListener('resize', resize);

    // Create particles
    for (let i = 0; i < 250; i++) {
      particles.push(createParticle());
    }

    let frameCount = 0;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      // Occasionally spawn shooting stars
      if (frameCount % 180 === 0 && Math.random() > 0.4) {
        shootingStars.push(createShootingStar());
      }

      // Draw particles
      particles.forEach((p, i) => {
        let opacity = p.opacity;
        if (p.twinkle) {
          opacity = p.opacity * (0.5 + 0.5 * Math.sin(frameCount * p.twinkleSpeed + p.twinkleOffset));
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${opacity})`;
        ctx.fill();

        // Move
        p.y -= p.speedY;
        p.x += p.speedX;

        // Wrap around
        if (p.y < -5) {
          particles[i] = { ...createParticle(), y: canvas.height + 5 };
        }
        if (p.x < -5) p.x = canvas.width + 5;
        if (p.x > canvas.width + 5) p.x = -5;
      });

      // Draw shooting stars
      shootingStars = shootingStars.filter((ss) => {
        ss.life++;
        const progress = ss.life / ss.maxLife;
        ss.opacity = progress < 0.3 ? progress / 0.3 : (1 - progress) / 0.7;

        const tailX = ss.x - Math.cos(ss.angle) * ss.length;
        const tailY = ss.y - Math.sin(ss.angle) * ss.length;

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y);
        grad.addColorStop(0, `rgba(0,245,255,0)`);
        grad.addColorStop(0.5, `rgba(0,245,255,${ss.opacity * 0.5})`);
        grad.addColorStop(1, `rgba(255,255,255,${ss.opacity})`);

        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.5;
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(ss.x, ss.y);
        ctx.stroke();

        ss.x += Math.cos(ss.angle) * ss.speed;
        ss.y += Math.sin(ss.angle) * ss.speed;

        return ss.life < ss.maxLife;
      });

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 starfield-canvas"
      style={{ background: 'transparent' }}
    />
  );
};

export default StarField;
