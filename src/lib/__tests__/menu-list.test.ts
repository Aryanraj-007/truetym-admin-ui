import { getMenuList } from '@/lib/menu-list'; // Replace with the actual file name

describe('getMenuList', () => {
  it('should return the correct menu structure', () => {
    const results = getMenuList('/dashboard');
    expect(results).toHaveLength(3);
    expect(results[0].groupLabel).toBe('');
    expect(results[1].groupLabel).toBe('Management');
    expect(results[2].groupLabel).toBe('Upskilling');
  });

  it('should set the correct active state for dashboard', () => {
    const result = getMenuList('/dashboard');
    const dashboardMenu = result[0].menus.find((menu) => menu.label === 'Dashboard');
    expect(dashboardMenu?.active).toBe(true);
  });

  it('should set the correct active state for payments', () => {
    const result = getMenuList('/payments');
    const paymentsMenu = result[0].menus.find((menu) => menu.label === 'Payments and finances');
    expect(paymentsMenu?.active).toBe(true);
  });

  it('should set the correct active state for insights', () => {
    const result = getMenuList('/insights');
    const insightsMenu = result[0].menus.find((menu) => menu.label === 'Insights and analytics');
    expect(insightsMenu?.active).toBe(true);
  });

  it('should set the correct active state for messages', () => {
    const result = getMenuList('/messages');
    const messagesMenu = result[0].menus.find((menu) => menu.label === 'Messages');
    expect(messagesMenu?.active).toBe(true);
  });

  it('should set the correct active state for user profile settings', () => {
    const result = getMenuList('/userprofilesettings');
    const userProfileMenu = result[0].menus.find(
      (menu) => menu.label === 'User profile and settings',
    );
    expect(userProfileMenu?.active).toBe(true);
  });

  it('should set the correct active state for appointments', () => {
    const result = getMenuList('/appointments');
    const appointmentsMenu = result[0].menus.find((menu) => menu.label === 'Appointments');
    expect(appointmentsMenu?.active).toBe(true);
  });

  it('should set the correct active state for leads', () => {
    const result = getMenuList('/leads');
    const leadsMenu = result[1].menus.find((menu) => menu.label === 'Leads');
    expect(leadsMenu?.active).toBe(true);
  });

  it('should set the correct active state for support', () => {
    const result = getMenuList('/support/faq');
    const supportMenu = result[2].menus.find((menu) => menu.label === 'Help and Support');
    expect(supportMenu?.active).toBe(true);
  });

  it('should set the correct active state for training', () => {
    const result = getMenuList('/training/courses');
    const trainingMenu = result[2].menus.find((menu) => menu.label === 'Training');
    expect(trainingMenu?.active).toBe(true);
  });

  it('should set all menus to inactive for an unmatched path', () => {
    const result = getMenuList('/unknown-path');
    const allMenus = result.flatMap((group) => group.menus);
    expect(allMenus.every((menu) => !menu.active)).toBe(true);
  });

  it('should return empty submenus for all menu items', () => {
    const result = getMenuList('/');
    const allSubmenus = result.flatMap((group) => group.menus.flatMap((menu) => menu.submenus));
    expect(allSubmenus).toEqual([]);
  });
});
