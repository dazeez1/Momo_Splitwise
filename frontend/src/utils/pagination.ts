export interface PaginationResult<T> {
  data: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export const paginate = <T>(
  data: T[],
  currentPage: number,
  itemsPerPage: number
): PaginationResult<T> => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedData = data.slice(startIndex, endIndex);
  
  return {
    data: paginatedData,
    currentPage,
    totalPages: Math.ceil(data.length / itemsPerPage),
    totalItems: data.length,
    itemsPerPage,
  };
};

export const getPageNumbers = (currentPage: number, totalPages: number): number[] => {
  const delta = 2;
  const range = [];
  const rangeWithDots = [];

  for (
    let i = Math.max(2, currentPage - delta);
    i <= Math.min(totalPages - 1, currentPage + delta);
    i++
  ) {
    range.push(i);
  }

  if (currentPage - delta > 2) {
    rangeWithDots.push(1, -1);
  } else {
    rangeWithDots.push(1);
  }

  rangeWithDots.push(...range);

  if (currentPage + delta < totalPages - 1) {
    rangeWithDots.push(-1, totalPages);
  } else {
    rangeWithDots.push(totalPages);
  }

  return rangeWithDots;
};