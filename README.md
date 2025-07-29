# 15-viki-bg

A professional HVAC (Heating, Ventilation, and Air Conditioning) e-commerce platform built with Next.js, featuring product management, order processing, installation scheduling, and administrative tools.

## Pages

### Main Pages

**Homepage (`/`)**
- Landing page showcasing HVAC services with hero section, company statistics, and service highlights
- Features floating cards for different HVAC solutions and call-to-action buttons

**Products (`/products`)**
- Displays all available HVAC solutions and services in a grid layout
- Shows climate solutions (air conditioning, heat pumps, etc.) and additional services (consultation, installation, maintenance, warranty)

**Buy (`/buy`)**
- Main product catalog page with filtering, sorting, and search functionality
- Displays air conditioning units with detailed specifications and pricing

**Product Detail (`/buy/[productId]`)**
- Individual product page showing detailed specifications, images, and purchase options
- Includes product features, technical specifications, and add-to-cart functionality

**Solutions (`/solutions/[solutionId]`)**
- Dedicated pages for different HVAC solutions (heat pumps, ventilation, etc.)
- Provides detailed information about specific HVAC technologies and services

**Contact (`/contact`)**
- Contact information page with company details, phone numbers, email, and address
- Includes interactive map and department contact information

**Inquiry (`/inquiry`)**
- Customer inquiry form for requesting quotes and information
- Collects customer details, inquiry type, budget range, and message

**Checkout (`/checkout`)**
- Complete order processing page with personal information, payment, and installation scheduling
- Integrates with Stripe for payment processing and manages cart items

**Order Success (`/order-success`)**
- Confirmation page displayed after successful order completion
- Shows order details and next steps

**Administration (`/Administration`)**
- Comprehensive admin panel for managing products, orders, installations, and inquiries
- Features product CRUD operations, order management, and installation scheduling

**Admin Analytics (`/admin/analytics`)**
- Analytics dashboard showing sales data, order statistics, and business metrics
- Provides insights into business performance and trends

## API Endpoints

### Product Management

**GET `/api/get-products`**
- Retrieves product catalog with filtering, sorting, and pagination options
- Supports search functionality and archived product filtering

**GET `/api/get-product`**
- Fetches individual product details by ID
- Returns complete product specifications and features

**POST `/api/add-product`**
- Creates new product entries in the database
- Handles product images, specifications, and promotional flags

**POST `/api/add-multiple-products`**
- Bulk product creation for importing multiple products at once
- Streamlines product catalog management

**PUT `/api/edit-product`**
- Updates existing product information and specifications
- Supports partial updates and image management

**DELETE `/api/delete-product`**
- Removes products from the active catalog
- Handles soft deletion with archive functionality

**POST `/api/archive-product`**
- Archives products instead of permanent deletion
- Maintains data integrity while hiding from active catalog

### Order Management

**POST `/api/submit-order`**
- Processes customer orders with personal information and payment details
- Creates order records and handles payment integration

**GET `/api/get-orders`**
- Retrieves order list with filtering and status management
- Supports admin order overview and management

**GET `/api/get-order-products`**
- Fetches products associated with specific orders
- Provides detailed order line items and accessories

**GET `/api/get-order-history`**
- Retrieves complete order history for customers
- Tracks order status changes and modifications

**PUT `/api/update-order-status`**
- Updates order status (new, confirmed, shipped, delivered, etc.)
- Manages order lifecycle and customer notifications

### Installation Management

**GET `/api/get-available-slots`**
- Retrieves available installation time slots for specific dates
- Manages installation scheduling conflicts and availability

**POST `/api/book-installation`**
- Schedules installation appointments for confirmed orders
- Handles multiple time slots and duration management

**POST `/api/reschedule-installation`**
- Modifies existing installation appointments
- Updates time slots and handles rescheduling conflicts

**POST `/api/cancel-installation`**
- Cancels scheduled installation appointments
- Frees up time slots for other customers

**GET `/api/get-weekly-installations`**
- Retrieves weekly installation schedule for planning
- Provides overview of upcoming installations

**GET `/api/get-installed-orders`**
- Fetches completed installation records
- Tracks installation history and completion status

### Customer Inquiries

**POST `/api/submit-inquiry`**
- Processes customer inquiries and quote requests
- Stores inquiry details for follow-up and management

**GET `/api/get-inquiries`**
- Retrieves customer inquiry list for admin review
- Supports inquiry management and response tracking

**PUT `/api/update-inquiry-status`**
- Updates inquiry status (new, in progress, completed, etc.)
- Manages inquiry lifecycle and customer communication

### Accessories and Support

**GET `/api/get-accessories`**
- Retrieves available product accessories and add-ons
- Supports accessory selection during product purchase

### Payment Processing

**POST `/api/create-payment-intent`**
- Creates Stripe payment intents for secure payment processing
- Handles payment amount validation and currency conversion

### Utilities

**GET `/api/maps-embed-url`**
- Provides Google Maps embed URL for contact page
- Enables interactive location display

### Admin Analytics

**GET `/api/admin/analytics`**
- Provides business analytics and reporting data
- Supports admin dashboard with key performance metrics

## Technology Stack

- **Frontend**: Next.js with React
- **Styling**: CSS Modules
- **Database**: Supabase (PostgreSQL)
- **Payment Processing**: Stripe
- **Internationalization**: next-i18next
- **Maps Integration**: Google Maps API
- **File Storage**: Supabase Storage

## Features

- Multi-language support (Bulgarian/English)
- Responsive design for all devices
- Real-time inventory management
- Installation scheduling system
- Customer inquiry management
- Order tracking and status updates
- Payment processing with Stripe
- Admin dashboard with analytics
- Product catalog with filtering and search
- Contact management and mapping

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables for Supabase and Stripe
4. Run the development server: `npm run dev`
5. Access the application at `http://localhost:3000`

## Database Structure

The application uses PostgreSQL with the following main tables:

### Core Tables

**`products`**
- Stores all product information including specifications, pricing, and inventory
- Contains technical details (COP, SCOP, power consumption, dimensions, etc.)
- Supports promotional flags (featured, bestseller, new) and archival status

**`orders`**
- Main order records with customer information and order status
- Tracks order lifecycle from creation to completion
- Links to related tables for items, payments, and installations

**`order_items`**
- Individual items within each order
- Stores product references, quantities, and service options
- Includes accessory information and installation flags

**`payment_and_tracking`**
- Payment method and amount tracking for orders
- Supports multiple payment methods (cash, office, online, mock)
- Tracks payment status and session management

### Installation Management

**`installation_schedule`**
- Manages installation appointments and time slots
- Links orders to scheduled installation dates and times
- Supports admin notes and creator tracking

### Customer Management

**`inquiries`**
- Customer inquiry and quote request storage
- Tracks inquiry status and admin response notes
- Stores customer contact information and inquiry details

### Supporting Tables

**`accessories`**
- Product accessories and add-ons
- Manages pricing and availability for supplementary items

**`invoice_info`**
- Invoice details for business customers
- Stores company information, tax details, and billing addresses

### Key Relationships

- Orders link to order_items (one-to-many)
- Orders link to payment_and_tracking (one-to-one)
- Orders link to installation_schedule (one-to-many)
- Orders link to invoice_info (one-to-one)
- Order items reference products (many-to-one)

## Environment Variables

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing