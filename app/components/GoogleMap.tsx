'use client';

import { useCookieConsent } from '../context/CookieConsentContext';

interface GoogleMapProps {
  mapSrc: string;
  height?: number;
  className?: string;
}

const GoogleMap: React.FC<GoogleMapProps> = ({ 
  mapSrc, 
  height = 300, 
  className = '' 
}) => {
  const { cookieConsent } = useCookieConsent();

  // Zobrazit mapu pouze pokud uživatel udělil souhlas s marketingovými cookies
  const showMap = cookieConsent === 'all';

  if (!showMap) {
    return null;
  }

  return (
    <iframe 
      src={mapSrc}
      width="100%" 
      height={height} 
      style={{ border: 0 }} 
      allowFullScreen 
      loading="lazy" 
      referrerPolicy="no-referrer-when-downgrade"
      className={`w-full rounded-md ${className}`}
    />
  );
};

export default GoogleMap; 