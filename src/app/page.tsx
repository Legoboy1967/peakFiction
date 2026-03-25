import { prisma } from '@/lib/prisma'
import { submitRating } from './actions'
import RatingForm from './components/RatingForm'

export default async function Home() {
  const artworks = await prisma.artwork.findMany({
    orderBy: { finalScore: 'desc' }
  });

  const leaderBoard = artworks.filter(a => a.ratingCount >= 2);
  const waitingList = artworks.filter(a => a.ratingCount === 1);

  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-primary">Peak Fiction</h1>
      
      <section className="mb-12 bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4">Rate Artwork</h2>
        <RatingForm />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">🏆</span> The LeaderBoard
          </h2>
          <div className="space-y-4">
            {leaderBoard.length === 0 && <p className="text-gray-500">Nothing here yet...</p>}
            {leaderBoard.map((artwork, idx) => (
              <div key={artwork.id} className="p-4 bg-white rounded shadow border-l-4 border-primary flex justify-between items-center">
                <div>
                  <span className="font-bold text-lg text-gray-700">#{idx + 1}</span>
                  <span className="ml-3 font-semibold">{artwork.title}</span>
                </div>
                <div className="text-2xl font-black text-primary">
                  {artwork.finalScore}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="mr-2">⏳</span> The Waiting List
          </h2>
          <div className="space-y-4">
            {waitingList.length === 0 && <p className="text-gray-500">Nothing here yet...</p>}
            {waitingList.map((artwork) => (
              <div key={artwork.id} className="p-4 bg-gray-50 rounded border flex justify-between items-center">
                <span className="font-medium text-gray-700">{artwork.title}</span>
                <span className="text-lg font-bold text-gray-500">
                  {artwork.finalScore}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
