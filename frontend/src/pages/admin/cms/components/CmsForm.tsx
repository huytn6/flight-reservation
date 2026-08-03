import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';

export interface CmsFormData {
  key: string;
  title: string;
  body: string;
  is_published: boolean;
}

interface CmsFormProps {
  formData: CmsFormData;
  setFormData: React.Dispatch<React.SetStateAction<CmsFormData>>;
  mode: 'create' | 'edit';
}

export const CmsForm: React.FC<CmsFormProps> = ({
  formData,
  setFormData,
  mode,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="space-y-2">
          <Label htmlFor="key" className="text-xs font-semibold text-slate-700">
            Content Slug / Key <span className="text-red-500">*</span>
          </Label>
          <Input
            id="key"
            name="key"
            value={formData.key}
            onChange={handleChange}
            placeholder="e.g. terms-and-conditions, privacy-policy, banner-home"
            required
            disabled={mode === 'edit'}
            className="font-mono text-sm bg-white border-slate-200"
          />
          <p className="text-[11px] text-slate-400">Unique identifier key used in frontend queries.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title" className="text-xs font-semibold text-slate-700">
            Article Title <span className="text-red-500">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Terms of Service & Flight Booking Agreement"
            required
            className="text-sm bg-white border-slate-200"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="body" className="text-xs font-semibold text-slate-700">
          Content Body (Markdown / HTML) <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="body"
          name="body"
          rows={10}
          value={formData.body}
          onChange={handleChange}
          placeholder="Enter article content, announcements, or terms description..."
          required
          className="text-sm bg-white border-slate-200 font-mono"
        />
      </div>

      <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <div>
          <p className="text-xs font-bold text-slate-900">Publish Article</p>
          <p className="text-[11px] text-slate-500">Make this content publicly visible on the storefront.</p>
        </div>
        <Switch
          checked={formData.is_published}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, is_published: checked }))}
        />
      </div>
    </div>
  );
};
