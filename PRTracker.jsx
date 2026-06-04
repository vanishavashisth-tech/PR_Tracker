import { useState, useMemo } from "react";

const INITIAL_PRS = [
  { id: 1, num: 412, title: "feat: add dark mode to settings panel", status: "review", author: "sarah.chen", repo: "frontend", branch: "feat/dark-mode", base: "main", age: "2h ago", checks: [1, 1, 1], comments: 4, draft: false },
  { id: 2, num: 411, title: "fix: resolve race condition in auth middleware", status: "open", author: "mike.torres", repo: "api", branch: "fix/auth-race", base: "main", age: "5h ago", checks: [1, 1, 0], comments: 2, draft: false },
  { id: 3, num: 410, title: "chore: upgrade Terraform to 1.7", status: "open", author: "priya.nair", repo: "infra", branch: "chore/tf-upgrade", base: "main", age: "1d ago", checks: [1, 1, 1], comments: 1, draft: true },
  { id: 4, num: 409, title: "feat: implement GraphQL subscriptions", status: "review", author: "alex.wu", repo: "api", branch: "feat/gql-subs", base: "dev", age: "1d ago", checks: [1, 0, 1], comments: 8, draft: false },
  { id: 5, num: 408, title: "fix: header z-index on mobile safari", status: "merged", author: "sarah.chen", repo: "frontend", branch: "fix/header-z", base: "main", age: "2d ago", checks: [1, 1, 1], comments: 3, draft: false },
  { id: 6, num: 407, title: "docs: update contribution guide", status: "merged", author: "dan.kim", repo: "frontend", branch: "docs/contrib", base: "main", age: "3d ago", checks: [1, 1, 1], comments: 0, draft: false },
  { id: 7, num: 406, title: "feat: S3 bucket lifecycle policies", status: "closed", author: "priya.nair", repo: "infra", branch: "feat/s3-lifecycle", base: "main", age: "4d ago", checks: [1, 1, 0], comments: 5, draft: false },
  { id: 8, num: 405, title: "refactor: extract payment service module", status: "open", author: "mike.torres", repo: "api", branch: "refactor/payment", base: "dev", age: "6h ago", checks: [2, 2, 2], comments: 0, draft: true },
];

const STATUS_LABELS = { open: "Open", review: "In review", merged: "Merged", closed: "Closed" };
const REPOS = ["all", "frontend", "api", "infra"];

const statusStyles = {
  open:   { icon: "bg-green-100 text-green-800",  badge: "bg-green-100 text-green-800" },
  review: { icon: "bg-amber-100 text-amber-800",  badge: "bg-amber-100 text-amber-800" },
  merged: { icon: "bg-purple-100 text-purple-800", badge: "bg-purple-100 text-purple-800" },
  closed: { icon: "bg-gray-100 text-gray-500",    badge: "bg-gray-100 text-gray-500" },
};

const StatusIcon = ({ status }) => {
  const icons = {
    open: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
      </svg>
    ),
    review: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M8 2a5.97 5.97 0 0 0-4.193 1.715C3.301 4.23 3 5.05 3 6a5 5 0 0 0 10 0c0-.95-.3-1.77-.807-2.285A5.97 5.97 0 0 0 8 2Zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm0-2a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" />
      </svg>
    ),
    merged: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M5.45 5.154A4.25 4.25 0 0 0 9.25 7.5h1.378a2.251 2.251 0 1 1 0 1.5H9.25A5.734 5.734 0 0 1 5 7.123v3.505a2.25 2.25 0 1 1-1.5 0V5.372A2.25 2.25 0 1 1 5.45 5.154Z" />
      </svg>
    ),
    closed: (
      <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
        <path d="M3.25 1A2.25 2.25 0 0 1 4 5.372v5.256a2.25 2.25 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 3.25 1Zm9.5 5.5a.75.75 0 0 1 .75.75v3.378a2.251 2.251 0 1 1-1.5 0V7.25a.75.75 0 0 1 .75-.75Zm-2.03-5.273a.75.75 0 0 1 1.06 0l.97.97.97-.97a.75.75 0 1 1 1.06 1.06l-.97.97.97.97a.75.75 0 0 1-1.06 1.06l-.97-.97-.97.97a.75.75 0 0 1-1.06-1.06l.97-.97-.97-.97a.75.75 0 0 1 0-1.06Z" />
      </svg>
    ),
  };
  return icons[status] || null;
};

const CheckDot = ({ value }) => {
  const cls =
    value === 0 ? "bg-red-500" :
    value === 2 ? "bg-amber-400" :
    "bg-green-500";
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} />;
};

const PRCard = ({ pr, onMerge }) => {
  const allPass = pr.checks.every((c) => c === 1);
  const hasFail = pr.checks.some((c) => c === 0);
  const checkLabel = allPass ? "All checks passed" : hasFail ? "Some checks failed" : "Checks pending";
  const mergeable = pr.status === "review" && allPass;
  const styles = statusStyles[pr.status];

  return (
    <div className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-gray-300 transition-colors cursor-pointer">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${styles.icon}`}>
        <StatusIcon status={pr.status} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-900 leading-snug">
            {pr.title}
            {pr.draft && <span className="ml-1 text-xs text-gray-400 font-normal">[draft]</span>}
          </span>
          <span className="text-xs text-gray-400">#{pr.num}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
            {STATUS_LABELS[pr.status]}
          </span>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4Z"/></svg>
            {pr.author}
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M11.75 2.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm-2.25.75a2.25 2.25 0 1 1 3 2.122V6A2.5 2.5 0 0 1 10 8.5H6a1 1 0 0 0-1 1v1.128a2.251 2.251 0 1 1-1.5 0V5.372a2.25 2.25 0 1 1 1.5 0v1.836A2.493 2.493 0 0 1 6 7h4a1 1 0 0 0 1-1v-.628A2.25 2.25 0 0 1 9.5 3.25Z"/></svg>
            {pr.branch} → {pr.base}
          </span>
          <span className="flex items-center gap-1">
            <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M1 5.25A2.25 2.25 0 0 1 3.25 3h9.5A2.25 2.25 0 0 1 15 5.25v5.5A2.25 2.25 0 0 1 12.75 13h-9.5A2.25 2.25 0 0 1 1 10.75ZM2.5 6v4.75c0 .414.336.75.75.75h9.5a.75.75 0 0 0 .75-.75V6Z"/></svg>
            {pr.age}
          </span>
          {pr.comments > 0 && (
            <span className="flex items-center gap-1">
              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3 h-3"><path d="M1 2.75C1 1.784 1.784 1 2.75 1h10.5c.966 0 1.75.784 1.75 1.75v7.5A1.75 1.75 0 0 1 13.25 12H9.06l-2.573 2.573A1.458 1.458 0 0 1 4 13.543V12H2.75A1.75 1.75 0 0 1 1 10.25Z"/></svg>
              {pr.comments}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            {pr.checks.map((c, i) => <CheckDot key={i} value={c} />)}
            <span className="text-gray-400">{checkLabel}</span>
          </span>
          <span className="text-gray-400">acme/{pr.repo}</span>
        </div>
      </div>

      <div className="flex gap-2 flex-shrink-0 mt-0.5">
        {mergeable && (
          <button
            onClick={(e) => { e.stopPropagation(); onMerge(pr.id); }}
            className="text-xs px-3 py-1.5 rounded-lg border border-green-600 text-green-700 hover:bg-green-50 transition-colors font-medium"
          >
            Merge
          </button>
        )}
        <a
          href={`https://github.com/acme/${pr.repo}/pull/${pr.num}`}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors"
        >
          Review ↗
        </a>
      </div>
    </div>
  );
};

export default function PRTracker() {
  const [prs, setPrs] = useState(INITIAL_PRS);
  const [activeStatus, setActiveStatus] = useState("all");
  const [repoFilter, setRepoFilter] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() =>
    prs.filter((p) =>
      (activeStatus === "all" || p.status === activeStatus) &&
      (repoFilter === "all" || p.repo === repoFilter) &&
      (p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.author.toLowerCase().includes(search.toLowerCase()) ||
        `#${p.num}`.includes(search))
    ),
    [prs, activeStatus, repoFilter, search]
  );

  const scoped = repoFilter === "all" ? prs : prs.filter((p) => p.repo === repoFilter);
  const stats = [
    { label: "Open", val: scoped.filter((p) => p.status === "open" || p.status === "review").length, color: "text-green-700" },
    { label: "In review", val: scoped.filter((p) => p.status === "review").length, color: "text-amber-700" },
    { label: "Merged", val: scoped.filter((p) => p.status === "merged").length, color: "text-purple-700" },
    { label: "Closed", val: scoped.filter((p) => p.status === "closed").length, color: "text-gray-500" },
  ];

  const handleMerge = (id) =>
    setPrs((prev) => prev.map((p) => (p.id === id ? { ...p, status: "merged" } : p)));

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div className="flex items-center gap-2">
          <svg viewBox="0 0 16 16" fill="currentColor" className="w-5 h-5 text-gray-400">
            <path d="M1.5 3.25a2.25 2.25 0 1 1 3 2.122v5.256a2.251 2.251 0 1 1-1.5 0V5.372A2.25 2.25 0 0 1 1.5 3.25Zm5.677-.177L9.573.677A.25.25 0 0 1 10 .854V2.5h1A2.5 2.5 0 0 1 13.5 5v5.628a2.251 2.251 0 1 1-1.5 0V5a1 1 0 0 0-1-1h-1v1.646a.25.25 0 0 1-.427.177L7.177 3.427a.25.25 0 0 1 0-.354Z" />
          </svg>
          <span className="text-base font-medium text-gray-900">Pull requests</span>
        </div>
        <select
          value={repoFilter}
          onChange={(e) => setRepoFilter(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 cursor-pointer"
        >
          <option value="all">All repositories</option>
          {REPOS.slice(1).map((r) => (
            <option key={r} value={r}>acme/{r}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2.5 mb-5">
        {stats.map((s) => (
          <div key={s.label} className="bg-gray-50 rounded-lg px-3 py-3">
            <div className="text-xs text-gray-400 mb-1">{s.label}</div>
            <div className={`text-2xl font-medium ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap items-center mb-4">
        {["all", "open", "review", "merged", "closed"].map((s) => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              activeStatus === s
                ? "bg-gray-900 text-white border-gray-900"
                : "border-gray-200 text-gray-500 hover:border-gray-400 hover:text-gray-700"
            }`}
          >
            {s === "all" ? "All" : STATUS_LABELS[s]}
          </button>
        ))}
        <input
          type="text"
          placeholder="Search PRs…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="ml-auto text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-44 bg-white text-gray-700 placeholder-gray-400"
        />
      </div>

      {/* PR List */}
      <div className="flex flex-col gap-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-sm text-gray-400">No pull requests match your filters</div>
        ) : (
          filtered.map((pr) => <PRCard key={pr.id} pr={pr} onMerge={handleMerge} />)
        )}
      </div>
    </div>
  );
}
