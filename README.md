# kiwi-next-app

UI for KIWI Personal Assistant (Next.js App Router).

**Sibling backend:** [kiwi-backend-api](https://github.com/SarabeevPavel/kiwi-backend-api) (ASP.NET).
This repo = frontend only. API lives in the other repo; they are one product, two packages.

## Local stack

| Piece | Repo | URL |
|-------|------|-----|
| UI | this (`kiwi-next-app`) | http://localhost:3000 |
| API | [kiwi-backend-api](https://github.com/SarabeevPavel/kiwi-backend-api) | http://localhost:5289 |

Env (`.env.local`):

```bash
BACKEND_API_URL=http://localhost:5289/api
```

Server actions / BFF call `${BACKEND_API_URL}/...` (already includes `/api`).

## Run

```bash
# terminal 1 - API
cd kiwi-backend-api/App
dotnet ef database update --project App.csproj
dotnet run --launch-profile http
# -> http://localhost:5289

# terminal 2 - UI
cd kiwi-next-app
bun install
bun dev
# -> http://localhost:3000
```

Without the API running, auth/notes/files will fail.

## Depends on backend

- Pagination/search/sort + `{ items, total, page, pageSize }` for notes & folder children - UI still does client-side until API ships
- Stable `createdAt` on folder/file DTOs - already used
- Upload size: Next Server Action limit raised, ASP.NET multipart limits must match if large uploads fail
- `rootFolderId` from `/auth/me` - missing root shows empty/missing-root UI state

API catalog: see backend `SWAGGER.md` / `README.md` WIP.
