# Zymuk Page

> Portfolio cá nhân + bộ công cụ trực tuyến của **Trần Thế Ngọc** (QA Engineer), chạy hoàn toàn phía client (SPA tĩnh), deploy trên **GitHub Pages**.

Zymuk Page là một ứng dụng web đơn trang (Single Page Application) được xây dựng bằng **React 19** và **Create React App**, đóng vai trò vừa là CV/portfolio online, vừa là bộ sưu tập các tiện ích hằng ngày (máy tính, ghi chú, mã hóa, lưu trang web, thần số học...). Điểm đặc biệt: **toàn bộ hệ thống không có backend** — dữ liệu được quản lý qua `localStorage` và các file JSON tĩnh trong thư mục `public/`, kèm một panel quản trị tích hợp sẵn để chỉnh sửa nội dung.

## Tính năng chính

| Khu vực | Đường dẫn | Mô tả |
|---|---|---|
| **Trang công khai** | `/#/` | 9 section: Hero, About (hiệu ứng gõ chữ), Experience (timeline), Education, Certifications, Skills, Projects, Features, Contact |
| **Công cụ** | `/#/calculator`, `/#/notes`, `/#/numerology-name`, `/#/text-encoder-decoder`, `/#/save-web`, `/#/encrypt-decrypt` | Máy tính khoa học, ghi chú rich-text, thần số học, mã hóa URL, quản lý bookmark, mã hóa/giải mã văn bản |
| **Admin Panel** | `/#/admin/...` | Dashboard, CRUD từng section, cài đặt homepage (màu/title/ảnh), đổi ngôn ngữ EN/VI, export dữ liệu JSON |

## Công nghệ sử dụng

- **React 19** + **ReactDOM 19** với `StrictMode`
- **React Router DOM v7** (`react-router-dom@^7.4.0`) — dùng `HashRouter` để hoạt động đúng trên GitHub Pages
- **Create React App 5** (`react-scripts@^5.0.1`)
- **Font Awesome 6** (qua CDN trong `public/index.html`)
- **cross-env** (đồng bộ biến môi trường trên Windows)
- **gh-pages** (triển khai build lên GitHub Pages)
- **Web Crypto API**, `localStorage`, `navigator.clipboard` — các Web API trình duyệt

## Bắt đầu nhanh

Yêu cầu: **Node.js ≥ 16** và **Yarn 1.x** (hoặc npm).

```bash
# 1. Cài đặt dependencies
yarn install

# 2. Chạy development (http://localhost:3000)
yarn start

# 3. Build production vào thư mục build/
yarn build
```

## Ghi chú & hạn chế đã biết

Tài liệu trung thực với hiện trạng code. Trong quá trình phân tích, tôi phát hiện những điểm cần lưu ý:

- **Xác thực admin chỉ mang tính giả lập** — phiên dùng token ngẫu nhiên 128-bit hết hạn sau 24h (`src/utils/auth.js`), nhưng mật khẩu vẫn dạng plaintext trong `public/data.json` và ai cũng tự set token qua DevTools; không dùng cho dữ liệu nhạy cảm.
- **Form Contact hoạt động qua `mailto:`** — nút Send mở email client với nội dung đã điền sẵn (không có backend, không gửi qua web).
- **i18n chỉ áp dụng cho admin** — trang công khai dùng nội dung tiếng Anh/Việt cứng trong JSON cấu hình.

## Giấy phép

© 2025 Zymuk Trần — All rights reserved.
