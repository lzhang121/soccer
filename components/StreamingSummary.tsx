interface StreamingSummaryProps {
  lines: string[];
}

export function StreamingSummary({ lines }: StreamingSummaryProps) {
  return (
    <div className="card card--glass summary-card streaming-card">
      <p className="summary-card__title streaming-card__label">⚡ 生成中...</p>
      <ol className="summary-list">
        {lines.map((line, index) => (
          <li key={`stream-${index}-${line}`} className="summary-item streaming-line">
            <span className="jersey-num">{index + 1}</span>
            <p className="summary-text">{line}</p>
          </li>
        ))}
        {lines.length < 3 &&
          Array.from({ length: 3 - lines.length }).map((_, index) => (
            <li key={`placeholder-${index}`} className="summary-item streaming-line streaming-line--pending">
              <span className="jersey-num jersey-num--pending">{lines.length + index + 1}</span>
              <div className="skeleton-block skeleton-block--short" />
            </li>
          ))}
      </ol>
    </div>
  );
}
