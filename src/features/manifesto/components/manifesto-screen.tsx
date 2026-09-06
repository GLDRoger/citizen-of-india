"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CitizenGraphMap } from "@/components/citizen-graph-map";
import { Page } from "@/components/ui/page";
import { RichText } from "@/components/rich-text";
import { useAuthStore } from "@/features/auth/store";
import type { MessageKey } from "@/i18n/messages";
import { useI18n } from "@/i18n/use-i18n";

interface ManifestoItem {
  body: MessageKey;
  title: MessageKey;
}

interface PublicFoundation extends ManifestoItem {
  href: string;
  name: string;
}

const flowSteps: ManifestoItem[] = [
  { body: "manifestoFlowSituationBody", title: "manifestoFlowSituationTitle" },
  { body: "manifestoFlowContextBody", title: "manifestoFlowContextTitle" },
  { body: "manifestoFlowRouteBody", title: "manifestoFlowRouteTitle" },
  { body: "manifestoFlowReturnBody", title: "manifestoFlowReturnTitle" },
];

const roles: ManifestoItem[] = [
  { body: "manifestoRoleTaxpayerBody", title: "manifestoRoleTaxpayerTitle" },
  { body: "manifestoRoleWorkerBody", title: "manifestoRoleWorkerTitle" },
  { body: "manifestoRoleOwnerBody", title: "manifestoRoleOwnerTitle" },
  { body: "manifestoRoleFamilyBody", title: "manifestoRoleFamilyTitle" },
  { body: "manifestoRoleAssetBody", title: "manifestoRoleAssetTitle" },
  { body: "manifestoRoleDelegateBody", title: "manifestoRoleDelegateTitle" },
];

const lifeEventSteps: ManifestoItem[] = [
  { body: "manifestoLifeRecordBody", title: "manifestoLifeRecordTitle" },
  { body: "manifestoLifeCertificateBody", title: "manifestoLifeCertificateTitle" },
  { body: "manifestoLifeNotifyBody", title: "manifestoLifeNotifyTitle" },
  { body: "manifestoLifeTransferBody", title: "manifestoLifeTransferTitle" },
  { body: "manifestoLifeTimelineBody", title: "manifestoLifeTimelineTitle" },
];

const civicSteps: ManifestoItem[] = [
  { body: "manifestoCivicDescribeBody", title: "manifestoCivicDescribeTitle" },
  { body: "manifestoCivicJurisdictionBody", title: "manifestoCivicJurisdictionTitle" },
  { body: "manifestoCivicRouteBody", title: "manifestoCivicRouteTitle" },
  { body: "manifestoCivicEscalateBody", title: "manifestoCivicEscalateTitle" },
];

const authorityDocumentSteps: ManifestoItem[] = [
  { body: "manifestoAuthorityScopeBody", title: "manifestoAuthorityScopeTitle" },
  { body: "manifestoAuthorityInstrumentBody", title: "manifestoAuthorityInstrumentTitle" },
  { body: "manifestoAuthorityStampBody", title: "manifestoAuthorityStampTitle" },
  { body: "manifestoAuthorityExecuteBody", title: "manifestoAuthorityExecuteTitle" },
];

const foundationFallbacks: MessageKey[] = [
  "manifestoFoundationsFamily",
  "manifestoFoundationsVideo",
  "manifestoFoundationsAgent",
  "manifestoFoundationsExperienced",
];

const guardrails: ManifestoItem[] = [
  { body: "manifestoGuardrailAdsBody", title: "manifestoGuardrailAdsTitle" },
  { body: "manifestoGuardrailDataBody", title: "manifestoGuardrailDataTitle" },
  { body: "manifestoGuardrailConsentBody", title: "manifestoGuardrailConsentTitle" },
  { body: "manifestoGuardrailAssistantBody", title: "manifestoGuardrailAssistantTitle" },
];

const publicFoundations: PublicFoundation[] = [
  { body: "manifestoFoundationUmangBody", href: "https://web.umang.gov.in/landing", name: "UMANG", title: "manifestoFoundationUmangTitle" },
  { body: "manifestoFoundationDigiLockerBody", href: "https://www.digilocker.gov.in/", name: "DigiLocker", title: "manifestoFoundationDigiLockerTitle" },
  { body: "manifestoFoundationMySchemeBody", href: "https://www.myscheme.gov.in/", name: "myScheme", title: "manifestoFoundationMySchemeTitle" },
  { body: "manifestoFoundationCpgramsBody", href: "https://pgportal.gov.in/", name: "CPGRAMS", title: "manifestoFoundationCpgramsTitle" },
  { body: "manifestoFoundationRtiBody", href: "https://rtionline.gov.in/", name: "RTI Online", title: "manifestoFoundationRtiTitle" },
];

const sectionTitle = "manifesto-section-title font-display font-semibold tracking-[-0.05em]";

/** Numbered ledger shared by the situation sections: saffron index, title, body. */
function NumberedList({ items }: { items: ManifestoItem[] }) {
  const { t } = useI18n();
  return (
    <ol className="border-y border-paper-line">
      {items.map(({ body, title }, index) => (
        <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 border-b border-paper-line py-4 last:border-b-0" key={title}>
          <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
          <div className="grid gap-1">
            <h3 className="font-display text-xl font-semibold">{t(title)}</h3>
            <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function ManifestoHero() {
  const { t } = useI18n();
  return (
    <section className="grid gap-8 pt-4 sm:pt-8">
      <div className="grid max-w-5xl gap-5">
        <p className="text-sm font-bold text-indigo-deep">{t("manifestoEyebrow")}</p>
        <h1 className="manifesto-title font-display text-[clamp(3rem,9vw,7.8rem)] font-semibold leading-[0.84] tracking-[-0.06em] text-ink"><RichText entrance="load" text={t("manifestoTitle")} /></h1>
      </div>
      <div className="grid gap-7 border-y-4 border-indigo-deep py-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.55fr)] lg:gap-16 lg:py-9">
        <p className="max-w-3xl font-display text-[clamp(1.8rem,3.4vw,3.25rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-indigo-deep">{t("manifestoLead")}</p>
        <div className="grid content-start gap-4 text-base leading-8 text-ink-mute">
          <p><RichText text={t("manifestoLetterOne")} /></p>
          <p>{t("manifestoLetterTwo")}</p>
          <p className="text-sm font-bold leading-6 text-green-deep">{t("manifestoCommitment")}</p>
        </div>
      </div>
    </section>
  );
}

/** The promises, first. Big type on indigo: this is the part a private app cannot sign. */
function Guardrails() {
  const { t } = useI18n();
  return (
    <section className="-mx-5 grid gap-10 bg-indigo-deep px-5 py-12 text-paper sm:mx-0 sm:px-9 lg:px-12 lg:py-16">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.9fr)_minmax(20rem,0.6fr)] lg:items-end lg:gap-16">
        <h2 className={`${sectionTitle} text-[clamp(3rem,7vw,6.4rem)] leading-[0.86]`}>{t("manifestoGuardrailsTitle")}</h2>
        <p className="max-w-xl text-base leading-8 text-indigo-tint"><RichText text={t("manifestoGuardrailsBody")} /></p>
      </div>
      <ol className="landing-reveal grid border-t border-paper/25 sm:grid-cols-2">
        {guardrails.map(({ body, title }, index) => (
          <li className="grid content-start gap-3 border-b border-paper/25 py-6 sm:pr-8 sm:odd:border-r sm:even:pl-8 sm:even:pr-0" key={title}>
            <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
            <h3 className="font-display text-3xl font-semibold leading-none tracking-[-0.03em] sm:text-4xl">{t(title)}</h3>
            <p className="max-w-md text-sm leading-6 text-indigo-tint">{t(body)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function ContinuityFlow() {
  const { t } = useI18n();
  return (
    <section className="grid gap-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(20rem,0.5fr)] lg:items-end lg:gap-16">
        <h2 className={`${sectionTitle} text-[clamp(3rem,6.4vw,6rem)] leading-[0.88]`}>{t("manifestoFlowTitle")}</h2>
        <p className="max-w-xl text-base leading-8 text-ink-mute">{t("manifestoFlowBody")}</p>
      </div>
      <ol className="landing-reveal grid border-y border-paper-line md:grid-cols-4">
        {flowSteps.map(({ body, title }, index) => (
          <li className="grid content-start gap-3 border-b border-paper-line py-5 last:border-b-0 md:border-b-0 md:border-l md:px-5 md:first:border-l-0 md:first:pl-0 md:last:pr-0" key={title}>
            <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
            <h3 className="font-display text-2xl font-semibold leading-tight">{t(title)}</h3>
            <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Roles() {
  const { t } = useI18n();
  return (
    <section className="grid gap-8 bg-paper-shade p-6 sm:p-9 lg:grid-cols-[minmax(0,0.7fr)_minmax(22rem,0.6fr)] lg:gap-16 lg:p-12">
      <div className="grid content-start gap-5">
        <h2 className={`${sectionTitle} text-[clamp(2.8rem,5.6vw,5.2rem)] leading-[0.9]`}>{t("manifestoRolesTitle")}</h2>
        <p className="max-w-2xl text-base leading-8 text-ink-mute">{t("manifestoRolesBody")}</p>
      </div>
      <ul className="landing-reveal grid border-y border-paper-line sm:grid-cols-2 sm:border-y-0">
        {roles.map(({ body, title }) => (
          <li className="grid content-start gap-1 border-b border-paper-line py-4 sm:border-t sm:pr-5 sm:even:pl-5 sm:even:pr-0" key={title}>
            <h3 className="font-display text-2xl font-semibold leading-tight text-indigo-deep">{t(title)}</h3>
            <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

function LifeEventPipeline() {
  const { t } = useI18n();
  return (
    <section className="grid gap-8">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.72fr)_minmax(20rem,0.5fr)] lg:items-end lg:gap-16">
        <h2 className={`${sectionTitle} text-[clamp(3rem,6vw,5.6rem)] leading-[0.9]`}>{t("manifestoLifeTitle")}</h2>
        <p className="max-w-xl text-base leading-8 text-ink-mute">{t("manifestoLifeBody")}</p>
      </div>
      <ol className="landing-reveal border-y border-paper-line md:grid md:grid-cols-5">
        {lifeEventSteps.map(({ body, title }, index) => (
          <li className="grid grid-cols-[2.25rem_minmax(0,1fr)] gap-4 border-b border-paper-line py-5 last:border-b-0 md:grid-cols-1 md:content-start md:border-b-0 md:border-l md:px-5 md:first:border-l-0 md:first:pl-0 md:last:pr-0" key={title}>
            <span className="font-display text-sm font-bold text-saffron">0{index + 1}</span>
            <div className="grid gap-2">
              <h3 className="font-display text-xl font-semibold leading-tight">{t(title)}</h3>
              <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Situation({ body, items, kicker, tone, title }: { body: MessageKey; items: ManifestoItem[]; kicker: MessageKey; tone: "green" | "indigo"; title: MessageKey }) {
  const { t } = useI18n();
  const shell = tone === "green" ? "bg-paper-shade p-6 sm:p-9 lg:p-12" : "border-y-4 border-indigo-deep py-10";
  return (
    <section className={`grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(22rem,0.6fr)] lg:gap-16 ${shell}`}>
      <div className="grid content-start gap-5">
        <p className={`text-sm font-bold ${tone === "green" ? "text-green-deep" : "text-indigo-deep"}`}>{t(kicker)}</p>
        <h2 className={`${sectionTitle} text-[clamp(2.8rem,5.2vw,4.8rem)] leading-[0.9]`}>{t(title)}</h2>
        <p className="max-w-2xl text-base leading-8 text-ink-mute">{t(body)}</p>
      </div>
      <div className="landing-reveal"><NumberedList items={items} /></div>
    </section>
  );
}

function RightsAndRemedies() {
  const { t } = useI18n();
  const remedies = [
    { body: "manifestoRtiBody", href: "https://rtionline.gov.in/", name: "RTI Online", title: "manifestoRtiTitle" },
    { body: "manifestoGrievanceBody", href: "https://pgportal.gov.in/", name: "CPGRAMS", title: "manifestoGrievanceTitle" },
  ] as const;
  return (
    <section className="-mx-5 grid gap-8 bg-green-deep px-5 py-9 text-paper sm:mx-0 sm:px-9 sm:py-12 lg:px-12">
      <div className="grid max-w-4xl gap-4">
        <h2 className={`${sectionTitle} text-[clamp(3rem,6vw,5.6rem)] leading-[0.9]`}>{t("manifestoRightsTitle")}</h2>
        <p className="max-w-3xl text-base leading-8 text-green-tint">{t("manifestoRightsBody")}</p>
      </div>
      <div className="grid border-y border-green-tint/35 md:grid-cols-2">
        {remedies.map((remedy, index) => (
          <article className={`grid content-start gap-4 py-6 ${index === 0 ? "md:pr-8" : "border-t border-green-tint/35 md:border-l md:border-t-0 md:pl-8"}`} key={remedy.name}>
            <h3 className="font-display text-3xl font-semibold">{t(remedy.title)}</h3>
            <p className="text-sm leading-7 text-green-tint">{t(remedy.body)}</p>
            <a className="inline-flex min-h-11 items-center gap-2 justify-self-start text-sm font-bold underline decoration-green-tint/50 underline-offset-4" href={remedy.href} rel="noreferrer" target="_blank">{remedy.name}<ArrowUpRight aria-hidden className="size-4" /></a>
          </article>
        ))}
      </div>
      <p className="font-display text-2xl font-semibold leading-tight text-green-tint">{t("manifestoRightsClosing")}</p>
    </section>
  );
}

function PublicFoundations() {
  const { t } = useI18n();
  return (
    <section className="grid gap-8">
      <div className="grid max-w-4xl gap-3">
        <h2 className={`${sectionTitle} text-[clamp(3rem,6vw,5.6rem)] leading-[0.9]`}><RichText text={t("manifestoFoundationsTitle")} /></h2>
        <p className="max-w-3xl text-base leading-8 text-ink-mute">{t("manifestoFoundationsBody")}</p>
        <p className="max-w-3xl text-base leading-8 text-ink-mute">{t("manifestoFoundationsAim")}</p>
      </div>
      <aside className="grid gap-5 bg-indigo-deep px-6 py-7 text-paper sm:px-8">
        <h3 className="font-display text-2xl font-semibold">{t("manifestoFoundationsMazeTitle")}</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {foundationFallbacks.map((item, index) => (
            <li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-indigo-tint" key={item}>
              <span className="font-display font-bold text-saffron">0{index + 1}</span>
              <span>{t(item)}</span>
            </li>
          ))}
        </ul>
      </aside>
      <ul className="landing-reveal border-y border-paper-line">
        {publicFoundations.map(({ body, href, name, title }) => (
          <li className="grid gap-3 border-b border-paper-line py-5 last:border-b-0 sm:grid-cols-[9rem_13rem_minmax(0,1fr)] sm:items-baseline sm:gap-6" key={name}>
            <a className="inline-flex min-h-11 items-center gap-1.5 justify-self-start font-display text-xl font-semibold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4" href={href} rel="noreferrer" target="_blank">{name}<ArrowUpRight aria-hidden className="size-4" /></a>
            <h3 className="font-display text-xl font-semibold">{t(title)}</h3>
            <p className="text-sm leading-6 text-ink-mute">{t(body)}</p>
          </li>
        ))}
      </ul>
      <p className="text-xs leading-5 text-ink-mute">{t("manifestoFoundationsNote")}</p>
    </section>
  );
}

function ManifestoClosing() {
  const { t } = useI18n();
  const personId = useAuthStore((state) => state.personId);
  return (
    <section className="grid gap-7 pb-4">
      <p className="max-w-3xl font-display text-2xl font-semibold leading-tight text-indigo-deep">{t("manifestoClosingSalutation")}</p>
      <h2 className={`${sectionTitle} max-w-5xl text-[clamp(3.4rem,8vw,7.2rem)] leading-[0.86] tracking-[-0.055em]`}><RichText text={t("manifestoClosingTitle")} /></h2>
      <p className="max-w-3xl text-lg leading-8 text-ink-mute">{t("manifestoClosingBody")}</p>
      <div className="flex flex-wrap gap-3">
        <Link className="inline-flex min-h-12 items-center rounded-[4px] bg-indigo-deep px-5 text-sm font-bold text-paper transition-colors hover:bg-indigo" href={personId ? "/home" : "/start"}>{t(personId ? "manifestoOpenCitizen" : "landingStart")}</Link>
        <Link className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 transition-colors hover:text-indigo" href="/#graph">{t("manifestoSeeGraph")}<ArrowUpRight aria-hidden className="size-4" /></Link>
        <Link className="inline-flex min-h-12 items-center gap-2 px-2 text-sm font-bold text-indigo-deep underline decoration-indigo-deep/25 underline-offset-4 transition-colors hover:text-indigo" href="/#here">{t("manifestoSeeHere")}<ArrowUpRight aria-hidden className="size-4" /></Link>
      </div>
    </section>
  );
}

export function ManifestoScreen() {
  return (
    <Page className="manifesto-page grid gap-16 sm:gap-24 lg:gap-28">
      <ManifestoHero />
      <Guardrails />
      <ContinuityFlow />
      <CitizenGraphMap className="manifesto-graph-map -mx-5 sm:mx-0" mode="static" />
      <Roles />
      <LifeEventPipeline />
      <Situation body="manifestoCivicBody" items={civicSteps} kicker="manifestoCivicSituation" title="manifestoCivicTitle" tone="green" />
      <Situation body="manifestoAuthorityBody" items={authorityDocumentSteps} kicker="manifestoAuthoritySituation" title="manifestoAuthorityTitle" tone="indigo" />
      <RightsAndRemedies />
      <PublicFoundations />
      <ManifestoClosing />
    </Page>
  );
}
