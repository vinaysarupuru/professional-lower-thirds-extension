# Contributing to Professional Lower Thirds & Brand Overlay

Thank you for your interest in contributing to this Chrome extension! We welcome contributions from the community.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Style Guidelines](#style-guidelines)
- [Reporting Issues](#reporting-issues)
- [Feature Requests](#feature-requests)

## Code of Conduct

This project follows a simple code of conduct:
- Be respectful and inclusive
- Focus on constructive feedback
- Help maintain a welcoming environment for all contributors

## Getting Started

### Prerequisites
- Google Chrome browser (version 88+)
- Basic knowledge of JavaScript, HTML, and CSS
- Familiarity with Chrome Extension development

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/vinaysarupuru/professional-lower-thirds-extension.git
   cd professional-lower-thirds-extension
   ```

2. **Load the extension in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right corner)
   - Click "Load unpacked" and select the project directory
   - The extension will appear in your extensions list

3. **Test your changes:**
   - Make your code changes
   - Click the refresh button on the extension card in `chrome://extensions/`
   - Test the functionality on web pages

## How to Contribute

### Types of Contributions

We welcome several types of contributions:

1. **Bug Fixes** - Fix existing issues
2. **New Themes** - Add new lower third or brand styles
3. **Feature Enhancements** - Improve existing functionality
4. **Documentation** - Improve README, comments, or guides
5. **Performance Improvements** - Optimize code performance

### Contribution Process

1. **Fork the repository** on GitHub
2. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the style guidelines
4. **Test thoroughly** on multiple websites
5. **Commit your changes** with clear commit messages:
   ```bash
   git commit -m "Add new gradient theme for lower thirds"
   ```
6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Create a Pull Request** with a clear description

## Style Guidelines

### JavaScript
- Use modern ES6+ syntax
- Follow consistent indentation (2 spaces)
- Add comments for complex logic
- Handle errors gracefully
- Use meaningful variable names

```javascript
// Good example
const createBrandElement = (brandText, backgroundStyle) => {
  try {
    // Clear implementation with error handling
  } catch (error) {
    console.error('Error creating brand element:', error);
  }
};
```

### CSS
- Use consistent naming conventions
- Group related properties
- Add comments for complex animations
- Ensure mobile responsiveness

```css
/* Lower Third Theme: Ocean Blue */
.label-ocean-blue {
  background: linear-gradient(45deg, #006994, #00a8cc);
  animation: shimmerWave 3s ease-in-out infinite;
  /* Additional properties... */
}
```

### HTML
- Use semantic HTML elements
- Maintain consistent indentation
- Add meaningful IDs and classes

## Adding New Themes

### Lower Third Themes

To add a new lower third theme:

1. **Add CSS to `styles.css`:**
   ```css
   .label-your-theme-name {
     background: your-background-style;
     color: your-text-color;
     /* Additional styling */
   }
   ```

2. **Add to popup.html theme list:**
   ```html
   <input type="radio" name="theme" value="your-theme-name" id="theme-your-name">
   <label for="theme-your-name">Your Theme Name</label>
   ```

3. **Test on various websites** to ensure compatibility

### Brand Background Styles

To add a new brand background style:

1. **Add CSS to `styles.css`:**
   ```css
   .brand-bg-your-style {
     background: your-background-style;
     /* Additional properties */
   }
   ```

2. **Add to popup.html brand styles:**
   ```html
   <input type="radio" name="brandBackground" value="your-style" id="brand-your-style">
   <label for="brand-your-style">Your Style</label>
   ```

## Reporting Issues

When reporting bugs:

1. **Use a clear, descriptive title**
2. **Provide steps to reproduce** the issue
3. **Include your Chrome version** and OS
4. **Attach screenshots** if relevant
5. **Describe expected vs actual behavior**

### Issue Template
```markdown
**Bug Description:**
Brief description of the bug

**Steps to Reproduce:**
1. Go to...
2. Click on...
3. See error

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happens

**Environment:**
- Chrome Version: 
- OS: 
- Extension Version:
```

## Feature Requests

For new feature suggestions:

1. **Check existing issues** to avoid duplicates
2. **Describe the use case** and benefits
3. **Provide implementation ideas** if possible
4. **Consider backward compatibility**

## Questions?

If you have questions about contributing:
- Open an issue with the "question" label
- Check existing documentation
- Review closed issues for similar questions

## Recognition

Contributors will be acknowledged in:
- CHANGELOG.md for their contributions
- GitHub contributors list
- Special mentions for significant contributions

Thank you for helping make this extension better!
