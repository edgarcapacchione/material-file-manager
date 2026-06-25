# Material File Manager UI

An open-source **file manager UI** built with **Angular 20+ and Angular Material**, backed by a **Spring Boot** REST API.

The project provides a modern, responsive, and mobile-friendly interface to manage files and directories, inspired by common desktop file managers but optimized for the web.

<img width="1917" height="988" alt="530016120-ee59343e-33bd-408f-abe0-603c7d471ba2" src="https://github.com/user-attachments/assets/08ee614c-55db-4e4d-a1de-5db485c196a4" />

## Features

- 📁 Directory navigation (browse folders and subfolders)
- 📄 File preview
  - Supported formats: **PDF**, **TXT**
- 📋 File operations
  - Copy / Paste
  - Move
  - Delete
- 🔍 File Search
- 🧩 Multiple views
  - Grid view
  - List view
- 📱 Responsive UI
  - Fully compatible with mobile and tablet devices
  - Built with Angular Material components

---

## Tech Stack

### Frontend
- **Angular 20+**
- **Angular Material**
- Responsive layout with Material Design principles

### Backend
- **Spring Boot**
- RESTful API for file system operations

---

## Project Goals

- Provide a clean and intuitive file management UI
- Keep the project lightweight and easy to extend
- Serve as a reusable base for custom file management solutions

---

## Status

🚧 **Work in progress**

Current limitations:
- File preview limited to PDF and TXT
- No authentication/authorization (yet)

---

## Local setup

The backend exposes the API on `http://localhost:8080`. The Angular development
server proxies `/api` requests to that address.

```powershell
cd spring-boot
mvn spring-boot:run
```

In another terminal:

```powershell
cd angular
npm install
npm start
```

By default, files are managed only inside `${user.home}/mfm-files`. Set the
`MFM_ROOT_PATH` environment variable before starting Spring Boot to use a
different directory. Operations that escape this root are rejected.

---

## License

This project is released under an **open-source license**.  
Feel free to use, modify, and contribute.

---

## Contributions

Contributions are welcome!  
Bug reports, feature requests, and pull requests are encouraged.

---

## Disclaimer

This project is intended as a general-purpose file manager UI.  
Security, access control, and advanced file handling should be implemented according to your specific use case.
