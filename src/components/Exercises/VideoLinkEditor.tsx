'use client';

import { useState } from 'react';
import { useLanguage } from '@/i18n/language-context';
import { updateExercise } from '@/lib/api/exercises';

const messages = {
  ka: { title: 'ვიდეოს ბმული', english: 'ინგლისური ვიდეოს ბმული', save: 'ბმულების შენახვა', saving: 'ინახება…', saved: 'ვიდეოს ბმულები შენახულია', error: 'ბმულის შენახვა ვერ მოხერხდა. სცადეთ ხელახლა.', invalid: 'შეიყვანეთ სწორი http ან https ბმული.', watch: 'ვიდეოს გახსნა' },
  en: { title: 'Video link', english: 'English video link', save: 'Save video links', saving: 'Saving…', saved: 'Video links saved', error: 'Could not save the video link. Please try again.', invalid: 'Enter a valid http or https URL.', watch: 'Open video' },
  ru: { title: 'Ссылка на видео', english: 'Ссылка на английское видео', save: 'Сохранить ссылки', saving: 'Сохранение…', saved: 'Ссылки сохранены', error: 'Не удалось сохранить ссылку. Попробуйте снова.', invalid: 'Введите корректную ссылку http или https.', watch: 'Открыть видео' },
};
function validUrl(value: string) {
  if (!value) return true;
  try { return ['http:', 'https:'].includes(new URL(value).protocol); } catch { return false; }
}
export function VideoLinkEditor({ id, videoUrl = '', videoUrlEn = '' }: { id: string; videoUrl?: string; videoUrlEn?: string }) {
  const { language } = useLanguage(); const c = messages[language];
  const [main, setMain] = useState(videoUrl), [english, setEnglish] = useState(videoUrlEn);
  const [saved, setSaved] = useState({ main: videoUrl, english: videoUrlEn });
  const [saving, setSaving] = useState(false), [error, setError] = useState(''), [success, setSuccess] = useState(false);
  const dirty = main.trim() !== saved.main || english.trim() !== saved.english;
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(''); setSuccess(false);
    const next = { main: main.trim(), english: english.trim() };
    if (!validUrl(next.main) || !validUrl(next.english)) { setError(c.invalid); return; }
    setSaving(true);
    try {
      const data = new FormData();
      if (next.main !== saved.main) data.append('videoUrl', next.main);
      if (next.english !== saved.english) data.append('videoUrlEn', next.english);
      await updateExercise(id, data);
      setSaved(next); setMain(next.main); setEnglish(next.english); setSuccess(true);
    } catch { setError(c.error); } finally { setSaving(false); }
  };
  return <form onSubmit={submit} className="mb-4 space-y-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
    <label className="block text-xs font-medium text-gray-700"><span className="mb-1.5 block">{c.title}</span><input type="url" placeholder="https://…" value={main} onChange={event => { setMain(event.target.value); setSuccess(false); }} disabled={saving} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" /></label>
    <label className="block text-xs font-medium text-gray-700"><span className="mb-1.5 block">{c.english}</span><input type="url" placeholder="https://…" value={english} onChange={event => { setEnglish(event.target.value); setSuccess(false); }} disabled={saving} className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs text-gray-900" /></label>
    {error && <p role="alert" className="text-xs text-red-600">{error}</p>}{success && <p role="status" className="text-xs text-green-700">{c.saved}</p>}
    <button type="submit" disabled={saving || !dirty} className="w-full rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-40">{saving ? c.saving : c.save}</button>
    {saved.main && validUrl(saved.main) && <a href={saved.main} target="_blank" rel="noopener noreferrer" className="block text-center text-xs text-blue-700 underline">{c.watch}</a>}
  </form>;
}
