'use client';

import Image from 'next/image';
import { useTranslations } from 'next-intl';
import GoogleMap from './GoogleMap';

const ContactInfo = () => {
  const t = useTranslations();

  const openingHours = [
    { day: t('openingHours.days.MONDAY'), hours: '10:00 - 21:00' },
    { day: t('openingHours.days.TUESDAY'), hours: '10:00 - 21:00' },
    { day: t('openingHours.days.WEDNESDAY'), hours: '10:00 - 21:00' },
    { day: t('openingHours.days.THURSDAY'), hours: '10:00 - 21:00' },
    { day: t('openingHours.days.FRIDAY'), hours: '10:00 - 22:00' },
    { day: t('openingHours.days.SATURDAY'), hours: '10:00 - 22:00' },
    { day: t('openingHours.days.SUNDAY'), hours: '10:00 - 21:00' },
  ];

  const getCurrentDayClosingTime = () => {
    const daysMap = [
      t('openingHours.days.SUNDAY'),
      t('openingHours.days.MONDAY'),
      t('openingHours.days.TUESDAY'),
      t('openingHours.days.WEDNESDAY'),
      t('openingHours.days.THURSDAY'),
      t('openingHours.days.FRIDAY'),
      t('openingHours.days.SATURDAY')
    ];
    const today = new Date().getDay();
    const currentDayName = daysMap[today];
    const currentDayHours = openingHours.find(item => item.day === currentDayName)?.hours;
    const closingTime = currentDayHours?.split(' - ')[1];
    return closingTime || '21:00';
  };

  return (
    <div className="bg-black text-white py-10 md:py-20 mb-12 md:mb-24">
      <div className="w-[min(1400px,100%)] mx-auto px-4 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8">
        {/* Levá část - Kontaktní informace */}
        <div className="space-y-12 md:space-y-20 text-center md:text-left">
          <div>
            <h2 className="text-orange text-3xl md:text-5xl mb-4 md:mb-6">{t('contact.callUs')}</h2>
            <a href={`tel:${t('phone')}`} className="text-white text-2xl md:text-3xl flex items-center gap-2 hover:text-orange transition cursor-pointer justify-center md:justify-start">
              <Image src="/Phone_icon.svg" alt="Telefon" width={40} height={40} />
              {t('phone')}
            </a>
          </div>

          <div>
            <h2 className="text-orange text-3xl md:text-5xl mb-4 md:mb-6">{t('contact.findUs')}</h2>
            <div className="flex items-start gap-2 justify-center md:justify-start">
              <Image src="/Place_icon.svg" alt="Lokace" width={40} height={40} className="mt-1" />
              <a 
                href="https://maps.app.goo.gl/r6Er6sZq91nrd4V39"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col gap-1 hover:text-orange transition"
              >
                <p className="text-lg md:text-xl">{t('contact.address.street')}</p>
                <p className="text-2xl md:text-3xl">{t('contact.address.city')}</p>
              </a>
            </div>
          </div>
        </div>


        {/* Pravá část - Otevírací doba */}
        <div className="text-center md:text-left">
          <h2 className="text-orange text-3xl md:text-5xl mb-2">{t('openingHours.title')}</h2>
          <div className="text-white mb-6 md:mb-10">
            <p className="text-xl md:text-2xl font-medium">{t('openingHours.openUntil')} {getCurrentDayClosingTime()}</p>
          </div>
          <div className="space-y-1 mx-auto md:mx-0">
            {openingHours.map((item, index) => (
              <div key={index} className="flex justify-between gap-4 md:gap-8 text-lg md:text-2xl">
                <span>{item.day}</span>
                <span>{item.hours}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="w-[min(1400px,100%)] mx-auto mt-24 px-4 md:px-12">
        <GoogleMap 
          mapSrc="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2559.921546258238!2d16.461705377109286!3d50.0877557134117!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470de36e2615063b%3A0xa964c33c6553e8ad!2zTsOzbiBMw6EgUmVzdGF1cmFjZQ!5e0!3m2!1scs!2scz!4v1745671692209!5m2!1scs!2scz" 
          height={300}
          className="w-full rounded-md"
        />
      </div>
    </div>
  );
};

export default ContactInfo; 