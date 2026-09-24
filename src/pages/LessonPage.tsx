import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Code2,
  ExternalLink,
  Lightbulb,
  PlayCircle,
  ShieldCheck,
  Table2,
} from 'lucide-react';

import { XPBadge } from '../components/ui';
import { useProgress } from '../context/ProgressContext';
import { useContent } from '../context/ContentContext';
import type { AssessmentQuestion } from '../types';

function normalize(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

type AssessmentBlockProps = {
  questions: AssessmentQuestion[];
  passScore: number;
  onPassed: () => void;
};

function AssessmentBlock({
  questions,
  passScore,
  onPassed,
}: AssessmentBlockProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);

  const results = useMemo(
    () =>
      questions.map((question) => {
        const answer = answers[question.id];

        if (question.type === 'true_false') {
          return answer === (question.correct === true || question.correct === 'true' ? 'true' : 'false');
        }

        if (question.type === 'multiple_choice') {
          return Number(answer) === question.correctIndex;
        }

        if (question.type === 'code_completion') {
          return (
            normalize(answer || '') ===
            normalize(String(question.answer || ''))
          );
        }

        // Scenario questions are evaluated as an applied-response exercise.
        return Boolean(answer && answer.trim().length > 20);
      }),
    [answers, questions],
  );

  function checkAssessment() {
    if (questions.length === 0) return;

    const currentScore = results.filter(Boolean).length;
    setScore(currentScore);
    setChecked(true);

    if (currentScore / questions.length >= passScore) {
      onPassed();
    }
  }

  const percentage =
    questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const passed = questions.length > 0 && score / questions.length >= passScore;

  return (
    <section className="rounded-3xl border border-indigo-100 bg-indigo-50/60 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-wider text-indigo-600">
            Evaluación de dominio
          </div>
          <h2 className="mt-1 text-xl font-black">
            Demuestra que entendiste el tema
          </h2>
        </div>
        <ShieldCheck className="text-indigo-600" />
      </div>

      <p className="mt-2 text-sm leading-6 text-slate-600">
        Debes obtener al menos {Math.round(passScore * 100)}%. Puedes revisar la
        explicación y volver a intentarlo. La evaluación combina verdadero o
        falso, opción múltiple, código y aplicación a un caso.
      </p>

      <div className="mt-5 space-y-5">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="rounded-2xl border border-white bg-white p-4"
          >
            <div className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              {index + 1}.{' '}
              {question.type === 'true_false'
                ? 'Verdadero / Falso'
                : question.type === 'multiple_choice'
                  ? 'Opción múltiple'
                  : question.type === 'code_completion'
                    ? 'Completar código'
                    : 'Caso práctico'}
            </div>

            <h3 className="mt-2 font-extrabold text-slate-800">
              {question.prompt}
            </h3>

            {question.type === 'true_false' && (
              <div className="mt-3 grid grid-cols-2 gap-2">
                {['true', 'false'].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: value,
                      }))
                    }
                    className={`rounded-xl border p-3 text-sm font-bold ${
                      answers[question.id] === value
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'bg-white'
                    }`}
                  >
                    {value === 'true' ? 'Verdadero' : 'Falso'}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'multiple_choice' && (
              <div className="mt-3 grid gap-2">
                {question.options?.map((option, optionIndex) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: String(optionIndex),
                      }))
                    }
                    className={`rounded-xl border p-3 text-left text-sm font-semibold ${
                      answers[question.id] === String(optionIndex)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'bg-white'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}

            {question.type === 'code_completion' && (
              <>
                <pre className="mt-3 overflow-x-auto rounded-xl bg-slate-950 p-4 text-sm text-cyan-100">
                  <code>{question.code}</code>
                </pre>

                <input
                  value={answers[question.id] || ''}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Escribe solo lo que falta"
                  className="mt-3 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-indigo-500"
                />
              </>
            )}

            {question.type === 'scenario' && (
              <textarea
                value={answers[question.id] || ''}
                onChange={(event) =>
                  setAnswers((current) => ({
                    ...current,
                    [question.id]: event.target.value,
                  }))
                }
                placeholder="Explica tu decisión, supuestos y cómo la validarías..."
                className="mt-3 min-h-28 w-full rounded-xl border px-3 py-3 text-sm outline-none focus:border-indigo-500"
              />
            )}

            {checked && (
              <div
                className={`mt-3 rounded-xl p-3 text-xs font-semibold ${
                  results[index]
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-amber-50 text-amber-700'
                }`}
              >
                {results[index] ? 'Correcto.' : 'Revisa este punto.'}{' '}
                {question.explanation}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={checkAssessment}
          disabled={questions.length === 0}
          className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-extrabold text-white disabled:opacity-40"
        >
          Comprobar evaluación
        </button>

        {checked && (
          <span
            className={`text-sm font-extrabold ${
              passed ? 'text-emerald-700' : 'text-amber-700'
            }`}
          >
            {score}/{questions.length} · {percentage}%
          </span>
        )}
      </div>

      {checked && passed && (
        <div className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm font-bold text-emerald-700">
          ✅ Dominio suficiente para avanzar. Ahora completa la lección para
          registrar el progreso.
        </div>
      )}

      {checked && !passed && (
        <div className="mt-4 rounded-2xl bg-amber-50 p-4 text-sm font-bold text-amber-700">
          🧠 Aún hay conceptos por reforzar. Revisa la explicación y vuelve a
          intentarlo.
        </div>
      )}
    </section>
  );
}

export default function LessonPage() {
  const { routeId, levelId, lessonId } = useParams();
  const { routes } = useContent();
  const navigate = useNavigate();

  const route = routes.find((item) => item.id === routeId) || routes[0];
  const level =
    route?.levels.find((item) => item.id === levelId) || route?.levels[0];
  const lesson =
    level?.lessons.find((item) => item.id === lessonId) ||
    level?.lessons[0];

  const { isCompleted, completeLesson, completeQuiz } = useProgress();

  const [feedback, setFeedback] = useState('');
  const [passed, setPassed] = useState(false);
  const [quizBonus, setQuizBonus] = useState(0);

  if (!route || !level || !lesson || !lesson.content) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-12">
        <div className="rounded-3xl border bg-white p-8 text-center">
          <h1 className="text-2xl font-black">Lección no encontrada</h1>
          <p className="mt-2 text-sm text-slate-500">
            No pudimos encontrar el contenido solicitado.
          </p>
          <Link
            to="/rutas"
            className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white"
          >
            Volver a rutas
          </Link>
        </div>
      </div>
    );
  }

  const done = isCompleted(lesson.id);
  const content = lesson.content;
  const currentIndex = level.lessons.findIndex((item) => item.id === lesson.id);
  const next = level.lessons[currentIndex + 1];

  async function handlePassed() {
    setPassed(true);

    try {
      const result = await completeQuiz(lesson.id, true);
      setQuizBonus(result.bonus);
    } catch {
      setQuizBonus(0);
    }
  }

  async function finishLesson() {
    try {
      const result = await completeLesson(lesson.id, lesson.xp);

      setFeedback(
        result.awarded
          ? `¡Excelente! Has ganado ${result.xp} XP y tu progreso quedó sincronizado.`
          : 'Esta lección ya estaba completada. Tu XP no se duplica.',
      );
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'No se pudo guardar el progreso.';
      setFeedback(message);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-8">
      <Link
        to={`/ruta/${route.id}/${level.id}`}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-500"
      >
        <ArrowLeft size={16} />
        Volver al nivel
      </Link>

      <div className="mt-5 rounded-[2rem] bg-slate-900 p-7 text-white">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">
            {lesson.type} · {lesson.duration} min
          </span>
          <XPBadge xp={lesson.xp} />
        </div>

        <h1 className="mt-5 text-3xl font-black">{lesson.title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
          {lesson.description}
        </p>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_.85fr]">
        <div className="space-y-5">
          <section className="rounded-3xl border bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-100 text-indigo-700">
                <Lightbulb size={19} />
              </div>
              <h2 className="font-extrabold">Objetivo de aprendizaje</h2>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {content.objective}
            </p>

            <h3 className="mt-5 font-extrabold">Explicación</h3>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              {content.explanation}
            </p>
          </section>

          <section className="rounded-3xl border bg-white p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-indigo-600" size={19} />
              <h2 className="font-extrabold">Ruta mental</h2>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {content.keyPoints.map((point, index) => (
                <span
                  key={point}
                  className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700"
                >
                  {index + 1}. {point}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="text-violet-600" size={19} />
              <h2 className="font-extrabold">Glosario rápido</h2>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {content.glossary.map((item) => (
                <div
                  key={item.term}
                  className="rounded-2xl bg-violet-50/70 p-4"
                >
                  <div className="font-extrabold text-violet-900">
                    {item.term}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-600">
                    {item.definition}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6">
            <div className="flex items-center gap-3">
              <Table2 className="text-cyan-600" />
              <h2 className="font-extrabold">Conceptos clave</h2>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs uppercase text-slate-400">
                    <th className="py-2">Concepto</th>
                    <th className="py-2">Qué significa</th>
                    <th className="py-2">Uso</th>
                  </tr>
                </thead>
                <tbody>
                  {content.comparisonTable.map((row) => (
                    <tr key={row.concept} className="border-b last:border-0">
                      <td className="py-3 font-bold">{row.concept}</td>
                      <td className="py-3 text-slate-600">{row.meaning}</td>
                      <td className="py-3 text-slate-600">{row.use}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6">
            <div className="flex items-center gap-3">
              <Code2 className="text-cyan-600" />
              <h2 className="font-extrabold">Ejemplo y código guiado</h2>
            </div>

            <h3 className="mt-4 font-bold text-slate-800">
              {content.exampleTitle}
            </h3>

            <p className="mt-2 text-sm leading-7 text-slate-600">
              {content.example}
            </p>

            <pre className="mt-4 overflow-x-auto rounded-2xl bg-slate-950 p-4 text-sm leading-7 text-cyan-100">
              <code>{content.guidedCode.starter}</code>
            </pre>

            <div className="mt-3 rounded-xl bg-cyan-50 p-3 text-xs font-semibold text-cyan-800">
              <strong>Reto de código:</strong> {content.guidedCode.prompt}
            </div>

            <div className="mt-3 text-xs text-slate-500">
              Respuesta esperada: aplica la lógica mostrada en el ejemplo y
              comprueba que el resultado sea correcto.
            </div>
          </section>

          <section className="rounded-3xl border bg-white p-6">
            <h2 className="font-extrabold">Errores comunes</h2>

            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              {content.commonMistakes.map((mistake) => (
                <li key={mistake} className="rounded-xl bg-amber-50 p-3">
                  ⚠️ {mistake}
                </li>
              ))}
            </ul>
          </section>

          {content.resources.length > 0 && (
            <section className="rounded-3xl border bg-white p-6">
              <h2 className="font-extrabold">Recursos recomendados</h2>

              <div className="mt-3 space-y-2">
                {content.resources.map((resource) =>
                  resource.url ? (
                    <a
                      key={resource.title}
                      href={resource.url}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm font-bold text-indigo-700"
                    >
                      {resource.type === 'video' ? (
                        <PlayCircle size={16} />
                      ) : (
                        <ExternalLink size={16} />
                      )}

                      <span className="flex-1 px-2">{resource.title}</span>
                      <ExternalLink size={14} />
                    </a>
                  ) : (
                    <div
                      key={resource.title}
                      className="rounded-xl bg-slate-50 p-3 text-sm font-bold text-slate-600"
                    >
                      {resource.title}
                    </div>
                  ),
                )}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-4">
          <AssessmentBlock
            questions={content.assessment.questions}
            passScore={content.assessment.passScore}
            onPassed={handlePassed}
          />

          {quizBonus > 0 && (
            <div className="rounded-2xl bg-amber-50 p-3 text-xs font-extrabold text-amber-700">
              ⚡ Bonus de evaluación: +{quizBonus} XP
            </div>
          )}

          <section className="rounded-3xl border bg-white p-5">
            <div className="text-xs font-bold text-slate-400">
              TAREA DE DOMINIO
            </div>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {content.masteryTask}
            </p>
          </section>

          <div className="rounded-3xl border bg-white p-5">
            <div className="text-xs font-bold text-slate-400">RECOMPENSA</div>

            <div className="mt-2 flex items-center justify-between">
              <div className="font-extrabold">
                {done ? 'Lección completada' : 'Completar lección'}
              </div>
              <XPBadge xp={lesson.xp} />
            </div>

            <button
              type="button"
              disabled={!done && !passed}
              onClick={finishLesson}
              className={`mt-4 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-extrabold text-white disabled:cursor-not-allowed disabled:opacity-40 ${
                done ? 'bg-emerald-600' : 'bg-indigo-600'
              }`}
            >
              <CheckCircle2 size={17} />
              {done
                ? 'Completada'
                : passed
                  ? 'Completar lección'
                  : 'Aprueba la evaluación (75%)'}
            </button>

            {feedback && (
              <div className="mt-3 rounded-2xl bg-emerald-50 p-3 text-xs font-bold text-emerald-700">
                {feedback}
              </div>
            )}
          </div>

          {done && next && (
            <button
              type="button"
              onClick={() =>
                navigate(`/leccion/${route.id}/${level.id}/${next.id}`)
              }
              className="w-full rounded-2xl border bg-white py-3 text-sm font-extrabold text-slate-700"
            >
              Siguiente lección →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
