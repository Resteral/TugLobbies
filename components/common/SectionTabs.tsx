/**
 * SectionTabs component
 * Purpose: Simple, reusable tab switcher for page-level sections (Lobbies, Rankings, etc.).
 */

import React from 'react';
import { cn } from '../../lib/utils'; // if not present, fallback inline class merge; otherwise it's fine

/**
 * Tab definition
 */
export interface SectionTab {
  /** Unique tab id */
  id: string;
  /** Visible label */
  label: string;
  /** Optional icon element */
  icon?: React.ReactNode;
}

/**
 * Props for SectionTabs
 */
interface SectionTabsProps {
  /** Tabs to render */
  tabs: SectionTab[];
  /** Currently active tab id */
  activeId: string;
  /** Change handler */
  onChange: (id: string) => void;
  /** Optional className */
  className?: string;
}

/**
 * SectionTabs
 * Minimal, accessible tab bar using buttons. Not route-based.
 */
export const SectionTabs: React.FC<SectionTabsProps> = ({
  tabs,
  activeId,
  onChange,
  className,
}) => {
  return (
    <div
      role="tablist"
      aria-label="Section tabs"
      className={cn(
        'inline-flex rounded-lg overflow-hidden border border-slate-700 bg-slate-800/40',
        className
      )}
    >
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={[
              'px-4 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                : 'text-slate-300 hover:bg-slate-700/60',
              'flex items-center gap-2',
            ].join(' ')}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default SectionTabs;
