# Workflow & Rules

## Luồng làm việc chuẩn (bắt buộc)

1. **Làm tính năng / sửa code / docs chi tiết** trên nhánh `docs` — KHÔNG commit khi làm.
2. Khi người dùng kêu **"commit"** → mới được commit lên nhánh `docs`.
3. Người dùng tự **push** commit đó lên `docs`.
4. Khi người dùng kêu **tạo MR** → tạo link/mở Merge Request từ `docs` → `main`.
   - MR này **chỉ chứa code** (không bao gồm tài liệu chi tiết trong `docs/`).
   - Chỉ sửa `README.md` nếu cần thiết cho phần merge code.
5. Người dùng **tự merge** MR — không được merge hộ.

## Quy ước nhánh

- `main`: code chính thức + `README.md` ngắn gọn (KHÔNG có thư mục `docs/` chi tiết).
- `docs`: tài liệu kỹ thuật chi tiết (`docs/API.md`, `docs/ARCHITECTURE.md`, `docs/INSTALLATION.md`) + code (đang phát triển).
- Tài liệu chi tiết chỉ sống trên nhánh `docs`, không bao giờ được merge lên `main`.

## Quy ước 2 README

- `README.md` (bản chi tiết): sống trên nhánh `docs`, trỏ tới bộ tài liệu `docs/*.md`.
- `README.main.md` (bản rút gọn): là **bản nháp dành cho main** — nội dung chính xác sẽ được đưa lên `README.md` của nhánh `main` qua MR.
- Khi cần thay đổi README trên `main`: sửa `README.main.md` trên nhánh `docs`, rồi đưa vào MR docs→main (copy nội dung sang `README.md` khi tạo MR).
- KHÔNG sửa trực tiếp `README.md` trên `main` khi làm việc trên `docs`.
