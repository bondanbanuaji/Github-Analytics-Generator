# **🚀 Project Plan: GitHub Analytics Dashboard (Astro \+ React)**

## **📌 Deskripsi Project**

Sebuah dashboard visualisasi data yang memungkinkan pengguna menganalisis profil GitHub hanya dengan memasukkan username. Project ini berfokus pada **Frontend Performance**, **Data Visualization**, dan **Clean UI/UX** tanpa memerlukan database backend (Pure Frontend-to-API).

## **🏗️ Tech Stack**

* **Framework:** Astro (Hybrid Mode)  , Astro Island
* **UI Library:** React (untuk logic Dashboard & Charts)  
* **Styling:** Tailwind CSS \+ Lucide React (Icons)  
* **Charts:** Recharts (Data visualization)  
* **Animation:** Framer Motion / Tailwind Transitions  
* **API:** GitHub REST API (v3)
* **Font:** Raleway : @import url('https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100..900;1,100..900&display=swap');
* **Button UI:** Shadcn UI
* **Icon:** Lucide React
* **3D View:** Three.js, GSAP

## **🛠️ Arsitektur Aplikasi**

1. **Astro Layer:** Menangani struktur halaman utama dan SEO metadata.  
2. **React Island:** Seluruh interaksi dashboard dibungkus dalam satu komponen besar (GitHubDashboard.jsx) untuk manajemen state yang efisien.  
3. **Data Flow:**  
   * User input username \-\> Trigger fetch()  
   * Fetch Data Profil \-\> Fetch Data Repositori (paralel)  
   * Logic Processing (Kalkulasi bahasa & total stars)  
   * State Update \-\> UI Re-render

## **🗓️ Roadmap Pengembangan**

### **Fase 1: Setup & Dasar (Day 1\)**

* \[ \] Inisialisasi project Astro baru.  
* \[ \] Konfigurasi Tailwind CSS dan integrasi React.  
* \[ \] Setup struktur folder (/src/components, /src/lib, dsb).  
* \[ \] Implementasi UI dasar (Header & Search Bar).

### **Fase 2: Integrasi API & Logic (Day 2\)**

* \[ \] Implementasi fungsi fetchGitHubData menggunakan Fetch API.  
* \[ \] Penanganan state: loading, error, dan userData.  
* \[ \] Logic pengolahan data:  
  * Filter 6 repositori terbaik berdasarkan *star count*.  
  * Mapping distribusi bahasa pemrograman untuk chart.  
  * Kalkulasi total star dari seluruh repositori publik.

### **Fase 3: Visualisasi & UI (Day 3\)**

* \[ \] Integrasi **Recharts** untuk Pie Chart distribusi bahasa.  
* \[ \] Pembuatan komponen kartu (Profile Card, Stats Card, Repo Card).  
* \[ \] Implementasi **Skeleton Loading** agar transisi data tidak kaku.  
* \[ \] Penambahan efek hover dan animasi masuk (fade-in).

### **Fase 4: Optimasi & Deployment (Day 4\)**

* \[ \] Responsive design check (Mobile, Tablet, Desktop).  
* \[ \] Penanganan Error (User tidak ditemukan atau API Rate Limit).  
* \[ \] Optimasi gambar menggunakan Astro Image.  
* \[ \] Deployment ke Vercel/Netlify.

## **🎯 Fitur Utama untuk Portofolio**

1. **Zero-JS Shell:** Menggunakan keunggulan Astro agar halaman awal dimuat sangat cepat.  
2. **Interactive Data:** Chart yang responsif dan interaktif saat di-hover.  
3. **Direct Navigation:** (Optional Upgrade) Menggunakan URL params ?user=username agar dashboard bisa langsung dibagikan.  
4. **Premium Look:** Desain bersih dengan skema warna yang terinspirasi dari GitHub Dark/Light mode.

## **💡 Ide Pengembangan Selanjutnya (V2)**

* Tambahkan fitur **Compare Users** (bandingkan statistik dua orang).  
* Integrasi dengan **GitHub GraphQL API** untuk data kontribusi (heatmap) yang lebih detail.  
* Tambahkan fitur **Export to PDF** untuk resume otomatis dari profil GitHub.

*Dibuat untuk portofolio pengembangan web modern.*