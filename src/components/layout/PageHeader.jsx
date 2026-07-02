function PageHeader({ icon, title, description, extra }) {
  return (
    <section className="page-hero">
      <div className="page-hero-icon"><Icon name={icon} size={24} /></div>
      <div>
        <Title level={2}>{title}</Title>
        <Paragraph>{description}</Paragraph>
        {extra ? <div className="page-hero-extra">{extra}</div> : null}
      </div>
    </section>
  );
}

