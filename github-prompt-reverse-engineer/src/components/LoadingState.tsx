export default function LoadingState() {
  return (
    <div className="w-full max-w-2xl mx-auto mt-12 flex flex-col items-center justify-center p-8">
      <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <h3 className="text-lg font-medium text-gray-800">Analyzing Repository...</h3>
      <p className="text-gray-500 mt-2 text-center text-sm">
        Fetching metadata, exploring the root tree, and reading the README to generate your synthetic prompt.
      </p>
    </div>
  );
}
