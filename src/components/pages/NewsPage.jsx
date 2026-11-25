import { Button, Card, Col, Paragraph, Row, Tag, Title } from "../../app/globals.jsx";
import { sortNewsByDate } from "../../lib/news.js";
import { PageHeader } from "../layout/PageHeader.jsx";

export function NewsPage({ dict }) {
  return (
    <>
      <PageHeader icon="Newspaper" title={dict.newsTitle} description={dict.newsDesc} />
      <Row gutter={[16, 16]}>
        {sortNewsByDate(dict.newsPosts).map(({ title, summary }) => (
          <Col xs={24} md={8} key={title}>
            <Card className="content-card">
              <Tag color="#16842c">{dict.advice}</Tag>
              <Title level={4}>{title}</Title>
              <Paragraph>{summary}</Paragraph>
              <Button type="link">{dict.readMore}</Button>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
}
