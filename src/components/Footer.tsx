export function Footer() {
  const handlePrivacyClick = () => {
    window.history.pushState({}, '', '/privacy');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-gray-600 mb-2">2026 - Projekt Społeczny</p>
        <p className="text-xs text-gray-500 mb-2">
          Informacje pochodzą z ogólnodostępnych źródeł i mogą ulec zmianie. Projekt społeczny – zawsze weryfikuj dane u źródła.
        </p>
        <button
          onClick={handlePrivacyClick}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
        >
          Polityka Prywatności
        </button>
      </div>
    </footer>
  );
}
