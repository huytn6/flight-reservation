export const HeroBanner = () => {
  return (
    <div className="relative w-full h-[280px] sm:h-[340px] md:h-[380px] bg-cover bg-center overflow-hidden"
         style={{
           backgroundImage: `url('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80')`
         }}
    >
      {/* Soft gradient overlay for text readability */}
      <div className="absolute inset-0 bg-black/20" />

      {/* Hero Title */}
      <div className="relative z-10 max-w-[1240px] mx-auto px-4 h-full flex flex-col items-center pt-8 sm:pt-12 text-center">
        <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-serif tracking-wide font-normal drop-shadow-md">
          Nơi duy nhất bạn cần để chinh phục mọi điểm đến
        </h1>
      </div>
    </div>
  );
};
