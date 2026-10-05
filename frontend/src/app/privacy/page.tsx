import type { Metadata } from "next";
import { LegalPage, SUPPORT_EMAIL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What TripPilot collects about you and how it is used.",
};

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="3 October 2026">
      <p>
        This policy explains what TripPilot collects when you create an account and sign in, why we
        collect it, and the choices you have.
      </p>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>Your name and email address, which you give us when you register.</li>
          <li>
            Your password. It is stored only by our authentication provider, in hashed form. We never
            see or store it ourselves.
          </li>
          <li>
            If you sign in with Google: your name, email address and profile picture, as shared by
            Google.
          </li>
          <li>When you registered, when you last signed in, and how many times you have signed in.</li>
        </ul>
      </section>

      <section>
        <h2>How we use it</h2>
        <ul>
          <li>To create your account, sign you in and keep you signed in.</li>
          <li>To send emails you need, such as confirming your address or resetting your password.</li>
          <li>To keep the service secure, for example by spotting unusual sign-in activity.</li>
        </ul>
        <p className="mt-2">We do not sell your data and we do not use it for advertising.</p>
      </section>

      <section>
        <h2>Who processes it</h2>
        <p>We rely on these providers to run TripPilot:</p>
        <ul>
          <li>Firebase Authentication (Google) for accounts, passwords and sign-in emails.</li>
          <li>MongoDB Atlas to store your profile.</li>
          <li>Vercel to host the website.</li>
          <li>Google Sign-In, only if you choose to sign in with Google.</li>
        </ul>
      </section>

      <section>
        <h2>Cookies and browser storage</h2>
        <p>
          We only store what is needed to keep you signed in, in your browser&apos;s storage. There are
          no tracking or advertising cookies.
        </p>
      </section>

      <section>
        <h2>Your choices</h2>
        <p>
          You can ask us to show you, correct or delete your data at any time. Email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-600 hover:underline">
            {SUPPORT_EMAIL}
          </a>{" "}
          and we will reply within 30 days. Deleting your account removes your profile and sign-in
          history.
        </p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>
          If we change this policy we will update the date above, and tell you by email for any
          significant change.
        </p>
      </section>
    </LegalPage>
  );
}
