function PolicyGrid({ policies, labelPolicy }) {
  return (
    <section className="policy-grid">
      {policies.map((policy) => (
        <Card key={policy}>
          <Space><Icon name="CheckCircle2" /><Text strong>{labelPolicy(policy)}</Text></Space>
        </Card>
      ))}
    </section>
  );
}

