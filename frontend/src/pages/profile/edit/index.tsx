import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/use-auth';
import { userService } from '@/services/user';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { X } from 'lucide-react';
import { toast } from 'sonner';

export const ProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobDay, setDobDay] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [gender, setGender] = useState<string>('Undisclosed');
  const [accessibility, setAccessibility] = useState('Not provided');
  const [saving, setSaving] = useState(false);

  const currentYear = new Date().getFullYear();
  const YEAR_OPTIONS = Array.from({ length: 100 }, (_, i) => String(currentYear - i));
  const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const daysInMonth = (month: string, year: string): number => {
    const m = parseInt(month, 10);
    if (!m) return 31;
    const y = parseInt(year, 10) || 2000; // fallback to a leap year so Feb 29 stays selectable
    return new Date(y, m, 0).getDate();
  };
  const DAY_OPTIONS = Array.from(
    { length: daysInMonth(dobMonth, dobYear) },
    (_, i) => String(i + 1).padStart(2, '0')
  );

  // Keep the selected day valid when month/year changes (e.g. 31 -> Feb)
  useEffect(() => {
    const maxDay = daysInMonth(dobMonth, dobYear);
    if (dobDay && parseInt(dobDay, 10) > maxDay) {
      setDobDay(String(maxDay).padStart(2, '0'));
    }
  }, [dobMonth, dobYear]);

  useEffect(() => {
    if (user?.full_name) {
      const parts = user.full_name.trim().split(' ');
      if (parts.length === 1) {
        setFirstName(parts[0]);
      } else if (parts.length === 2) {
        setFirstName(parts[0]);
        setLastName(parts[1]);
      } else {
        setFirstName(parts[0]);
        setMiddleName(parts.slice(1, -1).join(' '));
        setLastName(parts[parts.length - 1]);
      }
    }
    userService.getProfile().then((profile: any) => {
      if (profile.phone) setPhone(profile.phone);
      if (profile.date_of_birth) {
        const [y, m, d] = profile.date_of_birth.split('-');
        setDobYear(y || '');
        setDobMonth(m || '');
        setDobDay(d || '');
      }
    }).catch(() => {});
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const constructedFullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const updates: { full_name: string; phone: string; date_of_birth?: string } = {
      full_name: constructedFullName,
      phone,
    };
    if (dobYear && dobMonth && dobDay) {
      updates.date_of_birth = `${dobYear.padStart(4, '0')}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`;
    }

    try {
      await userService.updateProfile(updates);

      if (user) {
        setUser({ ...user, full_name: constructedFullName });
      }

      toast.success('Basic information updated successfully');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update basic information');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white font-sans text-slate-900 px-4 py-4 sm:py-6">

      {/* Centered Compact Expedia Edit Layout */}
      <div className="max-w-md sm:max-w-lg mx-auto pt-2 pb-10 flex flex-col gap-4">
        
        {/* Header Action Row with X Close Button Below Sticky Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Back to profile"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500">Edit Profile</span>
        </div>

        {/* Header Title & Description */}
        <div>
          <h1 className="text-lg font-semibold text-slate-900 mb-0.5">Basic information</h1>
          <p className="text-[11px] text-slate-500 leading-normal">
            Make sure this information matches your travel ID, like your passport or license.
          </p>
          <p className="text-[11px] text-red-500 font-medium mt-0.5">* Required</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          
          {/* Full Name Fields */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-slate-800">Full name</span>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">First name *</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                required
                className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Middle name</label>
              <Input
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle name"
                className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Last name *</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                required
                className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
              />
            </div>
          </div>

          {/* About You / Bio */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">About you</span>
            <p className="text-[10px] text-slate-400">Coming soon — not saved to your account yet.</p>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Help future hosts get to know you better. You can share your travel style, hobbies, interests, and more."
              className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] min-h-20 p-2.5 leading-normal"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Phone number</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 901 234 567"
              className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
            />
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Date of birth</span>
            <div className="grid grid-cols-3 gap-2.5">
              <Select value={dobDay} onValueChange={setDobDay}>
                <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DAY_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dobMonth} onValueChange={setDobMonth}>
                <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dobYear} onValueChange={setDobYear}>
                <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-800">Gender</span>
            <p className="text-[10px] text-slate-400">Coming soon — not saved to your account yet.</p>
            <div className="flex flex-col gap-2 text-xs text-slate-700">
              {['Female', 'Male', 'Unspecified (X)', 'Undisclosed (U)'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={opt}
                    checked={gender === opt}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-3.5 h-3.5 text-[#0065eb] focus:ring-[#0065eb] border-slate-300"
                  />
                  <span className="text-xs">{opt}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Needs */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Accessibility needs</span>
            <p className="text-[10px] text-slate-500 leading-normal mb-0.5">
              Help us build features that make travel accessible for all by sharing this information.
              Coming soon — not saved to your account yet.
            </p>
            <Select value={accessibility} onValueChange={setAccessibility}>
              <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                <SelectValue placeholder="Choose an option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not provided">Not provided</SelectItem>
                <SelectItem value="Wheelchair access">Wheelchair access required</SelectItem>
                <SelectItem value="Visual assistance">Visual assistance</SelectItem>
                <SelectItem value="Hearing assistance">Hearing assistance</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Centered Save Button */}
          <div className="flex justify-center mt-4">
            <Button
              type="submit"
              disabled={saving}
              className="bg-[#0065eb] hover:bg-blue-700 text-white rounded-full px-8 py-1.5 font-semibold text-xs h-9 cursor-pointer transition-colors shadow-none"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
