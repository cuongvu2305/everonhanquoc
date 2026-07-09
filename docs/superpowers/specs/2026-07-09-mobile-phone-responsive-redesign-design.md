# Mobile Phone Responsive Redesign Design

**Date:** 2026-07-09  
**Status:** Drafted for review

## Goal

Thiết kế lại trải nghiệm storefront trên điện thoại để không còn cảm giác "desktop bị thu nhỏ", ưu tiên người dùng vào danh mục thật nhanh, giữ khả năng tìm kiếm luôn sẵn sàng, và loại bỏ các điểm vỡ layout hiện tại trên `home`, `category`, `search`, `product`, `checkout`.

## Chosen Direction

Thiết kế mobile đi theo hướng **Compact Commerce**:

- header gọn, một hàng
- search nằm riêng ngay dưới header
- hero ngắn, chỉ giữ vai trò nhận diện + một câu giá trị
- hai ô danh mục lớn xuất hiện ngay ở màn đầu
- điều hướng phụ đi vào drawer
- mobile chỉ giữ một floating CTA là hotline

Đây là hướng được chọn vì nó phù hợp nhất với mục tiêu thao tác nhanh bằng ngón cái, giảm chiều cao phần đầu trang, và đẩy người dùng vào luồng duyệt danh mục sớm.

## Scope

Thiết kế này chỉ bao phủ trải nghiệm **điện thoại**, ưu tiên các viewport thực tế như:

- `390x844`
- `430x932`

Tablet vẫn phải giữ ổn định và không vỡ layout, nhưng spec này không cố tạo một ngôn ngữ giao diện tablet riêng. Tablet sẽ là bản trung gian sạch hơn của layout responsive, còn điện thoại là nơi được tối ưu mạnh nhất.

Desktop phải giữ nguyên về hành vi cốt lõi.

## Design Principles

### 1. Mobile is a dedicated flow, not a shrunk desktop

Trải nghiệm mobile không được tiếp tục dùng các khối desktop rồi ép nhỏ lại. Những thành phần như top nav ngang, sidebar danh mục, footer nhiều cột, và nhiều nút nổi phải được thay bằng flow mobile riêng.

### 2. First-screen utility over decorative depth

Phần trên màn hình phải giúp người dùng thực hiện ngay các hành động chính:

- mở menu
- nhìn thấy ô search
- vào giỏ hàng
- chạm vào danh mục lớn

Không để hero, badge, link phụ, hoặc CTA nổi tranh chỗ với các hành động này.

### 3. Readability beats density

Typography mobile phải tránh:

- heading dài bị ép thành nhiều cột ký tự
- label button vỡ thành nhiều dòng khó đọc
- block mô tả quá dài ở phần đầu trang

Khi phải chọn giữa nhiều thông tin hơn và dễ đọc hơn, mobile ưu tiên dễ đọc hơn.

### 4. One-thumb interaction

Các CTA chính ở mobile phải dễ chạm bằng một tay:

- cart trong header
- search ngay dưới header
- hai ô danh mục lớn ở phần đầu
- hotline nổi nằm tách khỏi vùng input và vùng tổng tiền

## Information Architecture

### Primary mobile surface

Các thành phần xuất hiện ngay khi vào trang:

1. header một hàng
2. search row
3. hero ngắn
4. hai ô danh mục lớn
5. khối sản phẩm nổi bật / khối nội dung tiếp theo

### Secondary navigation

Drawer mobile chứa:

- top-level navigation
- danh mục đầy đủ
- link Facebook
- link YouTube

Drawer không phải là nơi chứa mọi hành động chính. Người dùng không nên cần mở drawer chỉ để bắt đầu duyệt sản phẩm.

## Mobile Shell

### Header

Header mobile gồm đúng ba vùng:

- menu trigger
- logo
- cart

Không giữ icon Facebook và YouTube trong header mobile. Không thêm CTA phụ khác vào cùng hàng này.

### Search

Search nằm trên một hàng riêng ngay dưới header. Nó luôn hiển thị ở mobile, không giấu vào drawer, không biến thành icon-only.

Search phải:

- full width trong container mobile
- dễ chạm
- không bị che bởi floating CTA

### Hero

Hero mobile được rút ngắn mạnh:

- một banner thấp
- một câu giá trị ngắn
- không dùng copy dài
- không thêm nhiều CTA trong hero

Mục tiêu của hero là giữ nhịp thương hiệu, không phải chiếm màn hình đầu tiên.

### Category entry

Ngay dưới hero là **2 ô danh mục lớn**. Đây là điểm vào chính của mobile home.

Yêu cầu:

- bấm dễ bằng ngón cái
- label ngắn, rõ
- đủ tương phản
- không quá nhiều mục trong màn đầu

Danh mục đầy đủ vẫn tồn tại trong drawer hoặc các section phía dưới, nhưng màn đầu chỉ nên ưu tiên 2 entry rõ ràng nhất.

### Floating action

Mobile chỉ giữ một floating CTA là **hotline**.

Bỏ:

- floating Facebook/Messenger
- floating Zalo

Lý do:

- tránh che nội dung
- tránh chồng chéo với CTA checkout
- giữ một ưu tiên rõ ràng

## Per-Page Layout Behavior

### Home

Flow mobile của home:

1. header
2. search
3. short hero
4. two large category tiles
5. featured products
6. additional sections in vertical stack

Các section phía dưới phải:

- giảm spacing dọc
- tránh card quá cao
- dùng stack dọc hoặc grid gọn
- không kéo trang quá dài chỉ vì trang trí

### Category

Trang danh mục không được giữ cảm giác sidebar desktop.

Đầu trang category chỉ nên giữ:

- title ngắn
- mô tả ngắn nếu cần
- số lượng sản phẩm hoặc trạng thái lọc

Các điều hướng phụ giữa category/sibling categories phải thu gọn thành pattern mobile-friendly, không tạo block lớn làm nội dung bị đẩy xuống quá xa.

### Search

Trang search phải hiển thị kết quả theo flow dọc rõ ràng:

- title ngắn
- query summary gọn
- product list/grid tối ưu mobile

Không để phần đầu của search page chiếm quá nhiều chiều cao trước khi người dùng thấy kết quả.

### Product

Flow mobile của product page:

1. ảnh sản phẩm
2. tên sản phẩm
3. giá
4. CTA chính
5. thông tin ngắn
6. mô tả dài / thông tin thêm
7. related products

Related products có thể là:

- carousel ngang nếu giữ được swipe dễ
- hoặc grid 2 cột nếu chiều cao/card được kiểm soát tốt

CTA mua hàng không được nằm quá thấp sau một đoạn mô tả dài.

### Checkout

Checkout phải hoàn toàn về một cột trên điện thoại.

Yêu cầu:

- không hàng nào bị ép ngang gây vỡ chữ
- summary rõ ràng
- tổng tiền và nút đặt hàng luôn đọc được
- hotline nổi không được che form, action, hay total

Checkout là màn rủi ro cao nhất, nên đây là trang cần được xác minh trực tiếp ở viewport mobile sau khi implement.

### Footer

Footer mobile phải được rút gọn.

Không giữ nguyên quá nhiều cột desktop. Ưu tiên:

- liên hệ chính
- chính sách quan trọng
- link hữu ích thật sự cần trên mobile

Footer phải là phần kết gọn, không tạo cảm giác "bức tường nội dung".

## Visual Rules

### Breakpoints

- `>= 992px`: giữ desktop behavior
- `<= 991px`: dùng responsive mobile/tablet shell
- `<= 576px`: giảm spacing thêm một nấc cho phone nhỏ hơn

### Spacing

Phone layout cần:

- padding nhỏ hơn desktop
- gap nhất quán
- section spacing ngắn hơn
- card padding được siết lại ở viewport nhỏ

Nhưng không được siết tới mức khó đọc hoặc khó chạm.

### Typography

Typography mobile phải tránh các lỗi đã gặp:

- heading bị bó quá hẹp
- text wrap theo từng ký tự
- button text vỡ xấu

Rule chung:

- ưu tiên line-height dễ đọc
- ưu tiên wrapping theo từ
- tránh min-content traps trong flex/grid

### Motion and chrome

Motion không phải trọng tâm của redesign này. Mục tiêu chính là stability và usability. Mọi hiệu ứng nếu có phải nhẹ, không làm chậm thao tác.

## Components Expected To Change

Những nhóm thành phần sẽ bị tác động:

- app shell mobile
- header
- search row
- drawer
- hero/page header blocks
- home section flow
- category/search/product/checkout mobile spacing
- footer
- floating actions

## Non-Goals

Spec này không bao gồm:

- thay đổi nội dung marketing/copy ở desktop
- làm lại visual identity tổng thể của brand
- thêm tính năng thương mại điện tử mới
- đổi semantics routing
- xây lại tablet thành một giao diện riêng biệt hoàn toàn

## Verification

Responsive redesign chỉ được coi là đạt khi kiểm tra được ít nhất các màn:

- `home`
- `category`
- `search`
- `product`
- `checkout`

ở các viewport:

- `390x844`
- `430x932`

với các tiêu chí:

- không có block text bị kéo thành cột dọc
- không có CTA nổi che nội dung chính
- search luôn hiện diện dễ dùng
- category entry xuất hiện sớm trên home
- checkout không vỡ layout

## Implementation Constraints

- giữ nguyên desktop behavior
- không đổi route semantics
- tận dụng cấu trúc React JSX + Ant Design hiện có
- regenerate build output vì `public/app.jsx` được bundle từ source

## Summary

Mobile redesign này là một bước chuyển từ responsive kiểu "thu nhỏ desktop" sang một shell điện thoại chuyên biệt, thiên về commerce nhanh:

- header gọn
- search luôn lộ
- hero ngắn
- 2 ô danh mục lớn
- flow dọc rõ ràng
- chỉ giữ hotline nổi

Nếu implement đúng, màn mobile đầu tiên sẽ nhẹ hơn, nhanh hiểu hơn, và bớt vỡ hơn rõ rệt trên các trang bán hàng quan trọng.
