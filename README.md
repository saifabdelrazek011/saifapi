# SaifAPI - Authentication & Services API

A secure, feature-rich Express.js API service with bot integration support, built with modern security practices and rate limiting.

## 🚀 Features

- **User Authentication & Authorization** - JWT-based auth with secure user management
- **Posts Management** - Create, read, update, and delete posts
- **URL Shortening** - Generate and manage short URLs
- **Newsletter System** - Subscription and newsletter management
- **Subscription Services** - User subscription handling with workflow automation
- **Bot Integration** - Telegram bot support with proper security configurations
- **Advanced Security** - Arcjet protection with bot detection, rate limiting, and shield
- **Email Services** - Automated email notifications and templates

## 🛡️ Security Features

- **Arcjet Integration** - Advanced bot detection and rate limiting
- **CORS Protection** - Domain-specific CORS policies
- **Helmet Security** - HTTP security headers
- **API Key Authentication** - Secure API access
- **Rate Limiting** - Token bucket algorithm for request throttling
- **Input Validation** - Joi schema validation

## 📁 Project Structure

```
saifapi/
├── config/                 # Configuration files
│   ├── arcjet.js           # Arcjet security configuration
│   ├── env.js              # Environment variables
│   ├── sendMail.js         # Email configuration
│   └── upstash.js          # Upstash configuration
├── middlewares/            # Express middlewares
│   ├── apikey.middleware.js
│   ├── arcjet.middleware.js
│   ├── error.middleware.js
│   └── validators/
├── users/                  # User management
│   ├── auth/               # Authentication routes
│   ├── apikeys/            # API key management
│   └── user controllers, models, routes
├── posts/                  # Posts management
├── shorturls/              # URL shortening service
├── subscription/           # Subscription services
│   └── workflow/           # Workflow automation
├── newsletter/             # Newsletter system
├── utils/                  # Utility functions
└── views/                  # EJS templates
```

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/saifabdelrazek011/saifapi.git
   cd saifapi
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   # Server Configuration
   NODE_ENV=development
   PORT=3000

   # Database
   MONGODB_URI=mongodb://localhost:27017/saifapi

   # JWT
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d

   # Arcjet Security
   ARCJET_KEY=your-arcjet-key
   ARCJET_ENV=development

   # Email Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Upstash (for workflows)
   UPSTASH_REDIS_REST_URL=your-upstash-url
   UPSTASH_REDIS_REST_TOKEN=your-upstash-token
   ```

4. **Start the server**

   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

## 🤖 Bot Integration

### Telegram Bot Support

The API is configured to work with Telegram bots using Axios. The Arcjet configuration allows:

- **Telegram Crawlers** - For link previews
- **Social Media Bots** - Facebook, Twitter, LinkedIn crawlers
- **HTTP Clients** - Axios, fetch, curl requests
- **API Clients** - Custom bot integrations

### Bot Configuration

In `config/arcjet.js`, the following bot types are allowed:

```javascript
allow: [
  "CATEGORY:SEARCH_ENGINE", // Google, Bing crawlers
  "CATEGORY:SOCIAL", // Social media crawlers
  "POSTMAN", // API testing
  "TELEGRAM_CRAWLER", // Telegram link previews
  "CURL", // CLI requests
  "HTTP_CLIENT", // General HTTP clients
  "API_CLIENT", // API integrations
];
```

### Using with Telegram Bots

When making requests from your Telegram bot using Axios:

```javascript
import axios from "axios";

// Example API call from Telegram bot
const response = await axios.post(
  "https://your-api.com/api/posts",
  {
    title: "My Post",
    content: "Post content",
  },
  {
    headers: {
      Authorization: "Bearer your-jwt-token",
      "X-API-Key": "your-api-key",
      "User-Agent": "TelegramBot/1.0",
    },
  }
);
```

## 📚 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Posts

- `GET /api/posts` - Get all posts
- `POST /api/posts` - Create new post
- `GET /api/posts/:id` - Get specific post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post

### URL Shortening

- `POST /api/shorturls` - Create short URL
- `GET /api/shorturls` - Get user's short URLs
- `GET /s/:shortCode` - Redirect to original URL

### Newsletter

- `POST /api/newsletter/subscribe` - Subscribe to newsletter
- `GET /api/newsletter` - Get newsletters (admin)
- `POST /api/newsletter` - Send newsletter (admin)

### Subscriptions

- `GET /api/subscriptions` - Get user subscriptions
- `POST /api/subscriptions` - Create subscription
- `DELETE /api/subscriptions/:id` - Cancel subscription

## 🔐 Security Configuration

### Rate Limiting

- **5 requests per interval** (10s dev, 60s prod)
- **10 token bucket capacity**
- **IP-based rate limiting**

### CORS Policy

- **Production**: Only `*.saifdev.xyz` domains
- **Development**: All localhost origins

### Bot Detection

- **Shield protection** against malicious traffic
- **Whitelist approach** for legitimate bots
- **Token bucket rate limiting** for all requests

## 🚀 Deployment

### Production Setup

1. **Environment Variables**

   ```bash
   NODE_ENV=production
   ARCJET_ENV=production
   ```

2. **Process Manager**

   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start server.js --name "saifapi-bots"
   ```

3. **Reverse Proxy** (Nginx example)

   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## 🛠️ Development

### Available Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon

### Adding New Features

1. Create feature directory in project root
2. Add routes, controllers, models, and validation
3. Register routes in `server.js`
4. Update middleware if needed

## 📝 Troubleshooting

### Common Issues

**Bot Detection Errors**

- Ensure your bot's user agent is in the allow list
- Check if `CATEGORY:SOCIAL` covers your bot type
- Consider setting bot detection to `DRY_RUN` mode for testing

**CORS Errors**

- Verify your domain is in the allowed origins
- Check the CORS configuration in `server.js`

**Rate Limiting**

- Increase rate limits in `config/arcjet.js` if needed
- Monitor rate limit headers in responses

## 📄 License

This project is licensed under the ISC License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📞 Support

For support and questions, please open an issue in the repository.

---

Built with ❤️ using Express.js, Arcjet, and modern security practices.
