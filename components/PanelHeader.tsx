import { motion, useReducedMotion } from 'framer-motion';
import footballIcon from '@/assets/football.svg';
import { Ticker } from '@/components/Ticker';
import type { SiteTheme } from '@/lib/site-styles';

interface PanelHeaderProps {
  siteTheme: SiteTheme;
  tickerItems: string[];
  providerLabel?: string;
  model?: string;
  onSettings: () => void;
}

export function PanelHeader({
  siteTheme,
  tickerItems,
  providerLabel,
  model,
  onSettings,
}: PanelHeaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <header className={`panel-header panel-header--glass ${siteTheme.headerClass}`}>
      <div className="panel-header__glow" aria-hidden="true" />
      <div className="panel-header__row">
        <div className="panel-header__brand">
          <motion.img
            src={footballIcon}
            alt=""
            className="panel-header__icon"
            animate={reduceMotion ? undefined : { rotate: [0, 8, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div>
            <h1 className="panel-header__title">サッカー速読</h1>
            <p className="panel-header__subtitle">3行でサッカーニュースを読む</p>
          </div>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" onClick={onSettings}>
          設定
        </button>
      </div>
      {providerLabel && model && (
        <p className="panel-header__meta">
          AI: {providerLabel} · {model}
        </p>
      )}
      <Ticker items={tickerItems} />
    </header>
  );
}
