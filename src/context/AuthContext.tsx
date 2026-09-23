import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { Profile } from '../types';

const demoProfile: Profile = { id:'demo', username:'alex', full_name:'Alex Rivera', xp:420, streak:7, last_activity_date:null, role:'student', preferred_level:'mid-senior' };
type AuthValue={session:Session|null;user:User|null;profile:Profile|null;loading:boolean;configured:boolean;signIn:(email:string,password:string)=>Promise<{error?:string}>;signUp:(email:string,password:string,name:string)=>Promise<{error?:string}>;signOut:()=>Promise<void>;refreshProfile:()=>Promise<void>};
const C=createContext<AuthValue|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const [session,setSession]=useState<Session|null>(null); const [profile,setProfile]=useState<Profile|null>(isSupabaseConfigured?null:demoProfile); const [loading,setLoading]=useState(isSupabaseConfigured);
 const refreshProfile=async()=>{ if(!supabase||!session?.user) return; const {data,error}=await supabase.from('profiles').select('*').eq('id',session.user.id).single(); if(!error&&data)setProfile(data as Profile); };
 useEffect(()=>{ if(!supabase){setLoading(false);return;} let mounted=true; supabase.auth.getSession().then(({data})=>{if(mounted){setSession(data.session);setLoading(false);}}); const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(next); if(next){setTimeout(()=>refreshProfile(),0)}else setProfile(null);}); return()=>{mounted=false;subscription.unsubscribe();};},[]);
 useEffect(()=>{if(session)refreshProfile()},[session?.user?.id]);
 const value=useMemo<AuthValue>(()=>({session,user:session?.user??null,profile,loading,configured:isSupabaseConfigured,signIn:async(email,password)=>{if(!supabase)return{};const {error}=await supabase.auth.signInWithPassword({email,password});return error?{error:error.message}:{}} ,signUp:async(email,password,name)=>{if(!supabase)return{};const username=name.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)||`user-${Date.now()}`;const {error}=await supabase.auth.signUp({email,password,options:{data:{full_name:name,username}}});return error?{error:error.message}:{}},signOut:async()=>{if(supabase)await supabase.auth.signOut();},refreshProfile}),[session,profile,loading]);
 return <C.Provider value={value}>{children}</C.Provider>
}
export function useAuth(){const c=useContext(C);if(!c)throw new Error('useAuth debe usarse dentro de AuthProvider');return c;}
