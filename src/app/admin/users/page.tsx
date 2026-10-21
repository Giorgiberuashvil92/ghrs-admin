'use client';

import { useEffect, useState } from 'react';
import { useLanguage } from '@/i18n/language-context';
import { MagnifyingGlassIcon, UsersIcon, ArrowRightIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { copy } from './copy';
import { User, request, panelStyle, inputStyle, buttonStyle } from './types';
import { UserDetail } from './user-detail';

type Result = { users: User[]; total: number; pageSize: number };
export default function UsersPage() {
  const { language } = useLanguage();
  const c = copy[language];
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [revision, setRevision] = useState(0);
  const [result, setResult] = useState<Result>({ users: [], total: 0, pageSize: 25 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(false);
    request<Result>(`/api/admin/users?search=${encodeURIComponent(query)}&page=${page}`, { signal: controller.signal })
      .then(data => { setResult(data); if (!data.users.length && page > 1) setPage(page - 1); })
      .catch(() => { if (!controller.signal.aborted) setError(true); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [query, page, revision]);

  if (selectedId) return <UserDetail key={selectedId} id={selectedId} onBack={() => setSelectedId(null)} onSaved={() => setRevision(value => value + 1)} onDeleted={() => { setSelectedId(null); setRevision(value => value + 1); setNotice(c.deleted); }} />;

  return <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-7">
    <div className="flex items-center gap-4"><div className="rounded-2xl bg-primary/10 p-3 text-primary"><UsersIcon className="h-7 w-7" /></div><div><h1 className="text-2xl font-bold text-dark dark:text-white">{c.users}</h1><p className="mt-1 text-sm text-gray-5">{c.intro}</p></div></div>
    {notice && <p role="status" className="rounded-xl bg-green-50 p-4 text-green-700">{notice}</p>}
    <div className={panelStyle}>
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <p className="text-sm"><span className="mr-2 text-2xl font-semibold text-dark dark:text-white">{result.total}</span>{c.total}</p>
        <form className="flex w-full gap-2 md:max-w-lg" onSubmit={event => { event.preventDefault(); setPage(1); setQuery(search.trim()); }}>
          <div className="relative flex-1"><MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-3.5 h-5 w-5 text-gray-5" /><input aria-label={c.searchHint} placeholder={c.searchHint} maxLength={100} value={search} onChange={event => setSearch(event.target.value)} className={`${inputStyle} pl-10`} /></div>
          <button className={buttonStyle}>{c.search}</button>
        </form>
      </div>
      {error ? <div role="alert" className="py-8 text-center"><p className="text-red-600">{c.error}</p><button onClick={() => setRevision(value => value + 1)} className="mt-3 text-primary underline">{c.retry}</button></div> : loading ? <p role="status" className="py-14 text-center">{c.loading}</p> : <>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm">
          <thead><tr className="border-b border-stroke text-xs text-gray-5 dark:border-dark-3">{[c.user, c.phone, c.registered, c.purchases, c.access, ''].map((label, index) => <th key={index} className="px-3 py-4 font-medium">{label}</th>)}</tr></thead>
          <tbody>{result.users.map(user => <tr key={user._id} className="border-b border-stroke transition hover:bg-gray-2/60 dark:border-dark-3 dark:hover:bg-dark-2">
            <td className="px-3 py-5"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">{user.name?.trim().charAt(0).toUpperCase() || '?'}</div><div><button className="text-left font-semibold text-dark hover:text-primary dark:text-white" onClick={() => setSelectedId(user._id)}>{user.name}</button><p className="mt-1 text-xs text-gray-5">{user.email}</p></div></div></td>
            <td className="px-3 py-5">{user.phone || '—'}</td><td className="whitespace-nowrap px-3 py-5">{user.createdAt ? new Date(user.createdAt).toLocaleDateString(language) : '—'}</td>
            <td className="px-3 py-5"><span className="font-medium">{user.purchaseCount || 0}</span></td>
            <td className="px-3 py-5"><span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${user.fullAccess ? 'bg-green-50 text-green-700' : 'bg-gray-2 text-gray-6 dark:bg-dark-2 dark:text-gray-4'}`}>{user.fullAccess && <ShieldCheckIcon className="h-4 w-4" />}{user.fullAccess ? c.allAccess : c.standard}</span></td>
            <td className="px-3 py-5"><button aria-label={`${c.manage}: ${user.name}`} onClick={() => setSelectedId(user._id)} className="rounded-lg border border-stroke p-2 text-primary hover:bg-primary/10 dark:border-dark-3"><ArrowRightIcon className="h-5 w-5" /></button></td>
          </tr>)}</tbody>
        </table></div>
        {!result.users.length && <p className="py-14 text-center text-gray-5">{c.empty}</p>}
        <div className="mt-5 flex items-center justify-between text-sm"><button disabled={page <= 1} onClick={() => setPage(value => value - 1)} className="rounded-lg border border-stroke px-4 py-2 disabled:opacity-30 dark:border-dark-3">{c.previous}</button><span>{c.page} {page} / {Math.max(1, Math.ceil(result.total / result.pageSize))}</span><button disabled={page * result.pageSize >= result.total} onClick={() => setPage(value => value + 1)} className="rounded-lg border border-stroke px-4 py-2 disabled:opacity-30 dark:border-dark-3">{c.next}</button></div>
      </>}
    </div>
  </div>;
}
