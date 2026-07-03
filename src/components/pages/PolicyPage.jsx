const policyPages = [
  {
    slug: "chinh-sach-bao-mat-pt",
    title: "Chính sách bảo mật",
    icon: "ShieldCheck",
    summary: "Cam kết bảo vệ thông tin khách hàng khi tư vấn, đặt hàng và chăm sóc sau bán.",
    sections: [
      ["Thông tin thu thập", ["Họ tên, số điện thoại, địa chỉ nhận hàng và nhu cầu tư vấn sản phẩm.", "Thông tin chỉ dùng để xử lý đơn hàng, giao hàng và hỗ trợ bảo hành khi cần."]],
      ["Phạm vi sử dụng", ["Xác nhận đơn hàng, liên hệ giao nhận, thông báo tình trạng xử lý đơn và chăm sóc khách hàng.", "Không bán, trao đổi hoặc chia sẻ thông tin cá nhân cho bên thứ ba ngoài đơn vị vận chuyển/phục vụ đơn hàng."]],
      ["Bảo vệ dữ liệu", ["Thông tin được lưu trữ trong phạm vi vận hành cửa hàng.", "Khách hàng có thể yêu cầu kiểm tra, điều chỉnh hoặc xóa thông tin liên hệ đã cung cấp."]],
    ],
  },
  {
    slug: "chinh-sach-bao-hanh-pt",
    title: "Chính sách bảo hành",
    icon: "BadgeCheck",
    summary: "Áp dụng cho sản phẩm Everon, Artemis và Kingkoil chính hãng do cửa hàng phân phối.",
    sections: [
      ["Điều kiện bảo hành", ["Sản phẩm còn thông tin mua hàng, tem nhãn hoặc dấu hiệu nhận diện chính hãng.", "Lỗi phát sinh từ chất lượng sản phẩm theo tiêu chuẩn của nhà sản xuất."]],
      ["Thời hạn tham khảo", ["Đệm bông ép thường được bảo hành theo chính sách nhà sản xuất.", "Đệm cao su, đệm lò xo có thời hạn bảo hành khác nhau tùy dòng sản phẩm."]],
      ["Trường hợp không áp dụng", ["Sản phẩm dùng sai hướng dẫn, bảo quản không đúng cách hoặc bị tác động bởi ngoại lực.", "Hư hỏng do thiên tai, ẩm mốc, cháy nổ hoặc tự ý thay đổi kết cấu sản phẩm."]],
    ],
  },
  {
    slug: "mua-hang-va-thanh-toan-pt",
    title: "Mua hàng và thanh toán",
    icon: "CreditCard",
    summary: "Hướng dẫn đặt hàng, xác nhận đơn và lựa chọn phương thức thanh toán phù hợp.",
    sections: [
      ["Quy trình mua hàng", ["Tìm sản phẩm theo danh mục, thanh tìm kiếm hoặc sản phẩm nổi bật trên trang chủ.", "Chọn sản phẩm, kiểm tra thông tin giá và liên hệ cửa hàng nếu cần tư vấn kích thước."]],
      ["Xác nhận đơn", ["Khách hàng nhập họ tên, số điện thoại và địa chỉ giao hàng.", "Nhân viên cửa hàng gọi lại để xác nhận đơn, thời gian giao và các ưu đãi đi kèm."]],
      ["Phương thức thanh toán", ["Thanh toán khi nhận hàng.", "Chuyển khoản ngân hàng sau khi xác nhận đơn.", "Thanh toán trực tiếp tại cửa hàng."]],
    ],
  },
  {
    slug: "chinh-sach-doi-tra-pt",
    title: "Chính sách đổi trả",
    icon: "RefreshCcw",
    summary: "Hỗ trợ đổi trả khi sản phẩm giao không đúng đơn hoặc phát sinh lỗi được xác nhận.",
    sections: [
      ["Điều kiện đổi trả", ["Sản phẩm còn nguyên trạng, chưa qua sử dụng và còn đầy đủ bao bì/tem nhãn nếu có.", "Thông tin đổi trả cần được phản hồi sớm sau khi nhận hàng."]],
      ["Các trường hợp hỗ trợ", ["Giao sai mẫu, sai kích thước hoặc sai số lượng so với xác nhận đơn.", "Sản phẩm có lỗi kỹ thuật hoặc lỗi ngoại quan được ghi nhận khi nhận hàng."]],
      ["Lưu ý", ["Không áp dụng đổi trả với sản phẩm đã qua sử dụng, bị bẩn, hư hại do bảo quản sai cách.", "Sản phẩm đặt riêng theo kích thước đặc biệt sẽ được cửa hàng xác nhận điều kiện đổi trả trước khi đặt."]],
    ],
  },
  {
    slug: "chinh-sach-giao-hang-pt",
    title: "Chính sách giao hàng",
    icon: "Truck",
    summary: "Giao hàng linh hoạt trong nội thành Hà Nội và hỗ trợ gửi hàng theo khu vực phù hợp.",
    sections: [
      ["Khu vực giao hàng", ["Ưu tiên giao nhanh trong nội thành Hà Nội.", "Đơn hàng ở tỉnh/thành khác sẽ được tư vấn phương án vận chuyển phù hợp."]],
      ["Thời gian giao", ["Nhân viên xác nhận lịch giao sau khi tiếp nhận đơn.", "Các đơn đệm hoặc sản phẩm kích thước lớn có thể cần lịch giao riêng."]],
      ["Phí vận chuyển", ["Phí giao hàng phụ thuộc địa chỉ, kích thước sản phẩm và chương trình ưu đãi từng thời điểm.", "Cửa hàng thông báo rõ phí phát sinh trước khi khách xác nhận đơn."]],
    ],
  },
  {
    slug: "chinh-sach-kiem-hang-pt",
    title: "Chính sách kiểm hàng",
    icon: "ClipboardCheck",
    summary: "Khách hàng được kiểm tra sản phẩm khi nhận để đảm bảo đúng mẫu, đúng số lượng và tình trạng hàng.",
    sections: [
      ["Quyền kiểm hàng", ["Khách hàng kiểm tra mẫu mã, kích thước, số lượng và tình trạng bao bì trước khi nhận.", "Có thể đối chiếu thông tin đơn hàng với nhân viên giao hàng."]],
      ["Khi phát hiện sai lệch", ["Thông báo ngay cho cửa hàng hoặc nhân viên giao hàng để được hỗ trợ xử lý.", "Cửa hàng tiếp nhận hình ảnh/thông tin thực tế để xác nhận phương án đổi hoặc bổ sung."]],
      ["Sau khi nhận hàng", ["Vui lòng giữ lại hóa đơn, thông tin đơn và bao bì trong thời gian đầu để hỗ trợ bảo hành/đổi trả.", "Các phản hồi sau nhận hàng được xử lý theo chính sách đổi trả và bảo hành tương ứng."]],
    ],
  },
];

function getPolicyBySlug(slug) {
  return policyPages.find((item) => item.slug === slug);
}

function PolicyPage({ slug }) {
  const page = getPolicyBySlug(slug);

  if (!page) {
    return (
      <Card className="section-panel page-panel">
        <Empty description="Không tìm thấy chính sách" />
      </Card>
    );
  }

  return (
    <Card className="section-panel page-panel policy-page">
      <PageHeader icon={page.icon} title={page.title} description={page.summary} />
      <Row gutter={[16, 16]}>
        {page.sections.map(([title, items]) => (
          <Col xs={24} lg={8} key={title}>
            <Card className="policy-section-card" title={title}>
              <List dataSource={items} renderItem={(item) => <List.Item><Text>{item}</Text></List.Item>} />
            </Card>
          </Col>
        ))}
      </Row>
      <Alert className="policy-contact-note" type="success" showIcon message="Cần hỗ trợ thêm? Liên hệ hotline 0966.452.111 để được tư vấn nhanh." />
    </Card>
  );
}
