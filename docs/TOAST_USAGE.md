# Toast Notification System

## Overview

A lightweight, modern toast notification system built with React and TypeScript. No external dependencies required!

## Features

✅ **Four Toast Types**: Success, Error, Warning, and Info  
✅ **Smooth Animations**: Slide-in from right with fade effect  
✅ **Auto-Dismiss**: Automatically disappears after 4 seconds  
✅ **Manual Dismiss**: Click × to close immediately  
✅ **Multiple Toasts**: Stacks vertically in top-right corner  
✅ **Zero Dependencies**: Pure React + Tailwind CSS  
✅ **Global Access**: Call from anywhere in the app  
✅ **Type-Safe**: Full TypeScript support

## Usage

### Basic Usage

```tsx
import { useToast } from "../../contexts/ToastContext";

function MyComponent() {
  const { showToast } = useToast();

  const handleSuccess = () => {
    showToast("Profile updated successfully!", "success");
  };

  const handleError = () => {
    showToast("Error saving data", "error");
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
    </div>
  );
}
```

### All Toast Types

```tsx
const { showToast } = useToast();

// Success (Green)
showToast("Operation completed successfully!", "success");

// Error (Red)
showToast("Something went wrong!", "error");

// Warning (Yellow)
showToast("Please review before proceeding", "warning");

// Info (Blue)
showToast("Here's some helpful information", "info");
```

### With Custom Title

```tsx
showToast("Your changes have been saved", "success", "Profile Updated");
showToast("Invalid email format", "error", "Validation Error");
```

### Implementation Examples

#### In API Calls

```tsx
try {
  await apiService.updateProfile(data);
  showToast("Profile updated successfully", "success");
} catch (error) {
  showToast("Failed to update profile", "error");
}
```

#### In Form Submissions

```tsx
const handleSubmit = async () => {
  try {
    await saveForm();
    showToast("Form submitted successfully!", "success");
    resetForm();
  } catch (error) {
    showToast("Please check your input", "error");
  }
};
```

#### In Data Operations

```tsx
const handleDelete = async (id: string) => {
  try {
    await deleteItem(id);
    showToast("Item deleted successfully", "success");
  } catch (error) {
    showToast("Could not delete item", "error");
  }
};
```

## Configuration

### Toast Duration

Default: **4 seconds**

To change the duration, edit `ToastContext.tsx`:

```tsx
setTimeout(() => {
  setToasts((prev) => prev.filter((toast) => toast.id !== id));
}, 4000); // Change this value (in milliseconds)
```

### Position

Default: **Top-right corner**

The toasts are positioned at `top-4 right-4`. Change in `NotificationContainer.tsx`:

```tsx
<div className="fixed top-4 right-4 z-[9999] ...">
```

## Styling

All styles are in Tailwind CSS classes:

- **Success**: Green background with green border (`bg-green-50 border-green-200`)
- **Error**: Red background with red border (`bg-red-50 border-red-200`)
- **Warning**: Yellow background with yellow border (`bg-yellow-50 border-yellow-200`)
- **Info**: Blue background with blue border (`bg-blue-50 border-blue-200`)

## Components

### ToastProvider

Wraps the entire app in `App.tsx` to provide global toast functionality.

### Notification

Individual toast item with icon, message, and close button.

### NotificationContainer

Container that manages multiple toasts and positions them.

## Animation

Custom CSS animations in `index.css`:

```css
@keyframes slide-in-right {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

## Best Practices

1. **Keep messages concise**: 1-2 sentences maximum
2. **Use appropriate types**: Match the toast type to the action
3. **Don't spam**: Show one toast per action
4. **Be descriptive**: Tell users what happened
5. **Follow conventions**:
   - Success for completed actions
   - Error for failures
   - Warning for caution
   - Info for general messages

## Examples Throughout the App

The toast system is already implemented in:

- ✅ Group deletion
- ✅ Member addition
- ✅ Member removal
- ✅ Form submissions (ready to use)
- ✅ API error handling (ready to use)

## Adding More Toasts

Simply import and use wherever needed:

```tsx
import { useToast } from "../../contexts/ToastContext";

const { showToast } = useToast();

// Your success message
showToast("Done!", "success");

// Your error message
showToast("Oops, something went wrong", "error");
```

## Files Modified

1. `src/contexts/ToastContext.tsx` - Global toast state management
2. `src/components/Notification.tsx` - Individual toast component
3. `src/components/NotificationContainer.tsx` - Toast container
4. `src/App.tsx` - Added ToastProvider
5. `src/index.css` - Animation styles
6. `src/pages/dashboard/Groups.tsx` - Example usage
7. `src/pages/dashboard/GroupDetail.tsx` - Example usage

## Technical Details

- **No external dependencies** - Pure React + Tailwind
- **Context-based** - Global state management
- **Type-safe** - Full TypeScript support
- **Performant** - Minimal re-renders with React.memo
- **Accessible** - Proper ARIA labels and keyboard support
- **Responsive** - Works on all screen sizes

Enjoy your beautiful toast notifications! 🎉
