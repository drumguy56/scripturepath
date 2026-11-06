import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Image } from '@/components/ui/image';

const PHOTOS = [
  {
    src: 'https://media.base44.com/images/public/6aee56731f3f58a24e730082/f093ddd9c_generated_image.png',
    alt: 'An open Bible resting on a linen table in soft morning light',
  },
  {
    src: 'https://media.base44.com/images/public/6aee56731f3f58a24e730082/d7bd7f89f_generated_image.png',
    alt: 'Hands folded gently over an open Bible',
  },
  {
    src: 'https://media.base44.com/images/public/6aee56731f3f58a24e730082/d6ee5a05b_generated_image.png',
    alt: 'A notebook and pen beside an open Bible on a pale oak table',
  },
];

export default function Hero() {
  const reduce = useReducedMotion();

  const rise = (delay) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 22 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.75, delay, ease: [0.2, 0.7, 0.2, 1] },
        };

  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-background">
      <div className="mx-auto max-w-[1180px] px-5 pt-14 sm:px-8 md:pt-20">
        <div className="flex flex-col items-center text-center">
          <motion.p {...rise(0)} className="eyebrow">
            Guided, self-paced Bible study
          </motion.p>

          <motion.h1
            {...rise(0.08)}
            className="mt-5 max-w-[820px] text-[clamp(2.5rem,6.4vw,4.25rem)] leading-[1.08] text-foreground"
          >
            Scripture, taken <span className="hero-word italic">slowly</span>.
          </motion.h1>

          <motion.p
            {...rise(0.18)}
            className="mt-6 max-w-[430px] text-[15.5px] leading-[1.65] text-foreground/75"
          >
            Choose a study and move through it at your own pace — a passage to read,
            a short teaching, questions to answer, and room to write it down.
          </motion.p>

          <motion.div {...rise(0.28)}>
            <Link
              to="/library"
              className="group mt-8 inline-flex h-[42px] items-stretch overflow-hidden rounded-[4px] border border-foreground/80 bg-primary text-primary-foreground transition-colors duration-300 hover:bg-foreground"
            >
              <span className="flex items-center px-5 text-[13px] font-medium uppercase tracking-[0.14em]">
                Browse the studies
              </span>
              <span className="w-px self-stretch bg-primary-foreground/40" aria-hidden="true" />
              <span className="grid w-[42px] place-items-center">
                <svg viewBox="0 0 17.4 17.4" fill="none" className="h-[16px] w-[16px] transition-transform duration-300 group-hover:translate-x-0.5">
                  <path d="M11.35 1.52 14.1 4.68c1.87 2.15 1.87 5.63 0 7.78l-2.75 3.16" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  <path d="M15.5 8.63H1.07" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="mt-10 grid h-[230px] grid-cols-3 gap-3 overflow-hidden sm:mt-12 sm:h-[320px] sm:gap-4 lg:h-[430px]">
          {PHOTOS.map((photo, index) => (
            <motion.div
              key={photo.src}
              {...(reduce
                ? {}
                : {
                    initial: { opacity: 0, y: 40 },
                    animate: { opacity: 1, y: 0 },
                    transition: { duration: 0.9, delay: 0.4 + index * 0.1, ease: [0.2, 0.7, 0.2, 1] },
                  })}
              className={index === 1 ? 'translate-y-[32px] sm:translate-y-[52px] lg:translate-y-[70px]' : ''}
            >
              <div className="relative h-[calc(100%+56px)] overflow-hidden rounded-t-[14px] bg-muted sm:h-[calc(100%+90px)]">
                <Image
                  src={photo.src}
                  alt={photo.alt}
                  className="h-full w-full object-cover object-top"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}