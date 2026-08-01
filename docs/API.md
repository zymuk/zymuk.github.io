# API & Hợp đồng dữ liệu

> Đây là tài liệu cuối cùng của bộ kỹ thuật, khép lại mạch: tổng quan ([README](../README.md)) → cài đặt ([INSTALLATION.md](INSTALLATION.md)) → kiến trúc ([ARCHITECTURE.md](ARCHITECTURE.md)) → dữ liệu (tài liệu này). Trong [ARCHITECTURE.md](ARCHITECTURE.md) bạn đã thấy *luồng* dữ liệu; giờ ta đặc tả chính xác *hình dạng* của nó.

## 1. Mở đầu: "API" ở đây nghĩa là gì?

Dự án **không có backend** — không có REST API, không có `POST`/`PUT`/`DELETE`. Field `"apipage": "http://localhost/zymuk_page_api"` trong `package.json` chỉ là **trường dự phòng chưa được code sử dụng** (grep toàn bộ `src/` không tìm thấy nơi nào gọi tới nó).

Vì vậy, "API" trong tài liệu này được hiểu là **ba loại hợp đồng mà ứng dụng thực sự dựa vào**:

1. **Endpoints tĩnh** — các file JSON trong `public/` được fetch lúc runtime (mục 2).
2. **Lược đồ dữ liệu** — cấu trúc của từng file JSON (mục 3, 4, 5).
3. **Data Store API** — hợp đồng khóa `localStorage` (mục 6) + **Web APIs trình duyệt** (mục 7).

## 2. Endpoints (các file tĩnh được fetch)

Chỉ có **4 URL** được fetch trong toàn bộ codebase, tất cả là file tĩnh cục bộ:

| Endpoint | Nguồn dữ liệu | Nơi gọi | Mục đích |
|---|---|---|---|
| `GET /data.json` | `public/data.json` | `Home.jsx:54`, `Header.jsx:19`, `Login.jsx` (fallback khi chưa có `localStorage["users"]`), `Dashboard`, `ProjectsSettings`, `FeaturesSettings`, `ExperienceSettings`, `EducationSettings`, `CertificationSettings`, `SkillsSettings`, `Users` (fallback), `Settings` | Dữ liệu nội dung mặc định (sections, users) |
| `GET /config.json` | `public/config.json` | `Home.jsx:26`, `HomepageSettings` (load + reset) | Cấu hình trình bày 8 section của homepage |
| `GET /en.json` | `public/en.json` | mọi component admin | Bundle dịch tiếng Anh (map phẳng) |
| `GET /vi.json` | `public/vi.json` | mọi component admin | Bundle dịch tiếng Việt |

Quy ước chung:

- File ngôn ngữ được chọn qua `fetch(\`/${lang}.json\`)` với `lang = localStorage.getItem("lang") || "en"`.
- `Login.jsx` dùng cache-busting: `fetch("/en.json?v=${Date.now()}")`.
- Không có header/body đặc biệt; không có auth trên các endpoint này.

## 3. Lược đồ `data.json` — nội dung chính

File có 10 khóa cấp cao: `users`, `site`, `projects`, `features`, `experience`, `education`, `contact`, `certifications`, `skills`, `navigation`.

### 3.1. `users` — array
```json
{ "id": 1, "email": "admin@zymuk.com", "password": "password123", "role": "admin" }
```
| Khóa | Kiểu | Mô tả |
|---|---|---|
| `id` | number | định danh |
| `email` | string | email đăng nhập |
| `password` | string | mật khẩu **plaintext** (dùng cho đăng nhập giả lập) |
| `role` | string | `"admin"` / `"user"` |

> `data.json` là danh sách mặc định seed trong repo. Ở runtime, admin quản lý qua trang **Users** (`Users.jsx`), lưu danh sách đã chỉnh vào `localStorage["users"]`; `Login.jsx` đọc từ đó trước, nếu chưa có mới fallback `data.json` (xem mục 6.2).

> ⚠️ **Cảnh báo bảo mật:** mật khẩu được công khai trong repo và chỉ so khớp phía client — hoàn toàn không an toàn. Xem mục 8.

### 3.2. `site` — object
```json
{ "title": "Zymuk Portfolio", "description": "Personal portfolio and tools website", "author": "Zymuk Trần" }
```

### 3.3. `projects` — array
```json
{ "name": "PHP application", "demo": "http://ttngoc653.byethost4.com/", "github": "https://github.com/zymuk/zymuk.github.io" }
```
| Khóa | Kiểu | Mô tả |
|---|---|---|
| `name` | string | tên dự án |
| `demo` | string | link demo trực tiếp (có thể rỗng `""`) |
| `github` | string | link mã nguồn |

> Lưu ý: admin `ProjectsSettings` đọc các mục này rồi chuẩn hóa thành `demoLink`/`sourceLink` trước khi lưu vào localStorage — hai hệ thống dùng **hai quy ước tên khác nhau** (xem mục 6).

### 3.4. `features` — array (6 mục)
```json
{ "id": "calculator", "displayName": "Calculator", "description": "Simple calculator tool", "path": "/calculator", "isVisible": true }
```
| Khóa | Kiểu | Mô tả |
|---|---|---|
| `id` | string | định danh `kebab-case` (`calculator`, `notes`, `save-web`, `numerology-name`, `text-encoder-decoder`, `encrypt-decrypt`) |
| `displayName` | string | tên hiển thị |
| `description` | string | mô tả |
| `path` | string | route path tương ứng |
| `isVisible` | boolean | hiện/ẩn trên menu |

### 3.5. `experience` — array (mỗi mục kèm nested projects)
```json
{
  "role": "Software Developer → QA Tester",
  "company": "EVINA SOFTWARE CO. LTD",
  "period": "Jul 2025 - Dec 2025",
  "description": "Tasked with the technical maintenance...",
  "isVisible": true,
  "projects": [
    {
      "name": "OpenTestSystem (Legacy Maintenance & Support)",
      "description": "An ISO 13209 compliant diagnostic testing platform...",
      "technologies": ["C++", "OTX/OTL", "CMake", "WPF", "WinForms", "SVN"],
      "responsibilities": ["Maintained and patched core components..."]
    }
  ]
}
```
Cấp cha: `role` (string), `company` (string), `period` (string), `description` (string), `isVisible` (boolean), `projects` (array).
Cấp con `projects[]`: `name` (string), `description` (string), `technologies` (string[]), `responsibilities` (string[]).

### 3.6. `education` — array
```json
{
  "degree": "Bachelor of Science in Information Technology",
  "school": "Ho Chi Minh City University of Science (HCMUS)",
  "period": "2017 - 2019",
  "gpa": "6.63/10",
  "description": "Advanced studies in software engineering...",
  "achievements": ["Dean's List for academic excellence"],
  "isVisible": true
}
```
| Khóa | Kiểu | Mô tả |
|---|---|---|
| `degree` | string | bằng cấp |
| `school` | string | trường |
| `period` | string | khoảng thời gian (dạng text) |
| `gpa` | string | điểm (lưu dạng **chuỗi**) |
| `description` | string | mô tả |
| `achievements` | string[] | thành tích |
| `isVisible` | boolean | hiện/ẩn |

### 3.7. `contact` — array (link xã hội footer)
```json
[
  { "icon": "fab fa-github", "url": "https://github.com/zymuk", "title": "GitHub" },
  { "icon": "fab fa-linkedin", "url": "https://www.linkedin.com/in/ngoctrt", "title": "LinkedIn" }
]
```
| Khóa | Kiểu | Mô tả |
|---|---|---|
| `icon` | string | class Font Awesome (CDN `public/index.html`) |
| `url` | string | link đích |
| `title` | string | tooltip / tiêu đề |

> Lưu ý: `Footer.jsx` fetch `/data.json?v=${Date.now()}` (cache-busting) và chỉ render khi `Array.isArray(data.contact)`. Trước đây là **object** `{email, github, linkedin}` — không tương thích với Footer hiện tại.

### 3.8. `certifications` — array
```json
{
  "name": "SQL (Advanced)",
  "issuer": "HackerRank",
  "issueDate": "2025-12-04",
  "credentialUrl": "https://www.hackerrank.com/certificates/90dfbae98ceb",
  "description": "It covers topics like query optimization...",
  "isVisible": true
}
```
`issueDate` theo định dạng ISO `YYYY-MM-DD`; `credentialUrl` là link chứng nhận (render thành "View Credential").

### 3.9. `skills` — array (category kèm nested items)
```json
{
  "category": "Programming Languages",
  "items": [ { "name": "C++", "startDate": "2020-01", "isVisible": true } ],
  "isVisible": true
}
```
Cấp cha: `category` (string), `items` (array), `isVisible` (boolean).
Cấp con `items[]`: `name` (string), `startDate` (string `YYYY-MM`, tùy chọn — nếu thiếu thì hiển thị `years`; thiếu cả hai thì `Skills.jsx` chỉ render tên, không hiện "undefined years"), `isVisible` (boolean).

### 3.10. `navigation` — object (map nhãn menu)
```json
{ "home": "Home", "about": "About", "experience": "Experience", "certifications": "Certifications", "skills": "Skills", "projects": "Projects", "features": "Features", "contact": "Contact" }
```
> Ghi chú: `education` không nằm trong map này; hiện tại file không được component nào của site sử dụng.

## 4. Lược đồ `config.json` — cấu hình hiển thị homepage

Cấu trúc một khóa duy nhất `homepage` chứa 9 section. Mỗi section có 4 trường: `color`, `title`/`text`, `content`/`description`, `image`.

| Section | `color` (mặc định) | Trường text | Trường nội dung |
|---|---|---|---|
| `hero` | `#001f2e` | `title` | `content` |
| `about` | `#003855` | `text` | `description` |
| `experience` | `#005577` | `title` | `description` |
| `education` | `#006080` | `title` | `description` |
| `certifications` | `#006994` | `title` | `description` |
| `skills` | `#007099` | `title` | `description` |
| `projects` | `#0077b6` | `title` | `description` |
| `tools` | `#0099d4` | `title` | `description` |
| `contact` | `#00bbf2` | `title` | `description` |

```json
{
  "homepage": {
    "hero": {
      "color": "#001f2e",
      "title": "QA Engineer | A Tester Who Codes",
      "content": "6+ years in QA Automation: C++, Java, Jenkins, Docker...",
      "image": ""
    },
    "about": { "color": "#003855", "text": "TRẦN THẾ NGỌC", "description": "...", "image": "" }
  }
}
```

> **Ghi chú thiết kế:** đặt tên trường không nhất quán giữa các section — `hero` dùng `title`/`content`, `about` dùng `text`/`description`, các section còn lại dùng `title`/`description`. `Home.jsx` xử lý bằng pattern `settings.homepage?.X || settings.X`; component con tự chọn đúng trường của mình. Tất cả `image` đang để trống (section dùng màu nền).

## 5. Lược đồ file dịch `en.json` / `vi.json`

Hai file là **map phẳng key→chuỗi**, mỗi file 125 key, **khớp parity hoàn toàn**. Nhóm key chính:

| Nhóm | Key mẫu | Ví dụ (`en.json`) |
|---|---|---|
| Auth | `login_title`, `username`, `password`, `login_button`, `login_success`, `login_error`, `enter_email`, `enter_password` | `"login_button": "Login"` |
| Dashboard | `dashboard`, `admin_dashboard`, `admin_panel`, `quick_actions`, `recent_activity`, `just_now`, `today` | `"admin_panel": "Admin Panel"` |
| Nav/Layout | `hello`, `language`, `english`, `vietnamese`, `logout`, `homepage`, `profile`, `users`, `settings`, `footer_text` | `"logout": "Logout"` |
| 404 | `page_not_found`, `page_not_exist`, `back_to_dashboard` | `"page_not_found": "404 - Page Not Found"` |
| Homepage settings | `homepage_settings`, `hero_section`, `about_section`, `experience_section`, `projects_section`, `tools_section`, `contact_section`, `title`, `content`, `background_color`, `background_image_url`, `text`, `typing_text`, `save`, `save_changes` | `"save": "Save"` |
| Projects | `manage_projects`, `project_list`, `project_name`, `visible`, `edit`, `delete`, `add_project`, `update_project`, `cancel`, `demo_link`, `source_code_link` | `"add_project": "Add Project"` |
| Features | `features_settings`, `feature_id`, `display_name`, `path`, `features_saved`, `active_features` | `"display_name": "Display Name"` |
| Profile | `edit_profile_title`, `update_profile`, `change_password`, `current_password`, `new_password`, `confirm_password`, `profile_updated_success`, `password_mismatch_error`, `password_changed_success` | `"change_password": "Change Password"` |
| Certifications | `certifications`, `certification_name`, `issuer`, `issue_date`, `credential_url`, `add_certification`, `update_certification`, `confirm_delete` | `"issuer": "Issuer"` |
| Skills | `skills`, `skills_settings`, `category_name`, `skill_name`, `add_category`, `add_skill`, `edit_category` | `"add_category": "Add Category"` |
| Education | `education`, `education_settings`, `degree`, `school`, `period`, `gpa`, `achievements`, `add_education`, `add_achievement`, `new_education`, `no_education` | `"degree": "Degree"` |
| Common | `description`, `name`, `loading` | `"loading": "Loading..."` |

## 6. Data Store API — hợp đồng localStorage

Quy tắc truy cập nhất quán: `localStorage.setItem(key, JSON.stringify(value))` để ghi, `JSON.parse(localStorage.getItem(key))` để đọc. Mỗi khóa là một **hợp đồng** với bên ghi/bên đọc riêng.

### 6.1. Khóa nội dung (admin ghi, site đọc)

| Khóa | Shape | Bên ghi | Bên đọc |
|---|---|---|---|
| `homepageSettings` | object 8 section (giống `config.json.homepage`) | `HomepageSettings` | `Home.jsx`, `HomepageSettings` |
| `projects` | array `{name, description, demoLink, sourceLink, isVisible}` | `ProjectsSettings` | `Home.jsx`, `ProjectsSettings` |
| `features` | array `{id, displayName, description, path, isVisible}` | `FeaturesSettings` | `Home.jsx`, `Header.jsx`, `FeaturesSettings` |
| `experience` | array experience (kèm nested projects/responsibilities) | `ExperienceSettings` | `Home.jsx`, `ExperienceSettings` |
| `education` | array education (`degree, school, period, gpa, description, achievements[], isVisible`) | `EducationSettings` | `Home.jsx`, `EducationSettings` |
| `certifications` | array `{name, issuer, issueDate, credentialUrl, description, isVisible}` | `CertificationSettings` | `Home.jsx`, `CertificationSettings` |
| `skills` | array category `{category, isVisible, items:[{name, startDate, isVisible}]}` | `SkillsSettings` | `Home.jsx`, `SkillsSettings` |

> **Đã sửa:** trước đây `ExperienceSettings` ghi nhầm khóa `experienceData` trong khi `Home.jsx` đọc `experience`, khiến chỉnh sửa Experience không lên trang công khai. Hiện khóa thống nhất là `experience`; khi đọc, nếu tồn tại `experienceData` cũ sẽ được tự động migrate sang `experience`.

### 6.2. Khóa phiên & tài khoản (admin)

| Khóa | Shape | Bên ghi | Bên đọc |
|---|---|---|---|
| `lang` | `"en"` / `"vi"` | `AdminHeader`, `Login` | mọi trang admin |
| `users` | array `{email, password, role}` | `Users` | `Login`, `Users` |
| `admin_token` | chuỗi hex ngẫu nhiên 128-bit (sinh bởi `generateToken()`) | `Login` | `Admin.jsx`, `Dashboard`, `Login` |
| `admin_token_exp` | timestamp (ms) hết hạn phiên, mặc định +24h | `Login` | `Admin.jsx`, `Dashboard`, `Login` |
| `user` | JSON `{id, email, password, role}` | `Login` | `Admin.jsx` |
| `site_data` | toàn bộ object `data.json` | `Settings` (cache) | `Settings` |

> **Lưu ý:** `admin_token`/`admin_token_exp` do `src/utils/auth.js` quản lý — `isAuthenticated()` yêu cầu token tồn tại **và** chưa hết hạn; `logout()` xóa cả 3 khóa. Vẫn là cơ chế giả lập: ai cũng set tay được qua DevTools.
>
> **Users:** trang `Users.jsx` ghi `localStorage["users"]`; `Login.jsx` đọc từ đó trước, fallback `data.json` — nên user thêm/xóa trong admin có hiệu lực ngay khi đăng nhập.

### 6.3. Khóa công cụ (chỉ site, dữ liệu cá nhân người dùng)

| Khóa | Shape | Nơi dùng |
|---|---|---|
| `savedWebPages` | array `{id, title, url, description, createdAt, updatedAt}` | `SaveWeb` |
| `userNotes` | array `{id, title, shortContent, content, createdAt, updatedAt}` (`content` chứa HTML) | `Notes` |
| `numerologyHistory` | object theo ngày sinh (mỗi `date` chứa `results[]`) | `NumerologyName` |

## 7. Web APIs trình duyệt được sử dụng

| API | Nơi dùng | Mục đích |
|---|---|---|
| `localStorage` | toàn app | Lưu trữ dữ liệu (xem mục 6) |
| `crypto.subtle.digest` | `EncryptDecrypt.jsx` | Tính SHA-1/SHA-256/SHA-512 |
| `crypto.getRandomValues` | `src/utils/auth.js` | Sinh token phiên ngẫu nhiên 128-bit |
| `navigator.clipboard.writeText` | `EncryptDecrypt`, `TextEncoderDecoder` | Nút Copy |
| `btoa` / `atob` | `EncryptDecrypt` | Base64 (bọc `unescape`/`encodeURIComponent` cho UTF-8) |
| `document.execCommand` | `Notes.jsx` (RichTextEditor) | Lệnh định dạng rich-text — **đã deprecated** |
| `URL.createObjectURL` + Blob | `Settings.jsx` (export JSON) | Tải file `data_<timestamp>.json` về máy |
| `window.confirm` / `prompt` | `Notes`, `NumerologyName`, `SaveWeb` | Xác nhận xóa, nhập URL |
| `scrollIntoView` | `Site.jsx` | Cuộn mượt tới section |

## 8. Khuyến nghị mở rộng với backend thật

Nếu muốn biến nơi lưu trữ thành bền vững (dữ liệu admin dùng chung mọi máy) và bảo mật thật, mô hình đề xuất:

**Endpoints REST (thay thế localStorage + file JSON):**

```
GET    /api/sections/:name          → trả nội dung section (projects, features, ...)
PUT    /api/sections/:name          → ghi đè nội dung section   (admin)
GET    /api/config                  → cấu hình homepage
PUT    /api/config                  → cập nhật cấu hình homepage (admin)
POST   /api/auth/login              → nhận {email, password} → trả JWT
GET    /api/users/me                → thông tin user từ token
```

**Ví dụ payload login:**
```json
POST /api/auth/login
{ "email": "admin@zymuk.com", "password": "password123" }
→ 200
{ "token": "<jwt>", "user": { "id": 1, "email": "admin@zymuk.com", "role": "admin" } }
```

**Bảng mapping nâng cấp (hợp đồng hiện tại → API):**

| Hợp đồng hiện tại | Endpoint thay thế |
|---|---|
| `localStorage["homepageSettings"]` | `GET/PUT /api/config` |
| `localStorage["projects"/"features"/"experience"/"education"/"certifications"/"skills"]` | `GET/PUT /api/sections/:name` |
| `localStorage["admin_token"]` + đối chiếu `users` plaintext | `POST /api/auth/login` (JWT + hash mật khẩu bằng bcrypt/argon2) |
| `data.json` export thủ công | cơ sở dữ liệu server (PostgreSQL/MySQL/MongoDB) |

Khi triển khai, các component có thể giữ nguyên cấu trúc bằng cách chỉ đổi lớp đọc/ghi: hiện tại là `localStorage.getItem/setItem`, sau là `fetch` — phần render của site không cần thay đổi.

## 9. Kết luận

Ba tài liệu này đã bao phủ trọn vòng đời dự án: **INSTALLATION.md** giúp bạn chạy và deploy, **ARCHITECTURE.md** giải thích cách mọi thứ nối kết, **API.md** (tài liệu này) đặc tả chính xác mọi hợp đồng dữ liệu. Nếu bạn thay đổi lược đồ JSON hoặc thêm khóa localStorage, hãy cập nhật lại mục 3–6 để tài liệu luôn song hành với code.
