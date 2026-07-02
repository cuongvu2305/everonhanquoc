function PolicyGrid({ policies, labelPolicy }) {
  return (
    <Flex className="policy-grid" gap={12} wrap="wrap">
      {policies.map((policy) => <Card key={policy}><Space><Icon name="ShieldCheck" /> <Text>{labelPolicy(policy)}</Text></Space></Card>)}
    </Flex>
  );
}
