import React, { useState } from 'react';
import { ChevronDown, AlertTriangle } from 'lucide-react';

export const TravelerInfoForm: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('US');
  const [phone, setPhone] = useState('');
  const [textAlerts, setTextAlerts] = useState(true);
  const [gender, setGender] = useState('Male');
  const [dobMonth, setDobMonth] = useState('Month');
  const [dobDay, setDobDay] = useState('Day');
  const [dobYear, setDobYear] = useState('Year');

  // Touched states
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Helper regex: English letters, spaces, hyphens only
  const isLettersOnly = (val: string) => /^[a-zA-Z\s-]+$/.test(val);
  const isValidEmail = (val: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  const isValidPhone = (val: string) => /^[0-9+\s()-]{7,15}$/.test(val);

  // Validation checks
  const getFirstNameError = () => {
    if (!touched.firstName && !firstName) return null;
    if (!firstName.trim()) return 'Please enter a first name.';
    if (!isLettersOnly(firstName) || firstName.trim().length < 2) {
      return 'Please enter a first name using letters only (minimum 2 characters).';
    }
    return null;
  };

  const getMiddleNameError = () => {
    if (!middleName) return null;
    if (!isLettersOnly(middleName)) {
      return 'Please enter a middle name using letters only.';
    }
    return null;
  };

  const getLastNameError = () => {
    if (!touched.lastName && !lastName) return null;
    if (!lastName.trim()) return 'Please enter a last name.';
    if (!isLettersOnly(lastName) || lastName.trim().length < 2) {
      return 'Please enter a last name using letters only (minimum 2 characters).';
    }
    return null;
  };

  const getEmailError = () => {
    if (!touched.email && !email) return null;
    if (!email.trim() || !isValidEmail(email)) {
      return 'Please enter a valid email address.';
    }
    return null;
  };

  const getPhoneError = () => {
    if (!touched.phone && !phone) return null;
    if (!phone.trim() || !isValidPhone(phone)) {
      return 'Please enter a valid phone number.';
    }
    return null;
  };

  const getDobError = () => {
    if (!touched.dob && dobMonth === 'Month' && dobDay === 'Day' && dobYear === 'Year') return null;
    if (dobMonth === 'Month' || dobDay === 'Day' || dobYear === 'Year') {
      return 'Please select a valid date of birth.';
    }
    return null;
  };

  const firstNameError = getFirstNameError();
  const middleNameError = getMiddleNameError();
  const lastNameError = getLastNameError();
  const emailError = getEmailError();
  const phoneError = getPhoneError();
  const dobError = getDobError();

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  return (
    <div className="bg-white rounded-md border border-slate-200 p-5 sm:p-6 font-sans flex flex-col gap-5 shadow-2xs">
      
      {/* Header */}
      <div className="flex items-baseline justify-between border-b border-slate-100 pb-3">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Who's traveling?
        </h2>
        <span className="text-xs text-red-600 font-medium">* Required</span>
      </div>

      <p className="text-xs text-slate-500 font-normal -mt-2">
        Traveler names must match government-issued photo ID exactly.
      </p>

      {/* Name fields row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-start">
        {/* First Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-800">
            First name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onBlur={() => handleBlur('firstName')}
            className={`w-full h-9 px-3 rounded-md border text-xs sm:text-sm text-slate-900 focus:outline-hidden transition-all ${
              firstNameError 
                ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20' 
                : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            }`}
          />
          {firstNameError && (
            <div className="flex items-start gap-1 text-[11px] text-red-600 font-semibold mt-0.5 leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <span>{firstNameError}</span>
            </div>
          )}
        </div>

        {/* Middle Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-800">Middle name</label>
          <input
            type="text"
            value={middleName}
            onChange={(e) => setMiddleName(e.target.value)}
            onBlur={() => handleBlur('middleName')}
            className={`w-full h-9 px-3 rounded-md border text-xs sm:text-sm text-slate-900 focus:outline-hidden transition-all ${
              middleNameError 
                ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20' 
                : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            }`}
          />
          {middleNameError && (
            <div className="flex items-start gap-1 text-[11px] text-red-600 font-semibold mt-0.5 leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <span>{middleNameError}</span>
            </div>
          )}
        </div>

        {/* Last Name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs font-bold text-slate-800">
            Last name <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onBlur={() => handleBlur('lastName')}
            className={`w-full h-9 px-3 rounded-md border text-xs sm:text-sm text-slate-900 focus:outline-hidden transition-all ${
              lastNameError 
                ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20' 
                : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
            }`}
          />
          {lastNameError && (
            <div className="flex items-start gap-1 text-[11px] text-red-600 font-semibold mt-0.5 leading-tight">
              <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
              <span>{lastNameError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Email field */}
      <div className="flex flex-col gap-1 max-w-md">
        <label className="text-xs font-bold text-slate-800">
          Email address <span className="text-red-600">*</span>
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => handleBlur('email')}
          placeholder="Email for confirmation"
          className={`w-full h-9 px-3 rounded-md border text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden transition-all ${
            emailError 
              ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20' 
              : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
          }`}
        />
        {emailError && (
          <div className="flex items-start gap-1 text-[11px] text-red-600 font-semibold mt-0.5 leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
            <span>{emailError}</span>
          </div>
        )}
      </div>

      {/* Country/Territory Code */}
      <div className="flex flex-col gap-1 max-w-sm">
        <label className="text-xs font-bold text-slate-800">
          Country/Territory Code <span className="text-red-600">*</span>
        </label>
        <div className="relative">
          <select
            value={countryCode}
            onChange={(e) => setCountryCode(e.target.value)}
            className="w-full h-9 px-3 pr-8 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-hidden focus:border-blue-600 focus:ring-1 focus:ring-blue-600 cursor-pointer transition-all"
          >
            <option value="US">United States of America (+1)</option>
            <option value="VN">Vietnam (+84)</option>
            <option value="GB">United Kingdom (+44)</option>
            <option value="CA">Canada (+1)</option>
            <option value="AU">Australia (+61)</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-600 absolute right-3 top-2.5 pointer-events-none stroke-[2.5]" />
        </div>
      </div>

      {/* Phone number */}
      <div className="flex flex-col gap-1 max-w-md">
        <label className="text-xs font-bold text-slate-800">
          Phone number <span className="text-red-600">*</span>
        </label>
        <input
          type="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          onBlur={() => handleBlur('phone')}
          className={`w-full h-9 px-3 rounded-md border text-xs sm:text-sm text-slate-900 focus:outline-hidden transition-all ${
            phoneError 
              ? 'border-red-600 focus:border-red-600 focus:ring-1 focus:ring-red-600 bg-red-50/20' 
              : 'border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600'
          }`}
        />
        {phoneError && (
          <div className="flex items-start gap-1 text-[11px] text-red-600 font-semibold mt-0.5 leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
            <span>{phoneError}</span>
          </div>
        )}
      </div>

      {/* SMS alert checkbox */}
      <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 font-normal select-none my-0.5">
        <input
          type="checkbox"
          checked={textAlerts}
          onChange={(e) => setTextAlerts(e.target.checked)}
          className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0065eb]"
        />
        <span>Receive text alerts about this trip. Message and data rates may apply.</span>
      </label>

      {/* Gender selection */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-800">
          Gender <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center gap-6 text-xs text-slate-800">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Male"
              checked={gender === 'Male'}
              onChange={() => setGender('Male')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0065eb]"
            />
            <span>Male</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="gender"
              value="Female"
              checked={gender === 'Female'}
              onChange={() => setGender('Female')}
              className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer accent-[#0065eb]"
            />
            <span>Female</span>
          </label>
        </div>
      </div>

      {/* Date of Birth dropdowns */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold text-slate-800">
          Date of birth <span className="text-red-600">*</span>
        </label>
        <div className="flex items-center gap-2.5 max-w-xs sm:max-w-sm">
          <div className="relative flex-1">
            <select
              value={dobMonth}
              onChange={(e) => { setDobMonth(e.target.value); handleBlur('dob'); }}
              className="w-full h-9 px-3 pr-7 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-hidden focus:border-blue-600 cursor-pointer"
            >
              <option disabled value="Month">Month</option>
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-3 pointer-events-none stroke-[2.5]" />
          </div>

          <div className="relative flex-1">
            <select
              value={dobDay}
              onChange={(e) => { setDobDay(e.target.value); handleBlur('dob'); }}
              className="w-full h-9 px-3 pr-7 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-hidden focus:border-blue-600 cursor-pointer"
            >
              <option disabled value="Day">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-3 pointer-events-none stroke-[2.5]" />
          </div>

          <div className="relative flex-1">
            <select
              value={dobYear}
              onChange={(e) => { setDobYear(e.target.value); handleBlur('dob'); }}
              className="w-full h-9 px-3 pr-7 rounded-md border border-slate-300 text-xs sm:text-sm text-slate-900 bg-white appearance-none focus:outline-hidden focus:border-blue-600 cursor-pointer"
            >
              <option disabled value="Year">Year</option>
              {Array.from({ length: 80 }, (_, i) => 2024 - i).map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-3 pointer-events-none stroke-[2.5]" />
          </div>
        </div>
        {dobError && (
          <div className="flex items-start gap-1 text-[11px] text-red-600 font-semibold mt-0.5 leading-tight">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
            <span>{dobError}</span>
          </div>
        )}
      </div>

      {/* Extra details expandable link */}
      <button className="text-xs text-[#0065eb] hover:underline font-medium text-left w-fit mt-1 cursor-pointer">
        Frequent flyer, TSA PreCheck, redress, special assistance and more ▾
      </button>

    </div>
  );
};
