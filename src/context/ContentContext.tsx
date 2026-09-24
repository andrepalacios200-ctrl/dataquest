import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { routes as staticRoutes } from "../data/content";
import { lessonContent } from "../data/lessonContent";
import { supabase } from "../lib/supabase";

import type {
  LearningRoute,
  Lesson,
  LessonContent,
} from "../types";

type ContentValue = {
  routes: LearningRoute[];
  loading: boolean;
  refresh: () => Promise<void>;
};

const C = createContext<ContentValue | null>(null);

/**
 * Contenido de respaldo para evitar que una lección
 * quede sin contenido aunque Supabase todavía no tenga
 * el contenido completo.
 */
function fallbackContent(lesson: {
  title?: string;
  description?: string;
}): LessonContent {
  return {
    objective:
      lesson.description ||
      `Aprender los conceptos fundamentales de ${lesson.title || "esta lección"}.`,

    explanation:
      `En esta lección aprenderás los conceptos principales relacionados con ${
        lesson.title || "el tema"
      }. La idea es comprender el concepto, aplicarlo y validar el resultado.`,

    exampleTitle: "Ejemplo práctico",

    example:
      `Aplica el concepto de "${lesson.title || "esta lección"}" a un caso sencillo de datos.`,

    challenge:
      `Explica con tus propias palabras cómo aplicarías ${
        lesson.title || "este concepto"
      } en un proyecto real.`,

    quiz: {
      question: `¿Cuál es la mejor forma de aprender ${lesson.title || "este concepto"}?`,

      options: [
        "Aplicarlo y validar el resultado",
        "Ignorar la calidad de los datos",
        "Evitar practicar",
        "Usar la herramienta más compleja",
      ],

      correctIndex: 0,

      explanation:
        "La mejor práctica es comprender el concepto, aplicarlo y validar el resultado.",
    },
  };
}

function mergeDbLessons(db: any[]): LearningRoute[] {
  /**
   * Primero construimos las rutas locales.
   * Cada lección recibe su contenido local si existe.
   */
  const cloned: LearningRoute[] = staticRoutes.map((route) => ({
    ...route,

    levels: route.levels.map((level) => ({
      ...level,

      lessons: level.lessons.map((lesson) => ({
        ...lesson,

        content:
          lessonContent[lesson.id] ??
          fallbackContent({
            title: lesson.title,
            description: lesson.description,
          }),
      })),
    })),
  }));

  /**
   * Después mezclamos las lecciones procedentes
   * de Supabase.
   */
  for (const row of db) {
    const route = cloned.find((r) => r.id === row.route_id);

    const level = route?.levels.find(
      (l) => l.id === row.level_id
    );

    if (!route || !level) {
      continue;
    }

    /**
     * Buscamos primero contenido enviado por Supabase.
     * Si Supabase no tiene contenido, usamos el contenido
     * local correspondiente al ID.
     *
     * Si tampoco existe, generamos contenido de respaldo.
     */
    const dbContent =
      row.content &&
      typeof row.content === "object"
        ? (row.content as LessonContent)
        : undefined;

    const localContent = lessonContent[row.id];

    const existingLesson = level.lessons.find(
      (lesson) => lesson.id === row.id
    );

    const content =
      dbContent ??
      localContent ??
      existingLesson?.content ??
      fallbackContent({
        title: row.title,
        description: row.description,
      });

    const lesson: Lesson = {
      id: row.id,
      title: row.title,
      duration: row.duration,
      xp: row.xp,
      type: row.type,
      description: row.description,

      /**
       * IMPORTANTE:
       * content nunca queda undefined.
       */
      content,

      routeId: row.route_id,
      levelId: row.level_id,
      order: row.position,
      published: row.published,
    };

    const index = level.lessons.findIndex(
      (item) => item.id === lesson.id
    );

    if (index >= 0) {
      level.lessons[index] = lesson;
    } else {
      level.lessons.push(lesson);
    }

    level.lessons.sort(
      (a, b) =>
        (a.order ?? 999) -
        (b.order ?? 999)
    );
  }

  return cloned;
}

export function ContentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [rows, setRows] = useState<any[]>([]);

  const [loading, setLoading] = useState(
    Boolean(supabase)
  );

  const refresh = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("lessons")
      .select("*")
      .eq("published", true)
      .order("position");

    if (error) {
      console.error(
        "Error cargando lecciones:",
        error
      );

      setRows([]);
      setLoading(false);

      return;
    }

    setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const value = useMemo(
    () => ({
      routes: mergeDbLessons(rows),
      loading,
      refresh,
    }),
    [rows, loading]
  );

  return (
    <C.Provider value={value}>
      {children}
    </C.Provider>
  );
}

export function useContent() {
  const context = useContext(C);

  if (!context) {
    throw new Error(
      "useContent debe usarse dentro de ContentProvider"
    );
  }

  return context;
}