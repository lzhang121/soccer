import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: '' };

  static getDerivedStateFromError(error: Error): State {
    return { error: error.message || '不明なエラー' };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[sidepanel]', error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="container container--padded">
          <div className="card card--glass">
            <p className="empty-state__title">Side Panel の表示に失敗しました</p>
            <p className="muted">{this.state.error}</p>
            <p className="muted">
              chrome://extensions で拡張機能を再読み込みしてください。
              開発中は <code>npm run dev</code> を実行したままにしてください。
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
