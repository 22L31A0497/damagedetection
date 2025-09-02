import MultiImageUpload from './components/MultiImageUpload';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="max-w-4xl mx-auto pt-12">
        <h1 className="text-4xl font-bold text-center mb-8 text-white tracking-tight">
          Upload damaged photos of your car <span className="text-indigo-400">from different angles for better analysis</span>
        </h1>
        <MultiImageUpload />
      </div>
    </main>
  );
}