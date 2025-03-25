
# ShopVerse - Multi-Vendor eCommerce Platform

A modern, full-stack eCommerce platform that connects vendors with customers worldwide, featuring M-Pesa and PayPal integration.

## 🌟 Features

### For Customers
- Browse products from multiple vendors
- Secure checkout with M-Pesa and PayPal
- Real-time order tracking
- Product reviews and ratings
- Wishlist functionality
- Multi-language support
- Mobile-responsive design
- AI-powered product recommendations
- Live chat support

### For Vendors
- Easy onboarding process
- Vendor dashboard with analytics
- Inventory management
- Order processing
- Revenue tracking
- Store customization
- Marketing tools

### For Admins
- Comprehensive admin dashboard
- Vendor approval system
- Product category management
- User management
- Sales analytics
- Platform-wide settings

## 🚀 Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Node.js, Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT, Session-based auth
- **Payment Processing**: M-Pesa, PayPal
- **Real-time Features**: Socket.IO
- **AI Integration**: OpenAI for recommendations
- **Internationalization**: i18next

## 🛠️ Development

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
MPESA_API_KEY=your_mpesa_key
PAYPAL_CLIENT_ID=your_paypal_id
```

3. Start development server:
```bash
npm run dev
```

## 📦 Project Structure

```
├── client/           # Frontend React application
├── server/           # Backend Express server
├── shared/           # Shared types and utilities
└── ...
```

## 🔐 Security Features

- JWT authentication
- Session management
- Input validation
- XSS protection
- CSRF protection
- Rate limiting

## 🌐 Deployment

The application is deployed on Replit and can be accessed at your-repl-url.

## 📄 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines.
