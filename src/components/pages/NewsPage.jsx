function NewsPage({ dict }) {
  return (
    <>
      <PageHeader icon="Newspaper" title={dict.newsTitle} description={dict.newsDesc} />
      <Row gutter={[16, 16]}>
        {dict.newsPosts.map(([title, text]) => (
          <Col xs={24} md={8} key={title}>
            <Card className="content-card">
              <Tag color="#16842c">{dict.advice}</Tag>
              <Title level={4}>{title}</Title>
              <Paragraph>{text}</Paragraph>
              <Button type="link">{dict.readMore}</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
