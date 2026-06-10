import type { WarCorrespondent } from '../types/database';

interface CorrespondentalSectionProps {
  correspondents: WarCorrespondent[];
}

export function CorrespondentalSection({ correspondents }: CorrespondentalSectionProps) {
  if (correspondents.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-black border-t border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-12">
          <div className="w-1 h-8 bg-red-600 mr-4" />
          <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
            Cepheden Muhabirler
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {correspondents.map((correspondent) => (
            <div
              key={correspondent.id}
              className="group"
            >
              <div className="relative overflow-hidden bg-gray-900 aspect-square mb-4">
                <img
                  src={correspondent.photo_url}
                  alt={correspondent.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMWYxZjFmIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJzYW5zLXNlcmlmIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNTU1IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+R8O2cnNlbDwvdGV4dD48L3N2Zz4=';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-white font-bold text-lg mb-1">
                    {correspondent.name}
                  </h3>
                  <p className="text-red-500 text-sm font-semibold mb-2">
                    {correspondent.title}
                  </p>
                  <p className="text-gray-300 text-sm line-clamp-3 leading-relaxed">
                    {correspondent.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
