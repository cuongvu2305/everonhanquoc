import { Button, Card, Col, Flex, Paragraph, Row, Space, Tag, Text, Title } from "../../app/globals.jsx";
import { Icon } from "../icons/Icon.jsx";

function fill(text, params) {
  return String(text ?? "").replace(/\{(\w+)\}/g, (_, key) => params[key] ?? "");
}

// "0900 000 001" / "024.3999.4555" -> "tel:0900000001"; keeps a leading "+" for international numbers.
export function toTelHref(phone) {
  const digits = String(phone ?? "").replace(/(?!^\+)[^\d]/g, "");
  return digits ? `tel:${digits}` : undefined;
}

function ShowroomActions({ showroom, dict, size }) {
  const telHref = toTelHref(showroom.phone);
  return (
    <Space wrap size={8} className="showroom-actions">
      {telHref ? (
        <Button type="primary" size={size} href={telHref} icon={<Icon name="PhoneCall" />} aria-label={fill(dict.showroomCallLabel, { name: showroom.name }) || undefined}>
          {dict.showroomCall}
        </Button>
      ) : null}
      {showroom.mapUrl ? (
        <Button size={size} href={showroom.mapUrl} target="_blank" rel="noopener noreferrer" icon={<Icon name="Navigation" />} aria-label={fill(dict.showroomDirectionsLabel, { name: showroom.name }) || undefined}>
          {dict.showroomDirections}
        </Button>
      ) : null}
    </Space>
  );
}

function ShowroomCard({ showroom, dict }) {
  return (
    <Card className="showroom-card">
      <Flex gap={14} align="flex-start">
        <span className="showroom-card-icon">
          <Icon name="MapPinned" size={26} />
        </span>
        <Flex vertical gap={6} className="showroom-card-body">
          <Flex wrap gap={8} align="center">
            <Title level={5} className="showroom-card-name">{showroom.name}</Title>
            {showroom.isSample ? <Tag className="showroom-sample-tag">{dict.showroomSample}</Tag> : null}
          </Flex>
          <Text className="showroom-line"><Icon name="MapPin" size={15} />{showroom.address}</Text>
          <Text className="showroom-line"><Icon name="Phone" size={15} />{showroom.phone}</Text>
          {showroom.openingHours ? <Text className="showroom-line"><Icon name="Clock" size={15} />{showroom.openingHours}</Text> : null}
          <ShowroomActions showroom={showroom} dict={dict} />
        </Flex>
      </Flex>
    </Card>
  );
}

/**
 * variant="cards": full section for the home page.
 * variant="compact": condensed list for the footer.
 */
export function ShowroomList({ showrooms = [], dict, variant = "cards" }) {
  if (showrooms.length === 0) return null;

  if (variant === "compact") {
    return (
      <ul className="showroom-compact-list">
        {showrooms.map((showroom) => (
          <li key={showroom.name} className="showroom-compact-item">
            <Text strong>
              {showroom.name}
              {showroom.isSample ? <Tag className="showroom-sample-tag">{dict.showroomSample}</Tag> : null}
            </Text>
            <Text className="showroom-line"><Icon name="MapPin" size={14} />{showroom.address}</Text>
            <Text className="showroom-line">
              <Icon name="Phone" size={14} />
              {toTelHref(showroom.phone) ? <a href={toTelHref(showroom.phone)}>{showroom.phone}</a> : showroom.phone}
              {showroom.openingHours ? ` · ${showroom.openingHours}` : null}
            </Text>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <section className="home-showrooms" aria-labelledby="home-showrooms-title">
      <Title level={3} id="home-showrooms-title" className="home-showrooms-title">{dict.showroomTitle}</Title>
      {dict.showroomDesc ? <Paragraph className="home-showrooms-desc">{dict.showroomDesc}</Paragraph> : null}
      <Row gutter={[16, 16]}>
        {showrooms.map((showroom) => (
          <Col xs={24} md={12} key={showroom.name}>
            <ShowroomCard showroom={showroom} dict={dict} />
          </Col>
        ))}
      </Row>
    </section>
  );
}
