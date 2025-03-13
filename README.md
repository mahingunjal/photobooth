# Modern Photo Booth Web Application

A feature-rich web-based photo booth application that allows users to capture photos, apply filters, add stickers, create photo strips, and share their creations.

## Features

### Landing Page
- Modern, responsive design with smooth animations
- Dark/light theme toggle
- Flexible pricing plans with free option and free trials
- Monthly/annual billing options with discounts
- Stylish contact form with interactive animations and validation
- Website sharing functionality via URL, Facebook, Twitter, WhatsApp, and LinkedIn

### Photo Booth
- Real-time webcam feed with mirror mode
- Photo capture with countdown
- Multiple filter options:
  - Basic filters: Normal, Grayscale, Sepia, Invert, Vintage, Blueprint, Neon, Pastel, Dramatic
  - Fun filters: Rainbow, Pixelate, Cartoon, Thermal, Mirror, Glitch
- Film strip creation (5 sequential photos in a classic film strip layout)
- Stickers and text overlay:
  - Stickers: Sunglasses, Hat, Mustache, Lips, Crown
  - Customizable text with color and size options
- Download, email, and share functionality
- Timestamp feature for all photos
- Website sharing functionality
- Dark/light theme toggle with saved preferences
- Fully responsive design for mobile and desktop devices

## Pricing Plans
- **Free Plan**: Basic features with 3 photo sessions
- **Basic Plan**: ₹499/month with 7-day free trial
- **Premium Plan**: ₹999/month with 14-day free trial
- **Enterprise Plan**: ₹1,999/month with 30-day free trial
- **Annual Billing**: 20% discount on all paid plans
- **Special Offer**: Additional discounts with promo code

## How to Run the Website

### Option 1: Using the Launcher
1. Simply open the `launcher.html` file in your web browser
2. The launcher will automatically redirect you to the homepage after a brief loading animation

### Option 2: Direct Access
1. Open the `index.html` file in your web browser to access the landing page
2. Click on "Get Started" to access the photo booth functionality

## Technologies Used
- HTML5, CSS3, JavaScript
- Bootstrap 5 for responsive design
- Font Awesome for icons
- Web APIs (getUserMedia, Canvas, etc.)
- Social media sharing integration

## Sharing the Website
You can share the website with others by:
1. Clicking the "Share" button in the navigation bar
2. Copying the URL or using one of the social media buttons (Facebook, Twitter, WhatsApp, LinkedIn, Email)
3. On mobile devices, you can use the "Share on Your Device" button to access your device's native sharing options (including messaging apps, social media, etc.)
4. When someone opens the shared link, they will be automatically directed to start using the photo booth

### Sharing Features
- **Direct URL Sharing**: Copy and paste the URL to share via any platform
- **Native Mobile Sharing**: On supported mobile devices, use the device's built-in sharing menu
- **Social Media Sharing**: Direct buttons for Facebook, Twitter, WhatsApp, and LinkedIn
- **Email Sharing**: Send the link or captured photos via email with customizable subject and message
- **QR Code Generation**: Generate and share QR codes for easy mobile access
- **Auto-start Parameter**: Shared links include a parameter that automatically starts the photo booth when opened

## Browser Compatibility
This application works best on modern browsers that support the required Web APIs:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari (limited support for some features)

## Credits
Created by Mahin Gunjal

## Legal Information
The website includes comprehensive Privacy Policy and Terms & Conditions that cover data collection, usage, user rights, and legal obligations. These documents are accessible from both the landing page footer and the photo booth page.

## Mobile Support
The application is fully responsive and works on mobile devices. For the best experience, use in landscape mode on smaller screens.

## Notes
- Email functionality is simulated on the frontend. In a production environment, it would require backend implementation to actually send emails
- Web Share API may not be supported in all browsers
- Camera access requires HTTPS in most browsers (except localhost)
- Some visual effects like backdrop-filter may not work in all browsers

## Future Enhancements
- Backend integration for email functionality
- More filters and stickers
- Video recording capability
- GIF creation
- Social media authentication for direct posting

## License
This project is open source and available under the [MIT License](LICENSE).

---

Created with ❤️ by Mahin Gunjal 