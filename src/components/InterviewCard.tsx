import { useRouter } from '../hooks/useRouter';
import type { Interview } from '../types/database';

interface InterviewCardProps {
  interview: Interview;
}

export function InterviewCard({ interview }: InterviewCardProps) {
  const { navigate } = useRouter();

  return (
    <button
      onClick={() => navigate(`/interview/${interview.slug}`)}
      className="group text-left w-full"
    >
      <div className="relative overflow-hidden bg-gray-900 aspect-[4/5]">
        <img
          src={interview.interviewee_photo}
          alt={interview.interviewee_name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R8O2cnNlbDwvdGV4dD48L3N2Zz4=';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white font-bold text-xl mb-2 leading-tight">
            {interview.interviewee_name}
          </h3>
          <p className="text-gray-300 text-sm line-clamp-2 leading-relaxed">
            {interview.subtitle}
          </p>
        </div>
      </div>
    </button>
  );
}
