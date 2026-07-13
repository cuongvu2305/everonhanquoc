import { Card, Flex, Space, Text } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";

export function PolicyGrid({ policies, labelPolicy }) {
  return (
    <Flex className="policy-grid" gap={12} wrap="wrap">
      {policies.map((policy) => <Card key={policy}><Space><Icon name="ShieldCheck" /> <Text>{labelPolicy(policy)}</Text></Space></Card>)}
    </Flex>
  );
}
