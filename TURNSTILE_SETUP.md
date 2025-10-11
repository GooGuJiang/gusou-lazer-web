# Cloudflare Turnstile Setup Guide

This guide will help you set up Cloudflare Turnstile for authentication forms in the gusou-lazer-web project.

## What is Cloudflare Turnstile?

Cloudflare Turnstile is a user-friendly CAPTCHA alternative that helps protect your authentication forms from bots while providing a better user experience.

## Getting Started

### 1. Obtain Turnstile Keys

1. Go to [Cloudflare Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)
2. Create a new site or use an existing one
3. You'll receive:
   - **Site Key**: Used in the frontend (public)
   - **Secret Key**: Used in the backend (private, keep secure)

### 2. Configure Frontend

Create a `.env` file in the project root (or add to your existing one):

```env
# Cloudflare Turnstile Site Key
VITE_TURNSTILE_SITE_KEY=your_site_key_here
```

### 3. Test Keys (For Development)

Cloudflare provides test keys that you can use during development:

- **Always passes**: `1x00000000000000000000AA`
- **Always blocks**: `2x00000000000000000000AB`
- **Always shows challenge**: `3x00000000000000000000FF`

Example `.env` for testing:
```env
VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
```

### 4. Configure Backend

Make sure your backend API accepts the `cf_turnstile_response` parameter in the following endpoints:

- **Login**: `POST /oauth/token`
  - Parameter: `cf_turnstile_response`
  
- **Register**: `POST /users`
  - Parameter: `cf_turnstile_response`
  
- **Password Reset Request**: `POST /password-reset/request`
  - Parameter: `cf_turnstile_response`
  
- **Password Reset**: `POST /password-reset/reset`
  - Parameter: `cf_turnstile_response`

The backend should verify the token using Cloudflare's siteverify API:

```
POST https://challenges.cloudflare.com/turnstile/v0/siteverify
Content-Type: application/json

{
  "secret": "YOUR_SECRET_KEY",
  "response": "TOKEN_FROM_CLIENT",
  "remoteip": "USER_IP_ADDRESS" (optional)
}
```

## Features Implemented

### 1. Login Form (`/login`)
- Turnstile widget displayed before submit button
- Token required to submit form
- Auto-refreshes on login failure

### 2. Registration Form (`/register`)
- Turnstile widget displayed before submit button
- Token required to submit form
- Auto-refreshes on registration failure

### 3. Password Reset (`/password-reset`)
- **Step 1**: Email verification with Turnstile
- **Step 2**: Password reset with Turnstile
- Auto-refreshes on any error

## Widget Configuration

The Turnstile widget is configured with:

```typescript
{
  theme: 'auto',        // Matches user's system theme (light/dark)
  size: 'normal',       // Standard size (300x65px)
  language: 'auto',     // Matches user's browser language
}
```

## Error Handling

The implementation includes automatic refresh of the Turnstile widget when:

1. **Login fails** - Wrong username/password
2. **Registration fails** - Validation errors or duplicate accounts
3. **Password reset fails** - Invalid email or reset code
4. **Turnstile expires** - Token expiration (typically 5 minutes)
5. **Turnstile error** - Network issues or verification failures

## Testing

### Test with Development Keys

1. Set the test site key in `.env`:
   ```env
   VITE_TURNSTILE_SITE_KEY=1x00000000000000000000AA
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Visit any authentication page:
   - Login: `http://localhost:5173/login`
   - Register: `http://localhost:5173/register`
   - Password Reset: `http://localhost:5173/password-reset`

4. The Turnstile widget should appear and automatically pass with the test key.

### Test Error Scenarios

1. Use the "always fails" key to test error handling:
   ```env
   VITE_TURNSTILE_SITE_KEY=2x00000000000000000000AB
   ```

2. Try to submit a form and verify that:
   - The widget resets after failure
   - Error messages are displayed appropriately

## Customization

### Change Widget Size

In the component files, modify the `size` option:

```typescript
<Turnstile
  siteKey={TURNSTILE_SITE_KEY}
  options={{
    size: 'compact',  // Options: normal, compact, flexible, invisible
  }}
/>
```

### Change Theme

```typescript
<Turnstile
  siteKey={TURNSTILE_SITE_KEY}
  options={{
    theme: 'light',  // Options: auto, light, dark
  }}
/>
```

### Force Language

```typescript
<Turnstile
  siteKey={TURNSTILE_SITE_KEY}
  options={{
    language: 'zh-CN',  // Force Chinese
  }}
/>
```

## Troubleshooting

### Widget Not Showing

1. Check that `VITE_TURNSTILE_SITE_KEY` is set in `.env`
2. Restart the development server after adding `.env`
3. Check browser console for errors

### Widget Always Fails

1. Verify the site key is correct
2. Check domain is allowed in Cloudflare Turnstile settings
3. For localhost testing, ensure domain restrictions allow localhost

### Backend Returns Error

1. Ensure backend accepts `cf_turnstile_response` parameter
2. Verify backend is correctly validating with Cloudflare's siteverify API
3. Check backend secret key is correct

## Security Best Practices

1. **Never commit** `.env` files with real keys
2. **Rotate keys** regularly in production
3. **Use different keys** for development and production
4. **Validate on backend** - Never trust client-side only
5. **Rate limit** authentication endpoints even with Turnstile
6. **Log failed attempts** for monitoring

## Resources

- [Cloudflare Turnstile Documentation](https://developers.cloudflare.com/turnstile/)
- [React Turnstile Package](https://github.com/marsidev/react-turnstile)
- [Turnstile Dashboard](https://dash.cloudflare.com/?to=/:account/turnstile)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify all environment variables are set
3. Test with Cloudflare's test keys first
4. Review Cloudflare Turnstile logs in the dashboard

