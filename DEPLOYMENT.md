# EventX Ultra Deployment

## 1. MongoDB Atlas

1. Create an Atlas cluster.
2. Add a database user.
3. Allow Render outbound access, or allow `0.0.0.0/0` for development.
4. Copy the connection string into `MONGO_URI`.

Example:

```env
MONGO_URI=mongodb+srv://USER:PASSWORD@cluster.mongodb.net/eventx_ultra
```

## 2. Cloudinary

1. Create a Cloudinary account.
2. Copy cloud name, API key, and API secret.
3. Add these to the backend environment:

```env
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=eventx-ultra/events
```

## 3. Render Backend

Create a Render Web Service from this repository.

Root directory:

```txt
.
```

Build command:

```bash
npm install
```

Start command:

```bash
npm run start --workspace server
```

Required environment variables:

```env
NODE_ENV=production
PORT=5000
API_VERSION=v1
CLIENT_URL=https://your-frontend-domain.com
CLIENT_URLS=https://your-frontend-domain.com,http://localhost:5173
MONGO_URI=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
JWT_REFRESH_COOKIE_NAME=eventx_refresh_token
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=120
LOG_LEVEL=info
MAIL_HOST=
MAIL_PORT=587
MAIL_USER=
MAIL_PASS=
MAIL_FROM="EventX Ultra <noreply@your-domain.com>"
MAIL_SECURE=false
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
CLOUDINARY_FOLDER=eventx-ultra/events
PAYMENT_PROVIDER=dummy
PAYMENT_SECRET=
```

## 4. Frontend

Deploy `client` to Render Static Site, Netlify, or Vercel.

Build command:

```bash
npm install
npm run build --workspace client
```

Publish directory:

```txt
client/dist
```

Frontend environment:

```env
VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1
VITE_SOCKET_URL=https://your-backend.onrender.com
VITE_APP_NAME=EventX Ultra
```

## 5. Final Checks

Run before deployment:

```bash
npm run lint
npm run build
npm audit --json
```

## 6. Production Notes

- Set `CLIENT_URLS` to every allowed frontend origin.
- Use strong JWT and payment secrets.
- Configure SMTP for real email delivery.
- Keep Cloudinary keys only on the backend.
- The current payment provider is a secure dummy flow. Replace it with Razorpay order creation and signature verification when live payments are required.
