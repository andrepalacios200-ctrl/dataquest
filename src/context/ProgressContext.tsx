import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { LevelId, RouteId } from '../types';

const STORAGE_KEY = 'dataquest-progress-v3';

type ProgressState = {
  xp: number;
  streak: number;
  lastActivityDate: string | null;
  completedLessons: string[];
  quizCorrect: number;
  quizAttempts: number;
  completedQuizzes: string[];
};

const initialState: ProgressState = { xp: 0, streak: 0, lastActivityDate: null, completedLessons: [], quizCorrect: 0, quizAttempts: 0, completedQuizzes: [] };

type ProgressContextValue = ProgressState & {
  isCompleted: (lessonId: string) => boolean;
  completeLesson: (lessonId: string, xp: number) => { awarded: boolean; xp: number };
  completeQuiz: (lessonId: string, correct: boolean) => { bonus: number };
  getLessonProgress: (routeId: RouteId, levelId: LevelId, lessonIds: string[]) => number;
  getRouteProgress: (lessonIds: string[]) => number;
  resetProgress: () => void;
};

const ProgressContext = createContext<ProgressContextValue | null>(null);

function todayKey() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function dateDiffDays(a: string, b: string) { return Math.round((new Date(`${b}T00:00:00`).getTime() - new Date(`${a}T00:00:00`).getTime()) / 86400000); }
function loadState(): ProgressState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return initialState;
    const p = JSON.parse(raw) as Partial<ProgressState>;
    const last = typeof p.lastActivityDate==='string'?p.lastActivityDate:null;
    const stale = last ? dateDiffDays(last, todayKey()) > 1 : false;
    return { xp: typeof p.xp==='number'?p.xp:0, streak: stale ? 0 : (typeof p.streak==='number'?p.streak:0), lastActivityDate:last, completedLessons:Array.isArray(p.completedLessons)?p.completedLessons:[], quizCorrect:typeof p.quizCorrect==='number'?p.quizCorrect:0, quizAttempts:typeof p.quizAttempts==='number'?p.quizAttempts:0, completedQuizzes:Array.isArray(p.completedQuizzes)?p.completedQuizzes:[] };
  } catch { return initialState; }
}

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProgressState>(loadState);
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);

  const value = useMemo<ProgressContextValue>(() => ({
    ...state,
    isCompleted: (lessonId) => state.completedLessons.includes(lessonId),
    completeLesson: (lessonId, xp) => {
      if (state.completedLessons.includes(lessonId)) return { awarded: false, xp: 0 };
      const today = todayKey();
      setState(current => {
        if (current.completedLessons.includes(lessonId)) return current;
        const diff = current.lastActivityDate ? dateDiffDays(current.lastActivityDate, today) : null;
        const nextStreak = diff === 1 ? current.streak + 1 : diff === 0 ? Math.max(current.streak, 1) : 1;
        return { ...current, xp: current.xp + xp, streak: nextStreak, lastActivityDate: today, completedLessons: [...current.completedLessons, lessonId] };
      });
      return { awarded: true, xp };
    },
    completeQuiz: (lessonId, correct) => {
      if (state.completedQuizzes.includes(lessonId)) return { bonus: 0 };
      const bonus = correct ? 5 : 0;
      setState(current => ({ ...current, xp: current.xp + bonus, quizAttempts: current.quizAttempts + 1, quizCorrect: current.quizCorrect + (correct ? 1 : 0), completedQuizzes: [...current.completedQuizzes, lessonId] }));
      return { bonus };
    },
    getLessonProgress: (_routeId, _levelId, lessonIds) => lessonIds.length ? Math.round((lessonIds.filter(id => state.completedLessons.includes(id)).length / lessonIds.length) * 100) : 0,
    getRouteProgress: (lessonIds) => lessonIds.length ? Math.round((lessonIds.filter(id => state.completedLessons.includes(id)).length / lessonIds.length) * 100) : 0,
    resetProgress: () => setState(initialState),
  }), [state]);

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}
export function useProgress() { const context = useContext(ProgressContext); if (!context) throw new Error('useProgress debe usarse dentro de ProgressProvider'); return context; }
