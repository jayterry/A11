import React, { useState, useEffect } from 'react';

const GLOBAL_LOG_STORE = '__SRE_LOGS__';
const GLOBAL_EVENT = 'sre-log-event';

function Dashboard() {
  const [metrics, setMetrics] = useState({
    totalRequests: 0,
    errorRate: '0.00',
    activeUsers: 1,
    systemHealth: 'Healthy'
  });

  const [logs, setLogs] = useState([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateMetrics = () => {
      const currentLogs = window[GLOBAL_LOG_STORE] || [];
      const totalLogs = currentLogs.length;
      const errorCount = currentLogs.filter((log) => log.level === 'ERROR').length;
      const calculatedErrorRate =
        totalLogs > 0 ? ((errorCount / totalLogs) * 100).toFixed(2) : '0.00';
      const calculatedRequests = totalLogs;

      setMetrics({
        totalRequests: calculatedRequests,
        errorRate: calculatedErrorRate,
        activeUsers: Math.floor(Math.random() * 10) + 1,
        systemHealth: errorCount > 0 ? 'Degraded' : 'Healthy'
      });
    };

    const syncLogs = () => {
      setLogs([...(window[GLOBAL_LOG_STORE] || [])]);
    };

    const handleNewLog = () => {
      syncLogs();
      updateMetrics();
    };

    syncLogs();
    updateMetrics();

    window.addEventListener(GLOBAL_EVENT, handleNewLog);
    return () => window.removeEventListener(GLOBAL_EVENT, handleNewLog);
  }, []);

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace', 
      backgroundColor: '#1e1e1e', 
      color: '#0f0', 
      minHeight: '100vh',
      position: 'absolute',
      top: 0, left: 0, width: '100%', zIndex: 999 
    }}>
      <h1 style={{ borderBottom: '1px solid #333', paddingBottom: '10px' }}>
        📊 SRE 可觀測性儀表板 (Observability Dashboard)
      </h1>
      
      {/* SLI / Metrics 指標區塊 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <MetricCard title="Total Events" value={metrics.totalRequests} />
        <MetricCard title="Error Rate (SLI)" value={metrics.errorRate + '%'} color={metrics.errorRate > 1 ? 'red' : '#0f0'} />
        <MetricCard title="Active Users (模擬)" value={metrics.activeUsers} />
        <MetricCard title="System Status" value={metrics.systemHealth} />
      </div>

      {/* 即時 Log 列表區塊 */}
      <div style={{ border: '1px solid #333', padding: '15px', borderRadius: '5px', backgroundColor: '#000' }}>
        <h3>📜 Live Structured Logs (最近 20 筆)</h3>
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {logs.length === 0 ? (
            <p style={{ color: '#666' }}>暫無日誌... 請回到首頁操作 (新增/刪除) 以產生 Log</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} style={{ 
                borderBottom: '1px solid #333', 
                padding: '10px 0', 
                fontSize: '0.9em',
                color: log.level === 'ERROR' ? '#ff6b6b' : '#aaddff' 
              }}>
                <span style={{ color: '#666' }}>[{log.timestamp}]</span>{' '}
                <strong style={{ border: `1px solid ${log.level === 'ERROR' ? 'red' : 'cyan'}`, padding: '2px 5px', borderRadius: '3px' }}>
                  {log.level}
                </strong>{' '}
                {log.message}{' '}
                {log.data && <span style={{ color: '#aaa', display: 'block', marginLeft: '20px' }}>DATA: {JSON.stringify(log.data)}</span>}
                {log.error && <span style={{ color: 'red', display: 'block', marginLeft: '20px' }}>ERR: {JSON.stringify(log.error)}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// 小元件：指標卡片
function MetricCard({ title, value, color = '#fff' }) {
  return (
    <div style={{ border: '1px solid #444', padding: '20px', borderRadius: '8px', textAlign: 'center', backgroundColor: '#2d2d2d' }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#888' }}>{title}</h4>
      <div style={{ fontSize: '2em', fontWeight: 'bold', color: color }}>{value}</div>
    </div>
  );
}

export default Dashboard;