import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Lock, Sun, Sunset, Moon, Sunrise } from 'lucide-react';

export const FlightFilterSidebar: React.FC = () => {
  const [nonstopChecked, setNonstopChecked] = useState(false);
  const [vnAirChecked, setVnAirChecked] = useState(false);
  const [vjAirChecked, setVjAirChecked] = useState(false);
  const [basicEcoChecked, setBasicEcoChecked] = useState(false);

  // Time tile selection states
  const [selectedBaggage, setSelectedBaggage] = useState<string | null>(null);
  const [selectedDepTime, setSelectedDepTime] = useState<string | null>(null);
  const [selectedArrTime, setSelectedArrTime] = useState<string | null>(null);

  return (
    <aside className="w-full lg:w-64 flex flex-col gap-6 self-start shrink-0 text-[#141d38] font-sans select-none">
      
      {/* Title */}
      <h3 className="font-bold text-[#141d38] text-xl sm:text-2xl tracking-tight -mb-1">
        Filter by
      </h3>

      {/* Stops Filter Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141d38]">
          <span>Stops</span>
          <span>From</span>
        </div>
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              id="nonstop"
              checked={nonstopChecked}
              onCheckedChange={(c) => setNonstopChecked(!!c)}
            />
            <label htmlFor="nonstop" className="text-xs text-[#141d38] font-normal cursor-pointer">Nonstop (40)</label>
          </div>
          <span className="text-xs font-bold text-[#141d38]">$156</span>
        </div>
      </div>

      {/* Airlines Filter Section */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141d38]">
          <span>Airlines</span>
          <span>From</span>
        </div>
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                id="vnAir"
                checked={vnAirChecked}
                onCheckedChange={(c) => setVnAirChecked(!!c)}
              />
              <label htmlFor="vnAir" className="text-xs text-[#141d38] font-normal cursor-pointer">Vietnam Airlines (22)</label>
            </div>
            <span className="text-xs font-bold text-[#141d38]">$187</span>
          </div>

          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2 cursor-pointer">
              <Checkbox 
                id="vjAir"
                checked={vjAirChecked}
                onCheckedChange={(c) => setVjAirChecked(!!c)}
              />
              <label htmlFor="vjAir" className="text-xs text-[#141d38] font-normal cursor-pointer">Vietjet Air (18)</label>
            </div>
            <span className="text-xs font-bold text-[#141d38]">$156</span>
          </div>
        </div>
      </div>

      {/* Preferred Class Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#141d38]">
          <span>Preferred class</span>
          <span>From</span>
        </div>
        <div className="flex items-center justify-between py-0.5">
          <div className="flex items-center gap-2 cursor-pointer">
            <Checkbox 
              id="basicEco"
              checked={basicEcoChecked}
              onCheckedChange={(c) => setBasicEcoChecked(!!c)}
            />
            <label htmlFor="basicEco" className="text-xs text-[#141d38] font-normal cursor-pointer">Basic economy (40)</label>
          </div>
          <span className="text-xs font-bold text-[#141d38]">$156</span>
        </div>
        <span className="text-[11px] text-[#526077] font-normal ml-6 leading-tight">
          Fares may not include seats or bags
        </span>
      </div>

      {/* Travel and baggage Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm font-bold text-[#141d38]">Travel and baggage</span>
        <div className="w-[130px]">
          {/* Carry-on bag included */}
          <button 
            onClick={() => setSelectedBaggage(selectedBaggage === 'carry-on' ? null : 'carry-on')}
            className={`w-full rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 cursor-pointer text-center transition-all ${
              selectedBaggage === 'carry-on'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Lock className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-[11px] font-bold text-[#141d38] leading-tight">Carry-on bag included</span>
            <span className="text-[10px] text-[#526077] font-normal">$156</span>
          </button>
        </div>
      </div>

      {/* Departure time Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm font-bold text-[#141d38]">Departure time in Hanoi</span>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Morning */}
          <button 
            onClick={() => setSelectedDepTime(selectedDepTime === 'morning' ? null : 'morning')}
            className={`rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all ${
              selectedDepTime === 'morning'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Sun className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#141d38]">Morning</span>
            <span className="text-[10px] text-[#526077] font-normal">(5:00am - 11:59am)</span>
          </button>

          {/* Afternoon */}
          <button 
            onClick={() => setSelectedDepTime(selectedDepTime === 'afternoon' ? null : 'afternoon')}
            className={`rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all ${
              selectedDepTime === 'afternoon'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Sunset className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#141d38]">Afternoon</span>
            <span className="text-[10px] text-[#526077] font-normal">(12:00pm - 5:59pm)</span>
          </button>
        </div>

        {/* Evening (Starts row 2 left) */}
        <div className="w-1/2 pr-1">
          <button 
            onClick={() => setSelectedDepTime(selectedDepTime === 'evening' ? null : 'evening')}
            className={`w-full rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all ${
              selectedDepTime === 'evening'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Moon className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#141d38]">Evening</span>
            <span className="text-[10px] text-[#526077] font-normal">(6:00pm - 11:59pm)</span>
          </button>
        </div>
      </div>

      {/* Arrival time Section */}
      <div className="flex flex-col gap-2">
        <span className="text-xs sm:text-sm font-bold text-[#141d38]">Arrival time in Ho Chi Minh City</span>
        
        <div className="grid grid-cols-2 gap-2">
          {/* Early Morning */}
          <button 
            onClick={() => setSelectedArrTime(selectedArrTime === 'early-morning' ? null : 'early-morning')}
            className={`rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all ${
              selectedArrTime === 'early-morning'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Sunrise className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#141d38]">Early Morning</span>
            <span className="text-[10px] text-[#526077] font-normal">(12:00am - 4:59am)</span>
          </button>

          {/* Morning */}
          <button 
            onClick={() => setSelectedArrTime(selectedArrTime === 'morning' ? null : 'morning')}
            className={`rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all ${
              selectedArrTime === 'morning'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Sun className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#141d38]">Morning</span>
            <span className="text-[10px] text-[#526077] font-normal">(5:00am - 11:59am)</span>
          </button>

          {/* Afternoon */}
          <button 
            onClick={() => setSelectedArrTime(selectedArrTime === 'afternoon' ? null : 'afternoon')}
            className={`rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all ${
              selectedArrTime === 'afternoon'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Sunset className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#141d38]">Afternoon</span>
            <span className="text-[10px] text-[#526077] font-normal">(12:00pm - 5:59pm)</span>
          </button>

          {/* Evening */}
          <button 
            onClick={() => setSelectedArrTime(selectedArrTime === 'evening' ? null : 'evening')}
            className={`rounded-xl p-2.5 flex flex-col items-center justify-center gap-0.5 text-center cursor-pointer transition-all ${
              selectedArrTime === 'evening'
                ? 'bg-[#0065eb]/10 border-2 border-[#141d38] shadow-xs'
                : 'bg-transparent border border-slate-400 hover:border-slate-600'
            }`}
          >
            <Moon className="w-4 h-4 text-[#141d38] stroke-[1.5]" />
            <span className="text-xs font-bold text-[#141d38]">Evening</span>
            <span className="text-[10px] text-[#526077] font-normal">(6:00pm - 11:59pm)</span>
          </button>
        </div>
      </div>

    </aside>
  );
};
