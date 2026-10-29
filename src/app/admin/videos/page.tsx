"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowUpTrayIcon,
  CloudIcon,
  FilmIcon,
  PlayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PencilSquareIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "@/i18n/language-context";

const copy = {
  ka: {
    link: "ვიდეოს ბმული",
    copyLink: "ბმულის კოპირება",
    copied: "დაკოპირებულია",
    copyAll: "ნაჩვენები ბმულების კოპირება",
    sort: "სორტირება",
    newest: "ჯერ ახალი",
    oldest: "ჯერ ძველი",
    nameAsc: "სახელი: ა–ჰ",
    nameDesc: "სახელი: ჰ–ა",
    sizeDesc: "ზომა: კლებადობით",
    catalogSort: "კატალოგის მიხედვით",
    list: "სია",
    grid: "ბარათები",
    linkExpiry:
      "ეს ბმულები მოქმედებს 24 საათი; გვერდის განახლებით მიიღებ ახალ ბმულებს.",
    copyFailed: "კოპირება ვერ მოხერხდა — მონიშნე ბმული და დააკოპირე.",

    catalogs: "კატალოგები",
    all: "ყველა ვიდეო",
    uncategorized: "კატალოგის გარეშე",
    createCatalog: "კატალოგის შექმნა",
    catalogName: "კატალოგის სახელი",
    videoName: "ვიდეოს სახელი",
    catalog: "კატალოგი",
    save: "შენახვა",
    cancel: "გაუქმება",
    edit: "რედაქტირება",
    editCatalog: "კატალოგის რედაქტირება",
    deleteCatalog: "კატალოგის წაშლა",
    confirmDeleteCatalog:
      "წავშალოთ კატალოგი? ვიდეოები კატალოგის გარეშე გადავა.",
    startUpload: "ატვირთვის დაწყება",
    queue: "ასატვირთი ვიდეოები",

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
    link: "Video URL",
    copyLink: "Copy link",
    copied: "Copied",
    copyAll: "Copy visible links",
    sort: "Sort",
    newest: "Newest first",
    oldest: "Oldest first",
    nameAsc: "Name: A–Z",
    nameDesc: "Name: Z–A",
    sizeDesc: "Size: largest first",
    catalogSort: "By catalog",
    list: "List",
    grid: "Cards",
    linkExpiry:
      "These links are valid for 24 hours; refresh the page to get new links.",
    copyFailed: "Copy failed — select the URL and copy it manually.",

    catalogs: "Catalogs",
    all: "All videos",
    uncategorized: "Uncategorized",
    createCatalog: "Create catalog",
    catalogName: "Catalog name",
    videoName: "Video name",
    catalog: "Catalog",
    save: "Save",
    cancel: "Cancel",
    edit: "Edit video",
    editCatalog: "Edit catalog",
    deleteCatalog: "Delete catalog",
    confirmDeleteCatalog:
      "Delete this catalog? Videos will become uncategorized.",
    startUpload: "Start upload",
    queue: "Videos to upload",

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
    link: "Ссылка на видео",
    copyLink: "Копировать ссылку",
    copied: "Скопировано",
    copyAll: "Копировать показанные ссылки",
    sort: "Сортировка",
    newest: "Сначала новые",
    oldest: "Сначала старые",
    nameAsc: "Название: А–Я",
    nameDesc: "Название: Я–А",
    sizeDesc: "Сначала большие",
    catalogSort: "По каталогу",
    list: "Список",
    grid: "Карточки",
    linkExpiry:
      "Ссылки действуют 24 часа; обновите страницу, чтобы получить новые.",
    copyFailed:
      "Не удалось скопировать — выделите ссылку и скопируйте вручную.",

    catalogs: "Каталоги",
    all: "Все видео",
    uncategorized: "Без каталога",
    createCatalog: "Создать каталог",
    catalogName: "Название каталога",
    videoName: "Название видео",
    catalog: "Каталог",
    save: "Сохранить",
    cancel: "Отмена",
    edit: "Изменить видео",
    editCatalog: "Изменить каталог",
    deleteCatalog: "Удалить каталог",
    confirmDeleteCatalog:
      "Удалить каталог? Видео останутся без каталога.",
    startUpload: "Начать загрузку",
    queue: "Видео для загрузки",

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

type Video = {
  id: string;
  name: string;
  size: number;
  url: string;
  catalogId: string;
  createdAt?: string;
};
type Catalog = { id: string; name: string };
type PendingVideo = { id: string; file: File; name: string; catalogId: string };
const formatSize = (bytes: number) =>
  bytes >= 1024 ** 3
    ? `${(bytes / 1024 ** 3).toFixed(2)} GB`
    : `${(bytes / 1024 ** 2).toFixed(1)} MB`;

export default function VideosPage() {
  const { language } = useLanguage();
  const tr = copy[language];
  const [videos, setVideos] = useState<Video[]>([]);
  const [catalogs, setCatalogs] = useState<Catalog[]>([]);
  const [catalogFilter, setCatalogFilter] = useState("all");
  const [newCatalog, setNewCatalog] = useState("");
  const [pending, setPending] = useState<PendingVideo[]>([]);
  const [editing, setEditing] = useState<Video | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<Catalog | null>(null);
  const [saving, setSaving] = useState(false);
  const [sort, setSort] = useState("newest");
  const [view, setView] = useState("list");
  const [copied, setCopied] = useState("");
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    },
    [],
  );
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
    setCatalogs(data.catalogs || []);
    setConnected(true);
  }
  useEffect(() => {
    loadVideos().catch((err) => setError(err.message));
  }, []);
  useEffect(() => {
    if (active) dialog.current?.showModal();
    else dialog.current?.close();
  }, [active]);

  function addFiles(files: FileList | File[]) {
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
    setPending((previous) => [
      ...previous,
      ...selected.map((file) => ({
        id: crypto.randomUUID(),
        file,
        name: file.name.replace(/\.[^.]+$/, "").slice(0, 200),
        catalogId: catalogFilter === "all" ? "" : catalogFilter,
      })),
    ]);
    setError("");
  }
  async function saveVideoDetails(
    key: string,
    name: string,
    catalogId: string,
  ) {
    const response = await fetch("/api/r2/videos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, name, catalogId }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Save failed");
  }
  async function createCatalog() {
    if (!newCatalog.trim() || saving) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/r2/catalogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newCatalog }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCatalogs((previous) =>
        [...previous, data.catalog].sort((a, b) =>
          a.name.localeCompare(b.name),
        ),
      );
      setNewCatalog("");
      setCatalogFilter(data.catalog.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }
  async function updateCatalog() {
    if (!editingCatalog || saving || !editingCatalog.name.trim()) return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/r2/catalogs", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingCatalog.id,
          name: editingCatalog.name,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      setCatalogs((previous) =>
        previous
          .map((catalog) =>
            catalog.id === data.catalog.id ? data.catalog : catalog,
          )
          .sort((a, b) => a.name.localeCompare(b.name)),
      );
      setEditingCatalog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }
  async function removeCatalog(catalog: Catalog) {
    if (
      !window.confirm(`${tr.confirmDeleteCatalog}\n\n${catalog.name}`) ||
      saving
    )
      return;
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/r2/catalogs", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: catalog.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Delete failed");
      setCatalogs((previous) =>
        previous.filter((item) => item.id !== catalog.id),
      );
      setVideos((previous) =>
        previous.map((video) =>
          video.catalogId === catalog.id
            ? { ...video, catalogId: "" }
            : video,
        ),
      );
      if (catalogFilter === catalog.id) setCatalogFilter("all");
      if (editingCatalog?.id === catalog.id) setEditingCatalog(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setSaving(false);
    }
  }
  async function updateVideo() {
    if (!editing || saving) return;
    setSaving(true);
    setError("");
    try {
      await saveVideoDetails(editing.id, editing.name, editing.catalogId);
      setVideos((previous) =>
        previous.map((item) =>
          item.id === editing.id
            ? { ...editing, name: editing.name.trim() }
            : item,
        ),
      );
      setEditing(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }
  async function uploadPending() {
    if (
      uploading ||
      !pending.length ||
      pending.some((item) => !item.name.trim())
    )
      return;
    const selected = [...pending];
    setUploading(true);
    setError("");
    try {
      for (const item of selected) {
        const { file } = item;
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
        setPending((previous) =>
          previous.filter((entry) => entry.id !== item.id),
        );
        try {
          await saveVideoDetails(data.key, item.name, item.catalogId);
        } catch (err) {
          await loadVideos();
          throw err;
        }
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

  const catalogName = (video: Video) =>
    catalogs.find((catalog) => catalog.id === video.catalogId)?.name ||
    tr.uncategorized;
  const visible = videos
    .filter(
      (video) =>
        (video.name + " " + catalogName(video))
          .toLocaleLowerCase()
          .includes(query.toLocaleLowerCase()) &&
        (catalogFilter === "all" || video.catalogId === catalogFilter),
    )
    .sort((a, b) => {
      if (sort === "nameAsc")
        return a.name.localeCompare(b.name, language, { numeric: true });
      if (sort === "nameDesc")
        return b.name.localeCompare(a.name, language, { numeric: true });
      if (sort === "sizeDesc") return b.size - a.size;
      if (sort === "catalogSort")
        return (
          catalogName(a).localeCompare(catalogName(b), language) ||
          a.name.localeCompare(b.name, language, { numeric: true })
        );
      return sort === "oldest"
        ? (a.createdAt || "").localeCompare(b.createdAt || "")
        : (b.createdAt || "").localeCompare(a.createdAt || "");
    });
  async function copyLinks(text: string, id: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(id);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(""), 2500);
    } catch {
      setError(tr.copyFailed);
    }
  }
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

      <section className={`${panel} space-y-4 p-5`}>
        <h2 className="flex items-center gap-2 font-semibold">
          <FolderIcon className="size-5 text-orange-500" />
          {tr.catalogs}
        </h2>
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all", name: tr.all, managed: false },
            { id: "", name: tr.uncategorized, managed: false },
            ...catalogs.map((catalog) => ({ ...catalog, managed: true })),
          ].map((catalog) => (
            <div
              key={catalog.id || "uncategorized"}
              className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-sm ${catalogFilter === catalog.id ? "border-orange-500 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-200" : "border-gray-200 dark:border-gray-600"}`}
            >
              <button
                type="button"
                onClick={() => setCatalogFilter(catalog.id)}
                aria-pressed={catalogFilter === catalog.id}
                className="px-1 py-1"
              >
                {catalog.name}{" "}
                <span className="ml-1 text-xs">
                  (
                  {
                    videos.filter(
                      (video) =>
                        catalog.id === "all" || video.catalogId === catalog.id,
                    ).length
                  }
                  )
                </span>
              </button>
              {catalog.managed && (
                <>
                  <button
                    type="button"
                    disabled={saving}
                    aria-label={`${tr.editCatalog}: ${catalog.name}`}
                    onClick={() =>
                      setEditingCatalog({ id: catalog.id, name: catalog.name })
                    }
                    className="rounded p-1 text-gray-400 hover:text-orange-600"
                  >
                    <PencilSquareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={saving}
                    aria-label={`${tr.deleteCatalog}: ${catalog.name}`}
                    onClick={() =>
                      removeCatalog({ id: catalog.id, name: catalog.name })
                    }
                    className="rounded p-1 text-gray-400 hover:text-red-600"
                  >
                    <TrashIcon className="size-4" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createCatalog();
          }}
          className="flex flex-wrap gap-2"
        >
          <input
            required
            maxLength={200}
            aria-label={tr.catalogName}
            placeholder={tr.catalogName}
            value={newCatalog}
            onChange={(event) => setNewCatalog(event.target.value)}
            className="rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-sm dark:border-gray-600"
          />
          <button
            disabled={saving || !newCatalog.trim()}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {tr.createCatalog}
          </button>
        </form>
      </section>
      {pending.length > 0 && (
        <section className={`${panel} space-y-4 p-5`}>
          <h2 className="font-semibold">{tr.queue}</h2>
          {pending.map((item) => (
            <div
              key={item.id}
              className="flex flex-wrap items-end gap-3 border-b border-gray-100 pb-4 dark:border-gray-700"
            >
              <label className="min-w-48 flex-1 text-sm">
                {tr.videoName}
                <input
                  required
                  maxLength={200}
                  disabled={uploading}
                  value={item.name}
                  onChange={(event) =>
                    setPending((previous) =>
                      previous.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, name: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 dark:border-gray-600"
                />
                <span className="text-xs text-gray-500">
                  {item.file.name} · {formatSize(item.file.size)}
                </span>
              </label>
              <label className="text-sm">
                {tr.catalog}
                <select
                  disabled={uploading}
                  value={item.catalogId}
                  onChange={(event) =>
                    setPending((previous) =>
                      previous.map((entry) =>
                        entry.id === item.id
                          ? { ...entry, catalogId: event.target.value }
                          : entry,
                      ),
                    )
                  }
                  className="mt-1 block rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-dark"
                >
                  <option value="">{tr.uncategorized}</option>
                  {catalogs.map((catalog) => (
                    <option key={catalog.id} value={catalog.id}>
                      {catalog.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                disabled={uploading}
                onClick={() =>
                  setPending((previous) =>
                    previous.filter((entry) => entry.id !== item.id),
                  )
                }
                aria-label={`${tr.cancel}: ${item.file.name}`}
                className="rounded-lg p-2 text-red-600"
              >
                <TrashIcon className="size-5" />
              </button>
            </div>
          ))}
          <button
            disabled={uploading || pending.some((item) => !item.name.trim())}
            onClick={uploadPending}
            className="rounded-lg bg-orange-500 px-5 py-3 font-semibold text-white disabled:opacity-50"
          >
            {tr.startUpload}
          </button>
        </section>
      )}
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
        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 p-5 dark:border-gray-700">
          <label className="text-sm">
            {tr.catalog}
            <select
              value={catalogFilter}
              onChange={(event) => setCatalogFilter(event.target.value)}
              className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-dark"
            >
              <option value="all">{tr.all}</option>
              <option value="">{tr.uncategorized}</option>
              {catalogs.map((catalog) => (
                <option key={catalog.id} value={catalog.id}>
                  {catalog.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            {tr.sort}
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              className="ml-2 rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-dark"
            >
              {[
                "newest",
                "oldest",
                "nameAsc",
                "nameDesc",
                "sizeDesc",
                "catalogSort",
              ].map((value) => (
                <option key={value} value={value}>
                  {tr[value]}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-1">
            {["list", "grid"].map((value) => (
              <button
                key={value}
                aria-pressed={view === value}
                onClick={() => setView(value)}
                className={`rounded-lg border px-3 py-2 text-sm ${view === value ? "border-orange-500 text-orange-600" : "border-gray-200 dark:border-gray-600"}`}
              >
                {tr[value]}
              </button>
            ))}
          </div>
          <button
            disabled={!visible.length}
            onClick={() =>
              copyLinks(
                visible
                  .map(
                    (video) =>
                      `${video.name}\t${catalogName(video)}\t${video.url}`,
                  )
                  .join("\n"),
                "all",
              )
            }
            className="rounded-lg border border-orange-300 px-3 py-2 text-sm text-orange-600 disabled:opacity-50"
          >
            {copied === "all" ? tr.copied : tr.copyAll}
          </button>
          <p className="w-full text-xs text-gray-500">{tr.linkExpiry}</p>
          <p role="status" className="sr-only">
            {copied ? tr.copied : ""}
          </p>
        </div>
        {visible.length ? (
          <div
            className={
              view === "grid"
                ? "grid gap-5 p-5 sm:grid-cols-2 xl:grid-cols-3"
                : "space-y-3 p-5"
            }
          >
            {visible.map((video) => (
              <article
                key={video.id}
                className={`overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 ${view === "list" ? "flex flex-col sm:flex-row" : ""}`}
              >
                <button
                  onClick={() => setActive(video)}
                  aria-label={`${tr.preview}: ${video.name}`}
                  className={`group relative block aspect-video shrink-0 overflow-hidden bg-slate-950 ${view === "list" ? "w-full sm:w-40" : "w-full"}`}
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
                <div className="min-w-0 flex-1 p-4">
                  <h3
                    className="truncate text-sm font-semibold"
                    title={video.name}
                  >
                    {video.name}
                  </h3>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {catalogs.find((catalog) => catalog.id === video.catalogId)
                      ?.name || tr.uncategorized}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <input
                      aria-label={`${tr.link}: ${video.name}`}
                      readOnly
                      value={video.url}
                      onFocus={(event) => event.target.select()}
                      className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-transparent px-3 py-2 text-xs text-gray-500 dark:border-gray-600"
                    />
                    <button
                      onClick={() => copyLinks(video.url, video.id)}
                      className="rounded-lg bg-orange-500 px-3 py-2 text-xs font-semibold text-white"
                    >
                      {copied === video.id ? tr.copied : tr.copyLink}
                    </button>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-gray-200 px-3 py-2 text-xs dark:border-gray-600"
                    >
                      {tr.preview}
                    </a>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="text-xs text-gray-500">
                      {formatSize(video.size)}
                    </span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-800 dark:bg-amber-950 dark:text-amber-200">
                      {tr.connection}
                    </span>
                    <button
                      aria-label={`${tr.edit}: ${video.name}`}
                      onClick={() => setEditing({ ...video })}
                      className="rounded-lg p-2 text-gray-400 hover:text-orange-600"
                    >
                      <PencilSquareIcon className="size-4" />
                    </button>
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
            <h3 className="font-semibold">
              {query || catalogFilter !== "all" ? tr.noResults : tr.empty}
            </h3>
            {!query && catalogFilter === "all" && (
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
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !saving) setEditing(null);
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-label={tr.edit}
            onSubmit={(event) => {
              event.preventDefault();
              updateVideo();
            }}
            className={`${panel} w-full max-w-md space-y-4 p-6`}
          >
            <h2 className="font-semibold">{tr.edit}</h2>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <label className="block text-sm">
              {tr.videoName}
              <input
                autoFocus
                required
                maxLength={200}
                value={editing.name}
                onChange={(event) =>
                  setEditing({ ...editing, name: event.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 dark:border-gray-600"
              />
            </label>
            <label className="block text-sm">
              {tr.catalog}
              <select
                value={editing.catalogId}
                onChange={(event) =>
                  setEditing({ ...editing, catalogId: event.target.value })
                }
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-dark"
              >
                <option value="">{tr.uncategorized}</option>
                {catalogs.map((catalog) => (
                  <option key={catalog.id} value={catalog.id}>
                    {catalog.name}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditing(null)}
                className="rounded-lg border px-4 py-2"
              >
                {tr.cancel}
              </button>
              <button
                disabled={saving || !editing.name.trim()}
                className="rounded-lg bg-orange-500 px-4 py-2 text-white disabled:opacity-50"
              >
                {tr.save}
              </button>
            </div>
          </form>
        </div>
      )}
      {editingCatalog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onKeyDown={(event) => {
            if (event.key === "Escape" && !saving) setEditingCatalog(null);
          }}
        >
          <form
            role="dialog"
            aria-modal="true"
            aria-label={tr.editCatalog}
            onSubmit={(event) => {
              event.preventDefault();
              updateCatalog();
            }}
            className={`${panel} w-full max-w-md space-y-4 p-6`}
          >
            <h2 className="font-semibold">{tr.editCatalog}</h2>
            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}
            <label className="block text-sm">
              {tr.catalogName}
              <input
                autoFocus
                required
                maxLength={200}
                value={editingCatalog.name}
                onChange={(event) =>
                  setEditingCatalog({
                    ...editingCatalog,
                    name: event.target.value,
                  })
                }
                className="mt-1 block w-full rounded-lg border border-gray-200 bg-transparent px-3 py-2 dark:border-gray-600"
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                disabled={saving}
                onClick={() => setEditingCatalog(null)}
                className="rounded-lg border px-4 py-2"
              >
                {tr.cancel}
              </button>
              <button
                disabled={saving || !editingCatalog.name.trim()}
                className="rounded-lg bg-orange-500 px-4 py-2 text-white disabled:opacity-50"
              >
                {tr.save}
              </button>
            </div>
          </form>
        </div>
      )}
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
