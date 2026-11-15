export default function SetupLoading() {
  return (
    <div className="route-loading route-loading--setup" role="status" aria-live="polite">
      <span className="route-loading__line route-loading__line--short" />
      <span className="route-loading__line route-loading__line--title" />
      <span className="route-loading__panel" />
      <span className="sr-only">다음 단계를 불러오는 중이에요.</span>
    </div>
  );
}
