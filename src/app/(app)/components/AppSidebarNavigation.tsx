import { SidebarItem } from '~/core/ui/Sidebar';
import NAVIGATION_CONFIG from '~/navigation.config';

function AppSidebarNavigation() {
  return (
    <div className={'flex flex-col space-y-1.5'}>
      {NAVIGATION_CONFIG.items.map((item) => {
        return (
          <SidebarItem
            key={item.path}
            end={item.end}
            path={item.path}
            Icon={item.Icon}
          >
            {item.label}
          </SidebarItem>
        );
      })}
    </div>
  );
}

export default AppSidebarNavigation;
