import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';

const LOGO =
  '/media/57f3a7272_generated_image.png';

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto grid min-h-screen max-w-[1180px] lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex flex-col px-5 py-8 sm:px-8">
          <Link to="/" className="flex items-center gap-2.5 self-start">
            <Image
              src={LOGO}
              alt="ScripturePath"
              fittingType="fit"
              className="h-8 w-8 object-contain"
            />
            <span className="font-heading text-[19px] tracking-tight">ScripturePath</span>
          </Link>

          <div className="flex flex-1 items-center py-10">
            <div className="w-full max-w-[400px]">
              <div className="flex items-center gap-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-border text-primary">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <span className="eyebrow">Guided Bible study</span>
              </div>

              <h1 className="glow-heading mt-5 font-heading text-[clamp(1.85rem,4vw,2.35rem)] leading-[1.15] text-foreground">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-3 text-[13.5px] leading-relaxed text-muted-foreground">
                  {subtitle}
                </p>
              )}

              <div className="glow-panel mt-7 rounded-[14px] border border-border/80 bg-card p-6 sm:p-7">
                {children}
              </div>

              {footer && <p className="mt-5 text-[13px] text-muted-foreground">{footer}</p>}
            </div>
          </div>
        </div>

        <aside className="hidden flex-col justify-center border-l border-border/70 bg-secondary/40 px-10 lg:flex">
          <p className="glow-heading font-heading text-[24px] leading-[1.45] text-foreground/90">
            “Thy word is a lamp unto my feet, and a light unto my path.”
          </p>
          <p className="mt-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Psalm 119:105
          </p>
          <div className="mt-10 h-px w-16 bg-border" />
          <p className="mt-6 max-w-[240px] text-[13px] leading-relaxed text-muted-foreground">
            Free to begin. Your journal and your progress stay private to you.
          </p>
        </aside>
      </div>
    </div>
  );
}