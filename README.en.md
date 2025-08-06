# Code Snippet Management System

This is a code snippet management system built with Nuxt 4.0, supporting user registration, login, creation, editing, and deletion of code snippets, with bilingual interface in Chinese and English.

## Features

- User authentication system (registration, login)
- Code snippet management (create, edit, delete, view)
- Markdown editor support
- Responsive design
- Internationalization support (Chinese, English)
- Pagination support

## Technology Stack

- **Frontend Framework**: Nuxt 4.0, Vue 3.5
- **UI Components**: Custom CSS
- **State Management**: Vue Reactive API
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Internationalization**: vue-i18n
- **Markdown Editor**: md-editor-v3

## System Requirements

- Node.js >= 16.0.0
- MySQL >= 5.7
- npm >= 7.0.0 or pnpm >= 10.0.0

## Installation Steps

### 1. Clone the repository

```bash
git clone <repository-url>
cd my-code-nuxt
```

### 2. Install dependencies

Using npm:
```bash
npm install
```

Or using pnpm:
```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file and add the following configuration:

```
DB_HOST=localhost
DB_USER=your_db_user
DB_PASS=your_db_password
DB_NAME=your_db_name
DB_PORT=3306
JWT_SECRET=your_jwt_secret
```

### 4. Create database tables

Execute the following SQL statements in MySQL:

```sql
CREATE DATABASE IF NOT EXISTS your_db_name;
USE your_db_name;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE snippets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

### 5. Run development server

```bash
npm run dev
```

Or

```bash
pnpm dev
```

The application will run on http://localhost:3000

## Production Deployment

### 1. Build the application

```bash
npm run build
```

Or

```bash
pnpm build
```

### 2. Start production server

```bash
npm run start
```

Or

```bash
pnpm start
```

### Deploy with PM2

```bash
npm install -g pm2
pm2 start npm --name "my-code-nuxt" -- start
```

## Internationalization Feature

This project supports bilingual interface in Chinese and English. Users can switch languages through the language switcher in the upper right corner of the interface. Language settings are saved in the browser's local storage, maintaining the user's language choice after page refresh.

### Adding More Languages

To add more languages, follow these steps:

1. Create a new language file in the `app/locales` directory
2. Import the new language file in `app/plugins/i18n.ts` and add it to the configuration
3. Add the new language option in the language switcher

## Project Structure

```
my-code-nuxt/
├── app/                    # Application directory
│   ├── locales/            # Internationalization language files
│   ├── middleware/         # Middleware
│   ├── pages/              # Page components
│   └── plugins/            # Plugins
├── public/                 # Static assets
├── server/                 # Server-side API
│   ├── api/                # API routes
│   └── db.ts               # Database connection
├── .env                    # Environment variables
├── nuxt.config.ts          # Nuxt configuration
├── package.json            # Project dependencies
└── README.md               # Project documentation
```

## Contribution Guidelines

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Submit a pull request

## License

MIT

---

[中文文档](./README.md)