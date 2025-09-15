import { parseISO, format, isValid } from 'date-fns';

export const safeParseISO = (dateString: string | null | undefined): Date | null => {
  if (!dateString || typeof dateString !== 'string' || dateString === 'null' || dateString === 'undefined') {
    return null;
  }
  
  try {
    const parsed = parseISO(dateString);
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    console.error('Error parsing date:', dateString, error);
    return null;
  }
};

export const formatTime = (dateString: string | null | undefined, formatStr: string = 'HH:mm'): string => {
  const parsed = safeParseISO(dateString);
  return parsed ? format(parsed, formatStr) : '--:--';
};

export const formatDate = (dateString: string | null | undefined, formatStr: string = 'MMM dd, yyyy'): string => {
  const parsed = safeParseISO(dateString);
  return parsed ? format(parsed, formatStr) : '--';
};
