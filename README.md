# TicketNest UI

Lovable-generated React/TanStack frontend for the TicketNest Spring Boot API.

## Local development

Start the backend from the repository root:

```shell
docker compose up --build
```

Then start the UI:

```shell
cd frontend
npm install
npm run dev
```

The UI uses `http://localhost:8080` by default. Copy `.env.example` to
`.env.local` and change `VITE_API_BASE_URL` when the API runs elsewhere. You can
also change the API URL at runtime using the settings button in the site header.

## Checks

```shell
npm run lint
npm run build
npx tsc --noEmit
```

The UI supports the current `/api/v1` authentication, venue, show, inventory,
booking, and admin endpoints. Payment, saved payment methods, profile updates,
and scannable tickets are clearly marked as pending where the backend has no API.
