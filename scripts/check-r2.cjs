const fs = require("node:fs");
const {
  S3Client,
  ListObjectsV2Command,
  GetBucketCorsCommand,
  PutBucketCorsCommand,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const env = Object.fromEntries(
  fs
    .readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const client = new S3Client({
  region: "auto",
  endpoint: env.R2_ENDPOINT,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});
(async () => {
  const listing = await client.send(
    new ListObjectsV2Command({ Bucket: env.R2_BUCKET, MaxKeys: 1 }),
  );
  console.log("Bucket reachable:", env.R2_BUCKET, "objects:", listing.KeyCount);
  if (process.argv.includes("--test-upload")) {
    const key = `admin-videos/connection-test-${require("node:crypto").randomUUID()}.txt`;
    try {
      await client.send(
        new PutObjectCommand({
          Bucket: env.R2_BUCKET,
          Key: key,
          Body: "GHRS storage connection test",
          ContentType: "text/plain",
        }),
      );
      const result = await client.send(
        new GetObjectCommand({ Bucket: env.R2_BUCKET, Key: key }),
      );
      if (
        (await result.Body.transformToString()) !==
        "GHRS storage connection test"
      )
        throw new Error("Read verification failed");
      console.log("Upload and read verified.");
    } finally {
      await client.send(
        new DeleteObjectCommand({ Bucket: env.R2_BUCKET, Key: key }),
      );
      console.log("Test object removed.");
    }
    return;
  }
  if (process.argv.includes('--set-cors')) {
    await client.send(new PutBucketCorsCommand({Bucket:env.R2_BUCKET,CORSConfiguration:{CORSRules:[{AllowedOrigins:['*'],AllowedMethods:['GET','HEAD','PUT'],AllowedHeaders:['*'],ExposeHeaders:['ETag'],MaxAgeSeconds:3600}]}}));
    console.log('CORS saved.');
    return;
  }
  let rules = [];
  try {
    rules =
      (await client.send(new GetBucketCorsCommand({ Bucket: env.R2_BUCKET })))
        .CORSRules || [];
  } catch (e) {
    if (!["NoSuchCORSConfiguration", "NoSuchCORS"].includes(e.name)) throw e;
  }
  if (process.argv.includes("--configure-cors")) {
    if (
      !rules.some(
        (r) =>
          r.AllowedOrigins?.includes("*") &&
          r.AllowedMethods?.includes("PUT") &&
          r.AllowedHeaders?.includes("*"),
      )
    ) {
      await client.send(
        new PutBucketCorsCommand({
          Bucket: env.R2_BUCKET,
          CORSConfiguration: {
            CORSRules: [
              ...rules,
              {
                AllowedOrigins: ["*"],
                AllowedMethods: ["GET", "HEAD", "PUT"],
                AllowedHeaders: ["*"],
                ExposeHeaders: ["ETag"],
                MaxAgeSeconds: 3600,
              },
            ],
          },
        }),
      );
    }
    console.log(
      "Browser upload CORS configured. Requests still require signed URLs.",
    );
  } else console.log("CORS rules:", JSON.stringify(rules));
})().catch((e) => {
  console.error(e.name, e.message);
  process.exitCode = 1;
});
