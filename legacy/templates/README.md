# CV Templates

This directory contains template components that can be customized or replaced to change the CV appearance.

## Current Template: Default

The default template includes:
- Action buttons (language switcher, share, print)
- Layout structure
- Styling

## How to Change Templates

1. **Action Buttons**: Modify `templates/default-action-buttons.html` or replace the content in `index.html` within the `<!-- Template: Action Buttons Component -->` section.

2. **Future Templates**: Additional template files can be added here and loaded dynamically via JavaScript.

## Template Structure

- **Action Buttons**: Located in `templates/default-action-buttons.html`
- **Main Layout**: Defined in `index.html`
- **Styles**: CSS is in `index.html` but can be extracted to separate files for better organization

## Notes

- All button labels and messages are loaded from `cv-descriptions-pt.json` and `cv-descriptions-en.json`
- Template components should maintain the same IDs for JavaScript functionality to work correctly

