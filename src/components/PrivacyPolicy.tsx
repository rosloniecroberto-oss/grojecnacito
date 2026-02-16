import { ArrowLeft, Mail } from 'lucide-react';

export function PrivacyPolicy() {
  const handleBack = () => {
    window.history.pushState({}, '', '/');
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Wróć na stronę główną</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Polityka Prywatności</h1>
          <p className="text-sm text-gray-500 mt-2">Ostatnia aktualizacja: {new Date().toLocaleDateString('pl-PL')}</p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-8 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Informacje ogólne</h2>
            <p className="text-gray-700 leading-relaxed">
              Niniejsza Polityka Prywatności określa zasady przetwarzania i ochrony danych osobowych
              użytkowników korzystających ze strony internetowej Grojec na Cito. Dbamy o prywatność
              naszych użytkowników i zobowiązujemy się do ochrony ich danych osobowych zgodnie z
              obowiązującymi przepisami prawa, w tym z Rozporządzeniem Parlamentu Europejskiego i Rady
              (UE) 2016/679 z dnia 27 kwietnia 2016 r. (RODO).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Administrator danych</h2>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-gray-700 mb-2">
                <strong>Administrator danych osobowych:</strong> Grojec na Cito
              </p>
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-blue-600" />
                <strong>Kontakt:</strong>
                <a
                  href="mailto:grojecnacito@gmail.com"
                  className="text-blue-600 hover:text-blue-700 hover:underline"
                >
                  grojecnacito@gmail.com
                </a>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Pliki cookies</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nasza strona wykorzystuje pliki cookies (ciasteczka), które są małymi plikami tekstowymi
              zapisywanymi na urządzeniu użytkownika podczas przeglądania strony. Cookies służą do:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Zapamiętania preferencji użytkownika (np. akceptacji baneru cookies)</li>
              <li>Analizy ruchu na stronie i statystyk odwiedzin</li>
              <li>Poprawy funkcjonalności i użyteczności strony</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Użytkownik może w każdej chwili zmienić ustawienia dotyczące plików cookies w swojej
              przeglądarce internetowej lub usunąć zapisane pliki cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Google Analytics i Google Tag Manager</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Nasza strona wykorzystuje <strong>Google Analytics</strong> oraz <strong>Google Tag Manager</strong>
              – narzędzia firmy Google LLC służące do analizy ruchu na stronie internetowej. Informacje
              zebrane za pomocą Google Analytics obejmują:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Liczbę odwiedzin i użytkowników</li>
              <li>Źródła ruchu (skąd użytkownicy trafiają na stronę)</li>
              <li>Czas spędzony na stronie</li>
              <li>Przeglądane podstrony</li>
              <li>Typ urządzenia i przeglądarki</li>
              <li>Dane geograficzne (kraj, region, miasto)</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Dane zbierane przez Google Analytics są przetwarzane w sposób zagregowany i anonimowy.
              Nie pozwalają one na bezpośrednią identyfikację konkretnych użytkowników. Google może
              wykorzystywać zebrane dane do tworzenia raportów statystycznych oraz do doskonalenia
              własnych usług.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Więcej informacji na temat przetwarzania danych przez Google można znaleźć w
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 hover:underline ml-1"
              >
                Polityce Prywatności Google
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cel przetwarzania danych</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Dane zbierane za pomocą plików cookies oraz narzędzi analitycznych są przetwarzane w celach:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Statystycznych – analizy zachowań użytkowników w celu poprawy jakości serwisu</li>
              <li>Funkcjonalnych – zapewnienia prawidłowego działania strony</li>
              <li>Technicznych – optymalizacji wydajności strony</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Udostępnianie danych</h2>
            <p className="text-gray-700 leading-relaxed">
              Dane zbierane na naszej stronie nie są sprzedawane ani udostępniane podmiotom trzecim,
              z wyjątkiem sytuacji przewidzianych prawem lub w celu korzystania z usług dostawców
              narzędzi analitycznych (Google Analytics, Google Tag Manager). Dostawcy ci działają jako
              nasi podwykonawcy i przetwarzają dane wyłącznie zgodnie z naszymi instrukcjami.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Prawa użytkowników</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Zgodnie z przepisami RODO, użytkownicy mają prawo do:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Dostępu do swoich danych osobowych</li>
              <li>Sprostowania (poprawiania) danych</li>
              <li>Usunięcia danych ("prawo do bycia zapomnianym")</li>
              <li>Ograniczenia przetwarzania danych</li>
              <li>Przenoszenia danych</li>
              <li>Wniesienia sprzeciwu wobec przetwarzania danych</li>
              <li>Cofnięcia zgody na przetwarzanie danych</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              W celu skorzystania z powyższych praw, prosimy o kontakt pod adresem e-mail:
              <a
                href="mailto:grojecnacito@gmail.com"
                className="text-blue-600 hover:text-blue-700 hover:underline ml-1"
              >
                grojecnacito@gmail.com
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Bezpieczeństwo danych</h2>
            <p className="text-gray-700 leading-relaxed">
              Dokładamy wszelkich starań, aby chronić dane użytkowników przed nieuprawnionym dostępem,
              utratą, zniszczeniem lub modyfikacją. Stosujemy odpowiednie środki techniczne i
              organizacyjne zapewniające bezpieczeństwo przetwarzania danych.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Zmiany w Polityce Prywatności</h2>
            <p className="text-gray-700 leading-relaxed">
              Zastrzegamy sobie prawo do wprowadzania zmian w niniejszej Polityce Prywatności.
              O wszelkich zmianach użytkownicy zostaną poinformowani poprzez publikację zaktualizowanej
              wersji Polityki na stronie. Data ostatniej aktualizacji znajduje się na początku dokumentu.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Kontakt</h2>
            <p className="text-gray-700 leading-relaxed">
              W przypadku pytań dotyczących Polityki Prywatności lub przetwarzania danych osobowych,
              prosimy o kontakt:
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mt-3">
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-blue-600" />
                <a
                  href="mailto:grojecnacito@gmail.com"
                  className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                >
                  grojecnacito@gmail.com
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-4xl mx-auto px-4 py-6 text-center">
          <p className="text-sm text-gray-600 mb-2">2026 - Projekt Społeczny</p>
          <p className="text-xs text-gray-500">
            Informacje pochodzą z ogólnodostępnych źródeł i mogą ulec zmianie. Projekt społeczny – zawsze weryfikuj dane u źródła.
          </p>
        </div>
      </footer>
    </div>
  );
}
