import React, { useState, useEffect } from 'react';
import Login from './Login';
import TodoList from './TodoList';
import Dashboard from './Dashboard';
import { auth } from './firebase';
import { onAuthStateChanged } from "firebase/auth";
import './App.css';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 🌑 新增：黑夜模式狀態 (預設為 false/白天)
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) setCurrentUser(user);
      else setCurrentUser(null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 🌑 切換模式的函式
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // 根據模式決定背景色和文字色
  const appStyles = {
    fontFamily: 'Arial, sans-serif',
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '20px',
    transition: 'background-color 0.3s, color 0.3s', // 增加一點過渡動畫
    // 動態樣式
    backgroundColor: isDarkMode ? '#121212' : '#f4f4f9',
    color: isDarkMode ? '#e0e0e0' : '#333'
  };

  if (loading) return <div style={{ textAlign: 'center', marginTop: '50px' }}>載入系統中...</div>;

  return (
    <div style={appStyles}>
      <div style={{ position: 'absolute', top: '20px', right: '20px', display: 'flex', gap: '10px', zIndex: 1000 }}>
        <button 
          onClick={() => setShowDashboard(!showDashboard)}
          style={{
            background: showDashboard ? '#ff4d4f' : '#1890ff',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '0.95em'
          }}
        >
          {showDashboard ? '⬅️ 返回 App' : '📊 SRE 儀表板'}
        </button>

        {!showDashboard && (
          <button 
            onClick={toggleTheme}
            style={{
              background: isDarkMode ? '#333' : '#fff',
              color: isDarkMode ? '#fff' : '#333',
              border: '1px solid #ccc',
              borderRadius: '20px',
              padding: '8px 15px',
              cursor: 'pointer',
              fontSize: '1.2em',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
          >
            {isDarkMode ? '☀️ 白天模式' : '🌙 黑夜模式'}
          </button>
        )}
      </div>

      {showDashboard ? (
        <Dashboard />
      ) : (
        <div style={{ width: '100%', maxWidth: '600px' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h1 style={{ marginBottom: '10px', color: isDarkMode ? '#fff' : '#333' }}>
              🚀 DevSecOps 專案
            </h1>
            <p style={{ color: isDarkMode ? '#aaa' : '#666' }}>Developer: [賴俊曄]</p>
          </div>

          {currentUser ? (
            <div>
               {/* 用戶資訊欄 */}
               <div style={{ 
                 background: isDarkMode ? '#1e1e1e' : 'white', 
                 padding: '15px', 
                 borderRadius: '10px', 
                 marginBottom: '20px',
                 display: 'flex',
                 alignItems: 'center',
                 justifyContent: 'space-between',
                 boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                 border: isDarkMode ? '1px solid #333' : 'none'
               }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img src={currentUser.photoURL} alt="Avatar" style={{ width: '40px', borderRadius: '50%' }} />
                    <span style={{ fontWeight: 'bold', color: isDarkMode ? '#fff' : '#333' }}>
                      {currentUser.displayName}
                    </span>
                  </div>
                  <button 
                    onClick={() => auth.signOut()}
                    style={{ background: '#ff4d4f', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer' }}
                  >
                    登出
                  </button>
               </div>

               {/* 傳入 isDarkMode 給子元件 */}
               <TodoList user={currentUser} isDarkMode={isDarkMode} />
            </div>
          ) : (
            // 也可以把 isDarkMode 傳給 Login (如果你想讓登入頁也變黑)
            <Login isDarkMode={isDarkMode} />
          )}
        </div>
      )}
    </div>
  );
}

export default App;