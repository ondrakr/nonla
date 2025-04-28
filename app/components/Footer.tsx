const Footer = () => {
  return (
    <footer className="relative">
      <div className="absolute top-0 left-0 right-0 h-24 z-10" style={{ background: 'linear-gradient(0deg, rgba(0, 0, 0, 0.00) 0%, #000 100%)' }}></div>
      <div className="flex w-full">
        <img src="/jidlo1.jpg" alt="Jídlo 1" className="w-1/4 h-48 object-cover" />
        <img src="/jidlo2.jpg" alt="Jídlo 2" className="w-1/4 h-48 object-cover" />
        <img src="/jidlo3.jpg" alt="Jídlo 3" className="w-1/4 h-48 object-cover" />
        <img src="/jidlo4.jpg" alt="Jídlo 4" className="w-1/4 h-48 object-cover" />
      </div>
      <div className="text-center text-black z-20 bg-orange py-2 relative">
        © {new Date().getFullYear()} <a href="https://ondrejkrejci.com" className="hover:underline">Ondřej Krejčí</a>
      </div>
    </footer>
  );
};

export default Footer; 