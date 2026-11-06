import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';

export default function StudyCard({ study, to }) {
  return (
    <Link to={to} className="group block">
      <div className="relative aspect-[4/3] overflow-hidden rounded-[14px] bg-muted">
        <Image
          src={study.cover_image}
          alt=""
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
      </div>
      <div className="mt-4">
        <p className="eyebrow">
          {study.category} · {study.lesson_count} lessons
        </p>
        <h3 className="mt-2 text-[20px] leading-snug transition-colors group-hover:text-primary">
          {study.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-[13.5px] leading-relaxed text-muted-foreground">
          {study.summary}
        </p>
      </div>
    </Link>
  );
}