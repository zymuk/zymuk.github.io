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
