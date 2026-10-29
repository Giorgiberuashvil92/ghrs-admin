import "server-only";
import { createHash, randomUUID } from "node:crypto";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { r2Config, videoPrefix } from "./r2";

export type Catalog = { id: string; name: string };
export type VideoDetails = { name: string; catalogId: string };
const catalogPrefix = "video-library/catalogs/";
export function detailsKey(key: string) {
  return `video-library/videos/${createHash("sha256").update(key).digest("hex")}.json`;
}
export function validVideoKey(key: unknown): key is string {
  return (
    typeof key === "string" &&
    key.startsWith(videoPrefix) &&
    !key.includes("..") &&
    /\.(mp4|mov|webm)$/i.test(key)
  );
}
export function validName(name: unknown): name is string {
  return (
    typeof name === "string" &&
    name.trim().length > 0 &&
    name.trim().length <= 200
  );
}
async function readJson<T>(key: string): Promise<T | null> {
  const { client, bucket } = r2Config();
  try {
    const result = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: key }),
    );
    return JSON.parse(await result.Body.transformToString());
  } catch (error) {
    if (error?.name === "NoSuchKey" || error?.$metadata?.httpStatusCode === 404)
      return null;
    throw error;
  }
}
async function writeJson(key: string, value: unknown) {
  const { client, bucket } = r2Config();
  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(value),
      ContentType: "application/json",
    }),
  );
}
export async function readDetails(key: string) {
  return readJson<VideoDetails>(detailsKey(key));
}
export async function saveDetails(key: string, details: VideoDetails) {
  await writeJson(detailsKey(key), details);
}
export async function catalogExists(id: unknown): Promise<boolean> {
  if (id === "") return true;
  return (
    typeof id === "string" &&
    /^[a-f0-9-]{36}$/.test(id) &&
    !!(await readJson(`${catalogPrefix}${id}.json`))
  );
}
export function validCatalogId(id: unknown): id is string {
  return typeof id === "string" && /^[a-f0-9-]{36}$/.test(id);
}

export async function createCatalog(name: string) {
  const catalog = { id: randomUUID(), name: name.trim() };
  await writeJson(`${catalogPrefix}${catalog.id}.json`, catalog);
  return catalog;
}

export async function updateCatalog(id: string, name: string) {
  if (!validCatalogId(id) || !validName(name)) return null;
  const key = `${catalogPrefix}${id}.json`;
  const existing = await readJson<Catalog>(key);
  if (!existing) return null;
  const catalog = { id, name: name.trim() };
  await writeJson(key, catalog);
  return catalog;
}

async function uncategorizeVideos(catalogId: string) {
  const { client, bucket } = r2Config();
  let token: string | undefined;
  do {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: videoPrefix,
        ContinuationToken: token,
      }),
    );
    for (const item of result.Contents || []) {
      if (!item.Key || !validVideoKey(item.Key)) continue;
      const details = await readDetails(item.Key);
      if (details?.catalogId !== catalogId) continue;
      await saveDetails(item.Key, {
        name: details.name,
        catalogId: "",
      });
    }
    token = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (token);
}

export async function deleteCatalog(id: string) {
  if (!validCatalogId(id)) return false;
  const key = `${catalogPrefix}${id}.json`;
  const existing = await readJson<Catalog>(key);
  if (!existing) return false;
  const { client, bucket } = r2Config();
  await uncategorizeVideos(id);
  await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
  return true;
}

export async function listCatalogs(): Promise<Catalog[]> {
  const { client, bucket } = r2Config();
  const catalogs: Catalog[] = [];
  let token: string | undefined;
  do {
    const result = await client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: catalogPrefix,
        ContinuationToken: token,
      }),
    );
    const page = await Promise.all(
      (result.Contents || []).map((item) => readJson<Catalog>(item.Key)),
    );
    catalogs.push(...page.filter(Boolean));
    token = result.IsTruncated ? result.NextContinuationToken : undefined;
  } while (token);
  return catalogs.sort((a, b) => a.name.localeCompare(b.name));
}
