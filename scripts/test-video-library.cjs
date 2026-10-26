const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const ts = require("typescript");
const { NextRequest } = require("next/server");
const objects = new Map();
const root = path.resolve(__dirname, "..");
const client = {
  async send(command) {
    const { Key, Body, Prefix } = command.input;
    switch (command.constructor.name) {
      case "PutObjectCommand":
        objects.set(Key, String(Body));
        return {};
      case "GetObjectCommand":
        if (!objects.has(Key))
          throw Object.assign(new Error("Missing"), { name: "NoSuchKey" });
        return { Body: { transformToString: async () => objects.get(Key) } };
      case "HeadObjectCommand":
        if (!objects.has(Key))
          throw Object.assign(new Error("Missing"), {
            $metadata: { httpStatusCode: 404 },
          });
        return {};
      case "ListObjectsV2Command":
        return {
          Contents: [...objects.keys()]
            .filter((key) => key.startsWith(Prefix))
            .map((Key) => ({
              Key,
              Size: objects.get(Key).length,
              LastModified: new Date(),
            })),
        };
      case "DeleteObjectCommand":
        objects.delete(Key);
        return {};
      default:
        throw new Error("Unexpected command");
    }
  },
};
const cache = new Map();
function load(relative) {
  const filename = path.join(root, relative);
  if (cache.has(filename)) return cache.get(filename).exports;
  const module = { exports: {} };
  cache.set(filename, module);
  const output = ts.transpileModule(fs.readFileSync(filename, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2021,
    },
  }).outputText;
  const customRequire = (name) => {
    if (name === "server-only") return {};
    if (name === "./r2" || name === "@/lib/r2")
      return {
        r2Config: () => ({ client, bucket: "test" }),
        videoPrefix: "admin-videos/",
      };
    if (name === "@/lib/video-library") return load("src/lib/video-library.ts");
    if (name === "@aws-sdk/s3-request-presigner")
      return {
        getSignedUrl: async (_client, command) =>
          "https://example.test/" + command.input.Key,
      };
    return require(name);
  };
  vm.runInThisContext(`(function(require,module,exports){${output}\n})`, {
    filename,
  })(customRequire, module, module.exports);
  return module.exports;
}
function request(method, body) {
  return new NextRequest("http://localhost/api/r2/videos", {
    method,
    ...(body
      ? {
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
        }
      : {}),
  });
}
(async () => {
  const catalogs = load("src/app/api/r2/catalogs/route.ts");
  const videos = load("src/app/api/r2/videos/route.ts");
  assert.equal(
    (await catalogs.POST(request("POST", { name: " " }))).status,
    400,
  );
  const { catalog } = await (
    await catalogs.POST(request("POST", { name: "  მუხლის ვარჯიშები  " }))
  ).json();
  assert.equal(catalog.name, "მუხლის ვარჯიშები");
  const key = "admin-videos/627d1fd8-ffab-4fa3-a1c7-e82e93d02b6a-original.mp4";
  objects.set(key, "video");
  const listing = async () => (await videos.GET(request("GET"))).json();
  let list = await listing();
  assert.equal(list.videos[0].url, 'http://localhost/api/r2/play/' + key);
  const playback = load('src/app/api/r2/play/[...key]/route.ts');
  const response = await playback.GET(request('GET'), { params: Promise.resolve({ key: key.split('/') }) });
  assert.equal(response.status, 307);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.equal(response.headers.get('location'), 'https://example.test/' + key);
  assert.equal((await playback.GET(request('GET'), { params: Promise.resolve({ key: ['video-library', 'private.json'] }) })).status, 400);
  assert.equal((await playback.GET(request('GET'), { params: Promise.resolve({ key: ['admin-videos', 'missing.mp4'] }) })).status, 404);
  assert.equal(list.videos[0].name, "original.mp4");
  assert.equal(list.videos[0].catalogId, "");
  assert.equal(list.catalogs[0].id, catalog.id);
  assert.equal(
    (
      await videos.PATCH(
        request("PATCH", { key, name: "ვარჯიში №1", catalogId: catalog.id }),
      )
    ).status,
    200,
  );
  list = await listing();
  assert.equal(list.videos[0].name, "ვარჯიში №1");
  assert.equal(list.videos[0].catalogId, catalog.id);
  assert.equal(objects.get(key), "video");
  assert.equal(
    (await videos.PATCH(request("PATCH", { key, name: " ", catalogId: "" })))
      .status,
    400,
  );
  assert.equal(
    (
      await videos.PATCH(
        request("PATCH", { key, name: "Valid", catalogId: "unknown" }),
      )
    ).status,
    400,
  );
  assert.equal(
    (
      await videos.PATCH(
        request("PATCH", { key: "admin-videos/missing.mp4", name: "Valid" }),
      )
    ).status,
    404,
  );
  assert.equal(
    (
      await videos.PATCH(
        request("PATCH", { key, name: "ახალი სახელი", catalogId: "" }),
      )
    ).status,
    200,
  );
  list = await listing();
  assert.equal(list.videos[0].catalogId, "");
  assert.equal(list.videos[0].name, "ახალი სახელი");
  assert.equal((await videos.DELETE(request("DELETE", { key }))).status, 200);
  assert.equal(objects.size, 1);
  console.log(
    "Passed: catalogs, legacy videos, Georgian names, rename, move, persistence, validation and deletion cleanup.",
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
