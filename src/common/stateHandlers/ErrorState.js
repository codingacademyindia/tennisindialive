export default function ErrorMessage({ message = "Error loading data. Please refresh or try again later." }) {
  return (
    <div className="mt-3 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700 shadow-sm">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.8}
        stroke="currentColor"
        className="h-6 w-6 flex-shrink-0 text-red-600"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>

      <p className="text-sm leading-relaxed">
        {message}
      </p>
    </div>
  );
}
