import { createContext,useContext,useEffect,useMemo,useState,type ReactNode } from 'react';
import { routes as staticRoutes } from '../data/content';
import { lessonContent } from '../data/lessonContent';
import { supabase } from '../lib/supabase';
import type { LearningRoute, Lesson } from '../types';

type ContentValue={routes:LearningRoute[];loading:boolean;refresh:()=>Promise<void>};
const C=createContext<ContentValue|null>(null);
function mergeDbLessons(db:any[]):LearningRoute[]{
 const cloned=staticRoutes.map(r=>({...r,levels:r.levels.map(l=>({...l,lessons:l.lessons.map(x=>({...x,content:lessonContent[x.id]}) )}))}));
 for(const row of db){
  const route=cloned.find(r=>r.id===row.route_id); const level=route?.levels.find(l=>l.id===row.level_id); if(!route||!level)continue;
  const lesson:Lesson={id:row.id,title:row.title,duration:row.duration,xp:row.xp,type:row.type,description:row.description,content:row.content as any,routeId:row.route_id,levelId:row.level_id,order:row.position,published:row.published};
  const idx=level.lessons.findIndex(l=>l.id===lesson.id); if(idx>=0) level.lessons[idx]=lesson; else level.lessons.push(lesson);
  level.lessons.sort((a,b)=>(a.order??999)-(b.order??999));
 }
 return cloned;
}
export function ContentProvider({children}:{children:ReactNode}){const[rows,setRows]=useState<any[]>([]);const[loading,setLoading]=useState(Boolean(supabase));const refresh=async()=>{if(!supabase){setLoading(false);return;}const {data}=await supabase.from('lessons').select('*').eq('published',true).order('position');setRows(data??[]);setLoading(false)};useEffect(()=>{refresh()},[]);const value=useMemo(()=>({routes:mergeDbLessons(rows),loading,refresh}),[rows,loading]);return <C.Provider value={value}>{children}</C.Provider>}
export function useContent(){const c=useContext(C);if(!c)throw new Error('useContent debe usarse dentro de ContentProvider');return c;}
