function PageHeader({ icon, title, description, extra }) {
  return (
    <Card className="page-hero">
      <Flex align="flex-start" gap={16}>
        <Flex className="page-hero-icon" align="center" justify="center"><Icon name={icon} size={24} /></Flex>
        <Flex vertical flex={1}>
          <Title level={2}>{title}</Title>
          <Paragraph>{description}</Paragraph>
          {extra ? <Flex className="page-hero-extra" wrap="wrap">{extra}</Flex> : null}
        </Flex>
      </Flex>
    </Card>
  );
}
