'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ShieldCheckIcon, TrashIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useLanguage } from '@/i18n/language-context';
import { copy } from './copy';
import { ApiError, User, Purchase, request, inputStyle, panelStyle, buttonStyle } from './types';

type Draft = { name: string; email: string; phone: string; location: string; image: string; diseases: string; additionalInfo: string; fullAccess: boolean };
const draftOf = (user: User): Draft => ({ name: user.name, email: user.email, phone: user.phone || '', location: user.location || '', image: user.image || '', diseases: (user.diseases || []).join('\n'), additionalInfo: user.additionalInfo || '', fullAccess: !!user.fullAccess });
export function UserDetail({ id, onBack, onSaved, onDeleted }: { id: string; onBack: () => void; onSaved: () => void; onDeleted: () => void }) {
  const { language } = useLanguage(); const c = copy[language];
  const [user, setUser] = useState<User | null>(null), [draft, setDraft] = useState<Draft | null>(null);
  const [tab, setTab] = useState<'profile' | 'purchases' | 'activity' | 'security'>('profile');
  const [revision, setRevision] = useState(0), [loading, setLoading] = useState(true), [loadError, setLoadError] = useState('');
  const [purchases, setPurchases] = useState<Purchase[]>([]), [purchaseLoading, setPurchaseLoading] = useState(true), [purchaseError, setPurchaseError] = useState(false);
  const [saving, setSaving] = useState(false), [error, setError] = useState(''), [message, setMessage] = useState('');
  const [password, setPassword] = useState(''), [confirmation, setConfirmation] = useState('');
  const [deleteOpen, setDeleteOpen] = useState(false), [deleteEmail, setDeleteEmail] = useState('');
  const deleteInput = useRef<HTMLInputElement>(null), deleteButton = useRef<HTMLButtonElement>(null);
  const dirty = !!user && !!draft && JSON.stringify(draftOf(user)) !== JSON.stringify(draft);
  const date = (value?: string) => value ? new Date(value).toLocaleString(language) : '—';
  const errorMessage = (cause: unknown) => cause instanceof ApiError ? cause.status === 409 ? c.duplicate : cause.status === 400 ? c.invalid : cause.status === 404 ? c.missing : c.error : c.error;
  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setLoadError(''); setPurchaseLoading(true); setPurchaseError(false);
    request<User>(`/api/admin/users/${id}`, { signal: controller.signal }).then(data => { setUser(data); setDraft(draftOf(data)); })
      .catch(cause => { if (!controller.signal.aborted) setLoadError(cause instanceof ApiError && cause.status === 404 ? 'missing' : 'error'); }).finally(() => { if (!controller.signal.aborted) setLoading(false); });
    request<Purchase[]>(`/api/admin/users/${id}/purchases`, { signal: controller.signal }).then(setPurchases)
      .catch(() => { if (!controller.signal.aborted) setPurchaseError(true); }).finally(() => { if (!controller.signal.aborted) setPurchaseLoading(false); });
    return () => controller.abort();
  }, [id, revision]);
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn); return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  useEffect(() => { if (deleteOpen) deleteInput.current?.focus(); }, [deleteOpen]);
  const back = () => { if (!saving && (!dirty || window.confirm(c.unsaved))) onBack(); };
  const change = <K extends keyof Draft>(field: K, value: Draft[K]) => { setDraft(current => current ? { ...current, [field]: value } : current); setMessage(''); };
  const closeDelete = () => { if (!saving) { setDeleteOpen(false); setDeleteEmail(''); setError(''); deleteButton.current?.focus(); } };
  const saveProfile = async (event: React.FormEvent) => {
    event.preventDefault(); if (!draft) return;
    setSaving(true); setError(''); setMessage('');
    try {
      const updated = await request<User>(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify({ ...draft, diseases: draft.diseases.split('\n').map(value => value.trim()).filter(Boolean) }) });
      setUser(updated); setDraft(draftOf(updated)); setMessage(c.saved); onSaved();
    } catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  };
  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setMessage('');
    if (password !== confirmation) { setError(c.mismatch); return; }
    if (password.length < 8 || new TextEncoder().encode(password).length > 72) { setError(c.passwordLength); return; }
    setSaving(true);
    try { await request(`/api/admin/users/${id}/password`, { method: 'PATCH', body: JSON.stringify({ password }) }); setPassword(''); setConfirmation(''); setMessage(c.passwordSaved); }
    catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  };
  const remove = async (event: React.FormEvent) => {
    event.preventDefault(); if (!user || deleteEmail !== user.email) return;
    setSaving(true); setError('');
    try { await request(`/api/admin/users/${id}`, { method: 'DELETE' }); onDeleted(); }
    catch (cause) { setError(errorMessage(cause)); } finally { setSaving(false); }
  };
  return <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-7">
    <button onClick={back} disabled={saving} className="inline-flex items-center gap-2 text-sm text-gray-5 hover:text-primary disabled:opacity-40"><ArrowLeftIcon className="h-4 w-4" />{c.back}</button>
    {loading ? <div role="status" className={`${panelStyle} py-16 text-center`}>{c.loading}</div> : loadError || !user || !draft ? <div className={panelStyle}><p role="alert" className="text-red-600">{loadError === 'missing' ? c.missing : c.error}</p><button onClick={() => setRevision(value => value + 1)} className="mt-4 text-primary underline">{c.retry}</button></div> : <>
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div className="flex items-center gap-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-semibold text-primary">{user.name.charAt(0).toUpperCase()}</div><div><h1 className="text-2xl font-bold text-dark dark:text-white">{user.name}</h1><p className="mt-1 text-sm text-gray-5">{user.email}</p><p className="mt-1 text-xs text-gray-5">{c.userId}: {user._id}</p></div></div><span className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${user.fullAccess ? 'bg-green-50 text-green-700' : 'bg-gray-2 text-gray-6 dark:bg-dark-2 dark:text-gray-4'}`}><ShieldCheckIcon className="h-5 w-5" />{user.fullAccess ? c.allAccess : c.standard}</span></div>
      <div className="grid gap-4 sm:grid-cols-3">{[[c.registered, date(user.createdAt)], [c.updated, date(user.updatedAt)], [c.purchases, purchaseLoading ? '…' : purchaseError ? '—' : String(purchases.length)]].map(([label, value]) => <div key={label} className={panelStyle}><p className="text-xs text-gray-5">{label}</p><p className="mt-2 text-base font-semibold text-dark dark:text-white">{value}</p></div>)}</div>
      <div className="flex gap-1 overflow-x-auto border-b border-stroke dark:border-dark-3" role="tablist">{(['profile', 'purchases', 'activity', 'security'] as const).map(value => <button key={value} id={`tab-${value}`} aria-controls={`panel-${value}`} role="tab" aria-selected={tab === value} disabled={saving} onClick={() => { setTab(value); setError(''); setMessage(''); }} className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium ${tab === value ? 'border-primary text-primary' : 'border-transparent text-gray-5 hover:text-primary'}`}>{c[value]}</button>)}</div>
      {message && <p role="status" className="flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm text-green-700"><CheckCircleIcon className="h-5 w-5" />{message}</p>}{error && !deleteOpen && <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-600">{error}</p>}
      {tab === 'profile' && <form id="panel-profile" role="tabpanel" aria-labelledby="tab-profile" onSubmit={saveProfile} className="space-y-5"><div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <div className={`${panelStyle} space-y-5`}><h2 className="text-lg font-semibold text-dark dark:text-white">{c.profile}</h2><div className="grid gap-5 sm:grid-cols-2">{(['name', 'email', 'phone', 'location'] as const).map(field => <label key={field} className="block text-sm"><span className="mb-2 block font-medium">{c[field]}</span><input required maxLength={254} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} autoComplete="off" value={draft[field]} onChange={event => change(field, event.target.value)} disabled={saving} className={inputStyle} /></label>)}</div>
          <label className="block text-sm"><span className="mb-2 block font-medium">{c.image}</span><input maxLength={2048} value={draft.image} onChange={event => change('image', event.target.value)} disabled={saving} className={inputStyle} /></label>
          <label className="block text-sm"><span className="mb-2 block font-medium">{c.diseases}</span><textarea rows={3} maxLength={25500} placeholder={c.diseasesHint} value={draft.diseases} onChange={event => change('diseases', event.target.value)} disabled={saving} className={inputStyle} /></label>
          <label className="block text-sm"><span className="mb-2 block font-medium">{c.additionalInfo}</span><textarea rows={4} maxLength={10000} value={draft.additionalInfo} onChange={event => change('additionalInfo', event.target.value)} disabled={saving} className={inputStyle} /></label></div>
        <div><div className={`${panelStyle} space-y-4`}><div className="flex items-center gap-2 text-primary"><ShieldCheckIcon className="h-6 w-6" /><h2 className="font-semibold">{c.fullAccessTitle}</h2></div><p className="text-sm leading-relaxed text-gray-5">{c.fullAccessHint}</p><label className="flex cursor-pointer items-center gap-3 rounded-xl bg-primary/5 p-4 text-sm font-medium"><input type="checkbox" role="switch" checked={draft.fullAccess} onChange={event => change('fullAccess', event.target.checked)} disabled={saving} className="h-5 w-5 accent-primary" />{c.allAccess}</label><p className="text-xs leading-relaxed text-gray-5">{c.accessHint}</p></div></div>
      </div><div className="flex justify-end"><button disabled={saving || !dirty} className={buttonStyle}>{saving ? c.saving : c.save}</button></div></form>}
      {tab === 'purchases' && <section id="panel-purchases" role="tabpanel" aria-labelledby="tab-purchases" className={panelStyle}>
        {user.fullAccess && <p className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-700">{c.accessNotice}</p>}
        {purchaseLoading ? <p>{c.loading}</p> : purchaseError ? <div role="alert"><p className="text-red-600">{c.error}</p><button onClick={() => { if (!dirty || window.confirm(c.unsaved)) setRevision(value => value + 1); }} className="mt-3 text-primary underline">{c.retry}</button></div> : !purchases.length ? <p className="py-12 text-center text-gray-5">{c.noPurchases}</p> : <div className="grid gap-4 md:grid-cols-2">{purchases.map(purchase => {
          const raw = purchase.courseId?.title || purchase.setId?.name || purchase.setId?.title;
          const name = typeof raw === 'string' ? raw : raw?.[language] || raw?.en || raw?.ka || raw?.ru || c.removedContent;
          return <article key={purchase._id} className="rounded-xl border border-stroke p-5 dark:border-dark-3"><div className="mb-3 flex justify-between gap-3"><span className="text-xs text-gray-5">{purchase.itemType === 'course' ? c.course : c.set}</span><span className="text-sm font-semibold">{purchase.amount} {purchase.currency}</span></div><h3 className="font-semibold text-dark dark:text-white">{name}</h3><p className={`mt-3 text-sm ${purchase.hasAccess ? 'text-green-600' : 'text-red-600'}`}>{purchase.hasAccess ? c.active : c.inactive}</p><dl className="mt-4 space-y-2 text-xs text-gray-5"><div className="flex justify-between gap-2"><dt>{c.purchased}</dt><dd>{date(purchase.createdAt)}</dd></div><div className="flex justify-between gap-2"><dt>{c.expires}</dt><dd>{purchase.expiresAt ? date(purchase.expiresAt) : c.unlimited}</dd></div></dl></article>;
        })}</div>}
      </section>}
      {tab === 'activity' && <section id="panel-activity" role="tabpanel" aria-labelledby="tab-activity" className="space-y-5"><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{(['totalTimeSpent', 'totalExercisesCompleted', 'totalSetsCompleted', 'totalCoursesCompleted', 'currentStreak', 'recordStreak'] as const).map((field, index) => <div key={field} className={panelStyle}><p className="text-sm text-gray-5">{[c.totalTime, c.exercises, c.sets, c.courses, c.streak, c.record][index]}</p><p className="mt-3 text-3xl font-semibold text-dark dark:text-white">{user.statistics?.[field] || 0}</p></div>)}</div>
        <div className={panelStyle}><h2 className="mb-4 text-lg font-semibold">{c.achievements}</h2>{!user.achievements?.length ? <p className="text-sm text-gray-5">{c.noAchievements}</p> : <div className="grid gap-3 sm:grid-cols-2">{user.achievements.map(achievement => <div key={achievement.id} className="flex items-center justify-between gap-3 rounded-xl border border-stroke p-4 dark:border-dark-3"><div><p className="text-sm font-medium">{achievement.title?.[language] || achievement.title?.en || achievement.id}</p><p className="mt-1 text-xs text-gray-5">{achievement.current} / {achievement.total}</p></div>{achievement.isCompleted && <CheckCircleIcon className="h-6 w-6 text-green-600" />}</div>)}</div>}</div>
        <div className={panelStyle}><h2 className="mb-3 font-semibold">{c.activityDates} ({user.statistics?.activityDates?.length || 0})</h2><div className="flex flex-wrap gap-2">{user.statistics?.activityDates?.map((value, index) => <span key={index} className="rounded-lg bg-gray-2 px-3 py-1 text-xs dark:bg-dark-2">{new Date(value).toLocaleDateString(language)}</span>)}</div>{(['completedExerciseIds', 'completedSetIds', 'completedCourseIds'] as const).map((field, index) => <details key={field} className="mt-4 text-xs text-gray-5"><summary className="cursor-pointer">{[c.exercises, c.sets, c.courses][index]} · ID</summary><p className="mt-2 break-all">{user.statistics?.[field]?.join(', ') || '—'}</p></details>)}</div>
      </section>}
      {tab === 'security' && <section id="panel-security" role="tabpanel" aria-labelledby="tab-security" className="grid items-start gap-5 lg:grid-cols-2"><form onSubmit={savePassword} className={`${panelStyle} space-y-4`}><h2 className="text-lg font-semibold">{c.security}</h2><p className="text-sm text-gray-5">{c.passwordHint}</p><label className="block text-sm"><span className="mb-2 block">{c.newPassword}</span><input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={password} onChange={event => setPassword(event.target.value)} disabled={saving} className={inputStyle} /></label><label className="block text-sm"><span className="mb-2 block">{c.confirmPassword}</span><input type="password" autoComplete="new-password" required minLength={8} maxLength={72} value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={saving} className={inputStyle} /></label><button disabled={saving} className={buttonStyle}>{saving ? c.saving : c.passwordSave}</button></form><div className={`${panelStyle} border-red-200`}><TrashIcon className="mb-3 h-6 w-6 text-red-600" /><h2 className="font-semibold">{c.delete}</h2><p className="mt-3 text-sm leading-relaxed text-gray-5">{c.deleteHint}</p><button ref={deleteButton} onClick={() => { setError(''); setDeleteOpen(true); }} disabled={saving} className="mt-5 rounded-xl border border-red-300 px-5 py-3 text-sm font-medium text-red-600 hover:bg-red-50">{c.delete}</button></div></section>}
      {deleteOpen && <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-5" onKeyDown={event => {
        if (event.key === 'Escape') closeDelete();
        if (event.key === 'Tab') { const elements = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('input:not(:disabled),button:not(:disabled)')); const first = elements[0], last = elements[elements.length - 1]; if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); } else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); } }
      }}><form role="dialog" aria-modal="true" aria-labelledby="delete-user-title" onSubmit={remove} className="w-full max-w-lg rounded-2xl bg-white p-7 shadow-xl dark:bg-gray-dark"><h2 id="delete-user-title" className="text-xl font-semibold">{c.deleteTitle}</h2><p className="mt-3 text-sm leading-relaxed text-gray-5">{c.deleteHint}</p><p className="mt-3 break-all font-medium">{user.email}</p><label className="mt-5 block text-sm"><span className="mb-2 block">{c.deleteConfirm}</span><input ref={deleteInput} type="email" autoComplete="off" value={deleteEmail} onChange={event => setDeleteEmail(event.target.value)} disabled={saving} className={inputStyle} required /></label>{error && <p role="alert" className="mt-3 text-sm text-red-600">{error}</p>}<div className="mt-6 flex justify-end gap-3"><button type="button" onClick={closeDelete} disabled={saving} className="rounded-xl border border-stroke px-4 py-3 text-sm dark:border-dark-3">{c.cancel}</button><button disabled={saving || deleteEmail !== user.email} className="rounded-xl bg-red-600 px-4 py-3 text-sm text-white disabled:opacity-40">{saving ? c.saving : c.delete}</button></div></form></div>}
    </>}
  </div>;
}
