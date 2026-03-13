import React, { useState, useEffect, useRef } from 'react';
import { Check, GripVertical, Indent, Outdent, RotateCcw, Plus, X } from 'lucide-react';

// 初期データ
const initialData = [
  { id: 't1', text: 'モーニングルーティン', completed: false, indent: 0 },
  { id: 't2', text: 'コップ一杯の水を飲む', completed: false, indent: 1 },
  { id: 't3', text: 'ストレッチ（5分）', completed: false, indent: 1 },
  { id: 't4', text: '仕事の準備', completed: false, indent: 0 },
  { id: 't5', text: 'PCを起動する', completed: false, indent: 1 },
  { id: 't6', text: '今日のスケジュール確認', completed: false, indent: 1 },
  { id: 't7', text: 'メールチェック', completed: false, indent: 1 },
  { id: 't8', text: '夜のリラックス', completed: false, indent: 0 },
  { id: 't9', text: '読書（15分）', completed: false, indent: 1 },
];

// 個別のタスクコンポーネント
const TaskItem = ({ task, isDragging, onToggle, onIndentChange, onDragStart }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);

  // スワイプ（インデント操作）のハンドリング
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    startY.current = e.touches[0].clientY;
    isSwiping.current = true;
  };

  const handleTouchMove = (e) => {
    if (!isSwiping.current) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const diffX = currentX - startX.current;
    const diffY = currentY - startY.current;

    // 縦方向の動きが大きい場合はスクロールとみなす
    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 10) {
      isSwiping.current = false;
      setSwipeOffset(0);
      return;
    }

    // 親タスク(0)は右スワイプ(インデント)、子タスク(1)は左スワイプ(インデント解除)のみ許可
    if (task.indent === 0 && diffX > 0 && diffX < 120) {
      setSwipeOffset(diffX);
    } else if (task.indent === 1 && diffX < 0 && diffX > -120) {
      setSwipeOffset(diffX);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping.current) return;
    isSwiping.current = false;
    
    // スワイプ量が一定を超えたらインデント状態を変更
    if (swipeOffset > 60 && task.indent === 0) {
      onIndentChange(task.id, 1);
    } else if (swipeOffset < -60 && task.indent === 1) {
      onIndentChange(task.id, 0);
    }
    setSwipeOffset(0); // 位置をリセット
  };

  return (
    <div className="relative mb-3" data-task-id={task.id}>
      {/* スワイプ時の背景フィードバック（右スワイプ：インデント） */}
      <div 
        className={`absolute inset-0 flex items-center pl-5 bg-indigo-50 text-indigo-600 rounded-2xl transition-opacity duration-200 border border-indigo-100 ${swipeOffset > 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ marginLeft: task.indent === 1 ? '2.5rem' : '0' }}
      >
        <Indent size={24} /> <span className="ml-3 font-semibold text-sm">サブタスクにする</span>
      </div>
      
      {/* スワイプ時の背景フィードバック（左スワイプ：インデント解除） */}
      <div 
        className={`absolute inset-0 flex items-center pr-5 bg-orange-50 text-orange-600 justify-end rounded-2xl transition-opacity duration-200 border border-orange-100 ${swipeOffset < 0 ? 'opacity-100' : 'opacity-0'}`}
        style={{ marginLeft: task.indent === 1 ? '2.5rem' : '0' }}
      >
        <span className="mr-3 font-semibold text-sm">親タスクにする</span> <Outdent size={24} />
      </div>

      {/* タスク本体 */}
      <div 
        className={`relative bg-white p-4 rounded-2xl flex items-center gap-4 transition-all duration-200 shadow-sm border touch-pan-y
          ${isDragging ? 'opacity-70 scale-[0.98] shadow-md border-indigo-300 z-10' : 'border-slate-200 hover:border-slate-300'}
        `}
        style={{ 
          transform: `translateX(${swipeOffset}px)`,
          marginLeft: task.indent === 1 ? '2.5rem' : '0'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <button 
          onClick={() => onToggle(task.id)}
          className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${task.completed ? 'bg-emerald-500 border-emerald-500 scale-110' : 'border-slate-300 hover:border-slate-400'}`}
        >
          {task.completed && <Check size={16} className="text-white" />}
        </button>
        
        <span className={`flex-1 transition-all duration-300 select-none ${task.completed ? 'text-slate-400 line-through' : 'text-slate-800'} ${task.indent === 0 ? 'text-[1.05rem] font-bold' : 'text-[0.95rem] font-medium'}`}>
          {task.text}
        </span>

        {/* ドラッグハンドル */}
        <div 
          className="p-2 -m-2 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing touch-none"
          onPointerDown={(e) => {
            e.stopPropagation();
            onDragStart(task.id);
          }}
        >
          <GripVertical size={22} />
        </div>
      </div>
    </div>
  );
};


// メインアプリケーション
export default function App() {
  const [tasks, setTasks] = useState(initialData);
  const [draggingId, setDraggingId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

  // ---------------------------------------------------------
  // チェックの切り替え機能（親・子の連動）
  // ---------------------------------------------------------
  const handleToggleCheck = (id) => {
    setTasks(prev => {
      const index = prev.findIndex(t => t.id === id);
      if (index === -1) return prev;
      
      const task = prev[index];
      const newCompleted = !task.completed;
      const newTasks = [...prev];
      newTasks[index] = { ...task, completed: newCompleted };

      if (task.indent === 0) {
        // 親タスクを切り替えた場合：続く子タスクをすべて連動させる
        for (let i = index + 1; i < newTasks.length; i++) {
          if (newTasks[i].indent === 0) break; // 次の親が来たら終了
          newTasks[i] = { ...newTasks[i], completed: newCompleted };
        }
      } else {
        // 子タスクを切り替えた場合：親タスクの状態を更新する
        let parentIndex = -1;
        for (let i = index - 1; i >= 0; i--) {
          if (newTasks[i].indent === 0) {
            parentIndex = i;
            break;
          }
        }
        if (parentIndex !== -1) {
          let allChildrenCompleted = true;
          for (let i = parentIndex + 1; i < newTasks.length; i++) {
            if (newTasks[i].indent === 0) break;
            if (!newTasks[i].completed) {
              allChildrenCompleted = false;
              break;
            }
          }
          newTasks[parentIndex] = { ...newTasks[parentIndex], completed: allChildrenCompleted };
        }
      }
      return newTasks;
    });
  };

  // ---------------------------------------------------------
  // すべてのチェックを解除
  // ---------------------------------------------------------
  const uncheckAll = () => {
    setTasks(prev => prev.map(t => ({ ...t, completed: false })));
  };

  // ---------------------------------------------------------
  // インデントの変更
  // ---------------------------------------------------------
  const handleIndentChange = (id, newIndent) => {
    setTasks(prev => {
      const index = prev.findIndex(t => t.id === id);
      if (index === 0 && newIndent === 1) return prev; // 最初の項目はサブタスクにできない
      
      const newTasks = [...prev];
      newTasks[index] = { ...newTasks[index], indent: newIndent };
      return newTasks;
    });
  };

  // ---------------------------------------------------------
  // ドラッグ＆ドロップ（ソート）の実装
  // ---------------------------------------------------------
  useEffect(() => {
    if (!draggingId) {
      document.body.style.overflow = '';
      return;
    }
    
    // ドラッグ中は画面のスクロールを無効化
    document.body.style.overflow = 'hidden';

    const handlePointerMove = (e) => {
      e.preventDefault();
      const target = document.elementFromPoint(e.clientX, e.clientY);
      const row = target?.closest('[data-task-id]');
      
      if (row) {
        const hoverId = row.getAttribute('data-task-id');
        if (hoverId !== draggingId) {
          performSort(draggingId, hoverId);
        }
      }
    };

    const handlePointerUp = () => {
      setDraggingId(null);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: false });
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      document.body.style.overflow = '';
    };
  }, [draggingId]);

  // 並び替えロジック
  const performSort = (dragId, hoverId) => {
    setTasks(prev => {
      const fromIndex = prev.findIndex(t => t.id === dragId);
      const hoverIndex = prev.findIndex(t => t.id === hoverId);
      if (fromIndex === -1 || hoverIndex === -1 || fromIndex === hoverIndex) return prev;

      // タスクが含まれるグループ（親＋その子）の範囲を取得する関数
      const getGroup = (tasksArray, idx) => {
        let start = idx;
        // 親タスクを探す（上に遡る）
        while (start > 0 && tasksArray[start].indent === 1) {
          start--;
        }
        
        let end = start;
        // 子タスクを含める（下に下る）
        for (let i = start + 1; i < tasksArray.length; i++) {
          if (tasksArray[i].indent === 1) end = i;
          else break;
        }
        return { start, end, items: tasksArray.slice(start, end + 1) };
      };

      const isMovingParent = prev[fromIndex].indent === 0;

      // 親タスクを移動する場合はグループ全体、子タスクは単体として扱う
      const fromBlock = isMovingParent 
        ? getGroup(prev, fromIndex) 
        : { start: fromIndex, end: fromIndex, items: [prev[fromIndex]] };

      // 自身が属するブロック内への移動は無視
      if (hoverIndex >= fromBlock.start && hoverIndex <= fromBlock.end) return prev;

      const newTasks = [...prev];
      // ブロックを一旦配列から取り除く
      const removed = newTasks.splice(fromBlock.start, fromBlock.items.length);
      
      const targetIndex = newTasks.findIndex(t => t.id === hoverId);
      if (targetIndex === -1) return prev;

      let insertIndex;

      if (isMovingParent) {
        // 親タスクを移動する場合、ターゲットが属するグループの境界に挿入する
        const targetGroup = getGroup(newTasks, targetIndex);
        if (fromIndex < hoverIndex) {
          insertIndex = targetGroup.end + 1; // グループの下
        } else {
          insertIndex = targetGroup.start;   // グループの上
        }
      } else {
        // 子タスク単体を移動する場合
        if (fromIndex < hoverIndex) {
          insertIndex = targetIndex + 1;
        } else {
          insertIndex = targetIndex;
        }
      }

      newTasks.splice(insertIndex, 0, ...removed);

      // 先頭のタスクがインデントされている場合は親に戻す（データの整合性維持）
      return newTasks.map((t, i) => (i === 0 && t.indent === 1) ? { ...t, indent: 0 } : t);
    });
  };

  // ---------------------------------------------------------
  // タスク追加
  // ---------------------------------------------------------
  const addTask = (e) => {
    e.preventDefault();
    if (!newTaskText.trim()) {
      setIsAdding(false);
      return;
    }
    const newTask = {
      id: Date.now().toString(),
      text: newTaskText,
      completed: false,
      indent: 0
    };
    setTasks([...tasks, newTask]);
    setNewTaskText('');
    setIsAdding(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center font-sans">
      <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col relative shadow-2xl">
        
        {/* ヘッダー */}
        <header className="px-6 py-5 bg-white/80 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200 flex justify-between items-center shadow-sm">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Routine</h1>
            <p className="text-xs text-slate-500 mt-1 font-medium">スワイプで階層化・長押しで並び替え</p>
          </div>
          <button 
            onClick={uncheckAll}
            className="p-2.5 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors active:scale-95 flex items-center gap-2"
          >
            <RotateCcw size={18} />
          </button>
        </header>

        {/* タスクリスト */}
        <main className="flex-1 p-5 pb-32 overflow-y-auto">
          {tasks.map((task) => (
            <TaskItem 
              key={task.id} 
              task={task} 
              isDragging={draggingId === task.id}
              onToggle={handleToggleCheck}
              onIndentChange={handleIndentChange}
              onDragStart={setDraggingId}
            />
          ))}
          
          {tasks.length === 0 && (
            <div className="text-center text-slate-400 mt-10">
              タスクがありません
            </div>
          )}
        </main>

        {/* タスク追加UI */}
        {isAdding && (
          <div className="absolute bottom-0 left-0 right-0 bg-white p-5 border-t border-slate-200 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] z-30 animate-in slide-in-from-bottom-5">
            <form onSubmit={addTask} className="flex gap-3">
              <input
                type="text"
                autoFocus
                placeholder="新しいルーティンを追加..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 bg-slate-100 border-transparent rounded-xl px-4 py-3 text-slate-800 focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition-all outline-none"
              />
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="p-3 text-slate-400 hover:text-slate-600 bg-slate-50 rounded-xl"
              >
                <X size={24} />
              </button>
              <button 
                type="submit"
                disabled={!newTaskText.trim()}
                className="px-5 bg-indigo-600 text-white rounded-xl font-medium shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all active:scale-95"
              >
                追加
              </button>
            </form>
          </div>
        )}

        {/* 追加フローティングボタン */}
        {!isAdding && (
          <div className="fixed bottom-8 max-w-md w-full flex justify-end px-8 pointer-events-none z-20">
            <button 
              onClick={() => setIsAdding(true)}
              className="w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center hover:bg-indigo-700 hover:scale-105 transition-all active:scale-95 pointer-events-auto"
            >
              <Plus size={28} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}