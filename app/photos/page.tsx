import Image from 'next/image'

export default function Photos() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <h2 className="text-4xl font-bold mb-6 text-yellow-600">Photos</h2>
      <p className="text-lg mb-6">Sample trophy image below — replace with your event photos later.</p>
      <div className="max-w-sm mx-auto">
        <div className="bg-gray-100 rounded-lg overflow-hidden shadow">
          <Image src="/trophy.jpg" alt="Trophy" width={800} height={600} />
        </div>
      </div>
    </div>
  )
}
