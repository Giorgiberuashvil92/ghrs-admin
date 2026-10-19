"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpTrayIcon,
  CloudIcon,
  FilmIcon,
  PlayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/i18n/language-context";

const copy = {
  ka: {
    title: "ვიდეო ბიბლიოთეკა",
    subtitle: "ატვირთე და მართე ვიდეოები ერთ სივრცეში",
    add: "ვიდეოს დამატება",
    total: "ატვირთული ვიდეოები",
    size: "ფაილების მოცულობა",
    storage: "საცავის სტატუსი",
    pending: "დაკავშირების მოლოდინში",
    connected: "დაკავშირებულია",
    drop: "გადმოიტანე ვიდეოები აქ",
    browse: "ან აირჩიე კომპიუტერიდან",
    formats: "MP4, MOV, WebM · შესაძლებელია რამდენიმე ფაილის არჩევა",
    library: "ჩემი ვიდეოები",
    search: "ვიდეოს ძებნა…",
    empty: "შენი ვიდეო ბიბლიოთეკა აქ გამოჩნდება",
    emptyText: "აირჩიე პირველი ვიდეო R2-ში ასატვირთად.",
    preview: "ვიდეოს ნახვა",
    remove: "ვიდეოს წაშლა",
    close: "დახურვა",
    invalid: "აირჩიე ვიდეოფაილი (MP4, MOV ან WebM).",
    noResults: "ვიდეო ვერ მოიძებნა",
    connection: "Cloudflare R2",
    connectionText:
      "ვიდეოები იტვირთება Cloudflare R2-ში და გვერდის განახლების შემდეგაც ინახება.",
  },
  en: {
    title: "Video library",
    subtitle: "Upload and manage your videos in one place",
    add: "Add videos",
    total: "Uploaded videos",
    size: "Total file size",
    storage: "Storage status",
    pending: "Awaiting connection",
    connected: "Connected",
    drop: "Drag your videos here",
    browse: "or choose from your computer",
    formats: "MP4, MOV, WebM · Select multiple files",
    library: "My videos",
    search: "Search videos…",
    empty: "Your video library starts here",
    emptyText: "Choose your first video to upload to R2.",
    preview: "Preview video",
    remove: "Delete video",
    close: "Close",
    invalid: "Choose a video file (MP4, MOV or WebM).",
    noResults: "No videos found",
    connection: "Cloudflare R2",
    connectionText:
      "Videos are uploaded to Cloudflare R2 and remain available after refresh.",
  },
  ru: {
    title: "Видеотека",
    subtitle: "Загружайте и управляйте видео в одном месте",
    add: "Добавить видео",
    total: "Загружено видео",
    size: "Общий размер",
    storage: "Статус хранилища",
    pending: "Ожидает подключения",
    connected: "Подключено",
    drop: "Перетащите видео сюда",
    browse: "или выберите на компьютере",
    formats: "MP4, MOV, WebM · Можно выбрать несколько файлов",
    library: "Мои видео",
    search: "Поиск видео…",
    empty: "Здесь появится ваша видеотека",
    emptyText: "Выберите первое видео для загрузки в R2.",
    preview: "Смотреть видео",
    remove: "Удалить видео",
    close: "Закрыть",
    invalid: "Выберите видеофайл (MP4, MOV или WebM).",
    noResults: "Видео не найдены",
    connection: "Cloudflare R2",
    connectionText:
      "Видео сохраняются в Cloudflare R2 и доступны после обновления страницы.",
  },
};

type Video = { id: string; name: string; size: number; url: string };
const formatSize = (bytes: number) =>
  bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(2)} GB`
    : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

export default function VideosPage() {
  const { language } = useLanguage();
  const tr = copy[language];
  const [videos, setVideos] = useState<Video[]>([]);
  const [query, setQuery] = useState("");
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [active, setActive] = useState<Video | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState("");
  const [connected, setConnected] = useState(false);

  async function loadVideos() {
    const response = await fetch("/api/r2/videos", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Storage unavailable");
    setVideos(data.videos);
    setConnected(true);
  }
  useEffect(() => {
    loadVideos().catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    if (active) dialog.current?.showModal();
    else dialog.current?.close();
  }, [active]);

  async function addFiles(files: FileList | File[]) {
    if (uploading) return;
    const selected = Array.from(files);
    if (
      selected.some(
        (file) =>
          !/\.(mp4|mov|webm)$/i.test(file.name) ||
          !file.size ||
          file.size > 5 * 1024 ** 3,
      )
    ) {
      setError(tr.invalid + " (max. 5 GB)");
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of selected) {
        setProgress(`${file.name}: 0%`);
        const contentType = /\.mov$/i.test(file.name)
          ? "video/quicktime"
          : /\.webm$/i.test(file.name)
            ? "video/webm"
            : "video/mp4";
        const response = await fetch("/api/r2/videos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: file.name,
            size: file.size,
            contentType,
          }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message);
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("PUT", data.uploadUrl);
          xhr.setRequestHeader("Content-Type", contentType);
          xhr.upload.onprogress = (event) => {
            if (event.lengthComputable)
              setProgress(
                `${file.name}: ${Math.round((event.loaded / event.total) * 100)}%`,
              );
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(new Error(`Upload failed (${xhr.status})`));
          xhr.onerror = () =>
            reject(
              new Error(
                "Upload failed. Check your connection and R2 CORS settings.",
              ),
            );
          xhr.timeout = 60 * 60 * 1000;
          xhr.ontimeout = () =>
            reject(new Error("Upload timed out. Please retry."));
          xhr.send(file);
        });
        await loadVideos();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      setProgress("");
    }
  }

  async function removeVideo(video: Video) {
    if (!window.confirm(`${tr.remove}: ${video.name}?`)) return;
    try {
      const response = await fetch("/api/r2/videos", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: video.id }),
      });
      if (!response.ok) throw new Error("Delete failed");
      if (active?.id === video.id) setActive(null);
      setVideos((previous) => previous.filter((item) => item.id !== video.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    }
  }

  const visible = videos.filter((video) =>
    video.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()),
  );
  const panel =
    "rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-dark";

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 text-dark dark:text-white md:p-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-500">
            GHRS / MEDIA
          </p>
          <h1 className="text-2xl font-bold md:text-3xl">{tr.title}</h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {tr.subtitle}
          </p>
        </div>
        <button
          disabled={uploading}
          onClick={() => input.current?.click()}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600"
        >
          <ArrowUpTrayIcon className="size-5" />
          {tr.add}
        </button>
      </header>

      <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
        <CloudIcon className="size-6 shrink-0" />
        <div>
          <p className="font-semibold">{tr.connection}</p>
          <p className="mt-1 leading-relaxed">{tr.connectionText}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: tr.total, value: videos.length, icon: FilmIcon },
          {
            label: tr.size,
            value: formatSize(
              videos.reduce((sum, video) => sum + video.size, 0),
            ),
            icon: ArrowUpTrayIcon,
          },
          {
            label: tr.storage,
            value: connected ? tr.connected : tr.pending,
            icon: CloudIcon,
          },
        ].map((item) => (
          <div
            key={item.label}
            className={`${panel} flex items-center gap-4 p-5`}
          >
            <div className="rounded-xl bg-orange-50 p-3 text-orange-500 dark:bg-orange-950">
              <item.icon className="size-6" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {item.label}
              </p>
              <p className="mt-2 text-lg font-semibold">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={input}
        type="file"
        multiple
        accept="video/*,.mp4,.mov,.webm"
        className="hidden"
        aria-label={tr.add}
        onChange={(event) => {
          if (event.target.files) addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node))
            setDragging(false);
        }}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          addFiles(event.dataTransfer.files);
        }}
        className={`rounded-2xl border-2 border-dashed p-8 text-center transition-colors md:p-12 ${dragging ? "border-orange-500 bg-orange-100 dark:bg-orange-950" : "border-orange-200 bg-orange-50/50 dark:border-gray-600 dark:bg-gray-dark"}`}
      >
        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-white text-orange-500 shadow-sm dark:bg-gray-800">
          <ArrowUpTrayIcon className="size-7" />
        </div>
        <h2 className="text-lg font-semibold">{tr.drop}</h2>
        <button
          disabled={uploading}
          onClick={() => input.current?.click()}
          className="mt-2 text-sm font-medium text-orange-600 underline underline-offset-4 dark:text-orange-400"
        >
          {tr.browse}
        </button>
        <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">
          {tr.formats}
        </p>
      </div>
      {uploading && (
        <p role="status" className="text-sm text-orange-600">
          {progress}
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <section className={`${panel} overflow-hidden`}>
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 p-5 dark:border-gray-700">
          <h2 className="font-semibold">
            {tr.library}{" "}
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500 dark:bg-gray-800">
              {videos.length}
            </span>
          </h2>
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon className="absolute left-3 top-3 size-4 text-gray-400" />
            <input
              aria-label={tr.search}
              placeholder={tr.search}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-transparent py-2 pl-9 pr-3 text-sm dark:border-gray-600"
            />
          </div>
        </div>
        {visible.length ? (
          <div className="grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700"
              >
                <button
                  onClick={() => setActive(video)}
                  aria-label={`${tr.preview}: ${video.name}`}
                  className="group relative block aspect-video w-full overflow-hidden bg-slate-950"
                >
                  <video
                    src={video.url}
                    preload="metadata"
                    muted
                    playsInline
                    className="h-full w-full object-contain"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/40">
                    <PlayIcon className="size-12 rounded-full bg-white/90 p-3 text-orange-600" />
                  </span>
                </button>
                <div className="p-4">
                  <h3
                    className="truncate text-sm font-semibold"
                    title={video.name}
                  >
                    {video.name}
                  </h3>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">
                      {formatSize(video.size)}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      {tr.connection}
                    </span>
                    <button
                      aria-label={`${tr.remove}: ${video.name}`}
                      onClick={() => removeVideo(video)}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <TrashIcon className="size-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="px-6 py-16 text-center">
            <FilmIcon className="mx-auto mb-4 size-12 text-gray-300" />
            <h3 className="font-semibold">{query ? tr.noResults : tr.empty}</h3>
            {!query && (
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                {tr.emptyText}
              </p>
            )}
          </div>
        )}
      </section>

      <div className="flex items-center gap-3 px-1 text-sm text-gray-500 dark:text-gray-400">
        <CloudIcon className="size-5 shrink-0" />
        <p>
          <span className="font-semibold">{tr.connection}</span> ·{" "}
          {tr.connectionText}
        </p>
      </div>
      <dialog
        ref={dialog}
        onCancel={() => setActive(null)}
        onClose={() => setActive(null)}
        className="m-auto w-[calc(100%-2rem)] max-w-4xl rounded-2xl bg-white p-4 text-dark backdrop:bg-black/70 dark:bg-gray-dark dark:text-white"
      >
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="truncate font-semibold">{active?.name}</h2>
          <button
            onClick={() => setActive(null)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
          >
            {tr.close}
          </button>
        </div>
        {active && (
          <video
            key={active.id}
            src={active.url}
            controls
            autoPlay
            playsInline
            className="max-h-[70vh] w-full rounded-lg bg-black"
          />
        )}
      </dialog>
    </div>
  );
}
