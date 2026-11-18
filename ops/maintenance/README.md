# TrainFusion temporary shutdown

This folder is a standalone, static maintenance deployment for the existing TrainFusion Vercel project. Deploy **this folder only**, never this repository's root, to maintain the pause. It contains no application runtime, database calls, forms, analytics, mail transport, or scheduled jobs. All application paths and submission methods return HTTP 503 with the maintenance message. Vercel may return HTTP 204 to an OPTIONS preflight; it does not process a registration.

The original application source is unchanged. Existing databases, users, waitlist records, domains, email credentials, and Stripe configuration must remain intact. Do not deploy unfinished local changes or an older repository foundation as a replacement for the preserved production application.

## Additional production controls

In the **TrainFusion** Supabase project only, Authentication → Sign In / Providers:

- Allow new users to sign up: off.
- Email → Enable email provider: off.
- Email → Enable magic links and email OTP: off.
- Confirm email remains on; other security controls are unchanged.

Vercel Standard Protection remains enabled for generated/older deployment URLs. Only the maintenance deployment is exposed through the existing production domains. No Resend account-wide changes or credential revocations are needed. Never disable the shared Resend account.

## Deployment procedure

1. Confirm the destination is the existing TrainFusion project and preserve the current full-application production deployment ID/settings in a private operational record.
2. For emergency containment, pause that one Vercel project. To build the maintenance release without reopening the application, first set Vercel Authentication to All Deployments, verify it, then unpause hosting while protection stays enabled.
3. Deploy only `index.html` and `vercel.json` from this folder to that same project. The explicit static builder avoids the application's Next.js build and email/database code.
4. Verify the new deployment is Ready, is the production target, and has no application functions or cron definitions. Restore the original Standard Protection only after the maintenance deployment is the production target.
5. Verify the production domain's maintenance message, HTTP 503 on POST/server-action/API paths, authentication rejection, and unchanged database counts. Confirm generated URLs for older application deployments are still protected. Check for new provider acceptances without sending a test email.

## Reactivation — only after the owner requests it

1. Keep the maintenance release active while reviewing the spam incident and validating the original full application or an approved new application release. Restoring the previous application alone also restores its old waitlist behavior. Keep new registrations disabled until appropriate abuse protection is tested and approved.
2. Use the privately recorded pre-shutdown full-application deployment as the rollback reference. If it is no longer retained by Vercel, redeploy the preserved original application source with the existing TrainFusion environment, not this maintenance package and not an outdated repository foundation.
3. Build and verify the approved full application behind deployment protection. Preserve the existing database, credentials, domain aliases, Stripe settings and shared-provider isolation. Do not replay historic waitlist confirmations or notifications.
4. At the approved cutover, promote the approved application deployment. Re-enable the TrainFusion Email provider and magic-link/email-OTP switches when email sign-ins should return; enable Allow new users to sign up only when registrations are approved. Keep Confirm email enabled. The website waitlists are independently controlled by the application deployment, so do not expose the old public forms prematurely.
5. Confirm login, registration protections and email limits, then inspect real provider IDs/receipts, duplicate prevention and notification behavior. Do not perform bulk historical resends.

## Limits and costs

The pause prevents new application-generated sends. Messages already accepted by an email provider cannot be recalled by replacing the website and may still generate delayed delivery, bounce or complaint events. The database and domain remain active and can continue incurring existing hosting, compute, storage, backup and renewal charges. Shared Vercel/Resend/Supabase plans are unchanged. Stripe is not canceled or reconfigured; any pre-existing recurring billing must be reviewed separately before assuming it stopped.
