/**
 * Format a date to a readable string format
 * @param dateString - Date string to format
 * @returns Formatted date string (e.g., "Jan 15, 2023")
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  // Format as "Month Day, Year"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

/**
 * Calculate the number of nights between two dates
 * @param startDate - Check-in date
 * @param endDate - Check-out date
 * @returns Number of nights
 */
export const calculateNights = (startDate: string | Date, endDate: string | Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Check if dates are valid
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 0;
  }
  
  // Calculate difference in days
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Format a date to ISO string format (YYYY-MM-DD)
 * @param date - Date to format
 * @returns Formatted date string (e.g., "2023-01-15")
 */
export const formatDateForInput = (date: Date | string): string => {
  const dateObj = date instanceof Date ? date : new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return '';
  }
  
  return dateObj.toISOString().split('T')[0];
};

/**
 * Get minimum date string (today) for date inputs
 * @returns Today's date in YYYY-MM-DD format
 */
export const getMinDate = (): string => {
  const today = new Date();
  return formatDateForInput(today);
};

/**
 * Get maximum date string (a year from now) for date inputs
 * @returns Date a year from now in YYYY-MM-DD format
 */
export const getMaxDate = (): string => {
  const today = new Date();
  const nextYear = new Date();
  nextYear.setFullYear(today.getFullYear() + 1);
  return formatDateForInput(nextYear);
}; 