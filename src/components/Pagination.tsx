interface Props {
  page: number;
  total: number;
  pageSize?: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, total, pageSize = 20, onChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav aria-label="Навигация по страницам" className="mt-4">
      <ul className="pagination justify-content-center">
        <li className={`page-item${page <= 1 ? ' disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onChange(page - 1)}>←</button>
        </li>
        {pages.map((p) => (
          <li key={p} className={`page-item${p === page ? ' active' : ''}`}>
            <button type="button" className="page-link" onClick={() => onChange(p)}>{p}</button>
          </li>
        ))}
        <li className={`page-item${page >= totalPages ? ' disabled' : ''}`}>
          <button type="button" className="page-link" onClick={() => onChange(page + 1)}>→</button>
        </li>
      </ul>
    </nav>
  );
}
