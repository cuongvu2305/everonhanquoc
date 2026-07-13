import { Card, Col, Paragraph, Row, Title } from "../../app/globals.jsx";
import { PageHeader } from "../layout/PageHeader.jsx";

export function AboutPage({ dict }) {
  return (
    <>
      <PageHeader icon="Store" title={dict.aboutTitle} description={dict.aboutDesc} />
      <Row gutter={[16, 16]}>{dict.aboutCards.map(([title, text]) => <Col xs={24} md={8} key={title}><Card className="content-card"><Title level={4}>{title}</Title><Paragraph>{text}</Paragraph></Card></Col>)}</Row>
    </>
  );
}
