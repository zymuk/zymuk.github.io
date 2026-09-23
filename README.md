# Zymuk Page

> **Tiếng Việt** | [English](README.en.md)

> Portfolio cá nhân + bộ công cụ trực tuyến của **Trần Thế Ngọc** (QA Engineer), chạy hoàn toàn phía client (SPA tĩnh), deploy trên **GitHub Pages**.

Zymuk Page là một ứng dụng web đơn trang (Single Page Application) được xây dựng bằng **React 19** và **Create React App**, đóng vai trò vừa là CV/portfolio online, vừa là bộ sưu tập các tiện ích hằng ngày (máy tính, ghi chú, mã hóa, lưu trang web, thần số học...). Điểm đặc biệt: **toàn bộ hệ thống không có backend** — dữ liệu được quản lý qua `localStorage` và các file JSON tĩnh trong thư mục `public/`, kèm một panel quản trị tích hợp sẵn để chỉnh sửa nội dung.

## Tính năng chính

| Khu vực | Đường dẫn | Mô tả |
|---|---|---|
| **Trang công khai** | `/` | 10 section: Hero, About (hiệu ứng gõ chữ), Experience (timeline), Education, Certifications, Skills, Projects, Features, Animations, Contact — cuộn dạng slide toàn màn hình (scroll-snap) kèm nút đổi theme nổi góc dưới-trái (Default/Midnight/Sunset đổi màu nền, Harvard Clean tái thiết kế toàn bộ theo phong cách résumé học thuật) |
| **Công cụ** | `/features/calculator`, `/features/notes`, `/features/numerology-name`, `/features/text-encoder-decoder`, `/features/save-web`, `/features/encrypt-decrypt`, `/features/json-formatter`, `/features/reminders`, `/features/image-editor` | Máy tính khoa học, ghi chú rich-text, thần số học, mã hóa URL, quản lý bookmark, mã hóa/giải mã văn bản, format/validate JSON, nhắc việc, **loại bỏ nền trắng + cắt ảnh** |
| **Hoạt ảnh** | `/animations`, `/animations/dragon-cursor`, `/animations/generative-lines`, `/animations/lightbeams`, `/animations/blend-overlay`, `/animations/aizawa-attractor`, `/animations/explosive-attraction`, `/animations/3d-rowing-boat`, `/animations/not-comets` | Tám demo hoạt ảnh nhúng trực tiếp vào codebase: rồng SVG bám con trỏ (Dragon Cursor), tranh đường cong generative trên canvas, chùm chữ sáng hạt particle (Lightbeams), ảnh nền + overlay màu đổi liên tục bằng CSS `mix-blend-mode` (Blend Overlay), attractor Aizawa 3D holographic bằng Three.js (Aizawa Attractor), vụ nổ hạt particle hút theo con trỏ (Explosive Attraction), chiếc thuyền chèo 3D trên mặt nước động với nhân vật + tay chèo chuyển động, hoa súng, wake và gợn nước (3D Rowing Boat), và trời sao trôi + địa hình tinh thể phát sáng với vệt sao chổi tự sinh, vẽ bằng Canvas 2D thuần (Not Comets) |
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

- **Animations là demo hoạt ảnh thu thập từ web, nhúng trực tiếp vào codebase** — code nguồn (SVG rồng theo con trỏ, generative lines, lightbeams, đoạn CSS `mix-blend-mode` của demo "threejs-interactive-web-project-13", attractor Aizawa Three.js, và vụ nổ hạt của demo "explosive-attraction-threejs-animation") được để nguyên trong `src/site/pages/animations/`, chạy 100% phía client, không gọi CDN runtime. Lưu ý: demo project-13 của CodeTap tuy mô tả là Three.js nhưng mã nguồn thực tế **chỉ là CSS** (nền ảnh + overlay blend đổi màu qua keyframes) — bản port giữ nguyên tinh thần đó, ảnh nền tự lưu trong `public/` thay vì URL ngoài. Tương tự, demo "explosive-attraction-threejs-animation" cũng mô tả là Three.js nhưng mã nguồn thật **chỉ là Canvas 2D thuần** (200 hạt đi theo con trỏ, vỡ ra khi chạm tâm, kéo thành vệt mờ bằng `fillRect` rgba) — port giữ nguyên, chỉ chuyển toạ độ từ `window.inner*` sang kích thước stage. Riêng demo "3d-aizawa-attractor-threejs" **thật sự dùng Three.js** nên ta **thêm `three` vào `package.json`**; các tween intro vốn dùng GSAP được thay bằng JS thuần + CSS, bỏ font Google, để trang vẫn offline-an toàn. Demo **"3d-rowing-boat-threejs"** (author Grant Jenkins) cũng dùng **Three.js thật** và được port **đầy đủ thành trang nhúng thứ bảy**: thuyền + nhân vật chèo dựng bằng nguyên khối (hull `ExtrudeGeometry`, tay/chân thao tác IK `solveTwoBoneJoint`), mặt nước động co giãn theo sóng (`getWaveHeight` đẩy từng đỉnh của `PlaneGeometry` + tính lại normal), hoa súng kèm hoa trôi dạt né thuyền, wake ở đuôi thuyền + gợn nước ở mái chèo. Khác biệt so với nguồn gốc: demo dùng `THREE.Timer` (ra mắt từ `three@0.172`) nhưng repo đang bám `three@0.160` nên thay bằng đồng hồ thủ công (`performance.now()`, `delta` clamp 0.033); toạ độ quy về `clientWidth/clientHeight` của stage thay vì `window.inner*`, bỏ nút fullscreen và bỏ importmap CDN để trang offline-an toàn. Gần nhất, demo **"not-commets-threejs"** của CodeTap cũng mô tả là Three.js nhưng mã nguồn thật **chỉ là Canvas 2D thuần**: 2.000 hạt sao trôi, địa hình tinh thể 24×24 sáng dần theo từng pixel, và các vệt sao chổi tự mọc nhánh (mỗi 8 frame fork nhánh con giữ nguyên trạng thái toàn nhánh); port thành **trang nhúng thứ tám** — bỏ sạch sprite PNG + file OBJ tải từ CDN `srmcgann.github.io` thay bằng **sprite phát sáng tự vẽ** bằng `createRadialGradient` (trang offline-an toàn), bỏ dead code (nhà máy đa diện, `loadOBJ`, `reflect`), thêm HUD overlay, hủy `requestAnimationFrame` + gỡ listener khi unmount. Tên hiển thị dùng "Not Comets" (sửa lỗi chính tả "Commets" của nguồn).
- **Xác thực admin chỉ mang tính giả lập** — phiên dùng token ngẫu nhiên 128-bit hết hạn sau 24h (`src/utils/auth.js`), nhưng mật khẩu vẫn dạng plaintext trong `public/data.json` và ai cũng tự set token qua DevTools; không dùng cho dữ liệu nhạy cảm.
- **Form Contact hoạt động qua `mailto:`** — nút Send mở email client với nội dung đã điền sẵn (không có backend, không gửi qua web).
- **Nhắc việc dùng timer best-effort** — khi đóng tab, Service Worker chỉ gửi thông báo OS theo đúng giờ tương đối; muốn nhắc việc chính xác tuyệt đối khi đóng trình duyệt cần Web Push + server (GitHub Pages tĩnh không host được).
- **i18n chỉ áp dụng cho admin** — trang công khai dùng nội dung tiếng Anh/Việt cứng trong JSON cấu hình.

## Giấy phép

© 2025 Zymuk Trần — All rights reserved.
