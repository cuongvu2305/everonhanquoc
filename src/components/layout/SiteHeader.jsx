function SiteHeader({
  dict,
  searchText,
  setSearchText,
  submitSearch,
  onOpenMobileNav,
}) {
  return (
    <Header className="site-header">
      <div className="site-header-bar">
        <Button
          className="mobile-nav-trigger"
          type="text"
          aria-label="Mở menu điều hướng"
          icon={<Icon name="Menu" size={20} />}
          onClick={onOpenMobileNav}
        />
        <Button className="brand" type="link" onClick={() => navigateToTopPage("home")} aria-label="Everon Hàn Quốc">
          <Image preview={false} src="/assets/logo-everon.png" alt="Everon Hàn Quốc" />
        </Button>
      </div>
      <Input
        className="search-box"
        allowClear
        maxLength={255}
        prefix={<Icon name="Search" size={16} />}
        placeholder={dict.searchPlaceholder}
        value={searchText}
        onChange={(event) => setSearchText(event.target.value.slice(0, 255))}
        onPressEnter={submitSearch}
      />
    </Header>
  );
}
