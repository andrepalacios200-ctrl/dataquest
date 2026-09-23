export type RouteId='data-science'|'data-engineering'|'data-analysis';
export type LevelId='junior'|'mid-senior'|'senior';
export interface QuizQuestion { question:string; options:string[]; correctIndex:number; explanation:string; }
export interface LessonContent { objective:string; explanation:string; exampleTitle:string; example:string; challenge:string; quiz:QuizQuestion; }
export interface Lesson {id:string; title:string; duration:number; xp:number; type:string; description:string; content?:LessonContent; completed?:boolean; routeId?:RouteId; levelId?:LevelId; order?:number; published?:boolean;}
export interface Level {id:LevelId; title:string; subtitle:string; description:string; difficulty:number; modules:number; exercises:number; lessons:Lesson[];}
export interface LearningRoute {id:RouteId; title:string; short:string; description:string; icon:string; accent:string; levels:Level[];}
export interface Profile {id:string; username:string; full_name:string; avatar_url?:string|null; xp:number; streak:number; last_activity_date?:string|null; role:'student'|'admin'; preferred_level?:LevelId|null; created_at?:string;}
