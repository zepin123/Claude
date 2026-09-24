import {redirect} from 'next/navigation';
export default async function TaskDeepLink({params}:{params:Promise<{taskId:string}>}){const {taskId}=await params;redirect(`/?task=${encodeURIComponent(taskId)}#Tareas`)}
