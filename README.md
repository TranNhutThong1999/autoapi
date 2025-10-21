# My API Server

Simple API server thay thế cho JSON server với token authentication và lưu trữ dữ liệu trong RAM.

## Cài đặt

```bash
npm install
```

## Chạy server

```bash
# Development mode (với auto-reload)
npm run dev

# Production mode
npm start
```

Server sẽ chạy trên `http://localhost:3001`

## API Endpoints

### Authentication

-   `POST /user` - Login
-   `POST /auth/logout` - Logout
-   `GET /auth/me` - Lấy thông tin user hiện tại
-   `POST /auth/refresh-token` - Refresh token

### Credentials

-   `GET /credential` - Lấy tất cả credentials (có thể filter theo domain)
-   `POST /credential` - Tạo credential mới
-   `PUT /credential/:id` - Cập nhật credential
-   `DELETE /credential/:id` - Xóa credential

## Tính năng

-   ✅ Token authentication với random UUID
-   ✅ Lưu trữ dữ liệu trong RAM (không cần database)
-   ✅ CORS enabled
-   ✅ Tự động generate ID và timestamp
-   ✅ Filter credentials theo domain
-   ✅ Auto-reload trong development mode

## Cấu trúc dữ liệu

### User

```json
{
	"id": "string",
	"email": "string",
	"password": "string"
}
```

### Credential

```json
{
	"id": "string",
	"domain": "string",
	"icon": "string",
	"inputRules": "object",
	"multipleStep": "boolean",
	"password": "string",
	"timestamp": "number",
	"url": "string",
	"username": "string"
}
```
