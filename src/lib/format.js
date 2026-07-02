export function parsePrice(value) {
  return Number(String(value).replace(/[^0-9]/g, "")) || 0;
}

export function formatPrice(value) {
  return `${value.toLocaleString("vi-VN")}đ`;
}
