/** Narrow single-panel card used by the forgot / reset password pages. */
export default function AuthCard({
  eyebrow,
  title,
  intro,
  children,
}: {
  eyebrow: string;
  title: string;
  intro: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mx-auto max-w-[620px] px-5 py-12 sm:px-8 md:py-20">
      <div className="rounded-[3px] border border-hairline bg-panel-2 bg-[radial-gradient(120%_100%_at_30%_0%,rgba(201,162,75,0.10),rgba(16,13,10,0)_60%)] p-8 sm:p-10 md:p-12">
        <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.18em] text-gold-light">
          {eyebrow}
        </p>
        <h1 className="mb-3 font-serif text-[34px] font-semibold sm:text-[40px]">{title}</h1>
        <div className="mb-6 max-w-[440px] text-[14px] leading-[1.65] text-muted">{intro}</div>
        {children}
      </div>
    </section>
  );
}
