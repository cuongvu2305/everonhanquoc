import { Button, Collapse, Drawer, Menu, Skeleton, Space } from "../../app/globals.jsx";
import { BrandIcon } from "../icons/Icon.jsx";

export function MobileNavDrawer({
  open,
  onClose,
  navItems,
  menuItems,
  activePage,
  activeCategory,
  loading,
  dict,
  onNavigateTopPage,
  onNavigateCategory,
}) {
  const collapseItems = [
    {
      key: "product-categories",
      label: dict.productCategories,
      children: loading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : (
        <Menu
          mode="inline"
          selectedKeys={[activeCategory]}
          items={menuItems}
          onClick={({ key }) => onNavigateCategory(key)}
        />
      ),
    },
  ];

  return (
    <Drawer className="mobile-nav-drawer" placement="left" open={open} onClose={onClose} title="Điều hướng" width={320}>
      <Menu
        className="mobile-top-nav"
        mode="inline"
        selectedKeys={[activePage]}
        items={navItems}
        onClick={({ key }) => onNavigateTopPage(key)}
      />
      <Space className="mobile-quick-links" direction="vertical" size={10}>
        <Button href="https://www.facebook.com/everondongda/" target="_blank" rel="noopener noreferrer" icon={<BrandIcon name="facebook" />}>
          Facebook
        </Button>
        <Button href="https://www.youtube.com/channel/UCW8R-hC2rCWSm-T2fFyQcFw" target="_blank" rel="noopener noreferrer" icon={<BrandIcon name="youtube" />}>
          YouTube
        </Button>
      </Space>
      <Collapse className="mobile-category-collapse" items={collapseItems} defaultActiveKey={[]} />
    </Drawer>
  );
}
