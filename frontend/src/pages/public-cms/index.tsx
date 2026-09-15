import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { $api } from '@/utils/$api';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Calendar } from 'lucide-react';
import { toast } from 'sonner';

export const PublicCmsPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      const item = await $api.get(`/contents/${slug}`);
      setArticle(item);
    } catch {
      // Fallback default content for terms/privacy if this page hasn't been published in CMS yet
      if (slug === 'terms') {
        setArticle({
          title: 'Điều Khoản Dịch Vụ Khách Hàng',
          slug: 'terms',
          body: `Chào mừng bạn đến với hệ thống đặt vé chuyến bay UITAir. Khi sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản đặt vé, thanh toán, hủy vé và hoàn tiền theo quy định của hãng hàng không vận chuyển. Tất cả giá vé hiển thị đã bao gồm thuế và phí cố định.`,
          updated_at: new Date().toISOString(),
        });
      } else if (slug === 'privacy') {
        setArticle({
          title: 'Chính Sách Bảo Mật Quyền Riêng Tư',
          slug: 'privacy',
          body: `UITAir cam kết bảo vệ thông tin cá nhân của khách hàng. Mọi thông tin như Họ tên, Email, Số điện thoại và Mã thông tin thanh toán đều được mã hóa bằng chuẩn SSL 256-bit cao nhất. Chúng tôi không chia sẻ dữ liệu cho bên thứ ba ngoại trừ các hãng bay trực tiếp xử lý chuyến bay của bạn.`,
          updated_at: new Date().toISOString(),
        });
      } else {
        toast.error('Không tìm thấy bài viết');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-xs text-slate-500 font-sans">Đang tải nội dung bài viết...</div>;
  }

  if (!article) {
    return (
      <div className="p-8 text-center space-y-4 font-sans">
        <p className="text-sm text-slate-600">Bài viết không tồn tại.</p>
        <Button size="sm" onClick={() => navigate('/')} className="text-xs font-normal">Trang chủ</Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-4 space-y-6 font-sans">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(-1)}
        className="text-xs text-slate-600 hover:text-slate-900 border-slate-200/80 cursor-pointer shadow-none"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" />
        Quay lại
      </Button>

      <Card className="bg-white border-0 shadow-none rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <FileText className="w-3.5 h-3.5 text-[#0065eb]" />
            <span>Mã bài viết: {article.slug}</span>
            <span>•</span>
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(article.updated_at || Date.now()).toLocaleDateString('vi-VN')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            {article.title}
          </h1>
        </div>

        <div className="text-sm text-slate-700 leading-relaxed space-y-4 whitespace-pre-wrap">
          {article.body}
        </div>
      </Card>
    </div>
  );
};
