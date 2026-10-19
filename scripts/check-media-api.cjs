(async () => {
  const base = process.env.MEDIA_TEST_URL || "http://localhost:3000";
  const headers = {};
  for (const [path, options, expected] of [
    ["/api/r2/videos", {}, 200],
    ["/api/r2/videos", { headers }, 200],
    [
      "/api/r2/videos",
      {
        method: "POST",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({
          name: "bad.txt",
          size: 1,
          contentType: "text/plain",
        }),
      },
      400,
    ],
    [
      "/api/r2/videos",
      {
        method: "DELETE",
        headers: { ...headers, "content-type": "application/json" },
        body: JSON.stringify({ key: "unrelated/object" }),
      },
      400,
    ],
    ["/admin/videos", { headers }, 200],
  ]) {
    const r = await fetch(base + path, options);
    await r.text();
    console.log(path, r.status, "expected", expected);
    if (r.status !== expected) process.exitCode = 1;
  }
  const response = await fetch(base + "/api/r2/videos", {
    method: "POST",
    headers: { ...headers, "content-type": "application/json" },
    body: JSON.stringify({
      name: "connection-test.mp4",
      size: 4,
      contentType: "video/mp4",
    }),
  });
  if (!response.ok) throw new Error("Could not sign upload");
  const signed = await response.json();
  try {
    const upload = await fetch(new URL(signed.uploadUrl, base), {
      method: "PUT",
      headers: { "content-type": "video/mp4" },
      body: Buffer.from([0, 0, 0, 0]),
    });
    if (!upload.ok) throw new Error("Signed upload failed: " + upload.status);
    const list = await (
      await fetch(base + "/api/r2/videos", { headers })
    ).json();
    const video = list.videos.find((v) => v.id === signed.key);
    if (!video) throw new Error("Uploaded video missing from library");
    const playback = await fetch(video.url);
    if (!playback.ok || (await playback.arrayBuffer()).byteLength !== 4)
      throw new Error("Signed playback failed");
    console.log("Upload through admin server, persistent listing and playback passed.");
  } finally {
    const removed = await fetch(base + "/api/r2/videos", {
      method: "DELETE",
      headers: { ...headers, "content-type": "application/json" },
      body: JSON.stringify({ key: signed.key }),
    });
    if (!removed.ok) throw new Error("Test cleanup failed");
    console.log("Test video removed.");
  }
})().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
