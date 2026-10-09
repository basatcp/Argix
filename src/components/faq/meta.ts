import type { FaqGroup } from '../../data/faq';
import type { IconName } from '../Icons';

/** Icon for each FAQ category (same mark in the hero index and the group header). */
export const GROUP_ICONS: Record<string, IconName> = {
  'projects-development': 'code',
  cybersecurity: 'shield',
  compliance: 'clipboard',
  engagement: 'users',
};

/** "01", "02", … */
export const groupNumber = (i: number) => String(i + 1).padStart(2, '0');

export const questionCount = (n: number) => `${n} question${n === 1 ? '' : 's'}`;

/** The question a #hash points at, if any (null for a malformed hash such as "#%"). */
export function findQuestion(groups: FaqGroup[], hash: string) {
  let id = '';
  try {
    id = decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return null;
  }
  if (!id) return null;
  for (const g of groups) {
    const index = g.items.findIndex((item) => item.id === id);
    if (index !== -1) return { group: g.id, index, id };
  }
  return null;
}
