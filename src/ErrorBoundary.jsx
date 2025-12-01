import React from 'react';
import { logger } from './logger';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
    this.resetTimeoutId = null;
  }

  componentDidCatch(error, info) {
    // 記錄錯誤
    logger.error('UI Error Boundary Caught Error', error);

    // 標記錯誤狀態
    this.setState({ hasError: true });

    // 3 秒後自動嘗試「自動修復」
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }

    this.resetTimeoutId = setTimeout(() => {
      this.setState({ hasError: false });
      logger.info('Auto-healing: System reset attempted');
    }, 3000);
  }

  componentWillUnmount() {
    if (this.resetTimeoutId) {
      clearTimeout(this.resetTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            color: '#b71c1c',
            padding: '20px',
            borderRadius: '8px',
            margin: '20px 0'
          }}
        >
          <h2 style={{ marginTop: 0, marginBottom: '10px', whiteSpace: 'pre-line' }}>
            💥{'\n'} CRITICAL SYSTEM FAILURE
          </h2>
          <p style={{ margin: '6px 0' }}>
            Chaos Monkey has crashed the UI component.
          </p>
          <p style={{ margin: '6px 0' }}>
            System will reboot in 3 seconds.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;


