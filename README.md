# Interactive CV - Frontend Only Resume Builder

A modern, interactive curriculum vitae built with pure HTML, CSS, and JavaScript. No backend required - everything runs client-side in the browser.

## 🌟 Features

- **Multiple Templates**: Choose from three distinct CV templates
- **Color Themes**: Four beautiful color schemes to match your style
- **Bilingual Support**: Portuguese and English
- **Text-to-Speech**: Built-in TTS functionality with voice customization
- **Mobile Responsive**: Fully optimized for mobile devices
- **Print Ready**: Professional print layouts
- **Share Functionality**: Easy sharing via WhatsApp, Email, and LinkedIn

## 📋 Templates

### 1. Better View (Default)
The standard template with the best visual presentation. Features a clean sidebar with profile information and a main content area for professional experience, education, and skills. Perfect for general use and online viewing.

**Best for**: General job applications, portfolio websites, professional networking

### 2. ATS-Friendly
Optimized for Applicant Tracking Systems (ATS). This template uses a clean, structured layout with minimal styling to ensure maximum compatibility with ATS software used by recruiters. Text is formatted for easy parsing, and the layout follows ATS-friendly conventions.

**Best for**: Job applications through ATS systems, automated screening processes

**Key Features**:
- Simple, linear layout
- Standard text formatting
- No complex CSS that might confuse ATS parsers
- Clear section headers
- Structured data presentation

### 3. Star Wars
A fun, interactive template inspired by the Star Wars opening crawl. Features animated text scrolling, Star Wars theme music, and a unique visual experience. Perfect for standing out in creative industries or when applying to companies with a fun culture.

**Best for**: Creative industries, tech companies with fun cultures, standing out from the crowd

**Note**: This template features an animated opening crawl and Star Wars-themed styling for a unique presentation.

**Key Features**:
- Animated opening crawl text
- Star Wars theme music (optional)
- Interactive controls
- Unique visual presentation

## 📝 Adapting the CV to Your Data

### Understanding the JSON Structure

All your personal data is stored in `cv-data.json`. This is the only file you need to edit to customize the CV with your information. The structure is:

```json
{
  "personal": {
    "name": "Your Name",
    "tagline": {
      "pt": "Your tagline in Portuguese",
      "en": "Your tagline in English"
    },
    "photo": "./avatar.png",
    "location": {
      "pt": "City, Country",
      "en": "City, Country"
    },
    "phone": "+55 11 99999-9999",
    "email": "your.email@example.com",
    "linkedin": "https://linkedin.com/in/yourprofile",
    "github": "https://github.com/yourusername"
  },
  "about": {
    "pt": "Your about text in Portuguese",
    "en": "Your about text in English"
  },
  "workExperience": [
    {
      "period": {
        "pt": "January 2020 - Present",
        "en": "January 2020 - Present"
      },
      "title": {
        "pt": "Senior Developer",
        "en": "Senior Developer"
      },
      "company": {
        "pt": "Company Name",
        "en": "Company Name"
      },
      "location": {
        "pt": "City, Country",
        "en": "City, Country"
      },
      "description": {
        "pt": "Job description in Portuguese",
        "en": "Job description in English"
      },
      "technologies": "Technologies used: React, Node.js, TypeScript"
    }
  ],
  "education": [
    {
      "period": {
        "pt": "2010 - 2014",
        "en": "2010 - 2014"
      },
      "degree": {
        "pt": "Bachelor in Computer Science",
        "en": "Bachelor in Computer Science"
      },
      "institution": {
        "pt": "University Name",
        "en": "University Name"
      }
    }
  ],
  "certifications": [
    {
      "name": {
        "pt": "Certification Name",
        "en": "Certification Name"
      },
      "issuer": {
        "pt": "Issuing Organization",
        "en": "Issuing Organization"
      },
      "year": 2020
    }
  ],
  "languages": [
    {
      "name": {
        "pt": "Portuguese",
        "en": "Portuguese"
      },
      "level": {
        "pt": "Nativo",
        "en": "Native"
      }
    }
  ],
  "techStack": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js"
  ],
  "keyAchievements": [
    {
      "icon": "bi-trophy",
      "title": {
        "pt": "Achievement Title",
        "en": "Achievement Title"
      },
      "description": {
        "pt": "Achievement description",
        "en": "Achievement description"
      }
    }
  ],
  "projects": [
    {
      "name": {
        "pt": "Project Name",
        "en": "Project Name"
      },
      "description": {
        "pt": "Project description",
        "en": "Project description"
      },
      "technologies": ["React", "Node.js"],
      "link": "https://project-url.com"
    }
  ],
  "hobbies": [
    {
      "pt": "Reading, Traveling",
      "en": "Reading, Traveling"
    }
  ]
}
```

### Using AI to Extract Data from Your CV

You can use AI tools like ChatGPT, Claude, or other LLMs to help extract and format your CV data into JSON:

1. **Prepare your CV**: Have your current CV ready (PDF or text format)

2. **Create a prompt** like this:
   ```
   I have a CV/resume and I need to extract the information into a JSON format. 
   Here's my CV:
   
   [Paste your CV content here]
   
   Please extract all the information and format it as a JSON object following this structure:
   [Paste the JSON structure from above]
   
   Make sure to:
   - Include both Portuguese and English versions for bilingual fields
   - Format dates consistently
   - Include all work experience, education, certifications, and skills
   - Preserve the structure exactly as shown
   ```

3. **Review and adjust**: The AI will generate the JSON, but you should review it and make any necessary adjustments

4. **Save to file**: Copy the generated JSON and save it as `cv-data.json` in the project root

### Manual Data Entry

If you prefer to fill the data manually:

1. Open `cv-data.json` in a text editor
2. Replace the example data with your information
3. Make sure to maintain valid JSON syntax (commas, quotes, brackets)
4. Use a JSON validator if needed (many online tools available)

### Changing Your Photo

1. Replace `avatar.png` in the root directory with your photo
2. Keep the same filename or update the path in `cv-data.json`:
   ```json
   "photo": "./your-photo.png"
   ```

**Important**: All your personal data (name, phone, email, LinkedIn, GitHub, etc.) should be entered only in `cv-data.json`. The application will automatically extract and display the information from there.

## 🚀 Running a Local Server

Since this is a frontend-only application, you need to run it through a local web server (you cannot simply open the HTML file directly due to CORS restrictions when loading JSON files).

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (choose one of the options below)
- Basic knowledge of JSON (for editing your data)

### Option 1: Using Python

**Python 3:**
```bash
python -m http.server 8000
```

**Python 2:**
```bash
python -m SimpleHTTPServer 8000
```

### Option 2: Using Node.js (http-server)

First install http-server globally (if not already installed):
```bash
npm install -g http-server
```

Then run:
```bash
http-server -p 8000
```

Or use npx (no installation needed):
```bash
npx http-server -p 8000
```

### Option 3: Using PHP

```bash
php -S localhost:8000
```

### Option 4: Using the Provided Batch File (Windows)

Simply double-click `serve.bat` or run from command line:
```bash
serve.bat
```

### Opening in Browser

After starting the server, open your browser and navigate to:
```
http://localhost:8000
```

## 🎯 Customization

### Customizing Colors

Color themes are defined in `css/themes.css`. You can:
- Modify existing themes
- Create new themes by adding new `[data-theme="your-theme"]` rules
- Update the theme selector in `js/themes.js`

### Adding New Sections

1. Add the section data to `cv-data.json`
2. Add the HTML structure to the appropriate template in `templates/`
3. Add rendering logic in `index.html` (in the `renderCV()` function)
4. Add CSS styling in the appropriate CSS file

## 📱 Mobile Support

The CV is fully responsive. On mobile devices:
- The sidebar becomes a collapsible navigation menu
- Sections are organized into logical groups
- Touch-friendly controls
- Optimized for small screens

## 🔊 Text-to-Speech (TTS)

The CV includes built-in TTS functionality:
- Read the entire CV or specific sections
- Adjustable voice settings
- Multiple language support
- Voice presets for different themes

### Using TTS

1. Click the TTS button in the action buttons panel
2. Select sections to read
3. Adjust voice settings as needed
4. Click play to start

## 🖨️ Printing

The CV is optimized for printing:
- Professional layouts
- Proper page breaks
- Optimized colors for print
- All templates support printing (Star Wars template is optimized for screen viewing)

To print:
1. Click the print button
2. Use your browser's print dialog
3. Select your printer and settings

## 📤 Sharing

Share your CV easily:
- **WhatsApp**: Opens WhatsApp with a pre-filled message
- **Email**: Opens your email client with a pre-filled subject and body
- **LinkedIn**: Opens LinkedIn's sharing interface

## 🏗️ Project Structure

The project is organized into clear, logical directories following best practices:

```
cv/
├── index.html                  # Main HTML file
├── cv-data.json                # Your CV data (EDIT THIS FILE)
├── cv-descriptions-pt.json    # Portuguese descriptions
├── cv-descriptions-en.json    # English descriptions
├── css/                        # Stylesheets
│   ├── base.css                # Base variables, reset, typography
│   ├── layout.css              # Layout styles, responsive, print
│   ├── themes.css              # Color theme definitions
│   ├── components.css           # UI components (buttons, menus, TTS)
│   ├── animations.css          # Animation styles (Star Wars intro)
│   └── templates/              # Template-specific styles
│       ├── ats-friendly.css    # ATS-Friendly template styles
│       └── star-wars.css       # Star Wars template styles
├── js/                         # JavaScript modules
│   ├── themes.js               # Theme and template management
│   ├── templates.js            # Template loading system
│   ├── tts.js                  # Text-to-Speech functionality
│   ├── managers/               # Business logic managers
│   │   ├── dataManager.js      # Data loading and language switching
│   │   └── mobileManager.js     # Mobile navigation management
│   ├── renderers/              # Content rendering
│   │   └── cvRenderer.js       # CV content rendering
│   └── utils/                  # Utility functions
│       ├── dateUtils.js        # Date formatting utilities
│       ├── languageUtils.js    # Language detection and switching
│       ├── shareUtils.js       # Social sharing functions
│       └── printUtils.js        # Print functionality
├── templates/                  # HTML templates
│   ├── better-view.html        # Default template structure
│   ├── ats-friendly.html       # ATS-Friendly template structure
│   └── star-wars.html          # Star Wars template structure
└── fonts/                      # Custom fonts (Star Wars)
```

## 🔧 Technical Details

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern CSS with variables, flexbox, grid
- **Vanilla JavaScript**: No frameworks, pure JS
- **Bootstrap Icons**: For icons (CDN)
- **Web Speech API**: For TTS functionality

### Browser Compatibility
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance
- No external dependencies (except CDN for Bootstrap Icons)
- Lightweight and fast loading
- Optimized for performance

## 📄 License

This project is open source and available for personal and commercial use.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📧 Support

For questions or issues, please open an issue on GitHub.

## 🙏 Acknowledgments

- Star Wars fonts from [FontSpace](https://www.fontspace.com/)
- Bootstrap Icons for iconography
- Web Speech API for TTS functionality

---
