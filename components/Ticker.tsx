interface TickerProps {
  items: string[];
}

export function Ticker({ items }: TickerProps) {
  const display = items.length > 0 ? items : ['サッカーニュース'];
  const loop = [...display, ...display];

  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {loop.map((item, index) => (
          <span key={`${item}-${index}`} className="ticker__item">
            <span className="ticker__dot">⚽</span>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
