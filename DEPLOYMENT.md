# Deployment: Vercel + Render

This repository is deployed as two services:

- **Frontend:** Vercel static site from `frontend/`
- **Backend:** Render Node web service from `backend/`
- **Database:** MongoDB Atlas (or another reachable hosted MongoDB instance)

## 1. Prepare MongoDB Atlas

1. Create an Atlas cluster and database user.
2. In **Network Access**, permit Render to connect. For a simple demo deployment, add `0.0.0.0/0`; use a strong database password and restrict this later where possible.
3. Copy the connection string and replace its password, for example:

   ```text
   mongodb+srv://USERNAME:PASSWORD@cluster0.example.mongodb.net/revbookmyshow?retryWrites=true&w=majority
   ```

## 2. Deploy the API to Render

1. Push this repository to GitHub.
2. In Render, select **New > Blueprint** and select the repository. Render reads `render.yaml` and creates the web service.
3. Enter these secret environment variables when Render asks:

   - `MONGO_URI`: the Atlas connection string
   - `CORS_ORIGIN`: the Vercel URL from step 3, e.g. `https://your-app.vercel.app`

   `JWT_SECRET` is generated automatically by the Blueprint. You may instead set a long random value yourself.
4. Deploy, then open `https://YOUR-RENDER-SERVICE.onrender.com/health`. It should return `{"status":"ok"}`.

## 3. Deploy the frontend to Vercel

1. In Vercel, select **Add New > Project**, import the same GitHub repository, and set **Root Directory** to `frontend`.
2. Keep the detected Vite settings:

   - Build Command: `npm run build`
   - Output Directory: `dist`

3. Add this environment variable:

   ```text
   VITE_API_URL=https://YOUR-RENDER-SERVICE.onrender.com/api
   ```

4. Deploy. The `frontend/vercel.json` rewrite keeps React routes such as `/movies` and `/login` working on direct visits and refreshes.

## 4. Finish the connection

1. Copy the final Vercel production URL.
2. In Render, update `CORS_ORIGIN` to that URL (no trailing slash), then redeploy the Render service.
3. In Vercel, redeploy once if the Render URL or `VITE_API_URL` was changed.

For Vercel preview deployments, set `CORS_ORIGIN` to a comma-separated list of allowed preview URLs, or use a stable Vercel custom domain for testing.

## Optional: load demo data

After the Render service has database access, run this from a machine that has the same `MONGO_URI`:

```bash
cd backend
npm install
node seedDemoData.js
```

Never commit `.env` files or database credentials.
