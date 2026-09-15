export const TopNotice = () => {
  return (
    <div className="bg-[#2d3345] text-white text-xs py-1.5 px-4 font-normal tracking-tight">
      <div className="max-w-[1240px] mx-auto flex items-center justify-start gap-1">
        <span>Chào mừng đến với UITAir. Tiếp tục đến trang đặt vé máy bay tại</span>
        <a href="/" className="underline hover:text-gray-200 transition-colors font-medium">
          UITAir
        </a>
        <span>.</span>
      </div>
    </div>
  );
};
