export type RouteId='data-science'|'data-engineering'|'data-analysis';
export type LevelId='junior'|'mid-senior'|'senior';
export interface Lesson {id:string; title:string; duration:number; xp:number; type:string; description:string; completed?:boolean;}
export interface Level {id:LevelId; title:string; subtitle:string; description:string; difficulty:number; modules:number; exercises:number; lessons:Lesson[];}
export interface LearningRoute {id:RouteId; title:string; short:string; description:string; icon:string; accent:string; levels:Level[];}
