import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, SUPPORT_EMAIL } from "@/components/legal/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The rules for using TripPilot.",
};

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service" updated="3 October 2026">
      <p>
        By creating a TripPilot account or using the site, you agree to these terms. If you do not
        agree, please do not use TripPilot.
      </p>

      <section>
        <h2>Your account</h2>
        <ul>
          <li>Give accurate information when you register.</li>
          <li>Keep your password private. You are responsible for activity on your account.</li>
          <li>Tell us straight away if you think someone else has used your account.</li>
        </ul>
      </section>

      <section>
        <h2>Acceptable use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Break the law or anyone else&apos;s rights while using TripPilot.</li>
          <li>Try to access accounts or data that are not yours.</li>
          <li>Disrupt the service, for example with automated sign-up or sign-in attempts.</li>
        </ul>
        <p className="mt-2">We may suspend accounts that break these rules.</p>
      </section>

      <section>
        <h2>Your data</h2>
        <p>
          How we handle your information is described in our{" "}
          <Link href="/privacy" className="font-medium text-brand-600 hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </section>

      <section>
        <h2>The service</h2>
        <p>
          TripPilot is provided as it is. We work to keep it available and secure, but we cannot
          promise it will always be free of interruptions or errors. We may change or stop features
          over time.
        </p>
      </section>

      <section>
        <h2>Ending your account</h2>
        <p>
          You can stop using TripPilot and ask us to delete your account at any time by emailing{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-600 hover:underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </section>

      <section>
        <h2>Changes to these terms</h2>
        <p>
          We may update these terms. When we do, we will change the date above. Continuing to use
          TripPilot after a change means you accept the new terms.
        </p>
      </section>
    </LegalPage>
  );
}
