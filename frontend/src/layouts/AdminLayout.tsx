import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Plane,
  Building2,
  PlaneTakeoff,
  CreditCard,
  ArrowLeft,
  LogOut,
  User as UserIcon,
  Search,
  Plus,
  ExternalLink,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '@/store/use-auth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from '@/components/ui/sidebar';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const userRole = user?.role || 'STAFF';

  // Grouped Nav Items for Enterprise SaaS / ERP Hierarchy with Role Permissions
  const navGroups = [
    {
      group: 'THỐNG KÊ & TỔNG QUAN',
      items: [
        { path: '/admin', label: 'Tổng quan Dashboard', icon: LayoutDashboard, badge: null, roles: ['ADMIN', 'STAFF'] },
      ],
    },
    {
      group: 'CHUYẾN BAY & ĐỘI BAY',
      items: [
        { path: '/admin/flights', label: 'Quản lý Chuyến bay', icon: Plane, badge: null, roles: ['ADMIN', 'STAFF'] },
        { path: '/admin/airports', label: 'Danh mục Sân bay', icon: Building2, badge: null, roles: ['ADMIN'] },
        { path: '/admin/airlines', label: 'Danh mục Hãng bay', icon: PlaneTakeoff, badge: null, roles: ['ADMIN'] },
        { path: '/admin/aircraft', label: 'Đội tàu bay', icon: Plane, badge: null, roles: ['ADMIN'] },
      ],
    },
    {
      group: 'KINH DOANH & DOANH THU',
      items: [
        { path: '/admin/bookings', label: 'Quản lý Đặt vé', icon: CreditCard, badge: null, roles: ['ADMIN', 'STAFF'] },
      ],
    },
  ];

  const visibleNavGroups = navGroups
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => item.roles.includes(userRole as any)),
    }))
    .filter((g) => g.items.length > 0);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const allNavItems = visibleNavGroups.flatMap(g => g.items);
  const currentNav = allNavItems.find((item) => item.path === location.pathname) || allNavItems[0];

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex w-full font-sans bg-slate-100/60">
        
        {/* Official shadcn/ui Sidebar */}
        <Sidebar collapsible="icon" className="bg-white text-slate-800 border-r border-slate-200/80">
          
          {/* Top Brand Header */}
          <SidebarHeader className="p-3 border-b border-slate-100 bg-white group-data-[collapsible=icon]:p-2 group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-2.5 px-1 group-data-[collapsible=icon]:px-0 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
              <div className="w-8 h-8 bg-[#0065eb] rounded-lg flex items-center justify-center font-bold text-white shrink-0">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-xs font-semibold text-slate-900 tracking-tight leading-none">
                  {userRole === 'ADMIN' ? 'Quản Trị Hệ Thống' : 'Cổng Vận Hành Nhân Viên'}
                </span>
                <span className="text-[10px] text-slate-500 font-normal mt-1">Hệ thống quản lý đặt vé</span>
              </div>
            </div>
          </SidebarHeader>

          {/* Grouped Sidebar Navigation Content */}
          <SidebarContent className="p-2 bg-white group-data-[collapsible=icon]:px-1 group-data-[collapsible=icon]:py-2">
            {visibleNavGroups.map((group, idx) => (
              <SidebarGroup key={idx} className="py-1 group-data-[collapsible=icon]:py-0.5">
                <SidebarGroupLabel className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase px-2 mb-1 group-data-[collapsible=icon]:hidden">
                  {group.group}
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="group-data-[collapsible=icon]:items-center">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const isActive = location.pathname === item.path;
                      return (
                        <SidebarMenuItem key={item.path} className="group-data-[collapsible=icon]:flex group-data-[collapsible=icon]:justify-center">
                          <SidebarMenuButton
                            asChild
                            isActive={isActive}
                            tooltip={item.label}
                            className={`h-9 px-2.5 rounded-lg text-xs transition-colors cursor-pointer group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center ${
                              isActive
                                ? 'bg-blue-50 text-[#0065eb] font-semibold shadow-none'
                                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 font-normal'
                            }`}
                          >
                            <Link to={item.path} className="flex items-center gap-2.5 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:w-full">
                              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#0065eb]' : 'text-slate-500'}`} />
                              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                            </Link>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          {/* Bottom User Panel with Dropdown Menu (Flat Clean Style without Border & Shadow) */}
          <SidebarFooter className="p-2.5 bg-white border-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer outline-none border-0 shadow-none group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:bg-transparent"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar className="w-8 h-8 bg-[#0065eb] text-white font-bold text-xs shrink-0">
                      <AvatarFallback className="bg-[#0065eb] text-white text-xs">
                        {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left truncate group-data-[collapsible=icon]:hidden">
                      <span className="text-xs font-semibold text-slate-900 truncate leading-tight">
                        {user?.full_name || 'User'}
                      </span>
                      <span className="text-[9px] text-[#0065eb] font-mono font-bold uppercase mt-0.5">
                        {userRole === 'ADMIN' ? 'SYS_ADMIN' : 'STAFF_OPERATOR'}
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0 group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56 bg-white rounded-xl border-0 shadow-none p-1.5 font-sans z-50">
                <DropdownMenuLabel className="px-2 py-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-bold text-slate-900 truncate">{user?.full_name || 'User'}</span>
                    <span className="text-[11px] text-slate-500 font-normal truncate">{user?.email}</span>
                    <span className="inline-block mt-1 text-[9px] font-bold text-[#0065eb] bg-blue-50 px-2 py-0.5 rounded-md w-max uppercase font-mono">
                      {userRole === 'ADMIN' ? 'Administrator' : 'Staff Operator'}
                    </span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem 
                  onClick={() => navigate('/profile')} 
                  className="text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-2 py-2 flex items-center gap-2 cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  <span>Hồ sơ cá nhân</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => navigate('/')} 
                  className="text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-lg px-2 py-2 flex items-center gap-2 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>Quay lại trang khách hàng</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-100 my-1" />
                <DropdownMenuItem 
                  onClick={handleLogout} 
                  className="text-xs text-rose-600 hover:bg-rose-50 rounded-lg px-2 py-2 flex items-center gap-2 cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        {/* Main Content Area via SidebarInset */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 bg-slate-50/50">
          
          {/* Top Sticky Header */}
          <header className="h-14 bg-white border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="text-slate-700 hover:bg-slate-100 cursor-pointer" />
              <Separator orientation="vertical" className="h-4 bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-400 font-medium">Trang Quản Trị</span>
                <span className="text-slate-300">/</span>
                <span className="font-semibold text-slate-900">{currentNav.label}</span>
              </div>
            </div>

            {/* Center Global Search */}
            <div className="hidden md:flex items-center relative max-w-xs w-full">
              <Search className="w-3.5 h-3.5 absolute left-2.5 text-slate-400" />
              <Input
                type="text"
                placeholder="Tìm chuyến bay, mã đặt chỗ, người dùng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-12 h-8 text-xs bg-slate-50 border-slate-200 focus:bg-white rounded-lg focus:border-[#0065eb] transition-all"
              />
              <span className="absolute right-2 text-[10px] font-mono text-slate-400 bg-slate-200/60 px-1 rounded">
                ⌘K
              </span>
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" className="bg-[#0065eb] hover:bg-blue-700 text-white h-8 text-xs font-medium px-3 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs">
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tạo Nhanh</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white rounded-xl border border-slate-200 shadow-md p-1 text-xs">
                  <DropdownMenuItem onClick={() => navigate('/admin/flights/new')} className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <Plane className="w-3.5 h-3.5 mr-2 text-[#0065eb]" />
                    <span>Tạo chuyến bay mới</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/staff/new')} className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <UserCheck className="w-3.5 h-3.5 mr-2 text-blue-600" />
                    <span>Thêm tài khoản nhân viên</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/admin/bookings')} className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <CreditCard className="w-3.5 h-3.5 mr-2 text-purple-600" />
                    <span>Xem danh sách đặt vé</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate('/')}
                      className="w-8 h-8 rounded-lg border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-xs bg-slate-900 text-white">
                    Xem giao diện khách hàng
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 p-1 px-2 rounded-lg hover:bg-slate-100 cursor-pointer">
                    <Avatar className="w-6 h-6 bg-[#0065eb] text-white font-bold text-[10px]">
                      <AvatarFallback className="bg-[#0065eb] text-white text-[10px]">
                        {user?.full_name?.charAt(0).toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left leading-none hidden md:flex">
                      <span className="text-xs font-semibold text-slate-900">{user?.full_name}</span>
                      <span className="text-[9px] text-slate-500 uppercase">{user?.role}</span>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52 bg-white rounded-xl border border-slate-200 shadow-md p-1 text-xs">
                  <DropdownMenuLabel className="text-xs font-semibold text-slate-900 px-2.5 py-1.5">
                    Tài Khoản Quản Trị
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <UserIcon className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    <span>Hồ sơ cá nhân</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/')} className="px-2.5 py-1.5 rounded-lg text-xs cursor-pointer">
                    <ArrowLeft className="w-3.5 h-3.5 mr-2 text-slate-500" />
                    <span>Trang đặt vé khách hàng</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-slate-100" />
                  <DropdownMenuItem onClick={handleLogout} className="px-2.5 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 cursor-pointer">
                    <LogOut className="w-3.5 h-3.5 mr-2 text-red-600" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Dynamic Outlet Render Area */}
          <main className="flex-1 p-4 sm:p-6 bg-slate-50/50 w-full min-w-0">
            <Outlet />
          </main>

        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};
