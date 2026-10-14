import React from 'react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="pagination" aria-label="Điều hướng phân trang">
      <button
        type="button"
        className="pagination__btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        title="Trang trước"
      >
        <span className="ms">chevron_left</span>
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`pagination__btn ${p === currentPage ? 'is-active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        className="pagination__btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        title="Trang sau"
      >
        <span className="ms">chevron_right</span>
      </button>
    </nav>
  );
};
