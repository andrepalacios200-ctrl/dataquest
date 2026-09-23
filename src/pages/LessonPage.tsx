import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, Code2, Lightbulb } from 'lucide-react';
import { routes } from '../data/content';
import { QuizCard, XPBadge } from '../components/ui';
import { useProgress } from '../context/ProgressContext';

function quizFor(title: string, type: string) {
  const t = `${title} ${type}`.toLowerCase();
  if (t.includes('sql')) return { question: '¿Qué cláusula permite agrupar filas antes de aplicar una agregación?', options: ['ORDER BY', 'GROUP BY', 'LIMIT', 'DROP'], correctIndex: 1 };
  if (t.includes('métrica') || t.includes('metric')) return { question: '¿Qué métrica usarías para un modelo de clasificación con clases desbalanceadas?', options: ['Accuracy solamente', 'F1-score', 'R²', 'MAE'], correctIndex: 1 };
  if (t.includes('pipeline') || t.includes('etl') || t.includes('orquest')) return { question: '¿Qué propiedad ayuda a que un pipeline sea seguro al reintentarse?', options: ['Idempotencia', 'Más columnas', 'Más dashboards', 'Menos logs'], correctIndex: 0 };
  if (t.includes('dashboard') || t.includes('visual')) return { question: '¿Qué visualización suele ser adecuada para mostrar una tendencia temporal?', options: ['Gráfico de líneas', 'Treemap', 'Donut siempre', 'Tabla sin orden'], correctIndex: 0 };
  if (t.includes('modelo') || t.includes('machine learning') || t.includes('ml')) return { question: '¿Qué conjunto se utiliza normalmente para evaluar la generalización de un modelo?', options: ['Train', 'Test', 'Variables', 'Índices'], correctIndex: 1 };
  if (t.includes('cloud') || t.includes('arquitectura') || t.includes('lakehouse')) return { question: '¿Qué característica es especialmente importante al diseñar una plataforma de datos?', options: ['Escalabilidad', 'Eliminar observabilidad', 'Evitar automatización', 'Duplicar datos sin control'], correctIndex: 0 };
  return { question: '¿Cuál es una buena práctica al trabajar con datos?', options: ['Validar resultados', 'Ignorar valores nulos', 'No documentar decisiones', 'Copiar datos sin contexto'], correctIndex: 0 };
}

export default function LessonPage() {
  const { routeId, levelId, lessonId } = useParams();
  const navigate = useNavigate();
  const route = routes.find(r => r.id === routeId) || routes[0];
  const level = route.levels.find(l => l.id === levelId) || route.levels[0];
  const lesson = level.lessons.find(l => l.id === lessonId) || level.lessons[0];
  const { isCompleted, completeLesson } = useProgress();
  const [feedback, setFeedback] = useState('');
  const [quizFeedback, setQuizFeedback] = useState('');
  const done = isCompleted(lesson.id);
  const quiz = quizFor(lesson.title, lesson.type);

  function finish() {
    const result = completeLesson(lesson.id, lesson.xp);
    setFeedback(result.awarded ? `¡Buen trabajo! Has ganado ${result.xp} XP y tu progreso quedó guardado.` : 'Esta lección ya estaba completada. Tu XP no se duplica.');
  }

  const nextIndex = level.lessons.findIndex(l => l.id === lesson.id) + 1;
  const nextLesson = level.lessons[nextIndex];

  return <div className="mx-auto max-w-4xl px-5 py-8">
    <Link to={`/ruta/${route.id}/${level.id}`} className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16}/> Volver al nivel</Link>
    <div className="mt-5 rounded-[2rem] bg-slate-900 p-7 text-white"><div className="flex flex-wrap items-center justify-between gap-3"><span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{lesson.type} · {lesson.duration} min</span><XPBadge xp={lesson.xp}/></div><h1 className="mt-5 text-3xl font-black">{lesson.title}</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/60">{lesson.description}</p></div>
    <div className="mt-6 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <div className="space-y-5">
        <section className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-700"><Lightbulb size={19}/></div><h2 className="font-extrabold">Aprende en 2 minutos</h2></div><p className="mt-4 text-sm leading-7 text-slate-600">La habilidad importante no es memorizar una herramienta, sino elegir el paso correcto, comprobar el resultado y explicar qué significa. Practica con un ejemplo pequeño y luego aplica la idea a un caso real.</p><div className="mt-4 rounded-2xl bg-slate-950 p-4 font-mono text-xs leading-6 text-cyan-200"><span className="text-slate-500">// ejemplo</span><br/>SELECT customer_id, SUM(revenue)<br/>FROM sales<br/>GROUP BY customer_id;</div></section>
        <section className="rounded-3xl border border-slate-200 bg-white p-6"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700"><Code2 size={19}/></div><h2 className="font-extrabold">Mini reto práctico</h2></div><p className="mt-3 text-sm text-slate-600">Identifica qué parte del ejemplo te permite agrupar los datos por cliente.</p><div className="mt-4 grid gap-2 sm:grid-cols-3">{['SELECT','SUM(revenue)','GROUP BY customer_id'].map((x,i)=><button key={x} onClick={()=>setFeedback(i===2?'¡Exacto! GROUP BY crea los grupos sobre los que agregamos.':'Casi. Prueba otra vez.')} className="rounded-2xl border border-slate-200 p-3 text-left text-xs font-bold hover:border-indigo-400">{x}</button>)}</div>{feedback&&<div className="mt-4 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{feedback}</div>}</section>
      </div>
      <div>
        <QuizCard question={quiz.question} options={quiz.options} correctIndex={quiz.correctIndex} lessonId={lesson.id} onResult={(ok, bonus)=>setQuizFeedback(ok ? `¡Correcto! ${bonus ? `Has ganado ${bonus} XP extra.` : 'El bonus de este quiz ya estaba reclamado.'}` : 'No pasa nada, revisa la explicación y vuelve a intentarlo.')}/>
        {quizFeedback&&<div className="mt-3 rounded-2xl bg-white border border-slate-200 p-4 text-xs font-bold text-slate-700">{quizFeedback}</div>}
        <div className="mt-4 rounded-3xl border border-slate-200 bg-white p-5"><div className="text-xs font-bold text-slate-400">RECOMPENSA</div><div className="mt-2 flex items-center justify-between"><div className="font-extrabold">{done ? 'Lección completada' : 'Completar lección'}</div><XPBadge xp={lesson.xp}/></div><button onClick={finish} className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white ${done?'bg-emerald-600':'bg-indigo-600'}`}><CheckCircle2 size={17}/>{done?'Completada':'Completar lección'}</button>{feedback&&<div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">{feedback}</div>}</div>
        {done && nextLesson && <button onClick={()=>navigate(`/leccion/${route.id}/${level.id}/${nextLesson.id}`)} className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-3 text-sm font-extrabold text-slate-700 hover:border-indigo-300">Siguiente lección →</button>}
      </div>
    </div>
  </div>;
}
