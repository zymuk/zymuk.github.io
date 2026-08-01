# Workflow & Rules

## Vai trò & đối tượng

- **Người làm việc:** Zymuk — **kiểm thử viên (QA Engineer) biết code** (dùng làm, sửa code, viết tài liệu).
- **Người xem/đánh giá:** **Senior HR** — người tuyển dụng xem repo để đánh giá năng lực; không phải kỹ sư phần mềm.

Hệ quả khi viết README/docs:
- Nội dung **dễ hiểu với người không code chuyên sâu** — giải thích ý nghĩa, kết quả, quyết định kỹ thuật bằng ngôn ngữ rõ ràng.
- Nêu bật **giá trị & năng lực thực hiện** (cách tiếp cận, kiểm thử, chất lượng), không chỉ liệt kê công nghệ.
- Tránh thuật ngữ hàn lâm không giải thích, hạn chế chi tiết quá nội bộ.

## Luồng làm việc chuẩn (bắt buộc)

0. **Kiểm tra nhánh hiện tại TRƯỚC khi làm** — phải đang ở `dev`: `git branch --show-current`. Nếu không phải `dev`, checkout về `dev` trước khi sửa bất kỳ file nào. Làm xong mỗi lần cũng kiểm tra lại để tránh commit nhầm nhánh.
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

## Quy ước tên nhánh con

Nhánh con (tạo từ `origin/main` khi cần MR) đặt tên có tiền tố loại + mô tả ngắn bằng tiếng Anh, dùng `-` ngăn cách:

- `feat-<mô tả>` — tính năng mới (vd `feat-users-crud`)
- `fix-<mô tả>` — sửa lỗi (vd `fix-admin-auth`)
- `docs-<mô tả>` — README/tài liệu (vd `docs-readme-users-crud`)
- `chore-<mô tả>` — phụ trợ (vd `chore-remove-script`)

Quy tắc:
- Không đặt tên chung chung như `update`, `patch`, `temp`.
- Chỉ dùng chữ thường, `a-z0-9`, `-`. Không dấu tiếng Việt, không ký tự đặc biệt.
- Sau khi merge → xóa nhánh con (xem mục "Dọn nhánh sau merge").

## Quy ước README

- `README.md` (bản rút gọn): sống trên **cả 2 nhánh** `main` và `dev` — nội dung giống nhau, không bao giờ có link tới `docs/`.
- `docs/README.md` (bản chi tiết): chỉ sống trên nhánh `dev`, là mục lục trỏ tới bộ tài liệu `docs/*.md` (link tương đối `INSTALLATION.md`, `ARCHITECTURE.md`, `API.md`).
- Khi cần thay đổi README: sửa `README.md` trên nhánh `dev`, rồi đưa vào MR (nhánh con) lên `main`.
- KHÔNG sửa trực tiếp `README.md` trên `main` khi làm việc trên `dev`.

## Quy tắc khóa (chặn `docs/` + `AGENTS.md` lên main)

Git/GitHub không có cơ chế chặn tuyệt đối file mới qua MR. Vì vậy áp dụng quy ước quy trình sau — BẮT BUỘC:

- **Không bao giờ** tạo MR trực tiếp `dev` → `main` (sẽ kéo theo `docs/` + `AGENTS.md`).
- Mỗi lần cần đưa code/README lên `main`:
  1. `git fetch origin` trước — đảm bảo `origin/main` mới nhất.
  2. Tạo nhánh con từ `origin/main`: `git checkout -b <ten> origin/main`.
  3. Cherry-pick các commit code cần thiết: `git cherry-pick <hash>...`.
     - Nếu cherry-pick **bị conflict**: giải quyết trên nhánh con, `git cherry-pick --continue`. Nếu không thể giải quyết sạch → `git cherry-pick --abort` và báo người dùng.
  4. Push nhánh con, tạo MR `<ten>` → `main` — MR chỉ còn đúng các thay đổi mong muốn.
  5. Người dùng tự merge.
- Nếu `AGENTS.md` hoặc `docs/` xuất hiện trong MR → MR SAI, phải làm lại.

## Tạo link MR

Do không có `gh` CLI, dùng link soạn sẵn của GitHub:

1. **Có sẵn nhánh con** đã push: dùng URL `pull/new`:
   `https://github.com/<user>/<repo>/pull/new/<nhánh-con>?title=...&body=...`
2. **Chưa có nhánh con**: push nhánh con lên rồi dùng link trên, hoặc dùng `pull/<base>...<head>`:
   `https://github.com/<user>/<repo>/pull/<main>...<nhánh-con>`
3. Encode URL cho `title`/`body` (khoảng trắng `%20`, dấu `:` `%3A`, v.v.) để GitHub nhận đúng.

## Lệnh xác minh trước commit (bắt buộc)

Trước khi commit code lên `dev`, chạy build để đảm bảo không lỗi:

- Build: `yarn build` (dùng `react-scripts build`) — phải thành công (exit 0).
- Nếu build thất bại: sửa lỗi rồi chạy lại — KHÔNG commit khi còn lỗi.
- Với thay đổi chỉ là docs/AGENTS.md (không đụng code): có thể bỏ qua build.

## Quy ước commit message

Dùng [Conventional Commits](https://www.conventionalcommits.org/) — tiền tố bằng tiếng Anh, thân mô tả ngắn gọn:

- `feat:` — tính năng mới (vd `feat: full CRUD for users management`)
- `fix:` — sửa lỗi (vd `fix: harden admin auth`)
- `docs:` — tài liệu, README, docs/ (vd `docs: update architecture for users CRUD`)
- `chore:` — công việc phụ trợ, không phải feature/fix (vd `chore: remove merge-main.cmd`)
- `refactor:` — tái cấu trúc code, không đổi hành vi

## Lưu ý encoding

- Toàn bộ file text (`.md`, `.json`, code) dùng **UTF-8, KHÔNG BOM**.
- **Cẩn thận khi dùng PowerShell** đọc/ghi file qua pipeline (`>` redirect) — PowerShell 5.1 tự chuyển sang UTF-16 và làm hỏng tiếng Việt.
  - Đọc file text từ git bằng `git cat-file blob <rev>:<file>` + `cmd /c` redirect để giữ bytes gốc.
  - Ghi file dùng công cụ chuẩn (Write/Edit), không dùng `>` của PowerShell.
- Sau khi sửa file tiếng Việt, kiểm tra lại nội dung hiển thị đúng (không còn dấu `?` hoặc ký tự lạ).

## Dọn nhánh sau merge

- Sau khi MR merge vào `main`, **xóa nhánh con** để tránh tồn đọng:
  - Local: `git branch -D <ten>`
  - Remote: `git push origin --delete <ten>`
- Nhánh `readme-main` đang tồn đọng trên remote → xóa khi có dịp.
- Nhánh `dev` giữ nguyên (không xóa).
