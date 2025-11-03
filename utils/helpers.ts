export const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatProtein = (protein: number) => {
  return `${protein.toFixed(1)}g`;
};
