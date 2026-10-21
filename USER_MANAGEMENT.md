# User management

Open `/admin/users` from the Users sidebar entry. No extra credentials or API keys are required in the current configuration. The interface follows the admin panel's Georgian, Russian or English language setting.

The list supports search and pagination. Open a profile for:

- Profile: edit name, email, phone, location, image URL, conditions and additional information.
- Full access: enable or revoke access to every course and exercise set. Save changes to apply. This is stored on the user, not as fake purchase records. Revocation retains individually purchased content.
- Purchases: view the full purchase history, amount, currency, dates and current purchase access status.
- Activity: view exercise statistics, completed content IDs, activity days and achievements.
- Password: set a new password, cancelling outstanding reset links.
- Delete: confirm with the user's email. The account is archived, hidden from the list and denied login and authenticated API access. Purchase history is retained. The archived email remains reserved.

Changes are validated on the backend. Passwords and password reset secrets never appear in user responses. Sessions persist until logout. Existing JWTs are checked against the account and its active sessions; password changes and account deletion revoke access.

The admin server uses the existing `NEXT_PUBLIC_API_URL`, localhost:4000 in development or the existing Render backend in production. `ADMIN_BACKEND_URL` is an optional override.

The current admin panel does not yet have administrator authentication.

Run business checks without a database connection: `npm run test:admin-users` from `backend`.
