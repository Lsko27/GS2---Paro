import EstablishmentMapSearch from "@/app/_components/map/establishment-map-search";
import { searchEstablishments } from "@/app/_services/establishment-service";

export default async function TestApiPage() {
  const initialCenter: [number, number] = [-23.56, -46.65];

  const establishments = await searchEstablishments({
    latitude: initialCenter[0],
    longitude: initialCenter[1],
    radiusKm: 5,
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <EstablishmentMapSearch
        initialEstablishments={establishments}
        initialCenter={initialCenter}
      />
    </main>
  );
}
