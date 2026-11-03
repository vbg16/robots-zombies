export const groups = [
  'Sobrevivência',
  'Movimento',
  'Ataque',
  'Munição',
  'Projéteis',
  'Explosões',
  'Queimadura',
  'Resfriamento',
  'Eletricidade',
  'Coleta e evolução',
  'Habilidades especiais'
] as const;

export type Group = typeof groups[number];
export type SkillType = 'Normal' | 'Gambiarra' | 'Experimento' | 'Especialização';
export type Rarity = 'Comum' | 'Incomum' | 'Rara' | 'Épica' | 'Lendária';
export type Operator = '+' | '−' | '×' | '÷' | '=';

export type Effect = {
  id: string;
  attribute: string;
  operator: Operator;
  value: number;
  unit: string;
};

export type Skill = {
  id: string;
  enabled?: boolean;
  robot?: string;
  name: string;
  description: string;
  group: Group;
  type: SkillType;
  rarity: Rarity;
  unlockLevel: number;
  tree: string;
  prerequisites: string[];
  synergies?: string[];
  condition: string;
  effects: Effect[];
  notes: string;
  accent: string;
  updatedAt: string;
};


declare global { interface Window { ScrewBalance?: {
  catalog: Skill[]; attributes: string[];
  load(): Skill[]; validate(skills: unknown): {ok: boolean; errors: string[]};
  save(skills: Skill[]): {ok: boolean; errors: string[]};
  migrate(skills: Skill[], legacy?: boolean): Skill[];
}; } }
export const balance = window.ScrewBalance;
export const seedSkills: Skill[] = balance?.catalog ?? [];
export const attributes = balance?.attributes ?? [];
export const emptySkill = (): Skill => ({id: 'custom-' + crypto.randomUUID(), name: 'Nova melhoria', description: '', group: 'Sobrevivência', type: 'Normal', rarity: 'Comum', unlockLevel: 1, tree: 'Melhorias diretas', prerequisites: [], condition: '', effects: [{id: crypto.randomUUID(),attribute: attributes[0],operator: '+',value: 1,unit: ''}], notes: '', accent: '#9eff00', updatedAt: new Date().toISOString()});
