# Software Requirements Specification (SRS)

## Sistem Hotspot LMS

Versi dokumen: 1.0  
Tanggal: 3 Juli 2026  
Lingkup proyek: `hotspot-lms-1`

## 1. Pendahuluan

### 1.1 Tujuan

Dokumen ini menjelaskan kebutuhan perangkat lunak untuk Hotspot LMS, yaitu aplikasi Learning Management System sederhana yang berjalan melalui jaringan Wi-Fi hotspot lokal. Sistem ditujukan untuk membantu guru menerima dan memantau pengumpulan tugas siswa secara langsung melalui laptop guru tanpa bergantung pada internet publik.

### 1.2 Ruang Lingkup

Hotspot LMS menyediakan layanan utama berupa:

- Halaman siswa untuk mengunggah tugas.
- Halaman guru untuk melihat daftar pengumpulan tugas.
- Server lokal berbasis Express untuk menerima request dari client.
- Penyimpanan berkas tugas pada direktori lokal server.
- Rencana autentikasi pengguna untuk siswa dan guru.

Sistem ini berfokus pada skenario kelas lokal: guru menjalankan server pada laptop, siswa terhubung ke hotspot guru, lalu mengakses aplikasi melalui browser.

### 1.3 Definisi, Akronim, dan Singkatan

- LMS: Learning Management System.
- SRS: Software Requirements Specification.
- API: Application Programming Interface.
- Client: Aplikasi frontend berbasis React yang diakses melalui browser.
- Server: Aplikasi backend berbasis Express.
- Submission: Data atau berkas tugas yang dikumpulkan siswa.
- Hotspot lokal: Jaringan Wi-Fi yang dibuat dari perangkat guru untuk menghubungkan siswa ke server.

### 1.4 Referensi

- Struktur kode proyek `hotspot-lms-1`.
- README proyek Hotspot LMS.
- Komponen server: `server/src/index.ts`, `routes`, `controllers`, dan `services`.
- Komponen client: `client/src/App.tsx`, `pages`, `components`, dan `types`.

### 1.5 Gambaran Dokumen

Dokumen ini berisi deskripsi umum sistem, kebutuhan fungsional, kebutuhan nonfungsional, kebutuhan antarmuka, model data, batasan, asumsi, dan kriteria penerimaan.

## 2. Deskripsi Umum

### 2.1 Perspektif Produk

Hotspot LMS adalah aplikasi web lokal dengan arsitektur client-server. Client menyediakan halaman siswa dan guru, sedangkan server menangani API, autentikasi, dan penyimpanan submission. Aplikasi dirancang untuk digunakan dalam jaringan lokal melalui hotspot guru.

### 2.2 Fungsi Produk

Fungsi utama sistem adalah:

- Siswa dapat membuka halaman siswa.
- Siswa dapat memilih dan mengunggah file tugas.
- Sistem dapat menyimpan file tugas pada server lokal.
- Guru dapat membuka dashboard guru.
- Guru dapat melihat daftar submission yang masuk.
- Sistem dapat menyediakan API autentikasi login dan registrasi.

### 2.3 Karakteristik Pengguna

Pengguna sistem terdiri dari:

- Siswa: menggunakan browser untuk mengunggah tugas melalui jaringan hotspot lokal.
- Guru: menjalankan server, menyediakan jaringan hotspot, dan memantau submission melalui dashboard.
- Administrator atau pengembang: memasang dependensi, menjalankan aplikasi, dan melakukan konfigurasi teknis.

### 2.4 Lingkungan Operasi

Sistem berjalan pada lingkungan berikut:

- Server: Node.js, Express, TypeScript.
- Client: React, TypeScript, browser modern.
- Jaringan: Wi-Fi hotspot lokal atau jaringan lokal lain yang memungkinkan perangkat siswa mengakses IP perangkat guru.
- Sistem operasi target: Windows, Linux, atau macOS selama mendukung Node.js.

### 2.5 Batasan Desain dan Implementasi

- Server default berjalan pada port `5000`.
- Penyimpanan submission menggunakan filesystem lokal.
- Aplikasi belum mensyaratkan database eksternal.
- Akses siswa bergantung pada konektivitas ke jaringan lokal guru.
- Autentikasi pada kode saat ini masih berupa kerangka dan perlu dilengkapi sebelum dipakai untuk akses berbasis peran.

### 2.6 Asumsi dan Dependensi

- Guru memiliki laptop yang dapat menjalankan Node.js dan membuat hotspot lokal.
- Siswa memiliki perangkat dengan browser dan dapat terhubung ke hotspot guru.
- File submission tidak melebihi kapasitas penyimpanan laptop guru.
- Server dan client dijalankan dalam satu jaringan yang sama.

## 3. Kebutuhan Fungsional

### FR-001 Akses Halaman Awal

Sistem harus menyediakan halaman awal yang menampilkan identitas aplikasi Hotspot LMS.

Prioritas: Sedang  
Aktor: Siswa, Guru

### FR-002 Navigasi Halaman Siswa

Sistem harus menyediakan halaman siswa pada route `/student`.

Prioritas: Tinggi  
Aktor: Siswa

### FR-003 Navigasi Halaman Guru

Sistem harus menyediakan halaman guru pada route `/teacher`.

Prioritas: Tinggi  
Aktor: Guru

### FR-004 Unggah File Tugas

Siswa harus dapat memilih file dari perangkatnya dan mengunggahnya ke server.

Prioritas: Tinggi  
Aktor: Siswa

Kriteria penerimaan:

- Sistem menampilkan pesan jika belum ada file yang dipilih.
- Sistem mengirim file ke server menggunakan request `POST`.
- Sistem menampilkan pesan berhasil jika upload diterima server.
- Sistem menampilkan pesan gagal jika upload tidak berhasil.

### FR-005 Simpan File Submission

Server harus menyimpan file submission ke direktori lokal `uploads`.

Prioritas: Tinggi  
Aktor: Server

Kriteria penerimaan:

- Jika direktori penyimpanan belum ada, server membuat direktori tersebut.
- Server menyimpan file tanpa merusak isi file.
- Server mengembalikan informasi hasil penyimpanan kepada client.

### FR-006 Daftar Submission Guru

Guru harus dapat melihat daftar submission yang sudah dikumpulkan siswa.

Prioritas: Tinggi  
Aktor: Guru

Kriteria penerimaan:

- Sistem mengambil data submission dari API.
- Dashboard guru menampilkan minimal nama siswa atau ID siswa, nama file, dan waktu pengumpulan.
- Sistem menampilkan kondisi kosong jika belum ada submission.

### FR-007 Pencatatan Metadata Submission

Sistem harus mencatat metadata submission.

Prioritas: Tinggi  
Aktor: Server

Metadata minimal:

- `id`
- `studentId`
- `fileName`
- `submittedAt`

Metadata tambahan yang dapat didukung:

- `assignmentId`
- `content`
- `grade`
- `feedback`

### FR-008 API Autentikasi Login

Server harus menyediakan endpoint login untuk pengguna.

Prioritas: Sedang  
Aktor: Siswa, Guru

Kriteria penerimaan:

- Endpoint menerima username dan password.
- Sistem memvalidasi kredensial.
- Sistem mengembalikan status sukses atau gagal.
- Sistem membedakan role siswa dan guru.

Catatan: Pada implementasi saat ini controller autentikasi masih kosong.

### FR-009 API Registrasi

Server harus menyediakan endpoint registrasi pengguna.

Prioritas: Rendah  
Aktor: Siswa, Guru, Administrator

Kriteria penerimaan:

- Endpoint menerima data username, password, dan role.
- Sistem menolak username yang sudah digunakan.
- Sistem menyimpan data pengguna secara aman.

Catatan: Pada implementasi saat ini controller registrasi masih kosong.

### FR-010 Validasi Upload

Server harus memvalidasi request upload.

Prioritas: Tinggi  
Aktor: Server

Kriteria penerimaan:

- Server menolak request tanpa file.
- Server menolak file yang melebihi batas ukuran.
- Server menolak nama file berbahaya atau path traversal.
- Server mengembalikan pesan error yang jelas.

### FR-011 Pengambilan File Submission

Sistem sebaiknya menyediakan mekanisme bagi guru untuk membuka atau mengunduh file submission.

Prioritas: Sedang  
Aktor: Guru

Kriteria penerimaan:

- Guru dapat memilih submission tertentu.
- Sistem mengirim file yang sesuai.
- Sistem menolak akses ke file yang tidak terdaftar.

## 4. Kebutuhan Antarmuka Eksternal

### 4.1 Antarmuka Pengguna

Halaman siswa harus memuat:

- Judul halaman.
- Input file.
- Tombol upload.
- Pesan status upload.
- Daftar submission siswa pada sesi berjalan.

Halaman guru harus memuat:

- Judul dashboard.
- Daftar submission.
- Informasi nama siswa atau ID siswa.
- Informasi nama file.
- Informasi waktu pengumpulan.

### 4.2 Antarmuka Perangkat Keras

Sistem tidak membutuhkan perangkat keras khusus selain:

- Laptop atau komputer guru.
- Perangkat siswa yang memiliki browser.
- Adapter Wi-Fi atau jaringan lokal.

### 4.3 Antarmuka Perangkat Lunak

Server menggunakan:

- Node.js.
- Express.
- Body parser.
- CORS.
- Filesystem lokal.

Client menggunakan:

- React.
- React Router.
- Axios atau Fetch API.

### 4.4 Antarmuka Komunikasi

Komunikasi client-server menggunakan HTTP pada jaringan lokal.

Endpoint target yang direkomendasikan:

- `POST /api/auth/login`
- `POST /api/auth/register`
- `POST /api/submissions`
- `GET /api/submissions`
- `GET /api/submissions/:id/download`

Catatan implementasi saat ini:

- Server mendefinisikan route submission di bawah `/api/submissions`.
- Route server saat ini menggunakan `/submit` dan `/submissions`, sehingga endpoint lengkapnya menjadi `/api/submissions/submit` dan `/api/submissions/submissions`.
- Client saat ini memanggil `/api/submissions` untuk upload dan daftar submission. Endpoint server dan client perlu diselaraskan.

## 5. Kebutuhan Nonfungsional

### NFR-001 Kinerja

Sistem harus mampu menerima upload dari beberapa siswa dalam satu sesi kelas lokal. Untuk penggunaan awal, sistem ditargetkan mendukung minimal 20 siswa dalam jaringan yang sama.

### NFR-002 Keandalan

Sistem harus menjaga file submission agar tidak hilang selama server berjalan dan storage lokal tersedia.

### NFR-003 Keamanan

Sistem harus:

- Memvalidasi file upload.
- Mencegah path traversal.
- Membatasi ukuran file.
- Tidak menyimpan password dalam bentuk plaintext.
- Membatasi akses dashboard guru untuk role guru setelah autentikasi diterapkan.

### NFR-004 Kemudahan Penggunaan

Halaman siswa harus sederhana dan dapat digunakan tanpa pelatihan khusus. Alur upload harus dapat diselesaikan dalam beberapa langkah: buka halaman, pilih file, klik upload.

### NFR-005 Portabilitas

Sistem harus dapat dijalankan pada perangkat yang mendukung Node.js dan browser modern.

### NFR-006 Maintainability

Kode harus dipisahkan berdasarkan tanggung jawab:

- Route untuk definisi endpoint.
- Controller untuk logika request dan response.
- Service untuk penyimpanan file.
- Type atau model untuk struktur data.

### NFR-007 Usability pada Jaringan Lokal

Sistem harus dapat diakses dari perangkat siswa selama perangkat berada dalam jaringan yang sama dengan server guru.

## 6. Model Data

### 6.1 User

```ts
interface User {
  id: string;
  username: string;
  password: string;
  role: 'student' | 'teacher';
}
```

Rekomendasi keamanan: field `password` harus disimpan sebagai hash, bukan plaintext.

### 6.2 Submission

```ts
interface Submission {
  id: string;
  studentId: string;
  fileName: string;
  submittedAt: Date;
}
```

Model submission dapat diperluas menjadi:

```ts
interface Submission {
  id: string;
  studentId: string;
  assignmentId?: string;
  fileName?: string;
  content?: string;
  submittedAt: Date;
  grade?: number;
  feedback?: string;
}
```

## 7. Use Case

### UC-001 Siswa Mengunggah Tugas

Aktor utama: Siswa

Alur utama:

1. Siswa terhubung ke hotspot guru.
2. Siswa membuka halaman `/student`.
3. Siswa memilih file tugas.
4. Siswa menekan tombol upload.
5. Client mengirim file ke server.
6. Server menyimpan file dan metadata.
7. Sistem menampilkan pesan upload berhasil.

Alur alternatif:

- Jika file belum dipilih, sistem menampilkan pesan bahwa file harus dipilih.
- Jika koneksi gagal, sistem menampilkan pesan error.
- Jika file tidak valid, server menolak upload.

### UC-002 Guru Melihat Daftar Submission

Aktor utama: Guru

Alur utama:

1. Guru membuka halaman `/teacher`.
2. Client meminta daftar submission ke server.
3. Server mengembalikan data submission.
4. Dashboard menampilkan daftar submission.

Alur alternatif:

- Jika belum ada submission, sistem menampilkan daftar kosong.
- Jika server gagal, sistem menampilkan pesan gagal memuat data.

### UC-003 Pengguna Login

Aktor utama: Siswa atau Guru

Alur utama:

1. Pengguna membuka halaman login.
2. Pengguna memasukkan username dan password.
3. Client mengirim kredensial ke server.
4. Server memvalidasi kredensial.
5. Sistem mengarahkan pengguna ke halaman sesuai role.

Catatan: Use case ini adalah kebutuhan target karena implementasi login saat ini belum lengkap.

## 8. Kriteria Penerimaan Sistem

Sistem dinyatakan memenuhi kebutuhan awal jika:

- Server dapat dijalankan tanpa error.
- Client dapat dijalankan dan membuka halaman awal.
- Route `/student` dapat diakses.
- Route `/teacher` dapat diakses.
- Siswa dapat mengunggah file melalui halaman siswa.
- File tersimpan di server.
- Guru dapat melihat daftar submission.
- Endpoint client dan server sudah konsisten.
- Error upload ditangani dengan pesan yang mudah dipahami.

## 9. Gap Implementasi Saat Ini

Berdasarkan struktur `hotspot-lms-1`, terdapat beberapa gap yang perlu diperbaiki agar sesuai SRS:

- `AuthController.login` dan `AuthController.register` masih kosong.
- `SubmissionController` menggunakan `new Submission(...)`, padahal `Submission` pada model saat ini adalah interface, bukan class.
- `SubmissionController` mengimpor `storageService`, tetapi `storage.ts` mengekspor fungsi `saveSubmission` dan `getSubmission`, bukan objek `storageService`.
- Route `submissions.ts` memanggil `submissionController.getSubmissions`, sedangkan controller menyediakan `listSubmissions`.
- Client mengirim upload ke `POST /api/submissions`, sedangkan server saat ini menyediakan `POST /api/submissions/submit`.
- Client mengambil daftar submission dari `GET /api/submissions`, sedangkan server saat ini menyediakan `GET /api/submissions/submissions`.
- `UploadForm` menerima prop `onNewSubmission` dari halaman siswa, tetapi definisi komponen tidak mendeklarasikan prop tersebut.
- `SubmissionList` didefinisikan tanpa prop, tetapi halaman guru memanggilnya dengan prop `submissions`.
- Belum ada middleware upload seperti `multer` untuk menangani `multipart/form-data`.
- Belum ada penyimpanan metadata submission yang konsisten.

## 10. Prioritas Pengembangan Berikutnya

Prioritas perbaikan yang disarankan:

1. Menyelaraskan endpoint server dan client menjadi `POST /api/submissions` dan `GET /api/submissions`.
2. Menambahkan middleware upload file.
3. Membuat penyimpanan metadata submission.
4. Memperbaiki tipe React pada `UploadForm` dan `SubmissionList`.
5. Melengkapi autentikasi login dan registrasi.
6. Menambahkan validasi ukuran dan tipe file.
7. Menambahkan fitur download file untuk guru.

