# Zymuk Page

> **Tiếng Việt** | [English](README.en.md)

> Portfolio cá nhân + bộ công cụ trực tuyến của **Trần Thế Ngọc** (QA Engineer), chạy hoàn toàn phía client (SPA tĩnh), deploy trên **GitHub Pages**.

Zymuk Page là một ứng dụng web đơn trang (Single Page Application) được xây dựng bằng **React 19** và **Create React App**, đóng vai trò vừa là CV/portfolio online, vừa là bộ sưu tập các tiện ích hằng ngày (máy tính, ghi chú, mã hóa, lưu trang web, thần số học...). Điểm đặc biệt: **toàn bộ hệ thống không có backend** — dữ liệu được quản lý qua `localStorage` và các file JSON tĩnh trong thư mục `public/`, kèm một panel quản trị tích hợp sẵn để chỉnh sửa nội dung.

## Tính năng chính

| Khu vực | Đường dẫn | Mô tả |
|---|---|---|
| **Trang công khai** | `/` | 10 section: Hero, About (hiệu ứng gõ chữ), Experience (timeline), Education, Certifications, Skills, Projects, Features, Animations, Contact — cuộn dạng slide toàn màn hình (scroll-snap) kèm nút đổi theme nổi góc dưới-trái (Default/Midnight/Sunset đổi màu nền, Harvard Clean tái thiết kế toàn bộ theo phong cách résumé học thuật) |
| **Công cụ** | `/features/calculator`, `/features/notes`, `/features/numerology-name`, `/features/text-encoder-decoder`, `/features/save-web`, `/features/encrypt-decrypt`, `/features/json-formatter`, `/features/reminders`, `/features/image-editor` | Máy tính khoa học, ghi chú rich-text, thần số học, mã hóa URL, quản lý bookmark, mã hóa/giải mã văn bản, format/validate JSON, nhắc việc, **loại bỏ nền trắng + cắt ảnh** |
| **Hoạt ảnh** | `/animations`, `/animations/dragon-cursor`, `/animations/generative-lines`, `/animations/lightbeams`, `/animations/blend-overlay`, `/animations/aizawa-attractor`, `/animations/explosive-attraction`, `/animations/3d-rowing-boat`, `/animations/not-comets`, `/animations/fireworks`, `/animations/celestial-transmutation`, `/animations/fly-in-cave` | Mười một demo hoạt ảnh nhúng trực tiếp vào codebase: rồng SVG bám con trỏ (Dragon Cursor), tranh đường cong generative trên canvas, chùm chữ sáng hạt particle (Lightbeams), ảnh nền + overlay màu đổi liên tục bằng CSS `mix-blend-mode` (Blend Overlay), attractor Aizawa 3D holographic bằng Three.js (Aizawa Attractor), vụ nổ hạt particle hút theo con trỏ (Explosive Attraction), chiếc thuyền chèo 3D trên mặt nước động với nhân vật + tay chèo chuyển động, hoa súng, wake và gợn nước (3D Rowing Boat), trời sao trôi + địa hình tinh thể phát sáng với vệt sao chổi tự sinh, vẽ bằng Canvas 2D thuần (Not Comets), màn pháo hoa WebGL với các chùm hạt điểm nổ trên nền đất lưới nhấp nhô, tự bắn liên tục (Fireworks), cảnh tám hành tinh Hệ Mặt Trời WebGL dùng texture bề mặt thật (Solar System Scope / NASA, CC BY 4.0) tự biến hình qua mặt quét "phase-surge" với bloom, xoay quỹ đạo, tự quay + dữ liệu thật từng hành tinh và nút xem kích thước thật, auto-cycling (Celestial Transmutation), và cảnh bay xuyên hang động 3D với địa hình hang động được sinh từ noise, ánh sáng động và điều chỉnh tốc độ (Fly In Cave) |
| **Admin Panel** | `/admin/...` | Dashboard, CRUD từng section, quản lý người dùng (Users CRUD), cài đặt homepage (màu/title/ảnh), đổi ngôn ngữ EN/VI, export dữ liệu JSON |

## Công nghệ sử dụng

- **React 19** + **ReactDOM 19** với `StrictMode`
- **React Router DOM v7** (`react-router-dom@^7.4.0`) — dùng `BrowserRouter` với URL sạch (không `#`) để tốt cho SEO, kết hợp file `404.html` cho host tĩnh GitHub Pages
- **Create React App 5** (`react-scripts@^5.0.1`)
- **Font Awesome 6** (qua CDN trong `public/index.html`)
- **cross-env** (đồng bộ biến môi trường trên Windows)
- **gh-pages** (triển khai build lên GitHub Pages)
- **Jest + React Testing Library** — bộ kiểm thử tự động
- **Web Crypto API**, `localStorage`, `navigator.clipboard`, **Canvas 2D API**, **SVG animation**, **CSS `mix-blend-mode`**, **WebGL (Three.js)** — các Web API/kỹ thuật trình duyệt

## Bắt đầu nhanh

Yêu cầu: **Node.js ≥ 16** và **Yarn 1.x** (hoặc npm).

```bash
# 1. Cài đặt dependencies
yarn install

# 2. Chạy development (http://localhost:3000)
yarn start

# 3. Build production vào thư mục build/
yarn build

# 4. Chạy bộ kiểm thử
yarn test --watchAll=false
```

## Kiểm thử

Dự án đi kèm bộ kiểm thử tự động viết bằng **Jest + React Testing Library**, đặt trong thư mục `test/` (soi gương cây `src/`). Bộ test phủ các phần giàu logic nhất: các công cụ (máy tính, mã hóa 17 thuật toán, ghi chú, lưu trang, thần số học, JSON formatter...), luồng dữ liệu `localStorage` ↔ file JSON, và panel admin (đăng nhập, CRUD user, export dữ liệu). Hiện trạng: **tất cả test pass**.

## Ghi chú & hạn chế đã biết

Tài liệu trung thực với hiện trạng code. Trong quá trình phân tích, tôi phát hiện những điểm cần lưu ý:

- **Animations là demo hoạt ảnh thu thập từ web, nhúng trực tiếp vào codebase** — toàn bộ code (SVG rồng, generative lines, lightbeams, blend overlay CSS, attractor Aizawa, hạt nổ, thuyền 3D, sao chổi, pháo hoa, hành tinh, bay trong hang động) đặt trong `src/site/pages/animations/`, chạy 100% phía client, không gọi CDN runtime. Lưu ý: nhiều demo của CodeTap mô tả là Three.js nhưng mã nguồn thật chỉ là CSS hoặc Canvas 2D thuần (Blend Overlay, Explosive Attraction, Not Comets) — bản port giữ nguyên, chỉ bỏ nguồn ngoài (ảnh/sprite); riêng Aizawa Attractor, 3D Rowing Boat, Fireworks, Celestial Transmutation và Fly In Cave **dùng Three.js thật** nên thêm `three@0.160` vào dependency, thay GSAP bằng JS/CSS thuần, bỏ dat.GUI/simplex-noise/font Google, port mỗi trang lên React và dọn tài nguyên (requestAnimationFrame, listener) khi unmount. Celestial Transmutation phân biệt hẳn với mẫu gốc: bộ chọn chấm-planet, dòng thông số thật (kích thước, vệ tinh, tự quay, quỹ đạo), mặt tự quay theo tốc độ tương đối thật, và nút bật kích thước tương đối thật kèm camera tự thu phóng.
- **Xác thực admin chỉ mang tính giả lập** — phiên dùng token ngẫu nhiên 128-bit hết hạn sau 24h (`src/utils/auth.js`), nhưng mật khẩu vẫn dạng plaintext trong `public/data.json` và ai cũng tự set token qua DevTools; không dùng cho dữ liệu nhạy cảm.
- **Form Contact hoạt động qua `mailto:`** — nút Send mở email client với nội dung đã điền sẵn (không có backend, không gửi qua web).
- **Nhắc việc dùng timer best-effort** — khi đóng tab, Service Worker chỉ gửi thông báo OS theo đúng giờ tương đối; muốn nhắc việc chính xác tuyệt đối khi đóng trình duyệt cần Web Push + server (GitHub Pages tĩnh không host được).
- **i18n chỉ áp dụng cho admin** — trang công khai dùng nội dung tiếng Anh/Việt cứng trong JSON cấu hình.

## Giấy phép

© 2025 Zymuk Trần — All rights reserved.
