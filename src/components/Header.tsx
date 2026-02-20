import { Clock, ChevronDown, Share2 } from 'lucide-react'; // Dodano Share2
import { useWeather, getWeatherIcon } from '../hooks/useWeather';
import { Clock, ChevronDown } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';

export function Header() {
  const weather = useWeather();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

 const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Grójec na Cito',
          text: 'Sprawdź najnowsze informacje z Grójca i okolic!',
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link skopiowany do schowka!');
      }
    } catch (err) {
      console.log('Anulowano udostępnianie');
    }
  };
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
    }
  };

  const menuItems = [
    { id: 'autobusy', label: 'Autobusy' },
    { id: 'apteki', label: 'Apteki' },
    { id: 'odpady', label: 'Odpady' },
    { id: 'nabożeństwa', label: 'Nabożeństwa' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="flex items-center gap-1.5 hover:opacity-70 transition-opacity group"
            >
              <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-1">
                  Grójec na Cito
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">To, co dziś potrzebne</p>
              </div>
            </button>

            {isMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="w-full px-4 py-2.5 text-left text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* PRZYCISK UDOSTĘPNIANIA - WSTAWIAMY TUTAJ */}
          <button 
            onClick={handleShare}
            className="flex items-center justify-center p-2 rounded-full text-blue-600 hover:bg-blue-50 transition-colors ml-auto sm:ml-0"
            aria-label="Udostępnij"
          >
            <Share2 className="w-5 h-5" />
          </button>

          {/* POCZĄTEK BLOKU CZASU I POGODY */}          
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Clock className="w-4 h-4" />
              <span className="text-sm sm:text-base font-semibold">{formatTime(currentTime)}</span>
            </div>

            {!weather.isLoading && !weather.error && (
              <div className="flex items-center gap-1.5 bg-blue-50 px-2.5 sm:px-3 py-1.5 rounded-2xl">
                <span className="text-lg sm:text-xl">{getWeatherIcon(weather.weatherCode)}</span>
                <span className="text-sm sm:text-base font-semibold text-gray-900">
                  {weather.temperature}°C
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
