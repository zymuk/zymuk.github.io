# Workflow & Rules

## Luồng làm việc chuẩn (bắt buộc)

1. **Làm tính năng / sửa code / docs chi tiết** trên nhánh `dev` — KHÔNG commit khi làm.
2. Khi người dùng kêu **"commit"** → mới được commit lên nhánh `dev`.
3. Người dùng tự **push** commit đó lên `dev`.
4. Khi người dùng kêu **tạo MR** → tạo MR từ **nhánh con** (xem mục "Quy tắc khóa" bên dưới) → `main`.
   - MR này **chỉ chứa code + README.md** — KHÔNG bao giờ bao gồm `docs/` hoặc `AGENTS.md`.
   - Tạo link MR: `https://github.com/<user>/<repo>/pull/new/<nhánh-con>?title=<title-encode-url>&body=<body-encode-url>` rồi đưa cho người dùng.
5. Người dùng **tự merge** MR — không được merge hộ.

## Quy ước nhánh

- `main`: code chính thức + `README.md` ngắn gọn (KHÔNG có thư mục `docs/` chi tiết, KHÔNG có `AGENTS.md`).
- `dev`: code (đang phát triển) + `README.md` (bản rút gọn, giống main) + tài liệu kỹ thuật chi tiết trong `docs/`.
- Tài liệu chi tiết (`docs/*.md`) và `AGENTS.md` chỉ sống trên nhánh `dev`, không bao giờ được đưa lên `main`.

## Quy ước README

- `README.md` (bản rút gọn): sống trên **cả 2 nhánh** `main` và `dev` — nội dung giống nhau, không bao giờ có link tới `docs/`.
- `docs/README.md` (bản chi tiết): chỉ sống trên nhánh `dev`, là mục lục trỏ tới bộ tài liệu `docs/*.md` (link tương đối `INSTALLATION.md`, `ARCHITECTURE.md`, `API.md`).
- Khi cần thay đổi README: sửa `README.md` trên nhánh `dev`, rồi đưa vào MR (nhánh con) lên `main`.
- KHÔNG sửa trực tiếp `README.md` trên `main` khi làm việc trên `dev`.

## Quy tắc khóa (chặn `docs/` + `AGENTS.md` lên main)

Git/GitHub không có cơ chế chặn tuyệt đối file mới qua MR. Vì vậy áp dụng quy ước quy trình sau — BẮT BUỘC:

- **Không bao giờ** tạo MR trực tiếp `dev` → `main` (sẽ kéo theo `docs/` + `AGENTS.md`).
- Mỗi lần cần đưa code/README lên `main`:
  1. Tạo nhánh con từ `origin/main`: `git checkout -b <ten> origin/main`.
  2. Cherry-pick các commit code cần thiết: `git cherry-pick <hash>...`.
  3. Push nhánh con, tạo MR `<ten>` → `main` — MR chỉ còn đúng các thay đổi mong muốn.
  4. Người dùng tự merge.
- Nếu `AGENTS.md` hoặc `docs/` xuất hiện trong MR → MR SAI, phải làm lại.

## Tạo link MR

Do không có `gh` CLI, dùng link soạn sẵn của GitHub:

1. **Có sẵn nhánh con** đã push: dùng URL `pull/new`:
   `https://github.com/<user>/<repo>/pull/new/<nhánh-con>?title=...&body=...`
2. **Chưa có nhánh con**: push nhánh con lên rồi dùng link trên, hoặc dùng `pull/<base>...<head>`:
   `https://github.com/<user>/<repo>/pull/<main>...<nhánh-con>`
3. Encode URL cho `title`/`body` (khoảng trắng `%20`, dấu `:` `%3A`, v.v.) để GitHub nhận đúng.
