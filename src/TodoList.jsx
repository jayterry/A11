import React, { useState, useEffect, useContext } from 'react';
import { db } from './firebase';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { logger } from './logger'; // 引入我們剛寫好的 Logger
import { ChaosContext } from './ChaosMonkey';

function TodoList({ user, isDarkMode }) {
  const showTimestamp = import.meta.env.VITE_ENABLE_FEATURE_A === 'true';
  const enableDelete = import.meta.env.VITE_ENABLE_FEATURE_B === 'true';

  const [todos, setTodos] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [crashError, setCrashError] = useState(null);
  const { triggerFailure } = useContext(ChaosContext);

  // 如果被標記為崩潰，就直接丟出錯誤，讓 ErrorBoundary 捕捉
  if (crashError) {
    throw crashError;
  }

  // 定義深色/淺色主題樣式
  const theme = {
    cardBg: isDarkMode ? '#1e1e1e' : '#fefefe',
    cardBorder: isDarkMode ? '#333' : '#e0e0e0',
    textMain: isDarkMode ? '#e0e0e0' : '#333',
    textSub: isDarkMode ? '#aaa' : '#666',
    inputBg: isDarkMode ? '#2c2c2c' : '#fff',
    inputBorder: isDarkMode ? '#444' : '#ccc',
    itemBg: isDarkMode ? '#252525' : '#fcfcfc',
    itemBorder: isDarkMode ? '#333' : '#eee'
  };

  useEffect(() => {
    // 安全檢查：如果沒有 user，就不執行查詢
    if (!user) return;

    try {
      const q = query(
        collection(db, "todos"),
        where("uid", "==", user.uid)
        // orderBy("createdAt", "asc") // 如果還沒建索引，先保持註解
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedTodos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTodos(fetchedTodos);
        // 這裡可以選擇性加 log，但小心 snapshot 更新頻率高會洗版
        // logger.info("Data fetched", { count: fetchedTodos.length }); 
      }, (error) => {
        // 監聽過程發生錯誤 (例如權限不足)
        logger.error("Snapshot listener error", error);
      });

      return () => unsubscribe();
    } catch (error) {
      logger.error("Query setup failed", error);
    }
  }, [user]);

  // --- 新增資料 (包含 Log 與 安全檢查) ---
  const handleAdd = async () => {
    // 1. 安全檢查：確保有輸入內容且使用者已登入
    if (!inputValue.trim()) return;
    if (!user) {
      logger.error("Attempted to add task without user login");
      alert("請先登入！");
      return;
    }

    const failureInjected = triggerFailure();
    if (failureInjected) {
      // Chaos Monkey 觸發失敗，50% 機率讓整個 UI 崩潰
      if (Math.random() > 0.5) {
        setCrashError(new Error("Chaos Monkey Critical Hit!"));
      }
      // 無論是否觸發崩潰，這次操作都視為失敗，不繼續執行
      return;
    }

    try {
      // 2. 執行 Firestore 寫入
      const docRef = await addDoc(collection(db, "todos"), {
        text: inputValue,
        createdAt: Date.now(),
        timeString: new Date().toLocaleString(),
        uid: user.uid
      });

      // 3. 成功後記錄 Log (A12 Task 1 要求)
      logger.info("Task created successfully", { 
        taskId: docRef.id, 
        contentLength: inputValue.length,
        uid: user.uid 
      });

      setInputValue(""); // 清空輸入框
    } catch (error) {
      // 4. 失敗記錄 Error Log
      logger.error("Failed to create task", error);
      alert("新增失敗，請檢查網路或權限");
    }
  };

  // --- 刪除資料 (包含 Log) ---
  const handleDelete = async (id) => {
    if (!user) return;

    const failureInjected = triggerFailure();
    if (failureInjected) {
      // Chaos Monkey 觸發失敗，50% 機率讓整個 UI 崩潰
      if (Math.random() > 0.5) {
        setCrashError(new Error("Chaos Monkey Critical Hit!"));
      }
      // 無論是否觸發崩潰，這次操作都視為失敗，不繼續執行
      return;
    }

    try {
      // 1. 執行刪除
      await deleteDoc(doc(db, "todos", id));

      // 2. 成功後記錄 Log
      logger.info("Task deleted", { taskId: id, uid: user.uid });

    } catch (error) {
      // 3. 失敗記錄 Log
      logger.error("Failed to delete task", error);
    }
  };

  return (
    <div style={{
      border: `1px solid ${theme.cardBorder}`,
      borderRadius: '10px',
      padding: '25px',
      backgroundColor: theme.cardBg,
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      color: theme.textMain,
      transition: 'background-color 0.3s, color 0.3s'
    }}>
      <h2 style={{ marginTop: '0', marginBottom: '20px', color: theme.textMain }}>
        <span role="img" aria-label="notepad">📝</span> 我的雲端待辦清單
      </h2>
      
      <p style={{ fontSize: '0.9em', color: theme.textSub, marginBottom: '25px', borderBottom: `1px solid ${theme.itemBorder}`, paddingBottom: '15px' }}>
        ⚙️ 目前功能開關狀態：<br/>
        &nbsp; &nbsp; ⏰ 時間顯示: {showTimestamp ? "🟢 ON" : "🔴 OFF"} <br/>
        &nbsp; &nbsp; 🗑️ 刪除功能: {enableDelete ? "🟢 ON" : "🔴 OFF"}
      </p>

      {/* 輸入區 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px' }}>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="新增雲端任務..."
          style={{
            flex: 1,
            padding: '12px',
            borderRadius: '6px',
            border: `1px solid ${theme.inputBorder}`,
            backgroundColor: theme.inputBg,
            color: theme.textMain,
            fontSize: '1em'
          }}
          onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            padding: '12px 25px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 'bold'
          }}
        >
          儲存
        </button>
      </div>

      {/* 清單區 */}
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {todos.length === 0 && (
          <p style={{ textAlign: 'center', color: theme.textSub }}>目前沒有任務，新增一筆試試看！</p>
        )}
        
        {todos.map(todo => (
          <li key={todo.id} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            borderBottom: `1px solid ${theme.itemBorder}`,
            backgroundColor: theme.itemBg,
            borderRadius: '6px',
            marginBottom: '8px'
          }}>
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '1.15em', color: theme.textMain, fontWeight: 'bold' }}>
                {todo.text}
              </span>
              {showTimestamp && (
                <div style={{ fontSize: '0.85em', color: theme.textSub, marginTop: '5px' }}>
                  🕒 建立於: {todo.timeString}
                </div>
              )}
            </div>

            {enableDelete ? (
              <button
                onClick={() => handleDelete(todo.id)}
                style={{
                  backgroundColor: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '8px 15px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9em'
                }}
              >
                刪除
              </button>
            ) : (
              <span style={{ fontSize: '0.9em', color: theme.textSub, fontStyle: 'italic' }}>
                (刪除已停用)
              </span>
            )}
          </li>
        ))}
      </ul>
      
      <div style={{ marginTop: '20px', fontSize: '12px', color: theme.textSub, textAlign: 'right' }}>
        ☁️ 資料已儲存於 Google Firestore (多租戶隔離)
      </div>
    </div>
  );
}

export default TodoList;