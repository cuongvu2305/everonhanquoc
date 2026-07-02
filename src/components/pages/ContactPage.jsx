function ContactPage({ dict }) {
  return (
    <>
      <PageHeader icon="PhoneCall" title={dict.contactTitle} description={dict.contactDesc} />
      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}><Card className="content-card"><Title level={4}>{dict.storeInfo}</Title><Space direction="vertical" size={12}><Text><Icon name="MapPin" /> {dict.address}</Text><Text><Icon name="Phone" /> {dict.hotline}</Text><Text><Icon name="Clock" /> {dict.openingHours}</Text></Space></Card></Col>
        <Col xs={24} md={10}><Card className="content-card contact-card"><Title level={4}>{dict.requestTitle}</Title><Space direction="vertical" size={12}><Input placeholder={dict.fullName} /><Input placeholder={dict.phone} /><Input.TextArea rows={4} placeholder={dict.consultingNeed} /><Button type="primary" icon={<Icon name="Send" />}>{dict.sendRequest}</Button></Space></Card></Col>
      </Row>
    </>
  );
}

