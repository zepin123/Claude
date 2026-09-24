"use client";
import type {ReactNode} from 'react';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
export function Field({label,children}:{label:string;children:ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
export function Choice({label,value,onChange,options}:{label:string;value:string;onChange:(s:string)=>void;options:{value:string;label:string}[]}){return <div className="field"><span>{label}</span><Select value={value} onValueChange={onChange}><SelectTrigger aria-label={label} className="w-full"><SelectValue/></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent></Select></div>}
export function Empty({text,action,label='Crear'}:{text:string;action?:()=>void;label?:string}){return <div className="empty-state"><p>{text}</p>{action&&<button className="secondary" onClick={action}>{label}</button>}</div>}
export function Section({title,action,children}:{title:string;action?:ReactNode;children:ReactNode}){return <section><div className="section-title"><h2>{title}</h2>{action}</div>{children}</section>}
