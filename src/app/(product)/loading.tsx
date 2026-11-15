export default function ProductLoading() {
  return (
    <div className="route-loading" role="status" aria-live="polite" aria-label="화면을 불러오는 중">
      <span className="route-loading__line route-loading__line--short" />
      <span className="route-loading__line route-loading__line--title" />
      <span className="route-loading__panel" />
      <span className="route-loading__line" />
      <span className="route-loading__line route-loading__line--medium" />
      <span className="sr-only">화면을 불러오는 중이에요.</span>
    </div>
  );
}
