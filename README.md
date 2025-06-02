# Silvy 🌊

**A Social Media Platform for Exclusive Content**

> "Creation is owned by community not platform"

Silvy is a revolutionary social media platform for exclusive content, built on the Sui blockchain ecosystem. It empowers creators to securely share content with their audience while maintaining full ownership and control.

## 🌟 Overview

Silvy leverages cutting-edge blockchain technology to create a programmable, transparent, and fully on-chain platform. With Seal for secure end-to-end encryption and Walrus for decentralized storage, creators and supporters can interact in a seamless, anonymous, and community-driven environment.

## ✨ Key Features

- **🔒 Lifetime Exclusive Content Access Control** - Once purchased, content access is permanent
- **🛡️ Secure End-to-End Encryption** - Content is protected with Seal encryption
- **💰 Peer-to-Peer Payment Systems** - Direct payments between creators and supporters
- **👤 Anonymity by Default** - Users maintain privacy and anonymity
- **🏛️ Community-Driven Platform** - Governed and curated by the community
- **📝 Community Curation** - Quality content through community moderation

## 🛠️ Technologies Used

- **[Sui Blockchain](https://sui.io/)** - High-performance blockchain for smart contracts and digital assets
- **[Seal](https://docs.sui.io/standards/cryptography/sealing)** - Secure end-to-end encryption for content protection
- **[Walrus](https://walrus.site/)** - Decentralized storage network for content hosting

## 🏗️ Project Structure

```
├── frontend/                 # React + TypeScript frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API and external services
│   │   └── types/          # TypeScript type definitions
│   └── public/             # Static assets
├── silvy/
│   ├── backend/            # Backend API services
│   └── contract/           # Sui Move smart contracts
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or later)
- Bun package manager
- Sui CLI
- Git

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   bun install
   ```

3. **Start the development server:**
   ```bash
   bun dev
   ```

4. **Open your browser and visit:**
   ```
   http://localhost:5173
   ```

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd silvy/backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the backend server:**
   ```bash
   npm start
   ```

### Smart Contract Deployment

1. **Navigate to the contract directory:**
   ```bash
   cd silvy/contract
   ```

2. **Build the contracts:**
   ```bash
   sui move build
   ```

3. **Deploy to Sui network:**
   ```bash
   sui client publish --gas-budget 100000000
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_SUI_NETWORK=testnet
VITE_WALRUS_PUBLISHER_URL=https://publisher.walrus.site
VITE_WALRUS_AGGREGATOR_URL=https://aggregator.walrus.site
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
```

## 📱 Features Overview

### For Creators
- **Content Upload**: Securely upload and encrypt exclusive content
- **Access Control**: Set permissions and pricing for content access
- **Revenue Tracking**: Monitor earnings from content sales
- **Community Interaction**: Engage with supporters and fans

### For Supporters
- **Content Discovery**: Explore exclusive content from favorite creators
- **Secure Purchases**: Buy content access with cryptocurrency
- **Permanent Access**: Lifetime access to purchased content
- **Anonymous Browsing**: Maintain privacy while exploring content

### Platform Benefits
- **Decentralized**: No single point of failure or control
- **Transparent**: All transactions and access controls on-chain
- **Secure**: End-to-end encryption protects content
- **Community-Owned**: Platform governance by token holders

## 🤝 Contributing

We welcome contributions from the community! Please read our contributing guidelines before submitting pull requests.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Website**: [Coming Soon]
- **Documentation**: [Coming Soon]
- **Community**: [Coming Soon]
- **Sui Network**: [https://sui.io/](https://sui.io/)
- **Walrus**: [https://walrus.site/](https://walrus.site/)

## 📞 Support

For support and questions:
- Create an issue in this repository
- Join our community discussions
- Follow our development updates

---

**Built with ❤️ on Sui Blockchain**

*Empowering creators, protecting content, building community.*
