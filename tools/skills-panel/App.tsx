import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  Archive,
  ArrowDownUp,
  BarChart3,
  Check,
  ChevronDown,
  CircleHelp,
  Copy,
  Download,
  Filter,
  FolderOpen,
  GitBranch,
  Gauge,
  Layers3,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Search,
  Settings2,
  Shield,
  Sparkles,
  Trash2,
  Network,
  X,
  Zap,
} from 'lucide-react';
import { emptySkill, groups, seedSkills, balance, attributes, type Effect, type Group, type Operator, type Rarity, type Skill, type SkillType } from './data';

const STORAGE_KEY = 'screwvivors.balance.draft.v1';
let initialNotice = '';
function initialSkills(): Skill[] {
  if (!balance) {initialNotice = 'Não foi possível carregar balance.js. Abra o painel pela pasta completa do jogo.'; return [];}
  let applied: Skill[];
  try {applied = balance.load();} catch {initialNotice = 'Falha ao carregar o balanceamento aplicado. Catálogo padrão carregado.'; applied = structuredClone(seedSkills);}
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const draft = JSON.parse(raw);
      const migrated = draft.version === 1 ? balance.migrate(draft.skills,draft.catalogRevision ?? 1) : [];
      const result = draft.version === 1 ? balance.validate(migrated) : {ok: false};
      if (result.ok) {initialNotice = 'Rascunho local recuperado. Clique em Aplicar ao jogo para usá-lo nas próximas partidas.'; return migrated;}
      initialNotice = 'Rascunho inválido ignorado. O balanceamento aplicado foi carregado.';
    }
  } catch {initialNotice = 'Rascunho indisponível ou corrompido. O balanceamento aplicado foi carregado. Exporte um backup para preservar suas edições.';}
  return applied;
}
function downloadSkills(skills: Skill[]) {
  const url = URL.createObjectURL(new Blob([JSON.stringify({version: 1, catalogRevision: 3, skills}, null, 2)], {type: 'application/json'}));
  const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'screwvivors-balance-backup.json'; anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function gameHref() {
  const url = new URL(location.href);
  if (url.searchParams.has('painel')) {url.searchParams.delete('painel'); return url.href;}
  return new URL('../../index.html', location.href).href;
}
const groupAccent: Record<Group, string> = {
  'Sobrevivência': '#63d8c1',
  Movimento: '#f48cff',
  Ataque: '#ff6b4a',
  Munição: '#ffbf47',
  Projéteis: '#6ac7ff',
  Explosões: '#ff9f43',
  Queimadura: '#ff6b4a',
  Resfriamento: '#6ac7ff',
  Eletricidade: '#b491ff',
  'Coleta e evolução': '#9eff00',
  'Habilidades especiais': '#f48cff',
};
const groupOptions = Array.from(new Set([...groups, ...seedSkills.map(skill => skill.group)]));
const typeColors: Record<SkillType, string> = { Normal: '#7f8ca4', Gambiarra: '#ffbf47', Experimento: '#ff5874', Especialização: '#f48cff' };

function App() {
  const [skills, setSkills] = useState<Skill[]>(initialSkills);
  const [selectedId, setSelectedId] = useState<string>(() => seedSkills[0]?.id ?? '');
  const [notice, setNotice] = useState(() => initialNotice);
  const [errors, setErrors] = useState<string[]>([]);
  const [applied, setApplied] = useState(false);
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<'Todos' | Group>('Todos');
  const [typeFilter, setTypeFilter] = useState<'Todos' | SkillType>('Todos');
  const [rarityFilter, setRarityFilter] = useState<'Todas' | Rarity>('Todas');
  const [sortMode, setSortMode] = useState<'recent' | 'name' | 'level'>('recent');
  const [saved, setSaved] = useState(true);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [viewMode, setViewMode] = useState<'library' | 'tree'>('library');

  useEffect(() => {
    if (!balance) return;
    setApplied(false);
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify({version: 1, catalogRevision: 3, skills})); setSaved(true);}
    catch {setSaved(false); setNotice('Não foi possível salvar o rascunho neste navegador. Exporte um backup antes de fechar.');}
  }, [skills]);
  const applyToGame = () => {
    if (!balance) return;
    try {
      const validation = balance.validate(skills);
      if (!validation.ok) {setErrors(validation.errors); return;}
      const result = balance.save(skills);
      setErrors(result.errors ?? []);
      if (result.ok) {setApplied(true); setNotice('Balanceamento aplicado. As alterações valem apenas para as próximas partidas.');}
    } catch (error) {setErrors(['Falha ao aplicar: ' + String(error)]);}
  };
  const importLibrary = async (file?: File) => {
    if (!file || !balance) return;
    try {
      const envelope = JSON.parse(await file.text());
      if (envelope.version !== 1 || !Array.isArray(envelope.skills)) throw new Error('Formato esperado: {version: 1, skills: [...]}');
      const migrated = balance.migrate(envelope.skills,envelope.catalogRevision ?? 1);
      const result = balance.validate(migrated);
      if (!result.ok) {setErrors(result.errors); return;}
      downloadSkills(skills);
      setSkills(migrated); setSelectedId(migrated[0]?.id ?? ''); setErrors([]);
      setNotice('Importação validada no rascunho. Um backup anterior foi baixado. Clique em Aplicar ao jogo para publicar nas próximas partidas.');
    } catch (error) {setErrors(['Importação recusada: ' + String(error)]);}
  };
  const selected = skills.find((skill) => skill.id === selectedId) ?? skills[0];

  const filteredSkills = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const result = skills.filter((skill) => {
      const inText = !normalized || [skill.name, skill.description, skill.tree, skill.group, ...skill.effects.map((effect) => `${effect.attribute} ${effect.value} ${effect.unit}`)].join(' ').toLowerCase().includes(normalized);
      const inGroup = groupFilter === 'Todos' || skill.group === groupFilter;
      const inType = typeFilter === 'Todos' || skill.type === typeFilter;
      const inRarity = rarityFilter === 'Todas' || skill.rarity === rarityFilter;
      return inText && inGroup && inType && inRarity;
    });
    return result.sort((a, b) => sortMode === 'name' ? a.name.localeCompare(b.name) : sortMode === 'level' ? a.unlockLevel - b.unlockLevel : b.id.localeCompare(a.id));
  }, [groupFilter, query, rarityFilter, skills, sortMode, typeFilter]);

  const updateSkill = (patch: Partial<Skill>) => {
    if (!selected) return;
    setSaved(false);
    setSkills((current) => current.map((skill) => skill.id === selected.id ? { ...skill, ...patch, updatedAt: new Date().toISOString() } : skill));
  };

  const addSkill = () => {
    const next = emptySkill();
    setSkills((current) => [next, ...current]);
    setSelectedId(next.id);
  };

  const duplicateSkill = () => {
    if (!selected) return;
    if (selected.type !== 'Normal') {setErrors(['Apenas melhorias normais podem ser duplicadas como novos efeitos diretos.']); return;}
    const copy: Skill = { ...selected, id: 'custom-' + crypto.randomUUID(), type: 'Normal', condition: '', robot: undefined, prerequisites: [], name: selected.name + ' — cópia', effects: selected.effects.map(item => ({...item, id: crypto.randomUUID()})), updatedAt: new Date().toISOString() };
    setSkills((current) => [copy, ...current]);
    setSelectedId(copy.id);
  };

  const deleteSkill = () => {
    if (!selected) return;
    if (seedSkills.some(skill => skill.id === selected.id)) {
      const enabled = selected.enabled === false;
      setSkills(current => current.map(skill => skill.id === selected.id ? {...skill, enabled, updatedAt: new Date().toISOString()} : skill));
      setNotice(enabled ? 'Melhoria reativada no rascunho. Aplique para usar nas próximas partidas.' : 'Melhoria desativada no rascunho. O registro original foi preservado. Revise os requisitos antes de aplicar.');
      return;
    }
    if (!window.confirm('Excluir esta melhoria personalizada do rascunho?')) return;
    const dependents = skills.filter(skill => skill.prerequisites.includes(selected.id));
    if (dependents.length) {setErrors(['Remova antes os pré-requisitos em: ' + dependents.map(skill => skill.name).join(', ')]); return;}
    const next = skills.filter((skill) => skill.id !== selected.id);
    setSkills(next);
    setSelectedId(next[0]?.id ?? '');
  };

  const resetLibrary = () => {
    if (!window.confirm('Restaurar a biblioteca inicial? Suas alterações locais serão substituídas.')) return;
    downloadSkills(skills);
    setSkills(structuredClone(seedSkills));
    setErrors([]); setNotice('Padrões restaurados apenas no rascunho. Clique em Aplicar ao jogo para confirmar.');
    setSelectedId(seedSkills[0].id);
  };

  const exportLibrary = () => downloadSkills(skills);

  const countByType = (type: SkillType) => skills.filter((skill) => skill.type === type).length;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileMenu ? 'is-open' : ''}`}>
        <div className="brand-lockup">
          <div className="brand-mark"><Sparkles size={18} /></div>
          <div><strong>SCREW<span>VIVORS</span></strong><small>oficina de balanceamento</small></div>
        </div>
        <a className="workspace-switcher" href={gameHref()}><div className="workspace-icon">SV</div><div className="workspace-copy"><b>Screwvivors</b><span>Projeto principal</span></div><ChevronDown size={15} /></a>
        <nav className="primary-nav" aria-label="Navegação principal">
          <span className="nav-label">Workspace</span>
          <button className={`nav-item ${viewMode === 'library' ? 'active' : ''}`} onClick={() => setViewMode('library')}><Layers3 size={17} /> Skills & melhorias <span className="nav-count">{skills.length}</span></button>
          <span className="nav-label nav-label-spaced">Organização</span>
          <button className={`nav-item ${viewMode === 'tree' ? 'active' : ''}`} onClick={() => setViewMode('tree')}><GitBranch size={17} /> Árvore de talentos <span className="soon">novo</span></button>
        </nav>
        <div className="sidebar-footer">
          <div className="sync-card"><div className="sync-icon"><Check size={15} /></div><div><b>Rascunho local</b><span>{saved ? 'Salvo neste navegador' : 'Exporte um backup'}</span></div></div><a className="nav-item" href="tools/skills-panel/README.md" onClick={(event) => {event.preventDefault(); setNotice('Edite o rascunho, revise os efeitos e clique em Aplicar ao jogo. Raridade, grupo e árvore organizam a biblioteca; condição, tipo e chassi seguem o jogo. Exporte JSON para backup.');}}>Como usar</a>
          <div className="user-card"><div className="avatar">VC</div><div><b>Vi-ni</b><span>Game designer</span></div><MoreHorizontal size={17} /></div>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu-button" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Abrir menu"><Menu size={20} /></button>
          <div className="breadcrumbs"><span>Screwvivors</span><span>/</span><b>{viewMode === 'tree' ? 'Árvore de talentos' : 'Skills & melhorias'}</b></div>
          <div className="topbar-actions"><span className="save-state"><span className={`status-dot ${saved ? 'saved' : ''}`} /> {saved ? 'Rascunho salvo' : 'Rascunho sem persistência'}</span><div className="topbar-divider" /><button className="button button-secondary" onClick={exportLibrary}><Download size={16} /> Exportar</button><button className="button button-primary" onClick={addSkill} disabled={!balance}><Plus size={17} /> Nova melhoria</button></div>
        </header>

        <div className="content">
          <section className="balance-banner" aria-label="Aplicação do balanceamento"><div><strong>{applied ? 'Aplicado às próximas partidas' : 'Oficina de balanceamento'}</strong><p>As edições ficam em rascunho até aplicar. Partidas em andamento mantêm suas configurações.</p></div><button className="button button-primary" onClick={applyToGame} disabled={!balance}><Check size={16} /> Aplicar ao jogo</button><label className="button button-secondary import-control"><FolderOpen size={16} /> Importar JSON<input type="file" accept="application/json,.json" onChange={event => {importLibrary(event.target.files?.[0]); event.target.value = '';}} /></label><a className="button button-ghost" href={gameHref()}>Voltar ao jogo</a></section>
          {notice && <div className="feedback" role="status">{notice}<button onClick={() => setNotice('')} aria-label="Fechar aviso"><X size={16}/></button></div>}
          {errors.length > 0 && <div className="feedback feedback-error" role="alert"><strong>Revise antes de aplicar</strong><ul>{errors.map((error,index) => <li key={index}>{error}</li>)}</ul><button onClick={() => setErrors([])} aria-label="Fechar erros"><X size={16}/></button></div>}

          <section className="page-heading"><div><div className="eyebrow"><Zap size={14} /> {viewMode === 'tree' ? 'TALENT ARCHITECT' : 'CONTENT LIBRARY'} <span>•</span> SCREWVIVORS</div><h1>{viewMode === 'tree' ? 'Árvore de talentos' : 'Skills & melhorias'}</h1><p>{viewMode === 'tree' ? 'Visualize dependências, caminhos de progressão e combinações entre as melhorias.' : 'Edite os efeitos reais do jogo e organize as melhorias das próximas partidas.'}</p></div><div className="heading-actions"><button className={`button ${viewMode === 'tree' ? 'button-primary' : 'button-ghost'}`} onClick={() => setViewMode(viewMode === 'tree' ? 'library' : 'tree')}><GitBranch size={15} /> {viewMode === 'tree' ? 'Voltar à biblioteca' : 'Abrir árvore'}</button>{viewMode === 'library' && <><button className="button button-ghost" onClick={resetLibrary}><RotateCcw size={15} /> Restaurar padrão</button><button className="button button-secondary" onClick={exportLibrary}><Download size={15} /> JSON</button></>}</div></section>

          {viewMode === 'library' && <section className="stats-row">
            <div className="stat-card stat-primary"><div className="stat-label">Biblioteca total <span className="stat-icon"><Layers3 size={15} /></span></div><strong>{skills.length.toString().padStart(2, '0')}</strong><span className="stat-detail"><span className="trend-up">+{skills.filter((s) => s.id.startsWith('custom-')).length}</span> personalizadas</span></div>
            <div className="stat-card"><div className="stat-label">Grupos da biblioteca <span className="stat-icon"><Activity size={15} /></span></div><strong>{new Set(skills.map((skill) => skill.tree)).size.toString().padStart(2, '0')}</strong><span className="stat-detail">grupos da biblioteca</span></div>
            <div className="stat-card"><div className="stat-label">Normais <span className="stat-icon"><Gauge size={15} /></span></div><strong>{countByType('Normal').toString().padStart(2, '0')}</strong><span className="stat-detail">base da progressão</span></div>
            <div className="stat-card"><div className="stat-label">Especiais <span className="stat-icon"><Sparkles size={15} /></span></div><strong>{(countByType('Experimento') + countByType('Especialização')).toString().padStart(2, '0')}</strong><span className="stat-detail">chefes + chassis</span></div>
          </section>}

          {viewMode === 'tree' ? <TalentTree skills={skills} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setViewMode('library'); }} /> : <section className="library-layout">
            <div className="library-panel panel">
              <div className="panel-heading"><div><h2>Biblioteca</h2><span>{filteredSkills.length} resultados encontrados</span></div></div>
              <div className="search-box"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar por nome, árvore ou efeito..." /></div>
              <div className="filter-chips"><select value={groupFilter} onChange={(event) => setGroupFilter(event.target.value as 'Todos' | Group)}><option value="Todos">Todos os grupos</option>{groupOptions.map((group) => <option key={group} value={group}>{group}</option>)}</select><select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as 'Todos' | SkillType)}><option value="Todos">Todos os tipos</option><option>Normal</option><option>Gambiarra</option><option>Experimento</option><option>Especialização</option></select><select value={rarityFilter} onChange={(event) => setRarityFilter(event.target.value as 'Todas' | Rarity)}><option value="Todas">Todas as raridades (organização)</option><option>Comum</option><option>Incomum</option><option>Rara</option><option>Épica</option><option>Lendária</option></select></div>
              <div className="list-toolbar"><span>Ordenar por</span><button onClick={() => setSortMode(sortMode === 'recent' ? 'name' : sortMode === 'name' ? 'level' : 'recent')}>{sortMode === 'recent' ? 'Mais recentes' : sortMode === 'name' ? 'Nome A-Z' : 'Nível de desbloqueio'} <ArrowDownUp size={13} /></button></div>
              <div className="skill-list">{filteredSkills.map((skill) => <SkillListItem key={skill.id} skill={skill} selected={skill.id === selectedId} onClick={() => setSelectedId(skill.id)} />)}{filteredSkills.length === 0 && <div className="empty-state"><Search size={24} /><b>Nenhuma melhoria encontrada</b><span>Tente mudar os filtros ou criar uma nova.</span></div>}</div>
              <div className="list-footer"><span><span className="legend-dot" /> {skills.length} melhorias no projeto</span><button onClick={exportLibrary}>Exportar biblioteca <Download size={13} /></button></div>
            </div>

            {selected && <Editor key={selected.id} selected={selected} allSkills={skills} updateSkill={updateSkill} duplicateSkill={duplicateSkill} deleteSkill={deleteSkill} />}
          </section>}
        </div>
      </main>
    </div>
  );
}

function SkillListItem({ skill, selected, onClick }: { skill: Skill; selected: boolean; onClick: () => void }) {
  const accent = groupAccent[skill.group] ?? skill.accent;
  return <button className={`skill-list-item ${selected ? 'selected' : ''}`} onClick={onClick}><div className="skill-symbol" style={{ background: `${accent}18`, color: accent, borderColor: `${accent}45` }}>{skill.type === 'Gambiarra' ? <Zap size={16} /> : skill.type === 'Experimento' ? <Sparkles size={16} /> : skill.type === 'Especialização' ? <Shield size={16} /> : <Gauge size={16} />}</div><div className="skill-list-copy"><div className="skill-line"><b>{skill.name}{skill.enabled === false ? ' (desativada)' : ''}</b><span className="rarity-dot" style={{ background: typeColors[skill.type] }} /></div><span>{skill.group} <i>•</i> Nv. {skill.unlockLevel || 'chefe'}</span></div><ChevronDown className="list-chevron" size={15} /></button>;
}

function Editor({ selected, allSkills, updateSkill, duplicateSkill, deleteSkill }: { selected: Skill; allSkills: Skill[]; updateSkill: (patch: Partial<Skill>) => void; duplicateSkill: () => void; deleteSkill: () => void }) {
  const [activeTab, setActiveTab] = useState<'details' | 'effects' | 'notes'>('details');
  const accent = groupAccent[selected.group] ?? selected.accent;
  const fixedProgression = selected.type !== 'Normal' && seedSkills.some(skill => skill.id === selected.id);
  const updateEffect = (effectId: string, patch: Partial<Effect>) => updateSkill({ effects: selected.effects.map((effect) => effect.id === effectId ? { ...effect, ...patch } : effect) });
  const addEffect = () => updateSkill({ effects: [...selected.effects, { id: `e-${Date.now()}`, attribute: attributes[0], operator: '+', value: 10, unit: '' }] });
  const removeEffect = (effectId: string) => updateSkill({ effects: selected.effects.filter((effect) => effect.id !== effectId) });
  return <div className="editor-column"><div className="editor-panel panel"><div className="editor-header"><div className="editor-title-row"><div className="skill-symbol large" style={{ background: `${accent}18`, color: accent, borderColor: `${accent}45` }}><Sparkles size={21} /></div><div><div className="eyebrow muted">{selected.enabled === false ? 'MELHORIA DESATIVADA' : 'EDITANDO MELHORIA'}</div><h2>{selected.name}</h2><span className="updated">ID: {selected.id} · Atualizado {selected.updatedAt ? new Date(selected.updatedAt).toLocaleString('pt-BR') : 'catálogo padrão'}</span></div></div><div className="editor-actions"><button className="icon-button subtle" title="Duplicar melhoria normal" disabled={selected.type !== 'Normal'} onClick={duplicateSkill}><Copy size={16} /></button><button className="icon-button subtle danger" title={seedSkills.some(skill => skill.id === selected.id) ? (selected.enabled === false ? 'Reativar melhoria' : 'Desativar melhoria') : 'Excluir personalizada'} onClick={deleteSkill}>{seedSkills.some(skill => skill.id === selected.id) ? (selected.enabled === false ? <Check size={16} /> : <Archive size={16} />) : <Trash2 size={16} />}</button></div></div><div className="tabs"><button className={activeTab === 'details' ? 'active' : ''} onClick={() => setActiveTab('details')}>Detalhes</button><button className={activeTab === 'effects' ? 'active' : ''} onClick={() => setActiveTab('effects')}>Efeitos <span>{selected.effects.length}</span></button><button className={activeTab === 'notes' ? 'active' : ''} onClick={() => setActiveTab('notes')}>Notas de balanceamento</button></div>
    {activeTab === 'details' && <div className="editor-body"><div className="form-grid"><Field label="Nome da melhoria" wide><input value={selected.name} onChange={(event) => updateSkill({ name: event.target.value })} /></Field><Field label="Tipo (definido pelo jogo)"><select disabled value={selected.type} onChange={(event) => updateSkill({ type: event.target.value as SkillType })}><option>Normal</option><option>Gambiarra</option><option>Experimento</option><option>Especialização</option></select></Field><Field label="Raridade (organizacional)"><select value={selected.rarity} onChange={(event) => updateSkill({ rarity: event.target.value as Rarity })}><option>Comum</option><option>Incomum</option><option>Rara</option><option>Épica</option><option>Lendária</option></select></Field><Field label="Grupo de atributo"><select value={selected.group} onChange={(event) => updateSkill({ group: event.target.value as Group, accent: groupAccent[event.target.value as Group] })}>{groupOptions.map((group) => <option key={group}>{group}</option>)}</select></Field><Field label={fixedProgression ? 'Desbloqueio fixo da categoria' : 'Nível de desbloqueio'}><div className="number-input"><input disabled={fixedProgression} type="number" min="0" value={selected.unlockLevel} onChange={(event) => updateSkill({ unlockLevel: Number(event.target.value) })} /><span>LVL</span></div></Field><Field label="Chassi (definido pelo jogo)" wide><input readOnly value={selected.robot || 'Todos / sem restrição'} /></Field><Field label="Árvore de skills (organização)" wide><input value={selected.tree} onChange={(event) => updateSkill({ tree: event.target.value })} /></Field><Field label="Descrição" wide><textarea value={selected.description} onChange={(event) => updateSkill({ description: event.target.value })} rows={3} /></Field><Field label="Condição de ativação (definida pelo jogo)" wide><div className="input-with-icon"><Zap size={15} /><input readOnly value={selected.condition} onChange={(event) => updateSkill({ condition: event.target.value })} /></div></Field></div><div className="section-divider" /><div className="section-heading"><div><h3>Pré-requisitos</h3><p>Melhorias necessárias por ID. Categorias especiais mantêm a progressão do jogo.</p></div><span className="small-counter">{selected.prerequisites.length}/5</span></div><div className="tag-editor"><div className="tags">{selected.prerequisites.map((item) => <span className="tag" key={item}>{allSkills.find(skill => skill.id === item)?.name ?? item}<button disabled={fixedProgression} aria-label="Remover pré-requisito" onClick={() => updateSkill({ prerequisites: selected.prerequisites.filter((req) => req !== item) })}><X size={12} /></button></span>)}<select disabled={fixedProgression} value="" aria-label="Adicionar pré-requisito" onChange={event => {if(event.target.value) updateSkill({prerequisites: [...selected.prerequisites, event.target.value]});}}><option value="">Adicionar melhoria necessária...</option>{allSkills.filter(skill => skill.type === 'Normal' && skill.id !== selected.id && !selected.prerequisites.includes(skill.id)).map(skill => <option key={skill.id} value={skill.id}>{skill.name}</option>)}</select></div></div></div>}
    {activeTab === 'effects' && <div className="editor-body">{fixedProgression && <p className="conditional-hint">Tipo, condição e chassi seguem as regras originais. Estes modificadores substituem somente os valores diretos; consulte a condição e as notas do catálogo.</p>}<div className="section-heading"><div><h3>Modificadores numéricos</h3><p>Valores diretos, sem %. Para aumentar 10%, use × 1,1; + 10 soma dez unidades.</p></div><button className="button button-small button-secondary" onClick={addEffect}><Plus size={14} /> Adicionar efeito</button></div><div className="effects-table"><div className="effects-header"><span>Atributo</span><span>Operador</span><span>Valor</span><span /></div>{selected.effects.map((effect) => <div className="effect-row" key={effect.id}><select value={effect.attribute} aria-label="Atributo suportado" onChange={(event) => updateEffect(effect.id, { attribute: event.target.value })}>{attributes.map(attribute => <option key={attribute}>{attribute}</option>)}</select><select value={effect.operator} onChange={(event) => updateEffect(effect.id, { operator: event.target.value as Operator })}><option>+</option><option>−</option><option>×</option><option>÷</option><option>=</option></select><input className="effect-value" type="number" step="any" value={effect.value} onChange={(event) => updateEffect(effect.id, { value: Number(event.target.value) })} /><button className="icon-button subtle danger" onClick={() => removeEffect(effect.id)} title="Remover efeito"><Trash2 size={15} /></button></div>)}</div><div className="formula-preview"><div className="formula-icon"><Activity size={17} /></div><div><span>Preview do cálculo</span><b>{selected.effects.map((effect) => `${effect.operator} ${effect.value}${effect.unit ? ` ${effect.unit}` : ''} ${effect.attribute.toLowerCase()}`).join('  ·  ') || 'Nenhum efeito cadastrado'}</b></div></div></div>}
    {activeTab === 'notes' && <div className="editor-body notes-body"><div className="notes-intro"><div className="notes-icon"><Pencil size={17} /></div><div><h3>Notas de balanceamento</h3><p>Registre a intenção de design, sinergias e alertas para o time.</p></div></div><textarea className="notes-textarea" value={selected.notes ?? ''} onChange={(event) => updateSkill({ notes: event.target.value })} placeholder="Ex.: manter o DPS dentro de 15% da arma base; esta skill deve ser tentadora sem ser obrigatória..." /><div className="notes-hint"><Check size={14} /> Notas organizacionais; não criam regras de combate</div></div>}
    <div className="editor-footer"><span><span className="status-dot saved" /> Edições em rascunho; aplique no topo para usar no jogo</span><div><button className="button button-ghost" disabled={selected.type !== 'Normal'} onClick={duplicateSkill}><Copy size={14} /> Duplicar</button><button className="button button-secondary" onClick={deleteSkill}>{seedSkills.some(skill => skill.id === selected.id) ? (selected.enabled === false ? 'Reativar' : 'Desativar') : 'Excluir personalizada'}</button></div></div></div><SkillPreview skill={selected} accent={accent} /></div>;
}

export function TalentTree({ skills, selectedId, onSelect }: { skills: Skill[]; selectedId: string; onSelect: (id: string) => void }) {
  const [treeFilter, setTreeFilter] = useState('Todos');
  const trees = Array.from(new Set(skills.map((skill) => skill.tree))).sort();
  const visible = skills.filter((skill) => treeFilter === 'Todos' || skill.tree === treeFilter);
  const offerGroup = (skill: Skill) => skill.type === 'Normal' ? (skill.prerequisites.length ? 'normal-requires' : 'normal-open') : skill.type === 'Gambiarra' ? 'gambiarra' : skill.type === 'Especialização' ? 'specialization' : 'boss';
  const levels = [
    {key: 'normal-open', label: 'Normais sem requisitos'},
    {key: 'normal-requires', label: 'Normais com requisitos'},
    {key: 'gambiarra', label: 'Gambiarras · níveis 3/6/9'},
    {key: 'specialization', label: 'Especialização · nível 10'},
    {key: 'boss', label: 'Após chefes'},
  ];
  const byName = new Map(skills.map((skill) => [skill.id, skill]));
  const links = visible.flatMap((skill) => [
    ...skill.prerequisites.map((target) => ({ from: byName.get(target), to: skill, kind: 'Pré-requisito' })),
    ...(skill.synergies ?? []).map((target) => ({ from: byName.get(target), to: skill, kind: 'Sinergia' })),
  ]).filter((link) => link.from && link.from.id !== link.to.id);
  const connectedCount = new Set(links.flatMap((link) => [link.from?.id, link.to.id])).size;
  return <section className="talent-workspace">
    <div className="tree-toolbar panel"><div className="tree-toolbar-copy"><div className="tree-icon"><Network size={18} /></div><div><b>Mapa de progressão</b><span>Os vínculos mostram pré-requisitos reais por ID. Grupo e árvore organizam a visualização.</span></div></div><div className="tree-toolbar-actions"><label className="tree-select"><span>Árvore</span><select value={treeFilter} onChange={(event) => setTreeFilter(event.target.value)}><option>Todos</option>{trees.map((tree) => <option key={tree}>{tree}</option>)}</select></label><div className="tree-legend"><span><i className="legend-line prerequisite" /> requisito</span></div></div></div>
    <div className="tree-stats"><div><b>{visible.length}</b><span>nós visíveis</span></div><div><b>{links.length}</b><span>conexões mapeadas</span></div><div><b>{connectedCount}</b><span>skills conectadas</span></div><div><b>{trees.length}</b><span>árvores no projeto</span></div></div>
    <div className="talent-map panel"><div className="map-head"><div><div className="eyebrow muted"><GitBranch size={13} /> OFERTAS DA PARTIDA</div><h2>Grupos de oferta</h2></div><span>Clique em um nó para editar</span></div><div className="level-columns">{levels.map((level) => { const levelSkills = visible.filter((skill) => offerGroup(skill) === level.key); return <div className="level-column" key={level.key}><div className="level-label"><span>{level.label}</span><b>{levelSkills.length.toString().padStart(2, '0')}</b></div><div className="level-nodes">{levelSkills.length ? levelSkills.map((skill) => <button className={`talent-node ${skill.id === selectedId ? 'selected' : ''}`} key={skill.id} onClick={() => onSelect(skill.id)} style={{ '--node-accent': groupAccent[skill.group] ?? skill.accent } as React.CSSProperties}><span className="node-dot" /><span className="node-copy"><b>{skill.name}</b><small>{skill.type === 'Normal' ? `Nível mínimo ${skill.unlockLevel} · ` : ''}{skill.tree}</small></span><span className="node-type">{skill.type === 'Especialização' ? 'SPEC' : skill.type === 'Experimento' ? 'BOSS' : skill.type === 'Gambiarra' ? 'GMB' : 'CORE'}</span></button>) : <div className="empty-level">Nenhuma melhoria neste grupo</div>}</div></div>; })}</div></div>
    <div className="connections-panel panel"><div className="map-head"><div><div className="eyebrow muted"><Network size={13} /> RELATIONSHIP GRAPH</div><h2>Conexões da build</h2></div><span>Baseado nos campos do editor</span></div><div className="connection-list">{links.length ? links.map((link, index) => <button className={`connection-card ${link.kind === 'Sinergia' ? 'synergy' : ''}`} key={`${link.from?.id}-${link.to.id}-${index}`} onClick={() => onSelect(link.to.id)}><span className="connection-node">{link.from?.name}</span><span className="connection-arrow">{link.kind === 'Sinergia' ? '⇄' : '→'}</span><span className="connection-node target">{link.to.name}</span><span className="connection-kind">{link.kind}</span></button>) : <div className="connection-empty"><Network size={19} /><b>Ainda não há conexões explícitas.</b><span>Abra uma melhoria na biblioteca para revisar seus pré-requisitos.</span></div>}</div></div>
  </section>;
}

function SkillPreview({ skill, accent }: { skill: Skill; accent: string }) { return <aside className="preview-panel panel"><div className="preview-heading"><div><div className="eyebrow muted">LIVE PREVIEW</div><h3>Cartão de melhoria</h3></div><span className="live-indicator"><span /> ao vivo</span></div><div className="card-preview" style={{ '--skill-accent': accent } as React.CSSProperties}><div className="card-glow" /><div className="preview-card-top"><span className="preview-type">{skill.type.toUpperCase()}</span><span className="preview-level">{skill.unlockLevel ? `NÍVEL ${skill.unlockLevel}` : 'CHEFE'}</span></div><div className="preview-emblem"><Sparkles size={28} /></div><h4>{skill.name}</h4><p>{skill.description}</p><div className="preview-divider" /><div className="preview-effects">{skill.effects.slice(0, 3).map((effect) => <div className="preview-effect" key={effect.id}><span>{effect.attribute}</span><b>{effect.operator} {effect.value}{effect.unit}</b></div>)}</div><div className="preview-footer"><span style={{ color: accent }}>{skill.group}</span><span className="rarity-pill" style={{ borderColor: `${typeColors[skill.type]}60`, color: typeColors[skill.type] }}>{skill.rarity}</span></div></div><div className="preview-hint"><Pencil size={14} /><span>Edite os campos ao lado para atualizar a prévia em tempo real.</span></div><div className="preview-meta"><div><span>Árvore</span><b>{skill.tree}</b></div><div><span>Condição</span><b>{skill.condition}</b></div></div></aside>; }

function Field({ label, children, wide = false }: { label: string; children: React.ReactNode; wide?: boolean }) { return <label className={`field ${wide ? 'wide' : ''}`}><span>{label}</span>{children}</label>; }

export default App;
