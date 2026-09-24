export type RouteId='data-science'|'data-engineering'|'data-analysis';
export type LevelId='junior'|'mid-senior'|'senior';
export type AssessmentType='true_false'|'multiple_choice'|'code_completion'|'scenario';
export interface QuizQuestion { question:string; options:string[]; correctIndex:number; explanation:string; }
export interface GlossaryItem { term:string; definition:string; }
export interface CodeExercise { language:string; prompt:string; starter:string; answer:string; explanation:string; }
export interface TableRow { concept:string; meaning:string; use:string; }
export interface ResourceLink { type:'documentation'|'video'|'reference'; title:string; url:string; }
export interface AssessmentQuestion { id:string; type:AssessmentType; prompt:string; options?:string[]; correctIndex?:number; correct?:boolean|string; code?:string; answer?:string; language?:string; explanation:string; }
export interface Assessment { passScore:number; questions:AssessmentQuestion[]; }
export interface LessonContent {
  objective:string;
  explanation:string;
  keyPoints:string[];
  glossary:GlossaryItem[];
  exampleTitle:string;
  example:string;
  guidedCode:CodeExercise;
  comparisonTable:TableRow[];
  commonMistakes:string[];
  masteryTask:string;
  resources:ResourceLink[];
  assessment:Assessment;
}
export interface Lesson {id:string; title:string; duration:number; xp:number; type:string; description:string; content?:LessonContent; completed?:boolean; routeId?:RouteId; levelId?:LevelId; order?:number; published?:boolean;}
export interface Level {id:LevelId; title:string; subtitle:string; description:string; difficulty:number; modules:number; exercises:number; lessons:Lesson[];}
export interface LearningRoute {id:RouteId; title:string; short:string; description:string; icon:string; accent:string; levels:Level[];}
export interface Profile {id:string; username:string; full_name:string; avatar_url?:string|null; xp:number; streak:number; last_activity_date?:string|null; role:'student'|'admin'; preferred_level?:LevelId|null; created_at?:string;}
