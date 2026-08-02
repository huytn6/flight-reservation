import React, { useState } from 'react';
import { ChevronDown, Lock } from 'lucide-react';

export const PaymentForm: React.FC = () => {
  const [nameOnCard, setNameOnCard] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expMonth, setExpMonth] = useState('Month');
  const [expYear, setExpYear] = useState('Year');
  const [securityCode, setSecurityCode] = useState('');
  const [country, setCountry] = useState('United States of America');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Booking submitted successfully!');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-md border border-slate-200 p-5 sm:p-7 font-sans flex flex-col gap-4 shadow-2xs">
      
      {/* Header & Card Logos */}
      <div className="flex flex-col gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          How would you like to pay?
        </h2>

        {/* Mastercard & Visa Logos */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-5 rounded border border-slate-200 bg-white flex items-center justify-center p-0.5 shadow-2xs">
            <div className="flex items-center -space-x-1">
              <div className="w-3 h-3 rounded-full bg-[#eb001b]" />
              <div className="w-3 h-3 rounded-full bg-[#ff5f00]/90" />
            </div>
          </div>
          <div className="px-2 py-0.5 border border-slate-200 rounded bg-white text-[11px] font-extrabold text-[#1a1f71] italic tracking-tight shadow-2xs">
            VISA
          </div>
        </div>
      </div>

      {/* Name on card */}
      <div className="flex flex-col gap-1 max-w-md mt-1">
        <label className="text-xs font-bold text-slate-800">
          Name on Card <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={nameOnCard}
          onChange={(e) => setNameOnCard(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          required
        />
      </div>

      {/* Card number */}
      <div className="flex flex-col gap-1 max-w-xs">
        <label className="text-xs font-bold text-slate-800">
          Debit/Credit card number <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value)}
          placeholder="0000 0000 0000 0000"
          className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          required
        />
      </div>

      {/* Expiration date */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-bold text-slate-800">
          Expiration date <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative w-28">
            <select
              value={expMonth}
              onChange={(e) => setExpMonth(e.target.value)}
              className="w-full h-9 px-3 pr-7 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-hidden focus:border-blue-600 cursor-pointer"
            >
              <option disabled value="Month">Month</option>
              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-3 pointer-events-none stroke-[2.5]" />
          </div>

          <div className="relative w-28">
            <select
              value={expYear}
              onChange={(e) => setExpYear(e.target.value)}
              className="w-full h-9 px-3 pr-7 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-hidden focus:border-blue-600 cursor-pointer"
            >
              <option disabled value="Year">Year</option>
              {Array.from({ length: 15 }, (_, i) => 2026 + i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-3 pointer-events-none stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Security code */}
      <div className="flex flex-col gap-1 w-24">
        <label className="text-xs font-bold text-slate-800">
          Security code <span className="text-red-600">*</span>
        </label>
        <input
          type="password"
          maxLength={4}
          value={securityCode}
          onChange={(e) => setSecurityCode(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          required
        />
      </div>

      {/* Divider */}
      <div className="h-[1px] bg-slate-200/90 w-full my-2" />

      {/* Country / Territory */}
      <div className="flex flex-col gap-1 max-w-sm">
        <label className="text-xs font-bold text-slate-800">
          Country/Territory <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full h-9 px-3 pr-8 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-[#f4f4f4]/70 appearance-none focus:outline-hidden focus:border-blue-600 cursor-pointer"
          >
            <option value="United States of America">United States of America</option>
            <option value="Vietnam">Vietnam</option>
            <option value="United Kingdom">United Kingdom</option>
            <option value="Canada">Canada</option>
            <option value="Australia">Australia</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 top-2.5 pointer-events-none stroke-[2.5]" />
        </div>
      </div>

      {/* Billing Address 1 */}
      <div className="flex flex-col gap-1 max-w-md">
        <label className="text-xs font-bold text-slate-800">
          Billing address 1 <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={address1}
          onChange={(e) => setAddress1(e.target.value)}
          placeholder="(ex. 123 Main)"
          className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          required
        />
      </div>

      {/* Billing Address 2 */}
      <div className="flex flex-col gap-1 max-w-md">
        <label className="text-xs font-bold text-slate-800">Billing address 2</label>
        <input
          type="text"
          value={address2}
          onChange={(e) => setAddress2(e.target.value)}
          placeholder="(ex. Suite 400, Apt. 4B)"
          className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
        />
      </div>

      {/* City */}
      <div className="flex flex-col gap-1 max-w-xs">
        <label className="text-xs font-bold text-slate-800">
          City <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          required
        />
      </div>

      {/* State */}
      <div className="flex flex-col gap-1 w-28">
        <label className="text-xs font-bold text-slate-800">
          State <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full h-9 px-3 pr-7 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-hidden focus:border-blue-600 cursor-pointer"
          >
            <option value="">Select</option>
            <option value="CA">CA</option>
            <option value="NY">NY</option>
            <option value="TX">TX</option>
            <option value="FL">FL</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-3 pointer-events-none stroke-[2.5]" />
        </div>
      </div>

      {/* ZIP Code */}
      <div className="flex flex-col gap-1 w-28">
        <label className="text-xs font-bold text-slate-800">
          ZIP code <span className="text-red-600">*</span>
        </label>
        <input
          type="text"
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value)}
          className="w-full h-9 px-3 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all"
          required
        />
      </div>

      {/* Submit Button */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3">
        <button
          type="submit"
          className="w-full sm:w-auto bg-[#0065eb] hover:bg-blue-700 text-white font-bold text-sm rounded-md py-3 px-8 transition-colors cursor-pointer shadow-sm flex items-center justify-center gap-2 self-start"
        >
          <span>Complete Booking</span>
        </button>

        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-normal mt-1">
          <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>We use secure transmission and encrypted storage to protect your personal information.</span>
        </div>
      </div>

    </form>
  );
};
