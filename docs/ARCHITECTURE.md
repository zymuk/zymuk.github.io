# Kiến trúc hệ thống

> Tiếp nối [INSTALLATION.md](INSTALLATION.md) — sau khi biết cách *vận hành*, đây là tài liệu giải thích *cách hoạt động*. Chúng ta sẽ đi từ ngoài vào trong: tổng quan → routing → từng khu vực (Site, Admin) → luồng dữ liệu → chi tiết mô-đun → CSS → hạn chế đã biết. Mọi đường dẫn và tên hàm đều trích trực tiếp từ code.

## 1. Tổng quan kiến trúc

Zymuk Page là một **SPA tĩnh thuần client**:

- **Không có backend, không có database server.** Dữ liệu nằm trong thư mục `public/` dưới dạng file JSON tĩnh (`data.json`, `config.json`, `en.json`, `vi.json`) và được ghi đè cục bộ qua `localStorage`.
- Build bằng **Create React App 5**, deploy như file tĩnh lên GitHub Pages.
- Router là **`HashRouter`** — toàn bộ điều hướng nằm trong phần hash của URL, giúp mọi đường dẫn lồng nhau hoạt động trên host tĩnh mà không cần rewrite (giải thích đầy đủ trong [INSTALLATION.md](INSTALLATION.md#63-vì-sao-dùng-hashrouter)).

Sơ đồ entry point (`src/index.js`):

```
ReactDOM.createRoot(...)
└── <StrictMode>
    └── <HashRouter>
        ├── <Route path="/*"       element={<Site />} />   // src/site
        └── <Route path="/admin/*" element={<Admin />} />  // src/admin
```

Cây thư mục nguồn:

```
src/
├── index.js            # Entry, mount Root, định nghĩa 2 nhánh route
├── index.css           # Reset global (margin, smooth scroll)
├── site/               # Khu vực công khai
│   ├── Site.jsx        # Layout + route + hiệu ứng scroll
│   ├── Site.css        # Hệ thống thiết kế dùng chung
│   ├── components/     # header/ + footer/
│   └── pages/          # home/ (9 section) + 6 công cụ + notFound
└── admin/              # Khu vực quản trị
    ├── Admin.jsx       # Auth guard + route nội bộ
    ├── AdminLayout.jsx # Header + Sidebar + <Outlet/>
    ├── AuthContext.jsx # (dead code — xem mục 5.3)
    ├── components/     # AdminHeader, AdminSidebar, ProtectedRoute (dead)
    └── pages/          # 10 trang quản lý
```

## 2. Vòng đời ứng dụng & routing

`src/index.js` render ứng dụng vào `#root` (trong `public/index.html`) với `StrictMode` và `HashRouter`. Có hai nhánh route cấp cao: `/*` cho Site và `/admin/*` cho Admin — cả hai đều hoạt động trên cùng một URL gốc, phân biệt bằng prefix `admin`.

### 2.1. Routing của Site (`src/site/Site.jsx`)

`Site` render `Header`, khu vực `<div className="siteContent">` chứa `<Routes>`, và `Footer`. Ngoài ra nó đảm nhiệm hai hiệu ứng:

- **Header đổi màu khi cuộn**: listener `scroll` thêm/rem class `scrolled` vào `.header` khi `window.scrollY > 50` (Site.jsx:18-25).
- **Highlight nav active theo section**: với mỗi `section` đang nằm trong vùng nhìn, thêm class `active` vào link `a[data-scroll="<section-id>"]` (Site.jsx:32-46).
- **`scrollToSection(id)`** — cuộn mượt tới `document.getElementById(id)`, được truyền xuống `Header`.

| Route | Component | File |
|---|---|---|
| `/` | `Home` | `src/site/pages/home/Home.jsx` |
| `/features` | `Features` | `src/site/pages/home/features/Features.jsx` |
| `/calculator` | `Calculator` | `src/site/pages/calculator/Calculator.jsx` |
| `/notes` | `Notes` | `src/site/pages/notes/Notes.jsx` |
| `/numerology-name` | `NumerologyName` | `src/site/pages/numerologyName/NumerologyName.jsx` |
| `/text-encoder-decoder` | `TextEncoderDecoder` | `src/site/pages/textEncoderDecoder/TextEncoderDecoder.jsx` |
| `/save-web` | `SaveWeb` | `src/site/pages/saveWeb/SaveWeb.jsx` |
| `/encrypt-decrypt` | `EncryptDecrypt` | `src/site/pages/encryptDecrypt/EncryptDecrypt.jsx` |
| `*` | `NotFound` | `src/site/pages/notFound/NotFound.jsx` |

> **Điểm yếu đã biết:** route `/features` render component `Features` **không có props `data`** → nội dung luôn rỗng ("No features available"). Trang Features chỉ có ý nghĩa khi nằm trong `Home`.

### 2.2. Routing của Admin (`src/admin/Admin.jsx`)

`Admin` tự đóng vai trò **auth guard cục bộ** (không dùng `AuthContext`). Khi mount, nó đọc `localStorage.getItem("admin_token")`; nếu tồn tại thì set `auth=true` và lấy `user` để hiển thị `displayName`, ngược lại các route con bị điều hướng về `login`.

| Route | Component |
|---|---|
| `/admin/login` | `Login` (không cần auth) |
| `/admin` | `AdminLayout` (cần auth) — route index: `Dashboard` |
| `/admin/homepage` | `HomepageSettings` |
| `/admin/projects` | `ProjectsSettings` |
| `/admin/features` | `FeaturesSettings` |
| `/admin/experience` | `ExperienceSettings` |
| `/admin/education` | `EducationSettings` |
| `/admin/certifications` | `CertificationSettings` |
| `/admin/skills` | `SkillsSettings` |
| `/admin/profile` | `EditProfile` |
| `/admin/users` | `Users` |
| `/admin/settings` | `Settings` |
| `*` | `NotFound` |

## 3. Kiến trúc trang công khai (Site)

### 3.1. Home — bộ điều phối dữ liệu trung tâm

`src/site/pages/home/Home.jsx` là component chịu trách nhiệm **tải toàn bộ dữ liệu** và phân phối xuống 9 section con. Nó quản lý 3 state:

| State | Nội dung | Nguồn |
|---|---|---|
| `settings` | Cấu hình trình bày từng section (màu, title, ảnh) | `localStorage["homepageSettings"]`, fallback `fetch("/config.json")` |
| `data` | Nội dung (projects, features, experience, education, certifications, skills) | 6 khóa localStorage riêng lẻ, fallback `fetch("/data.json")` |
| `loading` | Cờ hiển thị `Loading...` | — |

**Logic tải (`loadHomeData`, Home.jsx:18-95):**
1. `settings`: nếu `localStorage.homepageSettings` tồn tại → dùng luôn; ngược lại fetch `/config.json` và dùng toàn bộ JSON.
2. Nội dung: nếu **cả ba** key `projects`, `features`, `experience` đều có trong localStorage → parse cả 6 section từ localStorage. Ngược lại fetch `/data.json`, và với từng section nếu thiếu key tương ứng thì dùng `jsonData.<section> || []`.
3. `catch` → fallback `settings:{}`, `data:{projects:[],features:[]}`; `finally` → `loading:false`.

Khi render, `Home` truyền props theo mẫu `settings.homepage?.<section> || settings.<section> || {}` (tương thích cả hai kiểu: `config.json` bọc dưới `homepage` hoặc `homepageSettings` đã được lưu phẳng):

```jsx
<Hero           settings={settings.homepage?.hero   || settings.hero || {}} />
<About          settings={settings.homepage?.about  || settings.about || {}} />
<Experience     settings={...} data={data.experience || []} />
<Education      settings={...} data={data.education || []} />
<Certifications settings={...} data={data.certifications || []} />
<Skills         settings={...} data={data.skills || []} />
<Projects       settings={...} data={data.projects || []} />
<Features       settings={settings.homepage?.tools || settings.tools || {}} data={data.features || []} />
<Contact        settings={settings.homepage?.contact || settings.contact || {}} />
```

### 3.2. Các section con của Home

| Section | File | Đặc điểm |
|---|---|---|
| **Hero** | `home/hero/Hero.jsx` | Nền = `settings.color` + optional `settings.image`; render `title`/`content`; trả `null` nếu thiếu cả hai |
| **About** | `home/about/About.jsx` | Hiệu ứng **typewriter** (100ms/ký tự, 3 `useEffect` nối tiếp); `settings.text` là tiêu đề, `settings.description` là nội dung gõ |
| **Experience** | `home/experience/Experience.jsx` | Timeline: `role, company, period, description` + nested `projects[]` (name, description, `technologies[]`, `responsibilities[]`); lọc `isVisible !== false` |
| **Education** | `home/education/Education.jsx` | `<ul>`: `degree — school (period), GPA`; lọc `isVisible` |
| **Certifications** | `home/certifications/Certifications.jsx` | `name — issuer (issueDate)` + link "View Credential" nếu có `credentialUrl` |
| **Skills** | `home/skills/Skills.jsx` | Nhóm theo `category`; `formatStartDate("2020-01")` → "January 2020", hiển thị "Since ..." hoặc "N years" |
| **Projects** | `home/projects/Projects.jsx` | Link "Live Site" (`demo`) / "GitHub" (`github`) |
| **Features** | `home/features/Features.jsx` | Trung tâm điều hướng tới các công cụ — `<NavLink>` tới `path || "/" + id`, hiển thị `displayName`; nếu không được truyền `data` (route `/features` đứng riêng) tự fetch `data.json` + `config.json` |
| **Contact** | `home/contact/Contact.jsx` | Form `mailto:` — submit mở email client với nội dung name/email/subject/message được điền sẵn (không cần backend) |

### 3.3. Header và Footer

- **`Header`** (`components/header/Header.jsx`): đọc `localStorage["features"]` (lọc `isVisible`), fallback `fetch("/data.json")`. Render menu theo **heuristic URL**: nếu `window.location.href` khớp regex "URL trần không có hash-path" → menu cuộn một trang (9 nút `data-scroll` gọi `scrollToSection`); ngược lại → menu link tới các công cụ (`<Link to={"/"+id}>`). Kèm hamburger menu mobile.
- **`Footer`** (`components/footer/Footer.jsx`): fetch `/data.json?v=${Date.now()}` (cache-busting), chỉ render khi `Array.isArray(data.contact)`, vẽ link xã hội theo từng item `{icon, url, title}` trong mảng `contact` (thay cho danh sách cứng cũ). Vẫn import `package.json` để đọc `datetimedeploy` (hiển thị "Deploy at ..." nếu khác rỗng — `deploy.bat` tự điền).

## 4. Kiến trúc Admin

### 4.1. Bố cục chung

`AdminLayout` (`src/admin/pages/AdminLayout.jsx`) render `AdminHeader` + `AdminSidebar` + `<main><Outlet/></main>`. State `isSidebarOpen` (mặc định `true`) cho phép thu gọn sidebar bằng nút chevron.

- **`AdminSidebar`** (`components/AdminSidebar.jsx`): menu `NavLink` với 10 mục (Dashboard, Homepage, Projects, Features, Experience, Education, Certifications, Skills, Edit Profile, Users, Settings), nhãn lấy từ bundle dịch `/{lang}.json`.
- **`AdminHeader`** (`components/AdminHeader.jsx`): tiêu đề "Admin Dashboard", dropdown user (`Hello, {displayName}` — đóng khi click ngoài), **switch ngôn ngữ EN/VI** (ghi `localStorage.lang` rồi `window.location.reload()`), và nút **Logout** (xóa `admin_token` + `user`, điều hướng về login).

### 4.2. Các trang quản lý

Mọi trang settings đều tuân theo cùng một khuôn mẫu: **đọc localStorage trước → fallback file JSON tĩnh → sửa state → ghi ngược localStorage**. Không có bất kỳ HTTP write nào (POST/PUT/DELETE).

| Trang | File | Nguồn dữ liệu | Chức năng | Key ghi |
|---|---|---|---|---|
| Dashboard | `pages/Dashboard.jsx` | `GET /data.json` | Thẻ thống kê số lượng từng section + lối tắt điều hướng; kiểm tra token | — |
| Homepage | `pages/HomepageSettings.jsx` | `GET /config.json` | Sửa 8 section (hero, about, experience, education, certifications, skills, projects, tools, contact) — màu/title/text/ảnh; có Reset | `homepageSettings` |
| Projects | `pages/ProjectsSettings.jsx` | `GET /data.json` | CRUD qua form; tự chuyển key cũ `demo`/`github` → `demoLink`/`sourceLink` | `projects` |
| Features | `pages/FeaturesSettings.jsx` | `GET /data.json` | Sửa inline các hàng hiện có (`displayName`, `description`, `path`, `isVisible`); **không thêm/xóa** | `features` |
| Experience | `pages/ExperienceSettings.jsx` | `GET /data.json` | CRUD entry + nested projects + responsibilities + visibility | `experience` |
| Education | `pages/EducationSettings.jsx` | `GET /data.json` | CRUD qua form (`degree, school, period, gpa, description, achievements[]`) | `education` |
| Certifications | `pages/CertificationSettings.jsx` | `GET /data.json` | CRUD (`name, issuer, issueDate, credentialUrl, description, isVisible`) | `certifications` |
| Skills | `pages/SkillsSettings.jsx` | `GET /data.json` | CRUD category + item con (`name`, `startDate`, `isVisible`) | `skills` |
| Edit Profile | `pages/EditProfile.jsx` | — | **Stub/no-op** — form chỉ hiện `alert()` thành công, không lưu gì | — |
| Users | `pages/Users.jsx` | — | **Placeholder** — chỉ render tiêu đề | — |
| Settings | `pages/Settings.jsx` | `GET /data.json` | **Export duy nhất**: tải toàn bộ data về dạng `data_<timestamp>.json` qua Blob | `site_data` (cache) |

## 5. Luồng dữ liệu — trái tim của kiến trúc

### 5.1. Mô hình hai tầng: localStorage ưu tiên, JSON tĩnh fallback

Toàn bộ ứng dụng vận hành trên một quy ước duy nhất:

```
                    ┌────────────────────────────┐
                    │  Admin Panel (src/admin)   │
                    └─────────────┬──────────────┘
                                  │ ghi
                                  ▼
                        ┌─────────────────────┐
                        │   localStorage      │  ← NGUỒN CHÍNH
                        │ (key = tên section) │
                        └─────────────┬───────┘
                                      │ đọc (nếu có)
                  ┌───────────────────┴───────────────────┐
                  │                                       │
        ┌─────────┴─────────┐                  ┌──────────┴─────────┐
        │ Site (src/site)   │                  │  public/*.json     │
        │ Home + Header     │  ← fallback ───  │  dữ liệu MẶC ĐỊNH  │
        └───────────────────┘                  └────────────────────┘
```

1. **Admin sửa nội dung** → `localStorage.setItem(<sectionKey>, JSON.stringify(state))`.
2. **Trang công khai load** → `Home.jsx` / `Header.jsx` gọi `localStorage.getItem(<sectionKey>)`; nếu có → dùng, nếu không → `fetch("/data.json")` / `fetch("/config.json")` lấy mặc định.
3. **`public/data.json` & `config.json` không bao giờ bị ghi** lúc runtime — chúng là mặc định seed trong repo. Muốn thay đổi bền vững, admin phải **Export** (Settings) rồi commit file.

> Hệ quả quan trọng: thay đổi admin **chỉ tồn tại trong localStorage của máy/trình duyệt đó**. Deploy lại code **không** mang dữ liệu admin theo. Với một site cá nhân đây là lựa chọn chấp nhận được; với dữ liệu quan trọng cần backend — xem gợi ý ở [API.md](API.md#7-khuyến-nghị-mở-rộng-với-backend-thật).

### 5.2. Bảng đầy đủ khóa localStorage

| Khóa | Dạng dữ liệu | Nơi ghi | Nơi đọc |
|---|---|---|---|
| `homepageSettings` | object 8 section | `HomepageSettings` | `Home.jsx`, `HomepageSettings` |
| `projects` | array `{name, description, demoLink, sourceLink, isVisible}` | `ProjectsSettings` | `Home.jsx`, `ProjectsSettings` |
| `features` | array `{id, displayName, description, path, isVisible}` | `FeaturesSettings` | `Home.jsx`, `Header.jsx`, `FeaturesSettings` |
| `experience` | array experience (kèm nested projects) | `ExperienceSettings` | `Home.jsx`, `ExperienceSettings` |
| `education` | array education | `EducationSettings` | `Home.jsx`, `EducationSettings` |
| `certifications` | array certifications | `CertificationSettings` | `Home.jsx`, `CertificationSettings` |
| `skills` | array category (kèm items) | `SkillsSettings` | `Home.jsx`, `SkillsSettings` |
| `lang` | `"en"` / `"vi"` | `AdminHeader`, `Login` | mọi trang admin |
| `admin_token` | chuỗi cứng `"authenticated"` | `Login` | `Admin.jsx`, `Dashboard`, `Login` |
| `user` | JSON `{id, email, password, role}` | `Login` | `Admin.jsx` |
| `site_data` | toàn bộ data.json | `Settings` (cache) | `Settings` |
| `savedWebPages` | array `{id, title, url, description, createdAt, updatedAt}` | `SaveWeb` | `SaveWeb` |
| `userNotes` | array `{id, title, shortContent, content, createdAt, updatedAt}` | `Notes` | `Notes` |
| `numerologyHistory` | object theo ngày sinh, mỗi entry có `results[]` | `NumerologyName` | `NumerologyName` |

### 5.3. Xác thực admin — cơ chế giả lập

`Login.jsx` fetch `data.json`, tìm `user` trong `users` khớp `email` + `password` (so khớp **plaintext phía client**), rồi ghi `admin_token = "authenticated"` (giá trị cứng, không có token thật, không hết hạn) và `user`.

```js
const user = users.find((u) => u.email === email && u.password === password);
if (user) {
  localStorage.setItem("admin_token", "authenticated");
  localStorage.setItem("user", JSON.stringify(user));
  ...
}
```

**Hệ quả bảo mật:** chỉ cần tồn tại khóa `admin_token` là vào được `/admin` — ai cũng có thể set khóa này qua DevTools console. Đây là hạn chế chấp nhận được cho site tĩnh cá nhân, nhưng **không dùng cho dữ liệu nhạy cảm**.

**Dead code:** `src/admin/AuthContext.jsx` (định nghĩa `AuthProvider`/`useAuth` nhưng không được mount ở đâu) và `src/admin/components/ProtectedRoute.jsx` (không được import; hơn nữa import `./AuthContext` sai đường dẫn — file thật nằm một cấp trên). `src/admin/components/layout/Sidebar.jsx` cũng không được dùng (AdminLayout dùng `AdminSidebar`).

## 6. Chi tiết các mô-đun công cụ

Tất cả công cụ đều chạy 100% phía client (không fetch dữ liệu ngoài).

### 6.1. Calculator (`pages/calculator/Calculator.jsx`)

State `input` (chuỗi biểu thức) + `result`. Bàn phím số/chức năng (π, e, sin, cos, tan, log, ln, exp, `^`, √). Khi tính:

1. Chuẩn hóa ký hiệu (`×`→`*`, `÷`→`/`, `√`→`Math.sqrt`, `π`→`Math.PI`, `e`→`Math.E`, các hàm lượng giác...).
2. `eval(expression)` trong try/catch → `"Error"` nếu lỗi.

> **Rủi ro:** dùng `eval` trên input người dùng (đã disable lint `no-eval`). Input của trang này bị giới hạn bởi các nút bấm, nhưng nếu mở rộng cần thay bằng trình parse biểu thức an toàn (ví dụ `mathjs`).

### 6.2. Notes (`pages/notes/Notes.jsx`, 621 dòng)

Hai component trong một file:

- **`RichTextEditor`** (5-170): editor `contentEditable` + `document.execCommand` (bold/italic/underline, căn lề, danh sách, link, heading, hr). Enter chèn `<br><br>`. Toolbar `"basic"` hoặc `"full"`.
- **`Notes`** (172-619): CRUD ghi chú với `title`, `shortContent`, `content` (HTML), `createdAt`, `updatedAt`. ID sinh bằng `Date.now().toString(36) + Math.random().toString(36).substr(2)`. Lưu `localStorage["userNotes"]`. Có search, view modal (render HTML qua `dangerouslySetInnerHTML`), edit, delete (confirm), thống kê.

> **Điểm cần lưu ý:** `document.execCommand` đã **deprecated**; và render HTML người dùng nhập bằng `dangerouslySetInnerHTML` mang rủi ro XSS nếu nội dung có nguồn không tin cậy.

### 6.3. SaveWeb (`pages/saveWeb/SaveWeb.jsx`)

Quản lý bookmark (`localStorage["savedWebPages"]`). Form thêm/sửa với `validateUrl` qua `new URL()`. Status message (✅/❌) tự ẩn sau 3 giây. Enter submit (trừ trong textarea). Search theo title/url/description.

### 6.4. NumerologyName (`pages/numerologyName/NumerologyName.jsx`)

Thần số học sinh tên từ ngày sinh. Luồng:

1. `handleBirthDateChange` tách chữ số của ngày/tháng/năm → `usedNumbers`.
2. `calculateNumerologyValue` xác định các số 1–9 **vắng mặt** trong ngày sinh → `remainingNumbers`.
3. `getLetters(number)` map số → bộ chữ cái (1→AJS, 9→IR...). Với mỗi số vắng mặt, chọn ngẫu nhiên 1 chữ cái → ghép thành tên.
4. `handleSubmit` lặp tối đa `calculateMaxNameCount` lần để tránh trùng tên đã có trong lịch sử/session.
5. `handleSave` upsert theo `date` vào `localStorage["numerologyHistory"]`; có xóa, clear cache, view, search.

### 6.5. TextEncoderDecoder (`pages/textEncoderDecoder/TextEncoderDecoder.jsx`)

Mã hóa/giải mã URL thuần: `encodeURIComponent` / `decodeURIComponent` (try/catch), copy qua `navigator.clipboard`.

### 6.6. EncryptDecrypt (`pages/encryptDecrypt/EncryptDecrypt.jsx`, 799 dòng)

Bộ công cụ mã hóa văn bản với **16 thuật toán** chia 4 nhóm trong `<select>`:

| Nhóm | Thuật toán | Cần mật khẩu |
|---|---|---|
| Encoding | base64, binary, hex, ascii, url | — |
| Ciphers (đảo ngược được) | caesar (shift 3), rot13, atbash, reverse, xor, vigenère | xor, vigenère |
| Hash (một chiều) | md5, sha1, sha256, sha512 | — |
| Fun | morse, piglatin | — |

Luồng xử lý (`handleProcess`):
1. Validate input rỗng; với xor/vigenère bắt buộc có mật khẩu.
2. Nếu là hash: mode `decrypt` → lỗi "Hash functions are one-way only"; ngược lại tính hash và trả về sớm.
3. Ngược lại dispatch encrypt/decrypt theo cặp hàm; set status "✅ Text encrypted/decrypted successfully!".
4. `catch` → "❌ Error: ..."; status tự ẩn sau 3–5 giây.

Điểm kỹ thuật đáng chú ý:
- XOR/Vigenère tự viết tay; hash dùng **Web Crypto** (`crypto.subtle.digest`).
- Base64 dùng `btoa(unescape(encodeURIComponent()))` để an toàn UTF-8.
- **MD5 không thật** — thực chất cắt 32 ký tự đầu của SHA-1 (có comment trong code xác nhận). Không dùng cho mục đích bảo mật.
- Thêm nút Swap (lấy output làm input + đảo mode), Copy, Clear, và bảng mô tả chi tiết từng thuật toán.

## 7. Cơ chế quốc tế hóa (i18n)

- **Chỉ tồn tại ở Admin.** Trang công khai không đọc `en.json`/`vi.json` — nội dung tiếng Việt của site đến từ `config.json`.
- Mỗi component admin đọc `localStorage.getItem("lang") || "en"` rồi `fetch(`/${lang}.json`)` lấy toàn bộ map dịch vào object `t` (vd `AdminHeader.jsx:15-21`). `Login.jsx` dùng `fetch("/en.json?v=${timestamp}")` để cache-bust.
- Chuyển ngôn ngữ: ghi `localStorage.lang` → `window.location.reload()`.
- Hai file `en.json` / `vi.json` là **map phẳng** 125 key song song, khớp parity tuyệt đối. Danh sách nhóm key và ví dụ trong [API.md](API.md#5-lược-đồ-file-dịch-enjson--vijson).

## 8. Thiết kế UI & CSS

- **Không dùng CSS variables/tokens.** Màu viết cứng, lặp lại giữa các file.
- **Bảng màu "mệnh Thủy"** (comment trong code ghi chú): nền `#001f3f`, gradient xanh nước từ tối ra sáng theo thứ tự section — hero `#001f2e` → about `#003855` → experience `#005577` → education `#006080` → certifications `#006994` → skills `#007099` → projects `#0077b6` → tools `#0099d4` → contact `#00bbf2`. Màu này **ghi đè được** bằng `settings.color` từ admin.
- **Glassmorphism**: `.glass-header`/`.glass-content` dùng `rgba(255,255,255,0.1)` + `backdrop-filter: blur(20px)`, các trang công cụ tự áp dụng lại pattern này.
- **Thành phần dùng chung** trong `Site.css`: `.page-title` (2.5rem), `.btn-primary`/`.btn-secondary`, form controls (`.form-input`, `.form-textarea`), `.modal-overlay` + `.modal-content` (animation `modalSlideIn`).
- **Admin CSS** được tách namespace bằng tiền tố `admin-` (commit `d7540d4`) để tránh xung đột với CSS của Site.
- **Responsive**: breakpoint `768px` ở hầu hết các trang (hamburger menu Header, xếp chồng cột, nút full-width), Notes thêm breakpoint `480px`.

## 9. Hạn chế đã biết (từ phân tích code)

> **Ghi chú cập nhật:** ba hạn chế trước đây **đã được sửa** — lệch key Experience (`ExperienceSettings` giờ đọc/ghi khóa `experience` khớp `Home.jsx`, kèm migration từ `experienceData`), form Contact (`Contact.jsx` giờ mở `mailto:` với nội dung đã điền sẵn), và route `/features` đứng riêng (`Features.jsx` giờ tự fetch `data.json` + `config.json` khi không được truyền props — trước đây crash `TypeError` vì `data.filter` trên `undefined`). Các mục dưới đây vẫn chưa được xử lý.

| # | Hạn chế | Vị trí | Ảnh hưởng |
|---|---|---|---|
| 1 | Auth giả lập, token cứng `"authenticated"`, mật khẩu plaintext | `Login.jsx`, `Admin.jsx` | Ai cũng vào được admin bằng DevTools |
| 2 | MD5 là SHA-1 cắt ngắn | `EncryptDecrypt.jsx` | Không dùng được như hash thật |
| 3 | Calculator dùng `eval` | `Calculator.jsx:21-41` | Rủi ro bảo mật nếu mở rộng input |
| 4 | Notes dùng `document.execCommand` (deprecated) + `dangerouslySetInnerHTML` | `Notes.jsx` | Rủi ro XSS với nội dung không tin cậy |
| 5 | `/features` đứng riêng không có dữ liệu; EditProfile & Users là stub | `EditProfile.jsx`, `Users.jsx` | Tính năng chưa hoàn thiện |
| 6 | Header dùng regex heuristic để phân biệt 2 chế độ menu | `Header.jsx:37-46` | Nhạy cảm với format URL |

## 10. Tiếp theo

Bạn đã hiểu *kiến trúc hoạt động*: route nào dẫn đâu, dữ liệu lưu ở đâu, ai đọc/ghi gì. Tài liệu cuối cùng — **[docs/API.md](API.md)** — sẽ đặc tả chính xác *hình dạng của dữ liệu*: lược đồ từng file JSON, hợp đồng từng khóa localStorage, và các Web API trình duyệt mà code đang dùng.
