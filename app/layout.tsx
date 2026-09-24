import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'Mi día · Dayra',description:'Tu agenda, prioridades y hábitos en un solo lugar.',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,statusBarStyle:'default',title:'Mi día'},icons:{icon:'/favicon.svg',apple:'/icon-192.png'}};
export const viewport:Viewport={width:'device-width',initialScale:1,viewportFit:'cover',themeColor:'#fff9fa'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="es"><body>{children}</body></html>}
