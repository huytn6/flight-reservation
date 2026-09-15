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

const NATIONALITY_OPTIONS = [
  { code: 'VN', label: 'Việt Nam' },
  { code: 'US', label: 'Hoa Kỳ' },
  { code: 'JP', label: 'Nhật Bản' },
  { code: 'KR', label: 'Hàn Quốc' },
  { code: 'TH', label: 'Thái Lan' },
  { code: 'SG', label: 'Singapore' },
  { code: 'AU', label: 'Úc' },
  { code: 'GB', label: 'Vương Quốc Anh' },
  { code: 'FR', label: 'Pháp' },
  { code: 'DE', label: 'Đức' },
  { code: 'CA', label: 'Canada' },
  { code: 'CN', label: 'Trung Quốc' },
  { code: 'TW', label: 'Đài Loan' },
  { code: 'MY', label: 'Malaysia' },
  { code: 'ID', label: 'Indonesia' },
];

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
  const [passportNumber, setPassportNumber] = useState('');
  const [nationality, setNationality] = useState('VN');
  const [gender, setGender] = useState<string>('');
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
      if (profile.nationality) setNationality(profile.nationality);
      if (profile.gender) setGender(profile.gender);
      if (profile.bio) setBio(profile.bio);
      if (profile.special_assistance) setAccessibility(profile.special_assistance);
      if (profile.passport_number) setPassportNumber(profile.passport_number);
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
    if (!dobYear || !dobMonth || !dobDay) {
      toast.error('Vui lòng nhập đầy đủ ngày sinh');
      return;
    }
    if (!passportNumber.trim()) {
      toast.error('Vui lòng nhập Số Hộ chiếu / CCCD');
      return;
    }
    setSaving(true);
    const constructedFullName = [firstName, middleName, lastName].filter(Boolean).join(' ');
    const updates: {
      full_name: string;
      phone: string;
      nationality: string;
      gender: string;
      bio: string;
      special_assistance: string;
      date_of_birth: string;
      passport_number: string;
    } = {
      full_name: constructedFullName,
      phone,
      nationality,
      gender,
      bio,
      special_assistance: accessibility,
      date_of_birth: `${dobYear.padStart(4, '0')}-${dobMonth.padStart(2, '0')}-${dobDay.padStart(2, '0')}`,
      passport_number: passportNumber.trim(),
    };

    try {
      await userService.updateProfile(updates);

      if (user) {
        setUser({ ...user, full_name: constructedFullName, phone });
      }

      toast.success('Cập nhật thông tin cá nhân thành công');
      navigate('/profile');
    } catch (err: any) {
      toast.error(err.message || 'Cập nhật thông tin cá nhân thất bại');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white font-sans text-slate-900 px-4 py-4 sm:py-6">

      {/* Centered Compact UITAir Edit Layout */}
      <div className="max-w-md sm:max-w-lg mx-auto pt-2 pb-10 flex flex-col gap-4">
        
        {/* Header Action Row with X Close Button Below Sticky Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-1">
          <button
            type="button"
            onClick={() => navigate('/profile')}
            className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Về trang cá nhân"
          >
            <X className="w-4 h-4" />
          </button>
          <span className="text-xs font-semibold text-slate-500">Chỉnh sửa hồ sơ</span>
        </div>

        {/* Header Title & Description */}
        <div>
          <h1 className="text-lg font-semibold text-slate-900 mb-0.5">Thông tin cơ bản</h1>
          <p className="text-[11px] text-slate-500 leading-normal">
            Đảm bảo thông tin này khớp với giấy tờ tùy thân của bạn, như hộ chiếu hoặc CCCD.
          </p>
          <p className="text-[11px] text-red-500 font-medium mt-0.5">* Bắt buộc</p>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">

          {/* Full Name Fields */}
          <div className="flex flex-col gap-2.5">
            <span className="text-xs font-semibold text-slate-800">Họ và tên</span>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Tên *</label>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Tên"
                required
                className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Tên đệm</label>
              <Input
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Tên đệm"
                className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-500 block mb-0.5">Họ *</label>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Họ"
                required
                className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
              />
            </div>
          </div>

          {/* About You / Bio */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Giới thiệu về bạn</span>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Chia sẻ phong cách du lịch, sở thích, mối quan tâm của bạn và nhiều hơn nữa."
              className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] min-h-20 p-2.5 leading-normal"
            />
          </div>

          {/* Phone Number */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Số điện thoại</span>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+84 901 234 567"
              className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
            />
          </div>

          {/* Date of Birth */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Ngày sinh *</span>
            <div className="grid grid-cols-3 gap-2.5">
              <Select value={dobDay} onValueChange={setDobDay}>
                <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                  <SelectValue placeholder="Ngày" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {DAY_OPTIONS.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dobMonth} onValueChange={setDobMonth}>
                <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                  <SelectValue placeholder="Tháng" />
                </SelectTrigger>
                <SelectContent>
                  {MONTH_OPTIONS.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={dobYear} onValueChange={setDobYear}>
                <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                  <SelectValue placeholder="Năm" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {YEAR_OPTIONS.map((y) => (
                    <SelectItem key={y} value={y}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Passport / Citizen ID */}
          <div className="flex flex-col gap-1">
            <label htmlFor="passport-number" className="text-xs font-semibold text-slate-800">
              Số Hộ chiếu / CCCD *
            </label>
            <Input
              id="passport-number"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              placeholder="001200012345"
              required
              maxLength={20}
              className="text-xs rounded-lg border-slate-300 focus:border-[#0065eb] h-9"
            />
          </div>

          {/* Nationality */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Quốc tịch</span>
            <Select value={nationality} onValueChange={setNationality}>
              <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                <SelectValue placeholder="Chọn quốc tịch của bạn" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {NATIONALITY_OPTIONS.map((n) => (
                  <SelectItem key={n.code} value={n.code}>{n.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Gender */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-slate-800">Giới tính</span>
            <div className="flex flex-col gap-2 text-xs text-slate-700">
              {[
                { value: 'Female', label: 'Nữ' },
                { value: 'Male', label: 'Nam' },
                { value: 'Unspecified (X)', label: 'Không xác định (X)' },
                { value: 'Undisclosed (U)', label: 'Không tiết lộ (U)' },
              ].map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value={opt.value}
                    checked={gender === opt.value}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-3.5 h-3.5 text-[#0065eb] focus:ring-[#0065eb] border-slate-300"
                  />
                  <span className="text-xs">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Accessibility Needs */}
          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-slate-800">Nhu cầu hỗ trợ đặc biệt</span>
            <p className="text-[10px] text-slate-500 leading-normal mb-0.5">
              Giúp chúng tôi xây dựng các tính năng hỗ trợ du lịch cho mọi người bằng cách chia sẻ thông tin này.
            </p>
            <Select value={accessibility} onValueChange={setAccessibility}>
              <SelectTrigger className="text-xs rounded-lg border-slate-300 h-9">
                <SelectValue placeholder="Chọn một tùy chọn" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Not provided">Không cung cấp</SelectItem>
                <SelectItem value="Wheelchair access">Cần hỗ trợ xe lăn</SelectItem>
                <SelectItem value="Visual assistance">Hỗ trợ khiếm thị</SelectItem>
                <SelectItem value="Hearing assistance">Hỗ trợ khiếm thính</SelectItem>
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
              {saving ? 'Đang lưu...' : 'Lưu'}
            </Button>
          </div>

        </form>

      </div>
    </div>
  );
};
