# Terms and Conditions Consent System

This document describes the implementation of a comprehensive Terms and Conditions consent system for the BG-VIKI15 website.

## Overview

The consent system ensures that users accept the terms and conditions before they can submit forms on the website. It includes:

- Modal dialog for terms display
- localStorage persistence
- Form validation
- Responsive design
- Accessibility features

## Components

### 1. TermsConsentModal
**File:** `src/components/TermsConsentModal.js`

A reusable modal component that displays the terms and conditions.

**Props:**
- `isOpen` (boolean): Controls modal visibility
- `onAccept` (function): Called when user accepts terms
- `onDecline` (function): Called when user declines terms
- `termsText` (string): HTML content of terms

**Features:**
- Responsive design (600px desktop, 90% mobile)
- Keyboard navigation (Esc to close)
- Focus management
- Body scroll prevention
- Smooth animations

### 2. ConsentProvider
**File:** `src/components/ConsentProvider.js`

Context provider that manages consent state across the application.

**Usage:**
```jsx
import { ConsentProvider } from '../components/ConsentProvider';

<ConsentProvider termsText={termsText}>
  <YourApp />
</ConsentProvider>
```

**Context Value:**
- `hasConsent` (boolean): Whether user has accepted terms
- `isLoading` (boolean): Whether consent is being checked
- `showConsentModal` (function): Show the consent modal
- `clearConsent` (function): Clear stored consent

### 3. ConsentFormWrapper
**File:** `src/components/ConsentFormWrapper.js`

Wrapper component that automatically disables forms when consent is not given.

**Usage:**
```jsx
import ConsentFormWrapper from '../components/ConsentFormWrapper';

<ConsentFormWrapper>
  <form>
    {/* Your form content */}
  </form>
</ConsentFormWrapper>
```

**Features:**
- Automatic form disabling
- Warning overlay with accept button
- Loading state handling

## Utilities

### 1. consentManager
**File:** `src/lib/consentManager.js`

Utility functions for managing consent in localStorage.

**Methods:**
- `hasAcceptedTerms()`: Check if user has accepted terms
- `acceptTerms(version)`: Accept terms with optional version
- `clearConsent()`: Clear stored consent
- `getConsentDetails()`: Get detailed consent information
- `needsRenewal()`: Check if consent needs renewal
- `getCurrentVersion()`: Get current terms version

### 2. useFormConsent
**File:** `src/lib/useFormConsent.js`

Custom hook for form consent validation.

**Usage:**
```jsx
import useFormConsent from '../lib/useFormConsent';

const { validateConsent, getSubmitButtonProps, getConsentErrorMessage } = useFormConsent();

const handleSubmitWithConsent = validateConsent(handleSubmit);
```

**Methods:**
- `validateConsent(onSubmit)`: Wrap form submission with consent check
- `getSubmitButtonProps(isSubmitting)`: Get button props based on consent
- `getConsentErrorMessage()`: Get consent error message component
- `clearConsentError()`: Clear consent error state

## API

### Terms Endpoint
**File:** `src/pages/api/obshti-uslovia.js`

Serves the terms and conditions text.

**Response:**
```json
{
  "terms": "<h1>ОБЩИ УСЛОВИЯ...</h1>",
  "version": "1.0",
  "lastUpdated": "2024-01-01"
}
```

## Integration

### 1. App Setup
Update `src/pages/_app.js`:

```jsx
import { ConsentProvider } from '../components/ConsentProvider';

const MyApp = ({ Component, pageProps }) => {
  const [termsText, setTermsText] = useState('');

  useEffect(() => {
    const fetchTerms = async () => {
      const response = await fetch('/api/obshti-uslovia');
      const data = await response.json();
      setTermsText(data.terms);
    };
    fetchTerms();
  }, []);

  return (
    <ConsentProvider termsText={termsText}>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </ConsentProvider>
  );
};
```

### 2. Form Integration
Wrap forms with ConsentFormWrapper:

```jsx
import ConsentFormWrapper from '../components/ConsentFormWrapper';
import { useConsent } from '../components/ConsentProvider';

const MyForm = () => {
  const { hasConsent } = useConsent();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!hasConsent) return;
    // Submit form
  };

  return (
    <ConsentFormWrapper>
      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <button type="submit" disabled={!hasConsent}>
          Submit
        </button>
      </form>
    </ConsentFormWrapper>
  );
};
```

### 3. Advanced Form Integration
Use the useFormConsent hook for more control:

```jsx
import useFormConsent from '../lib/useFormConsent';

const MyForm = () => {
  const { validateConsent, getSubmitButtonProps, getConsentErrorMessage } = useFormConsent();

  const handleSubmit = async (e) => {
    // Your form submission logic
  };

  const handleSubmitWithConsent = validateConsent(handleSubmit);

  return (
    <form onSubmit={handleSubmitWithConsent}>
      {/* Form fields */}
      {getConsentErrorMessage()}
      <button type="submit" {...getSubmitButtonProps(isSubmitting)}>
        Submit
      </button>
    </form>
  );
};
```

## Styling

### CSS Modules
- `TermsConsentModal.module.css`: Modal styling
- `ConsentFormWrapper.module.css`: Form wrapper styling
- `ConsentExample.module.css`: Example component styling

### Key Features
- Responsive design
- Accessibility support
- High contrast mode
- Reduced motion support
- Mobile optimization

## Testing

### Manual Testing
1. Clear localStorage: `localStorage.clear()`
2. Refresh page - modal should appear
3. Accept terms - modal should close
4. Try submitting forms - should work
5. Clear consent - forms should be disabled

### Automated Testing
```jsx
// Test consent acceptance
test('accepts terms and enables forms', () => {
  render(<ConsentProvider><TestForm /></ConsentProvider>);
  
  // Modal should be visible
  expect(screen.getByText('Общи условия')).toBeInTheDocument();
  
  // Accept terms
  fireEvent.click(screen.getByText('Приемам'));
  
  // Form should be enabled
  expect(screen.getByRole('button', { name: /submit/i })).not.toBeDisabled();
});
```

## Best Practices

1. **Always wrap forms** with ConsentFormWrapper
2. **Check consent** before form submission
3. **Show clear messages** when consent is required
4. **Test both states** - with and without consent
5. **Handle loading states** properly
6. **Provide fallback content** if terms fail to load
7. **Version your terms** for future updates
8. **Log consent events** for compliance

## Compliance

The system is designed to meet GDPR requirements:

- Clear consent mechanism
- Easy withdrawal of consent
- Persistent storage with versioning
- Audit trail capabilities
- User-friendly interface

## Troubleshooting

### Common Issues

1. **Modal not appearing**: Check if ConsentProvider is wrapping your app
2. **Forms not disabled**: Ensure ConsentFormWrapper is used
3. **Terms not loading**: Check API endpoint and network requests
4. **Consent not persisting**: Check localStorage availability

### Debug Commands
```javascript
// Check consent status
console.log(consentManager.hasAcceptedTerms());

// Clear consent for testing
consentManager.clearConsent();

// Check consent details
console.log(consentManager.getConsentDetails());
```

## Future Enhancements

1. **Server-side consent tracking**
2. **Multiple consent levels**
3. **Consent analytics**
4. **Automated consent renewal**
5. **Multi-language support**
6. **Consent preferences management** 