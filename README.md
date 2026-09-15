# Digital Vault

A secure React + Firebase document management application with Cloudinary-backed file storage.

## Stack
- React + Vite
- Firebase Authentication + Firestore
- Node.js + Express API
- Cloudinary for document storage

## Project structure

```text
Digital-Vault/
├── client/
├── server/
├── firestore.rules
├── .env.example
└── README.md
```

## Local setup

### 1. Configure the server

From the project root, copy `.env.example` to `.env` and fill in your **new** Cloudinary credentials. The server is configured to load this root `.env` even when started from the `server` directory.

```bash
cd server
npm install
npm run dev
```

### 2. Configure the client

The Firebase web configuration can be provided through `client/.env.local` using the variables in `client/.env.example`. The project also contains safe public Firebase defaults for the configured Firebase web app; server-only secrets must never be placed in the client.

```bash
cd client
npm install
npm run dev
```

Open `http://localhost:5173`.

## Firebase setup

In Firebase Console:

1. Enable **Email/Password** sign-in.
2. Enable **Google** sign-in if you want Google login.
3. Add your local and production domains under Authentication > Settings > Authorized domains.
4. Deploy `firestore.rules` under Firestore Database > Rules.

Email/password accounts send a verification email during registration. Login is not blocked while an account is unverified, but the UI warns the user and provides a resend-verification action.

## Cloudinary

The Express upload/delete endpoints require a valid Firebase ID token. Files are stored under `Digital-Vault/<uid>/`, and deletion is restricted to that user's folder.

## Security

Never commit `.env`, Cloudinary API secrets, database passwords, JWT secrets, or service-account credentials. If a secret was previously exposed, rotate it before deployment.

## Production

Set `VITE_API_URL` to the deployed API origin and configure `CLIENT_ORIGIN` on the API server for the deployed frontend origin. Do not use `localhost` in production.


### Application version
The frontend version is maintained in `client/package.json`. Vite injects that value into the footer automatically at build time, so every deployed device displays the same release version. Current release: `v1.0.46`.

## v1.0.23 — Universal PWA reliability
- All uploaded files are stored in Cloudinary; Firebase is used for Authentication and Firestore metadata.
- Production API calls default to the same origin, preventing `ERR_CONNECTION_REFUSED` caused by a stale `localhost:5000` URL.
- CSV and PDF exports include validated empty-state handling and polished document summaries.
- Keep Cloudinary API secrets server-side; never put `CLOUDINARY_API_SECRET` in `client/.env`.


## Administration
- Primary administrator: `nitesh933438@gmail.com` via Google Login only.
- Existing administrators can promote normal users to Admin or remove delegated admin access.
- The primary administrator is protected from disable, delete, and demotion.
- Admin permissions are enforced by Firestore Security Rules.

### Support inbox and updates
- **Contact Us** submissions are saved in the private Firestore `contactMessages` collection and appear in Admin Center → Contact Messages. Admins can mark them New/Read/Replied/Closed, delete them, or reply through their email client.
- **Stay Updated** subscriptions are saved in the private `newsletterSubscribers` collection and managed from Admin Center → Subscribers. Duplicate email submissions are prevented with a deterministic SHA-256 record id.
- Actual bulk newsletter email delivery still requires an email provider such as SMTP/Resend/SendGrid configured server-side; the current system safely stores and manages the subscriber list without exposing provider credentials.

### Upload support
- Cloudinary is the only file-storage provider.
- Maximum upload size is **25 MB per file** by default and can be changed with `MAX_UPLOAD_SIZE_BYTES` / `VITE_MAX_UPLOAD_SIZE_BYTES`.
- Supported formats include PDF, DOC/DOCX, XLS/XLSX, PPT/PPTX, TXT, CSV, ZIP, JPG/JPEG/PNG/WEBP and MP4/WEBM/MOV.
- If Firestore metadata creation fails after a Cloudinary upload, the app automatically attempts to remove the just-uploaded Cloudinary asset so failed uploads do not normally leave orphaned files.

## Free deployment architecture

Digital Vault can run without Firebase Cloud Functions or a Firebase Blaze billing plan. The production frontend is deployed to GitHub Pages, Firebase Authentication/Firestore remain client-side, and file uploads use a restricted Cloudinary unsigned upload preset. The Cloudinary API secret is never shipped to the browser.

For GitHub Actions, add these repository secrets:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_CLOUDINARY_UPLOAD_PRESET`

Create the Cloudinary upload preset as **Unsigned** and restrict its allowed formats, maximum file size, and upload folder as appropriate. Because this free architecture has no secure server-side Cloudinary destroy operation, deleting a vault record removes its Firestore metadata; it does not securely delete the Cloudinary asset.
