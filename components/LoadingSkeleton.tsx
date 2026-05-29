import { motion, useReducedMotion } from 'framer-motion';
import footballIcon from '@/assets/football.svg';

export function LoadingSkeleton() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="card card--glass loading-card">
      <div className="loading-card__hero">
        <motion.img
          src={footballIcon}
          alt=""
          className="loading-card__ball"
          animate={
            reduceMotion
              ? undefined
              : {
                  rotate: [0, 360],
                  scale: [1, 1.08, 1],
                }
          }
          transition={{
            rotate: { duration: 2.4, repeat: Infinity, ease: 'linear' },
            scale: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
          }}
        />
        <p className="loading-card__label">⚡ クイック要約を生成中...</p>
      </div>
      <div className="skeleton-block" />
      <div className="skeleton-block" />
      <div className="skeleton-block skeleton-block--short" />
      <div style={{ marginTop: 14 }}>
        <span className="skeleton-block skeleton-block--tag" />
        <span className="skeleton-block skeleton-block--tag" />
        <span className="skeleton-block skeleton-block--tag" />
      </div>
    </div>
  );
}
