import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 text-on-surface dark:text-slate-100 font-geist">
      <Sidebar />
      <TopBar />

      <main className="lg:pl-[260px] min-h-screen">
        <motion.div
          className="p-6 max-w-[1400px] mx-auto"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
