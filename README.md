# Civic Problems Reporter

A web application that allows citizens to report civic problems in their area and enables municipal corporations to manage and resolve these issues efficiently.

## Features

### For Citizens:
- **Report Issues**: Upload photos and detailed descriptions of civic problems
- **Multiple Categories**: Report various types of issues including:
  - Road damage/potholes
  - Water leakage
  - Garbage collection problems
  - Street light issues
  - Drainage problems
  - Parks & recreation issues
  - Traffic management
  - Other miscellaneous problems
- **Priority Levels**: Mark issues as High, Medium, or Low priority
- **Location Services**: Use GPS to automatically capture current location
- **Municipal Corporation Selection**: Choose the relevant municipal corporation
- **Track Reports**: Monitor the status of submitted reports using report ID

### For Municipal Corporations:
- **Dashboard**: View comprehensive statistics and reports
- **Filtering**: Filter reports by municipal corporation, status, and priority
- **Status Management**: Update report status (Pending → In Progress → Resolved)
- **Priority-based Sorting**: Reports are automatically sorted by priority and timestamp
- **Resolution Tracking**: Add resolution details when issues are resolved

## How to Use

### For Citizens:

1. **Report an Issue**:
   - Click on "Report Issue" tab
   - Fill in the problem details:
     - Select problem category
     - Choose priority level
     - Enter location (or use GPS)
     - Select your municipal corporation
     - Describe the problem
     - Upload a photo
     - Add contact information (optional)
   - Submit the report
   - Note down your Report ID for tracking

2. **Track Your Report**:
   - Click on "Track Issue" tab
   - Enter your Report ID
   - View the current status and updates

### For Municipal Workers:

1. **View Dashboard**:
   - Click on "Municipal Dashboard" tab
   - View statistics and all reported issues
   - Use filters to find specific reports

2. **Manage Reports**:
   - Click "Start Work" to change status from Pending to In Progress
   - Click "Mark Resolved" to complete the work and add resolution details
   - View detailed information for each report

## Technical Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Local Storage**: Data persists in browser's local storage for demo purposes
- **Photo Upload**: Support for image uploads with preview
- **GPS Integration**: Automatic location capture using browser geolocation
- **Real-time Updates**: Dashboard updates automatically when reports are modified
- **Priority System**: High priority issues appear first in the dashboard

## File Structure

```
SIH Project/
├── index.html          # Main HTML file
├── styles.css          # CSS styling
├── script.js           # JavaScript functionality
└── README.md           # This documentation
```

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Future Enhancements

For a production version, consider adding:
- Backend database integration
- User authentication system
- Email notifications
- SMS alerts
- Mobile app version
- Integration with municipal corporation systems
- Advanced mapping features
- Report analytics and insights
- Multi-language support

## Getting Started

1. Open `index.html` in a web browser
2. Start reporting civic issues or managing reports through the dashboard
3. All data is stored locally in your browser

## Sample Data

The application comes with sample data to demonstrate functionality:
- Report #1: Road damage (In Progress)
- Report #2: Water leakage (Pending)
- Report #3: Garbage collection (Resolved)

## Support

This is a demonstration application for civic problem reporting. For production use, additional security, authentication, and backend integration would be required.