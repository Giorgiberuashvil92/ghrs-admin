Video library: /admin/videos

Set R2_ENDPOINT, R2_BUCKET, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY in the admin Next.js server environment. Local values are
in ignored .env.local. Restart the admin server after changing them. In production,
copy these variables into the admin hosting environment and redeploy over HTTPS.

Videos stream through the admin Next.js server to R2 (up to 5 GB per file).
Browser uploads do not require bucket CORS. Hosting request size and timeout
limits must support the intended video sizes; restrictive serverless hosting may
require direct uploads with bucket CORS instead.
The library lists the admin-videos/ prefix, with private signed playback URLs valid
for 24 hours; reload the page to renew them. Delete permanently removes the object.
Storage credentials are never sent to the browser. An upload may finish in R2 even
if refreshing the library fails; reload before retrying.

Run node scripts/check-r2.cjs to check bucket access and CORS.
Run node scripts/check-r2.cjs --configure-cors to append a rule permitting signed
GET/HEAD/PUT from browser origins. CORS does not grant unauthenticated access.
The existing CORS rules are preserved. R2 credentials need object read/write and,
for automatic CORS configuration, permission to read/write bucket CORS.

On Vercel, uploads default to direct signed R2 URLs to avoid the function body
size limit. Configure R2 bucket CORS for the admin origin before uploading.
R2_UPLOAD_MODE=direct or proxy explicitly selects the transport. Local servers
default to proxy and do not need CORS for uploads.

Video display names and catalog assignments are stored as independent JSON
objects under video-library/videos/. Catalogs live under video-library/catalogs/.
Renaming or moving a video does not change its object key or require reuploading.
Existing videos without metadata keep their original names under Uncategorized.
Run node scripts/test-video-library.cjs for offline route and persistence checks.
