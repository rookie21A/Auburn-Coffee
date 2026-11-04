# Auburn Origin Coffee Market

Build a premium, production-ready, mobile-first e-commerce website for my coffee brand:

BRAND NAME: Auburn Coffee
ORIGIN: Chikkamagaluru, Karnataka, India
BUSINESS TYPE: Premium coffee and farm-origin products
PRIMARY MARKET: India initially, but the website design and architecture must feel globally premium and scalable.

==================================================
1. PRODUCT VISION
==================================================

Create a world-class e-commerce experience for Auburn Coffee that communicates:

- Authenticity
- Chikkamagaluru origin
- Premium quality
- Trust
- Craftsmanship
- Natural sourcing
- Elegance
- Simplicity
- Warmth
- Modern luxury

The website should NOT look like a generic Shopify template.

The visual language should feel comparable to premium global coffee, gourmet food and lifestyle brands.

The design should be:
- Minimal
- Sophisticated
- Calm
- Highly readable
- Premium
- Nature-inspired
- Content-rich without feeling cluttered
- Easy to navigate for users of all age groups
- Accessible
- Fast
- Mobile-first
- Conversion-focused

Avoid excessive animations, gradients, glassmorphism, oversized cards, unnecessary UI decoration or flashy e-commerce patterns.

Use whitespace generously.

==================================================
2. BRAND VISUAL SYSTEM
==================================================

Use an earthy, premium color palette inspired by Auburn Coffee.

Suggested palette:

Primary Auburn:
#8B321E

Deep Forest Green:
#14291E

Warm Ivory:
#F5E9D8

Olive / Estate Green:
#62632B

Espresso Charcoal:
#1B1512

Copper Auburn:
#B86742

Optional luxury gold accent:
#8C6A35

Use gold very sparingly.

Typography:
Use an elegant premium serif typeface for major brand headings and the Auburn wordmark feeling.

Use a highly readable modern sans-serif for:
- Product information
- Navigation
- Forms
- Buttons
- Prices
- Supporting text

Maintain excellent typography hierarchy and spacing.

==================================================
3. PRIMARY NAVIGATION
==================================================

Create a clean sticky navigation header.

Navigation:

Home
Shop
Coffee
Seeds / Green Coffee
Spices
Our Story
Gallery
Bulk Orders
Feedback
Contact

Include:
Search
Account
Cart

Mobile navigation must use an accessible menu.

==================================================
4. HOMEPAGE
==================================================

Build a premium storytelling homepage.

Suggested structure:

HERO SECTION

Large, elegant Auburn Coffee branding.

Strong lifestyle/origin imagery inspired by:
- Chikkamagaluru coffee estates
- Coffee plantations
- Coffee cherries
- Coffee beans
- Misty hills
- Natural landscapes
- Coffee harvesting
- Roasting

Example headline:

"Coffee, Rooted in Chikkamagaluru."

Supporting copy:

"From the hills where Indian coffee found its home, Auburn brings carefully sourced coffee, estate products and flavours crafted with character."

CTA:
Shop Coffee

Secondary CTA:
Discover Our Story


FEATURED COLLECTIONS

Show visually rich collection cards for:

Speciality Coffee
Filter Coffee
Roasted Coffee Beans
Green Coffee Beans / Seeds
Cascara
Spices


BEST SELLERS

Premium horizontal or responsive product showcase.

Each product card should show:

Product image
Product name
Coffee type
Roast level
Taste notes
Weight
Price
Rating if available
Add to Cart
Quick View


ORIGIN STORY

Dedicated storytelling section about Chikkamagaluru.

Focus on:
Origin
Estate culture
Climate
Coffee heritage
Craftsmanship

Keep language authentic and premium rather than overly promotional.


WHY AUBURN

Highlight:

Origin-focused sourcing
Carefully selected coffee
Small-batch quality
Freshness
Traceability
Thoughtful processing


COFFEE JOURNEY

Visual storytelling:

Seed
→ Plant
→ Cherry
→ Harvest
→ Processing
→ Roasting
→ Brewing


FEATURED PRODUCTS


BULK / CORPORATE ORDERS

Dedicated CTA:

"Coffee for offices, cafés, hotels and businesses."

Button:
Explore Bulk Orders


GALLERY PREVIEW


CUSTOMER FEEDBACK


SOCIAL / INSTAGRAM SECTION


NEWSLETTER


FOOTER

==================================================
5. SHOP EXPERIENCE
==================================================

Build a professional ecommerce catalogue.

Main categories:

Speciality Coffee
Filter Coffee
Roasted Beans
Ground Coffee
Green Coffee Beans
Coffee Seeds
Cascara
Spices

Filters should include where relevant:

Category
Price
Roast level
Coffee variety
Arabica
Robusta
Blend
Processing method
Whole bean / Ground
Weight
Availability

Coffee filters may include:

Light Roast
Medium Roast
Medium Dark
Dark Roast

Processing examples:

Washed
Natural
Honey
Anaerobic

Grinding options:

Whole Bean
Espresso
Moka Pot
Pour Over
French Press
South Indian Filter
Cold Brew

Use clean filter controls, especially on mobile.

==================================================
6. PRODUCT DETAIL PAGE
==================================================

Every product should have a premium product page.

Include:

Large product photography
Gallery
Product title
Short description
Price
Weight selector
Quantity selector
Roast level
Processing method
Origin
Variety
Altitude if applicable
Taste notes
Acidity
Body
Sweetness
Recommended brewing methods
Grinding selector where applicable
Stock availability

Buttons:

ADD TO CART
BUY NOW

Include:

Product story
Farm / origin details
Brewing guide
Storage recommendation
Shipping information
Related products

For spices or non-coffee products, automatically hide coffee-specific fields.

==================================================
7. USER LOGIN & SIGNUP
==================================================

Implement secure authentication.

Allow:

Sign Up
Login
Logout
Forgot Password
Password Reset

User profile should contain:

Full Name
Mobile Number
Email
Delivery Address
City
State
Pincode

Account dashboard should include:

Profile
Saved Addresses
Order History
Order Details
Logout

Use secure authentication best practices.

Prefer Supabase Auth if appropriate for the Lovable stack.

Do not store passwords manually.

==================================================
8. CART
==================================================

Create a persistent shopping cart.

Cart should support:

Add product
Remove product
Increase quantity
Decrease quantity
Variant selection
Weight variation
Grinding variation

Show:

Product
Variant
Quantity
Price
Subtotal
Shipping
Total

Cart should persist across refreshes for logged-in users.

Provide:

CONTINUE SHOPPING

and

PROCEED TO CHECKOUT

==================================================
9. CHECKOUT
==================================================

Checkout must be extremely simple.

Steps:

1. Customer Details
2. Delivery Address
3. Order Review
4. Payment / WhatsApp confirmation

Show:

Product subtotal
Shipping charges
Total amount

Do NOT support:

Credit Cards
Debit Cards
Net Banking
Cash on Delivery

PAYMENT METHOD:

UPI ONLY

==================================================
10. UPI + WHATSAPP ORDER FLOW
==================================================

This is a critical requirement.

The checkout model should work as follows:

Customer adds products to cart.

Customer enters/selects delivery address.

Customer reviews the final order.

Customer clicks:

"PLACE ORDER & PAY VIA WHATSAPP"

The system creates a unique order ID.

Example:

AUB-2026-000145

Create the order in the database with status:

Awaiting Payment

After creating the order, open the official Auburn Coffee WhatsApp business number.

Use a pre-filled WhatsApp message.

Example:

Hello Auburn Coffee,

I would like to confirm my order.

Order ID:
AUB-2026-000145

Customer:
{{customer_name}}

Products:
{{product_name}} × {{quantity}}
{{variant}}
{{weight}}

Subtotal:
₹{{subtotal}}

Shipping:
₹{{shipping}}

Order Total:
₹{{total}}

Delivery Address:
{{delivery_address}}

I would like to complete the payment via UPI.

Please share/confirm the payment details.

Thank you.

Use WhatsApp deep linking:

https://wa.me/

Business WhatsApp number must NOT be hardcoded throughout the application.

Create a configuration/settings variable:

BUSINESS_WHATSAPP_NUMBER

Also create:

BUSINESS_UPI_ID

Example placeholder:

auburncoffee@upi

Do not expose sensitive backend credentials.

==================================================
11. OPTIONAL UPI PAYMENT EXPERIENCE
==================================================

Where possible, also show:

"Pay via UPI"

Generate a UPI payment intent containing:

Payee UPI ID
Payee Name
Order Amount
Order ID

Example transaction note:

Auburn Coffee - AUB-2026-000145

Allow mobile customers to open their preferred installed UPI application.

Optionally display a UPI QR code.

After initiating payment, provide:

"I've Completed Payment"

which redirects the customer to WhatsApp with the complete order summary and asks them to send the payment confirmation.

IMPORTANT:

Do not fake automatic payment confirmation.

If no payment-provider webhook is implemented, orders should remain:

Awaiting Payment

until Auburn staff confirms payment.

Design the architecture so that Razorpay / PhonePe / Cashfree UPI verification can be integrated later without rebuilding checkout.

==================================================
12. ORDER MANAGEMENT
==================================================

Order statuses:

Awaiting Payment
Payment Confirmed
Processing
Packed
Shipped
Delivered
Cancelled

Customers should see their current order status in their account.

==================================================
13. ADMIN PANEL
==================================================

Create a secure admin dashboard.

Admin should be able to:

Add products
Edit products
Delete/archive products
Upload product images
Manage product categories
Manage inventory
Change prices
Create discounts
Mark products featured
Manage orders
Update payment status
Update order status
View customers
View bulk-order enquiries
View feedback submissions
Manage gallery
Manage homepage featured products

Admin pages must not be accessible to normal users.

Use proper role-based access control.

==================================================
14. PRODUCT DATA MODEL
==================================================

Design a flexible product structure.

Suggested fields:

id
name
slug
description
short_description
category
subcategory
origin
coffee_variety
processing_method
roast_level
tasting_notes
altitude
brewing_methods
weight_options
grind_options
price
discount_price
stock
images
featured
active
created_at
updated_at

Support multiple product variants.

==================================================
15. WHO WE ARE / OUR STORY
==================================================

Create a visually beautiful brand story page.

Tell the Auburn Coffee story using sections for:

Chikkamagaluru
Coffee heritage
Our philosophy
Sourcing
Craftsmanship
Farm-to-cup journey
Sustainability

Tone:

Warm
Authentic
Premium
Personal
Grounded

Avoid generic corporate language.

==================================================
16. GALLERY
==================================================

Create an editorial photography gallery.

Categories could include:

Estates
Harvest
Coffee Cherries
Processing
Roasting
Products
Brewing
People
Chikkamagaluru

Support responsive image layouts.

Images must:

Lazy load
Use optimized formats
Have descriptive ALT text

==================================================
17. BULK ORDERS
==================================================

Create a dedicated bulk-order page.

Target customers:

Corporate Offices
Hotels
Restaurants
Cafés
Retailers
Resellers
Event Organisers
Gift Buyers

Form fields:

Full Name
Company
Email
Phone
Business Type
Product Interest
Expected Quantity
Frequency
Message

CTA:

"Request a Bulk Quote"

Also offer:

"Discuss on WhatsApp"

Bulk-order submissions should be stored in the database.

==================================================
18. FEEDBACK
==================================================

Create a feedback section.

Fields:

Name
Email / Mobile
Order ID optional
Rating
Feedback

Allow 1–5 star rating.

Store responses in database.

Do not automatically publish feedback publicly.

Admin must approve reviews before publishing.

==================================================
19. CONTACT
==================================================

Create a contact page containing:

Contact form
Email
Phone
WhatsApp
Business address
Operating hours

Add a prominent:

"Chat with us on WhatsApp"

button.

==================================================
20. SOCIAL MEDIA
==================================================

Provide configurable links for:

Instagram
Facebook
YouTube
LinkedIn
WhatsApp

Do not hardcode URLs into multiple components.

Store them centrally.

Open external social links safely in new tabs.

==================================================
21. SEARCH
==================================================

Implement product search.

Search should find products using:

Product name
Category
Coffee type
Origin
Processing method
Taste notes

Provide useful empty-search states.

==================================================
22. RESPONSIVE DESIGN
==================================================

Mobile-first implementation.

Optimize for:

320px mobile
375px mobile
430px mobile
Tablet
Laptop
Desktop
Large desktop

No horizontal overflow.

Navigation, filters, cart and checkout must work perfectly with touch.

Touch targets should follow accessibility guidelines.

==================================================
23. ACCESSIBILITY
==================================================

Target WCAG 2.2 AA accessibility.

Implement:

Semantic HTML
Keyboard navigation
Visible focus states
Correct heading hierarchy
Accessible forms
Form labels
ARIA only where necessary
Descriptive image ALT text
Accessible modals
Accessible menus
Color contrast compliance
Minimum touch targets
Error messages connected to form fields

Do not use color alone to communicate state.

Respect reduced-motion preferences.

==================================================
24. PERFORMANCE
==================================================

Target excellent Core Web Vitals.

Implement:

Image compression
Responsive images
WebP / AVIF where supported
Lazy loading
Code splitting
Minimal unnecessary JavaScript
Font optimization
Caching
Skeleton states where beneficial

Avoid autoplay videos.

==================================================
25. SEO
==================================================

Implement proper technical SEO.

Include:

Unique page titles
Meta descriptions
Canonical URLs
OpenGraph metadata
Twitter cards
Semantic page structure
Product structured data
Organization structured data
Breadcrumb structured data
Product URLs with readable slugs

Example:

/coffee/hillside-arabica

Create:

robots.txt
sitemap.xml

==================================================
26. LOCAL SEO
==================================================

Optimize the business identity around:

Auburn Coffee
Chikkamagaluru Coffee
Speciality Coffee India
Indian Arabica Coffee
Filter Coffee
Coffee Beans
Green Coffee Beans
Chikkamagaluru Coffee Beans

Do not keyword-stuff content.

==================================================
27. SECURITY
==================================================

Follow modern web security standards.

Implement:

Secure authentication
Role-based permissions
Server-side validation
Client-side validation
Database row-level security where applicable
Rate limiting for sensitive actions
Secure environment variables
Input sanitization
Protection from unauthorized admin access

Never expose:

Database secrets
API private keys
Payment credentials
Admin service keys

==================================================
28. DATABASE / BACKEND
==================================================

Prefer Supabase for:

Authentication
PostgreSQL database
Product data
Orders
Customer profiles
Feedback
Bulk enquiries
Image storage

Create proper relationships between:

Users
Profiles
Addresses
Products
Product Variants
Categories
Orders
Order Items
Reviews
Bulk Enquiries
Gallery
Settings

Configure Row Level Security correctly.

==================================================
29. EMPTY / ERROR / LOADING STATES
==================================================

Design intentional states for:

Empty cart
No products found
Search without results
Payment pending
Order successful
Order failed
Network error
Login failure
Registration errors
Out-of-stock product
Page not found

No blank pages.

==================================================
30. MICROCOPY
==================================================

Use warm, sophisticated language.

Instead of generic:

"Buy Now"

occasionally use:

"Choose Your Coffee"
"Explore the Collection"
"Discover the Origin"

But do not sacrifice ecommerce clarity.

Core commerce actions such as:

Add to Cart
Checkout
Place Order

must remain immediately understandable.

==================================================
31. DESIGN DETAILS
==================================================

Use:

Large editorial photography
Strong typography
Thin dividers
Subtle micro-interactions
Light hover states
Refined spacing
Minimal borders
Rounded corners only where appropriate

Avoid:

Excessive rounded cards
Heavy shadows
Neon colors
Huge gradients
Over-animation
Glass effects
Generic SaaS dashboard styling
Stock-template appearance

The website should feel like:

"Luxury grounded in nature."

==================================================
32. FOOTER
==================================================

Include:

Auburn Coffee logo
Short brand description

SHOP
Coffee
Filter Coffee
Green Beans
Seeds
Spices

COMPANY
Our Story
Gallery
Bulk Orders
Contact

SUPPORT
Shipping
Returns
Privacy Policy
Terms
FAQs

CONNECT
Instagram
Facebook
YouTube
WhatsApp

Newsletter signup

Copyright

==================================================
33. LEGAL / ECOMMERCE PAGES
==================================================

Create placeholder pages for:

Privacy Policy
Terms & Conditions
Shipping Policy
Return / Refund Policy
Cancellation Policy
FAQ

Make these easy for the owner to edit later.

==================================================
34. ANALYTICS READY
==================================================

Structure important ecommerce actions so analytics can later track:

product_viewed
product_added_to_cart
cart_viewed
checkout_started
order_created
upi_payment_initiated
whatsapp_checkout_opened
bulk_order_submitted
feedback_submitted
signup_completed

Do not add fake analytics keys.

==================================================
35. INITIAL DEMO DATA
==================================================

Populate the development version with realistic Auburn Coffee demo products.

Examples:

Hillside Arabica
Estate Filter Coffee
Peaberry Reserve
Honey Process Arabica
Washed Arabica
Natural Robusta
Green Arabica Beans
Coffee Seeds
Cascara
Black Pepper
Cardamom

Use realistic Indian Rupee pricing but clearly structure the data so I can replace it.

==================================================
36. IMPORTANT BUILD PRINCIPLES
==================================================

Do not merely create a static landing page.

Build a functioning ecommerce application.

All buttons should work.

All navigation should work.

Cart should work.

Authentication should work.

Product filters should work.

Checkout should work.

WhatsApp redirect should work.

Forms should persist data.

Admin access should be protected.

Use reusable components.

Do not repeat configuration values throughout the codebase.

Avoid hardcoded customer-facing content where it should instead come from the database.

Use clean architecture and production-quality code.

==================================================
37. DELIVERABLE
==================================================

Build the complete responsive Auburn Coffee ecommerce experience.

Start by:

1. Establishing the global design system.
2. Building the database schema.
3. Setting up authentication.
4. Creating navigation and reusable layout.
5. Building Home and Shop.
6. Building product pages.
7. Implementing cart.
8. Implementing checkout.
9. Implementing WhatsApp + UPI flow.
10. Building user account.
11. Building admin.
12. Building story/gallery/bulk-order/feedback pages.
13. Performing responsive/accessibility polish.

Before considering the build complete, audit:

Mobile responsiveness
Accessibility
Navigation
Forms
Checkout
Database permissions
Loading states
Error states
Visual consistency
SEO
Performance

The final product must look and behave like a premium commercial coffee brand website, not a demo project.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ab6f31ab-9aea-4001-ae22-c25a1bd049da).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
