import { Button, Card, Col, Flex, Paragraph, Row, Text, Title } from "../../app/globals.jsx";
import { formatNewsDate, getLatestNews } from "../../lib/news.js";
import { navigateToTopPage } from "../../lib/runtime.js";
import { Icon } from "../icons/Icon.jsx";

export const HOME_NEWS_LIMIT = 4;

export function HomeLatestNews({ dict }) {
  const posts = getLatestNews(dict.newsPosts, HOME_NEWS_LIMIT);
  if (posts.length === 0) return null;

  return (
    <section className="home-news" aria-labelledby="home-news-title">
      <Flex className="home-news-header" align="center" justify="space-between" gap={12} wrap>
        <Title level={3} id="home-news-title" className="home-news-title">{dict.latestNewsTitle}</Title>
        <Button className="home-news-view-all" onClick={() => navigateToTopPage("news")}>
          {dict.viewAll}
          <Icon name="ArrowRight" size={16} />
        </Button>
      </Flex>
      <Row gutter={[16, 16]}>
        {posts.map((post) => (
          <Col xs={24} sm={12} xl={6} key={post.title}>
            <Card
              className="home-news-card"
              cover={post.image ? <img className="home-news-image" src={post.image} alt="" loading="lazy" /> : null}
            >
              {post.date ? (
                <Text className="home-news-date">
                  <Icon name="CalendarDays" size={14} />
                  <time dateTime={post.date}>{formatNewsDate(post.date, dict.dateLocale)}</time>
                </Text>
              ) : null}
              <Title level={5} className="home-news-card-title">{post.title}</Title>
              <Paragraph className="home-news-summary">{post.summary}</Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  );
}
