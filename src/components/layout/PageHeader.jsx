import { Card, Flex, Paragraph, Title } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";

export function PageHeader({ icon, title, description, extra }) {
  return (
    <Card className="page-hero">
      <Flex className="page-hero-body" align="flex-start" gap={16}>
        <Flex className="page-hero-icon" align="center" justify="center">
          <Icon name={icon} size={24} />
        </Flex>
        <Flex className="page-hero-copy" vertical>
          <Title level={2}>{title}</Title>
          <Paragraph>{description}</Paragraph>
          {extra ? <Flex className="page-hero-extra" wrap="wrap">{extra}</Flex> : null}
        </Flex>
      </Flex>
    </Card>
  );
}
