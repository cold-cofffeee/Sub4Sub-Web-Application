/**
 * Database Migration Script
 * Creates initial data and admin user
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Content = require('../models/Content');
const config = require('../config/config');

async function migrate() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongodb.uri);
    console.log('✓ Connected to MongoDB');
    
    // Create admin user if doesn't exist
    const adminExists = await User.findOne({ email: config.admin.email });
    
    if (!adminExists) {
      const admin = new User({
        email: config.admin.email,
        username: config.admin.username,
        password: config.admin.password,
        isAdmin: true,
        isPremium: true,
        emailVerified: true,
        fullName: 'System Administrator'
      });
      
      await admin.save();
      console.log('✓ Admin user created');
      console.log(`  Email: ${config.admin.email}`);
      console.log(`  Username: ${config.admin.username}`);
      console.log(`  Password: ${config.admin.password}`);
      console.log('  ⚠ PLEASE CHANGE THE ADMIN PASSWORD AFTER FIRST LOGIN!');
    } else {
      console.log('✓ Admin user already exists');
    }
    
    // Create default content pages
    const contentTypes = [
      {
        type: 'about',
        title: 'About Us',
        content: `
          <h2>Welcome to SUB4SUB</h2>
          <p>SUB4SUB is a platform designed to help YouTube creators grow their channels organically by exchanging subscriptions with other creators.</p>
          <h3>Our Mission</h3>
          <p>We believe in supporting content creators and helping them reach their goals through genuine engagement and mutual support.</p>
          <h3>How It Works</h3>
          <p>1. Sign up for free<br>2. Browse available YouTube channels<br>3. Subscribe to channels you're interested in<br>4. Get subscribed back and grow your channel!</p>
        `
      },
      {
        type: 'faq',
        title: 'Frequently Asked Questions',
        content: `
          <h2>FAQ</h2>
          <h3>Is SUB4SUB free?</h3>
          <p>Yes! SUB4SUB is completely free to use. We also offer premium features for users who want to accelerate their growth.</p>
          <h3>Is it safe?</h3>
          <p>Absolutely. We use industry-standard security measures to protect your data. We never ask for your YouTube password.</p>
          <h3>How do I get more subscriptions?</h3>
          <p>Simply subscribe to other channels on our platform and verify your subscriptions. Other users will subscribe back to your channel.</p>
          <h3>Can I get banned from YouTube?</h3>
          <p>Our platform promotes organic growth through real users. However, we always recommend following YouTube's terms of service.</p>
        `
      },
      {
        type: 'privacy',
        title: 'Privacy Policy',
        content: `
          <h2>Privacy Policy</h2>
          <p><strong>Last updated: ${new Date().toLocaleDateString()}</strong></p>
          <h3>Information We Collect</h3>
          <p>We collect information you provide directly to us, including your email address, username, and YouTube channel information.</p>
          <h3>How We Use Your Information</h3>
          <p>We use your information to provide and improve our services, communicate with you, and protect our platform.</p>
          <h3>Data Security</h3>
          <p>We implement appropriate security measures to protect your personal information.</p>
          <h3>Contact Us</h3>
          <p>If you have any questions about our privacy policy, please contact us.</p>
        `
      },
      {
        type: 'tos',
        title: 'Terms of Service',
        content: `
          <h2>Terms of Service</h2>
          <p><strong>Last updated: ${new Date().toLocaleDateString()}</strong></p>
          <h3>Acceptance of Terms</h3>
          <p>By accessing and using SUB4SUB, you accept and agree to be bound by these Terms of Service.</p>
          <h3>User Responsibilities</h3>
          <p>You are responsible for maintaining the confidentiality of your account and for all activities under your account.</p>
          <h3>Prohibited Activities</h3>
          <p>You may not use our service for any illegal or unauthorized purpose.</p>
          <h3>Termination</h3>
          <p>We reserve the right to terminate or suspend your account at any time for violation of these terms.</p>
        `
      },
      {
        type: 'contact',
        title: 'Contact Us',
        content: `
          <p>We're here to help! If you have any questions, concerns, or feedback, please don't hesitate to reach out to us.</p>
        `
      }
    ];
    
    for (const contentData of contentTypes) {
      const existing = await Content.findOne({ type: contentData.type });
      
      if (!existing) {
        await Content.create(contentData);
        console.log(`✓ Created ${contentData.type} content page`);
      } else {
        console.log(`✓ ${contentData.type} content page already exists`);
      }
    }
    
    console.log('\n✓ Migration completed successfully!\n');
    
    // Create uploads directory
    const fs = require('fs');
    const uploadsDir = config.upload.path;
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✓ Uploads directory created');
    }
    
    console.log('\n📝 Next Steps:');
    console.log('1. Copy .env.example to .env and configure your settings');
    console.log('2. Run: npm install');
    console.log('3. Run: npm start');
    console.log('4. Visit: http://localhost:3000\n');
    
  } catch (error) {
    console.error('✗ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run migration
migrate();
