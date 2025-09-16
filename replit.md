# TrueBalance - Personal Finance Tracker

## Overview

TrueBalance is a modern personal finance dashboard that helps users track spending, categorize transactions, and gain insights into their financial habits. The application provides a comprehensive view of bank accounts, transactions, and spending patterns through an intuitive web interface with professional design inspired by trusted financial platforms like Mint and YNAB.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React + TypeScript**: Built with React 18 and TypeScript for type safety and modern component patterns
- **Vite Build System**: Fast development server and optimized production builds
- **ShadCN UI Components**: Modern, accessible component library with Radix UI primitives
- **Tailwind CSS**: Utility-first styling with custom design tokens for consistent theming
- **React Query**: Efficient data fetching, caching, and synchronization
- **Wouter**: Lightweight client-side routing

### Backend Architecture
- **Express.js**: RESTful API server with middleware for security and rate limiting
- **Node.js + ESM**: Modern JavaScript runtime with ES modules
- **JWT Authentication**: Stateless authentication with token-based sessions
- **bcrypt**: Secure password hashing with salt rounds
- **Helmet**: Security middleware with CSP and other security headers
- **Rate Limiting**: Protection against brute force attacks and API abuse

### Data Storage
- **PostgreSQL**: Primary database using Neon serverless hosting
- **Drizzle ORM**: Type-safe database access with schema-first approach
- **Connection Pooling**: Efficient database connections via Neon's serverless pooling

### Authentication & Security
- **JWT Tokens**: 7-day expiration with Bearer token authorization
- **Password Security**: bcrypt hashing with 12 salt rounds
- **Rate Limiting**: Tiered limits for auth endpoints (5 login attempts per 15min) and API calls (100 requests per 15min)
- **CORS**: Environment-aware cross-origin resource sharing
- **Helmet Security**: CSP, XSS protection, and other security headers

### Design System
- **Theme Support**: Dark/light mode with system preference detection
- **Color Palette**: Professional blue primary colors with semantic color tokens
- **Typography**: Inter font family with JetBrains Mono for financial data
- **Component Consistency**: Centralized design tokens and reusable UI components

### Database Schema
- **Users**: Authentication and user management
- **Accounts**: Bank account connections with balance tracking
- **Transactions**: Individual transaction records with categorization
- **Sessions**: JWT token management and validation

## External Dependencies

### Banking Integration
- **Teller API**: Bank account connectivity for transaction import and balance sync
- **WebSocket Support**: Real-time data updates via ws package

### UI & Styling
- **Radix UI**: Comprehensive primitive components for accessibility
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Modern icon library
- **Recharts**: Data visualization for spending charts and analytics

### Development Tools
- **TypeScript**: Static type checking across frontend and backend
- **ESBuild**: Fast JavaScript bundling for production
- **Drizzle Kit**: Database migrations and schema management

### Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Environment Configuration**: Secure credential management for database and API keys