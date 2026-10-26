Video playback links
====================

The video library returns permanent `/api/r2/play/admin-videos/...` URLs.
Opening one creates a fresh storage redirect. Redirects use `Cache-Control:
no-store`; video bytes and range requests go directly to R2.

Deploy the admin app before deploying the backend. The backend converts legacy
R2 URLs (even expired ones) when serializing existing exercises and normalizes
new writes. No database migration or video upload is required.

The backend defaults to the existing production admin origin,
`https://ghrs-admin.vercel.app`. Set `VIDEO_PLAYBACK_ORIGIN` on the backend for
a different admin deployment. The admin deployment needs its existing R2
environment variables and the playback route must remain publicly reachable.

Checks:

- Admin: `node scripts/test-video-library.cjs`
- Backend: `node test/video-urls.check.cjs`
