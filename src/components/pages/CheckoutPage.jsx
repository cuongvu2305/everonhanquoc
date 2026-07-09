function CheckoutPage({ cartItems, langTools, onRemoveCartItem, onUpdateCartQuantity }) {
  const { dict, labelProduct } = langTools;
  const [form] = Form.useForm();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [orderResult, setOrderResult] = useState(null);
  const subtotal = cartItems.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  const shippingFee = subtotal > 3000000 ? 0 : 80000;
  const discount = Math.round(subtotal * 0.05);
  const total = subtotal + shippingFee - discount;
  const paymentMessages = {
    cod: "Đơn hàng đã được ghi nhận. Nhân viên sẽ gọi xác nhận và quý khách thanh toán khi nhận hàng.",
    transfer: "Đơn hàng đã được ghi nhận. Nhân viên sẽ gửi thông tin chuyển khoản và xác nhận sau khi nhận thanh toán.",
    store: "Đơn hàng đã được giữ tại cửa hàng. Quý khách có thể đến thanh toán và nhận tư vấn trực tiếp.",
  };
  const submitOrder = async () => {
    if (cartItems.length === 0) {
      setOrderResult(null);
      message.error(dict.emptyCart);
      return;
    }
    try {
      const values = await form.validateFields();
      setOrderResult({ values, paymentMethod, message: paymentMessages[paymentMethod] });
      message.success("Đã xác nhận thông tin thanh toán");
    } catch (error) {
      setOrderResult(null);
      message.error("Vui lòng nhập đủ họ tên, số điện thoại và địa chỉ giao hàng");
    }
  };

  return (
    <>
      <PageHeader icon="CreditCard" title={dict.checkoutTitle} description={dict.checkoutDesc} />
      <Steps className="checkout-steps" current={1} items={[{ title: dict.cart }, { title: dict.information }, { title: dict.confirm }]} />
      <Row gutter={[18, 18]} className="checkout-grid">
        <Col xs={24} lg={15}>
          <Card className="checkout-card" title={dict.shippingInfo}>
            <Form form={form} layout="vertical" requiredMark>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.recipientName} name="recipientName" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}><Input placeholder={dict.recipientPlaceholder} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.phone} name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}><Input placeholder={dict.phonePlaceholder} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.shippingAddress} name="shippingAddress" rules={[{ required: true, message: "Vui lòng nhập địa chỉ giao hàng" }]}><Input placeholder={dict.addressPlaceholder} /></Form.Item>
              <Row gutter={[12, 0]}>
                <Col xs={24} md={12}><Form.Item label={dict.province}><Select defaultValue="ha-noi" options={[{ value: "ha-noi", label: dict.all === "All" ? "Hanoi" : "Hà Nội" }, { value: "hcm", label: dict.all === "All" ? "Ho Chi Minh City" : "TP. Hồ Chí Minh" }, { value: "other", label: langTools.dict.all === "All" ? "Other province" : "Tỉnh/Thành khác" }]} /></Form.Item></Col>
                <Col xs={24} md={12}><Form.Item label={dict.deliveryTime}><Select defaultValue="today" options={[{ value: "today", label: dict.today }, { value: "tomorrow", label: dict.tomorrow }, { value: "schedule", label: dict.schedule }]} /></Form.Item></Col>
              </Row>
              <Form.Item label={dict.note}><Input.TextArea rows={4} placeholder={dict.notePlaceholder} /></Form.Item>
            </Form>
          </Card>
          <Card className="checkout-card" title={dict.paymentMethod}>
            <Radio.Group value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)} className="payment-options"><Radio value="cod">{dict.cod}</Radio><Radio value="transfer">{dict.transfer}</Radio><Radio value="store">{dict.storePayment}</Radio></Radio.Group>
            {orderResult ? <Alert className="checkout-result" type="success" showIcon message="Xác nhận thanh toán" description={orderResult.message} /> : null}
          </Card>
        </Col>
        <Col xs={24} lg={9}>
          <Card className="order-summary" title={dict.orderSummary}>
            {cartItems.length === 0 ? <Empty description={dict.emptyCart} /> : <List itemLayout="horizontal" dataSource={cartItems} renderItem={(item) => <List.Item actions={[<Button key={`decrease-${item.slug}`} shape="circle" icon={<Icon name="Minus" size={14} />} onClick={() => onUpdateCartQuantity(item.slug, item.quantity - 1)} />, <Text key={`qty-${item.slug}`}>{item.quantity}</Text>, <Button key={`increase-${item.slug}`} shape="circle" icon={<Icon name="Plus" size={14} />} onClick={() => onUpdateCartQuantity(item.slug, item.quantity + 1)} />, <Button key={`remove-${item.slug}`} danger type="text" icon={<Icon name="Trash2" size={16} />} onClick={() => onRemoveCartItem(item.slug)}>{dict.remove}</Button>]}><List.Item.Meta avatar={<Image className="cart-thumb" preview={false} src={item.image} alt={labelProduct(item)} />} title={labelProduct(item)} description={`${dict.quantity}: ${item.quantity}`} /><Text strong>{formatPrice(parsePrice(item.price) * item.quantity)}</Text></List.Item>} />}
            <Divider />
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.subtotal}</Text><Text>{formatPrice(subtotal)}</Text></Flex>
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.shippingFee}</Text><Text>{shippingFee === 0 ? dict.freeShipping : formatPrice(shippingFee)}</Text></Flex>
            <Flex className="summary-row" align="center" justify="space-between" gap={12}><Text>{dict.discount}</Text><Text>-{formatPrice(discount)}</Text></Flex>
            <Flex className="summary-row total-row" align="center" justify="space-between" gap={12}><Text strong>{dict.total}</Text><Text strong>{formatPrice(total)}</Text></Flex>
            <Button block type="primary" size="large" icon={<Icon name="CheckCircle2" />} onClick={submitOrder} disabled={cartItems.length === 0}>{dict.placeOrder}</Button>
            <Button block onClick={() => navigateToTopPage("retail")} className="continue-shopping">{dict.continueShopping}</Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}
