# Hướng dẫn cài đặt & triển khai

> Tài liệu này là phần tiếp nối của [README.md](../README.md). Sau khi bạn đã nắm tổng quan, đây là hành trình chi tiết đưa dự án từ một repo trống cho tới khi **chạy được trên local** rồi **lên GitHub Pages**. Toàn bộ lệnh được thực hiện tại thư mục gốc của dự án (`D:\Repositories\Git\zymuk.github.io`).

## 1. Yêu cầu hệ thống

| Thành phần | Phiên bản tối thiểu | Ghi chú |
|---|---|---|
| Node.js | ≥ 16 | Kiểm tra: `node -v` |
| Yarn | 1.x (Classic) | Ưu tiên; kiểm tra: `yarn -v` |
| npm | ≥ 8 | Có thể thay thế Yarn |
| Trình duyệt | Bản hiện đại (Chrome/Firefox/Edge/Safari) | Cần hỗ trợ Web Crypto API cho trang Encrypt/Decrypt |

> **Ghi chú về Node.js & CRA 5:** Create React App 5 (`react-scripts@^5.0.1`) hoạt động ổn định nhất với Node 16–18. Nếu bạn dùng Node ≥ 20, một số phiên bản có thể báo cảnh báo OpenSSL liên quan tới webpack — thường vẫn build được, nhưng nếu gặp lỗi `ERR_OSSL_EVP_UNSUPPORTED`, hãy chuyển xuống Node 18 LTS.

## 2. Cài đặt dự án

```bash
# 2.1. Clone repository
git clone https://github.com/zymuk/zymuk.github.io.git
cd zymuk.github.io

# 2.2. Cài đặt dependencies
yarn install
```

`yarn install` sẽ đọc `yarn.lock` và tạo thư mục `node_modules/`. Các dependencies chính (từ `package.json`):

- **Dependencies**: `react@^19`, `react-dom@^19`, `react-router-dom@^7.4.0`, `react-scripts@^5.0.1`, `@fortawesome/fontawesome-free@^6.7.2`, `cross-env@^7.0.3`, `web-vitals@^2.1.4`.
- **DevDependencies**: `gh-pages@^6.2.0`.

Nếu bạn dùng npm thay cho Yarn, thay `yarn` bằng `npm`:

```bash
npm install
```

## 3. Chạy môi trường development

```bash
yarn start
```

- Mở **http://localhost:3000** để xem trang.
- Script chạy với `cross-env BROWSER=none`, nghĩa là **trình duyệt không tự động mở** (hữu ích khi dev từ xa hoặc qua WSL).
- Hot reload được bật — mọi thay đổi trong `src/` tự phản chiếu ngay trên trình duyệt.
- Vì dự án dùng `HashRouter`, URL có dạng `http://localhost:3000/#/calculator`, `http://localhost:3000/#/admin`.

> **Lưu ý khi dữ liệu "không đổi":** đây là dự án tĩnh, nội dung bạn sửa trong Admin Panel được lưu vào `localStorage` của đúng trình duyệt đó. Nếu trang không hiện thay đổi, xem mục 7.3.

## 4. Bảng lệnh (scripts)

| Lệnh | Thực thi | Mô tả |
|---|---|---|
| `yarn start` | `cross-env BROWSER=none react-scripts start` | Chạy dev server trên port 3000 |
| `yarn test` | `react-scripts test` | Chạy test runner (interactive watch mode) |
| `yarn build` | `react-scripts build` | Build production vào `build/` |
| `yarn predeploy` | `npm run build` | Tự chạy build trước khi deploy |
| `yarn deploy` | `gh-pages -d build` | Đẩy `build/` lên nhánh `gh-pages` |
| `yarn eject` | `react-scripts eject` | **Một chiều**, không thể hoàn tác — copy toàn bộ cấu hình webpack/Babel vào dự án |

## 5. Build production

```bash
yarn build
```

- Kết quả nằm trong thư mục **`build/`** — code React được minify, đóng gói, tên file kèm hash nội dung (`static/js/main.<hash>.js`...).
- Field **`homepage`** trong `package.json` được set `https://zymuk.github.io` — CRA dùng nó để sinh đúng các đường dẫn tuyệt đối cho assets.
- Thư mục `build/` nằm trong `.gitignore`, không được commit.

## 6. Triển khai lên GitHub Pages

### 6.1. Cách tự động — chạy `deploy.bat` (Windows)

File `deploy.bat` ở gốc dự án thực hiện chuỗi sau:

1. Ghi timestamp của commit mới nhất (`git log -1 --format="%ad"`) ra file tạm `dateTimeLastCommit.txt`.
2. Đọc lại timestamp và xóa file tạm.
3. Dùng PowerShell cập nhật field **`datetimedeploy`** trong `package.json` thành timestamp vừa lấy (khiến dòng "Deploy at ..." ở footer tự cập nhật — component `Footer.jsx` đọc trực tiếp từ `package.json`).
4. Chạy `yarn deploy` → `predeploy` chạy `build` rồi `gh-pages -d build` đẩy lên nhánh `gh-pages`.

```bash
deploy.bat
```

### 6.2. Cách thủ công

```bash
yarn deploy        # build + đẩy build/ lên nhánh gh-pages
```

Sau khi deploy, site có thể truy cập tại `https://zymuk.github.io` (hoặc `https://<username>.github.io/<repo>` nếu khác tên chuẩn). Cần vài phút để GitHub Pages cập nhật.

### 6.3. Vì sao dùng HashRouter?

GitHub Pages chỉ phục vụ file tĩnh và không có rewrite rule cho SPA. `BrowserRouter` sẽ cho 404 khi refresh các đường dẫn lồng nhau như `/admin/homepage`. `HashRouter` chuyển mọi route vào phần hash (`#/admin/homepage`), phần này không được gửi tới server, nên **không cần cấu hình server** — đây là lý do `src/index.js` dùng `HashRouter`.

## 7. Cấu hình & xử lý sự cố

### 7.1. Các field quan trọng trong `package.json`

| Field | Giá trị hiện tại | Ý nghĩa |
|---|---|---|
| `homepage` | `https://zymuk.github.io` | Đường dẫn gốc để CRA sinh asset URL khi build |
| `apipage` | `http://localhost/zymuk_page_api` | **Không được code sử dụng** — là trường dự phòng cho ý tưởng backend chưa triển khai |
| `datetimedeploy` | `""` | Được `deploy.bat` tự cập nhật; hiển thị trong Footer nếu khác rỗng |

### 7.2. Script `buildApp.cmd`

`buildApp.cmd` tại gốc dự án chạy một lệnh duy nhất:

```bat
yarn install && yarn build && yarn start
```

Dành cho quy trình một-chạm: cài dependency → build → mở dev server.

### 7.3. Xử lý sự cố thường gặp

| Vấn đề | Nguyên nhân & cách xử lý |
|---|---|
| **`ERR_OSSL_EVP_UNSUPPORTED` khi build** | Node quá mới so với webpack của CRA 5 → dùng Node 18 LTS |
| **Cổng 3000 bị chiếm** | CRA tự nhảy sang port khác (thông báo trong console); hoặc kill tiến trình chiếm cổng |
| **Sửa dữ liệu trong Admin nhưng trang công khai không đổi** | Dữ liệu bị ghi đè bởi `localStorage` của trình duyệt. Mở DevTools → Application → Local Storage, xóa các key liên quan (`homepageSettings`, `projects`, `features`, `experience`, `education`, `certifications`, `skills`) rồi tải lại trang để dùng lại dữ liệu mặc định từ `public/*.json` |
| **Mất hết dữ liệu admin** | `localStorage` là dữ liệu local của từng máy/trình duyệt, không đồng bộ. Dùng Admin → Settings → Export để tải file JSON sao lưu |
| **Vào `/admin` bị đẩy về login** | Bình thường khi chưa đăng nhập. Thông tin đăng nhập mặc định nằm trong `public/data.json` → `users` |
| **Ảnh không hiện** | Field `image` trong `config.json` đang để trống; các section dùng màu nền fallback |

## 8. Tiếp theo

Ứng dụng đã chạy và deploy thành công. Bạn đã biết *cách vận hành* — giờ hãy đọc **[docs/ARCHITECTURE.md](ARCHITECTURE.md)** để hiểu *cách nó hoạt động bên trong*: sơ đồ route, luồng dữ liệu localStorage ↔ file JSON, và chi tiết từng mô-đun.
