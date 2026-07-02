function CheckoutPage({ products, langTools }) {
  const { dict, labelProduct } = langTools;
  const cartItems = products.slice(0, 3).map((product, index) => ({ ...product, quantity: index === 0 ? 1 : 2 }));
  const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const shippingFee = subtotal > 3000000 ? 0 : 80000;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee - discount;

  return (
    <>
      <PageHeader icon="CreditCard" title={dict.checkoutTitle} description={dict.checkoutDesc} />
      <Steps className="checkout-steps" current={1} items={[{ title: dict.cart }, { title: dict.information }, { title: dict.confirm }]} />
      <Row gutter={[18, 18]} className="checkout-grid">
        <Col xs={24} lg={15}>
          <Card className="checkout-card" title={dict.shippingInfo}>
            <Form layout="vertical">
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.recipientName}><Input placeholder={dict.recipientPlaceholder} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.phone}><Input placeholder={dict.phonePlaceholder} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.shippingAddress}><Input placeholder={dict.addressPlaceholder} /></Form.Item>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.province}><Select defaultValue="ha-noi" options={[{ value: "ha-noi", label: dict.all === "All" ? "Hanoi" : "Hà Nội" }, { value: "hcm", label: dict.all === "All" ? "Ho Chi Minh City" : "TP. Hồ Chí Minh" }, { value: "other", label: langTools.dict.all === "All" ? "Other province" : "Tỉnh/Thành khác" }]} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.deliveryTime}><Select defaultValue="today" options={[{ value: "today", label: dict.today }, { value: "tomorrow", label: dict.tomorrow }, { value: "schedule", label: dict.schedule }]} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.note}><Input.TextArea rows={4} placeholder={dict.notePlaceholder} /></Form.Item>
            </Form>
          </Card>
          <Card className="checkout-card" title={dict.paymentMethod}>
            <Radio.Group defaultValue="cod" className="payment-options"><Radio value="cod">{dict.cod}</Radio><Radio value="transfer">{dict.transfer}</Radio><Radio value="store">{dict.storePayment}</Radio></Radio.Group>
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card className="order-summary" title={dict.orderSummary}>
            <List itemLayout="horizontal" dataSource={cartItems} renderItem={(item) => <List.Item><List.Item.Meta avatar={<img className="cart-thumb" src={item.image} alt="" />} title={labelProduct(item)} description={`${dict.quantity}: ${item.quantity}`} /><Text strong>{formatPrice(parsePrice(item.price) * item.quantity)}</Text></List.Item>} />
            <Divider />
            <div className="summary-row"><Text>{dict.subtotal}</Text><Text>{formatPrice(subtotal)}</Text></div>
            <div className="summary-row"><Text>{dict.shippingFee}</Text><Text>{shippingFee === 0 ? dict.freeShipping : formatPrice(shippingFee)}</Text></div>
            <div className="summary-row"><Text>{dict.discount}</Text><Text>-{formatPrice(discount)}</Text></div>
            <div className="summary-row total-row"><Text strong>{dict.total}</Text><Text strong>{formatPrice(total)}</Text></div>
            <Button block type="primary" size="large" icon={<Icon name="CheckCircle2" />}>{dict.placeOrder}</Button>
            <Button block href="#retail" className="continue-shopping">{dict.continueShopping}</Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}

