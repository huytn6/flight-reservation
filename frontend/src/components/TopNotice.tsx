export const TopNotice = () => {
  return (
    <div className="bg-[#2d3345] text-white text-xs py-1.5 px-4 font-normal tracking-tight">
      <div className="max-w-[1240px] mx-auto flex items-center justify-start gap-1">
        <span>Welcome to Expedia.com. Continue to the Vietnam site at</span>
        <a href="https://www.expedia.com.vn" className="underline hover:text-gray-200 transition-colors font-medium">
          Expedia.com.vn
        </a>
        <span>.</span>
      </div>
    </div>
  );
};
