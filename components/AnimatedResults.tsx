import { motion, useReducedMotion } from 'framer-motion';

interface AnimatedSummaryProps {
  lines: string[];
  animate: boolean;
}

export function AnimatedSummary({ lines, animate }: AnimatedSummaryProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animate && !reduceMotion;

  return (
    <ol className="summary-list">
      {lines.map((line, index) => (
        <motion.li
          key={`${index}-${line}`}
          className="summary-item"
          initial={shouldAnimate ? { opacity: 0, y: 14 } : false}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.38,
            delay: shouldAnimate ? index * 0.12 : 0,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="jersey-num">{index + 1}</span>
          <p className="summary-text">{line}</p>
        </motion.li>
      ))}
    </ol>
  );
}

interface AnimatedTagsProps {
  keywords: string[];
  animate: boolean;
  onKeywordClick?: (keyword: string) => void;
  activeKeyword?: string | null;
}

export function AnimatedTags({ keywords, animate, onKeywordClick, activeKeyword }: AnimatedTagsProps) {
  const reduceMotion = useReducedMotion();
  const shouldAnimate = animate && !reduceMotion;

  return (
    <ul className="tag-list">
      {keywords.map((keyword, index) => (
        <motion.li
          key={keyword}
          initial={shouldAnimate ? { opacity: 0, scale: 0.82 } : false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.28,
            delay: shouldAnimate ? 0.35 + index * 0.06 : 0,
            ease: [0.34, 1.56, 0.64, 1],
          }}
          whileHover={{ scale: 1.05 }}
        >
          <button
            type="button"
            className={`tag tag--clickable ${activeKeyword === keyword ? 'tag--active' : ''}`}
            onClick={() => onKeywordClick?.(keyword)}
            title="記事内でハイライト"
          >
            {keyword}
          </button>
        </motion.li>
      ))}
    </ul>
  );
}

interface CelebrateBurstProps {
  show: boolean;
}

export function CelebrateBurst({ show }: CelebrateBurstProps) {
  const reduceMotion = useReducedMotion();
  if (!show || reduceMotion) return null;

  const dots = Array.from({ length: 10 }, (_, i) => i);

  return (
    <div className="celebrate" aria-hidden="true">
      {dots.map((i) => (
        <motion.span
          key={i}
          className="celebrate__dot"
          initial={{ opacity: 1, y: 0, x: 0, scale: 1 }}
          animate={{
            opacity: 0,
            y: -28 - (i % 3) * 12,
            x: (i - 5) * 10,
            scale: 0.2,
          }}
          transition={{ duration: 0.75, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}
