import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import './Sidebar.css'

/* ─── Icons ─────────────────────────────────────────── */

function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

function WrenchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

/* ─── Types ──────────────────────────────────────────── */

interface SidebarNavLink {
  label: string
  path: string
}

interface NavGroup {
  label: string
  links: SidebarNavLink[]
}

interface NavSection {
  key: string
  label: string
  icon: React.ReactNode
  /** Direct link — section header navigates to this path */
  path?: string
  /** Collapsible sub-groups with their links */
  groups?: NavGroup[]
}

/* ─── Nav config ─────────────────────────────────────── */

const NAV: NavSection[] = [
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: <WrenchIcon />,
    path: '/maintenance',
  },
  {
    key: 'visitation',
    label: 'Visitment Form',
    icon: <UserIcon />,
    path: '/visitation',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <ChartIcon />,
    groups: [
      {
        label: 'Maintenance',
        links: [
          { label: 'Maintainers by Skill', path: '/reports/maintenance/maintainers-by-skill' },
          { label: 'Labor by Cost', path: '/reports/maintenance/labor-by-cost' },
          { label: 'Cost by Location', path: '/reports/maintenance/cost-by-location' },
        ],
      },
      {
        label: 'Visitment',
        links: [
          {
            label: 'Visitor-Prisoner Relationship',
            path: '/reports/visitation/visitor-prisoner-relationship',
          },
          { label: 'Visitation Logs', path: '/reports/visitation/visitation-logs' },
          { label: 'Visitation Analysis', path: '/reports/visitation/visitation-analysis' },
        ],
      },
    ],
  },
]

/* ─── Component ──────────────────────────────────────── */

export default function Sidebar() {
  const location = useLocation()

  const isGroupActive = (groups: NavGroup[]) =>
    groups.some((g) => g.links.some((l) => location.pathname.startsWith(l.path)))

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    NAV.reduce<Record<string, boolean>>((acc, section) => {
      if (section.groups) acc[section.key] = isGroupActive(section.groups)
      return acc
    }, {})
  )

  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">
          <ShieldIcon />
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">ZedYor</span>
          <span className="sidebar__brand-sub">Prison Management</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV.map((section) => {
          const isActive = section.path
            ? location.pathname === section.path || location.pathname.startsWith(`${section.path}/`)
            : section.groups
              ? isGroupActive(section.groups)
              : false

          const isOpen = open[section.key] ?? false

          /* Direct link section */
          if (section.path) {
            return (
              <NavLink
                key={section.key}
                to={section.path}
                className={({ isActive: a }) =>
                  `sidebar__section-link${a ? ' sidebar__section-link--active' : ''}`
                }
              >
                <span className="sidebar__section-icon">{section.icon}</span>
                <span className="sidebar__section-label">{section.label}</span>
              </NavLink>
            )
          }

          /* Collapsible section */
          return (
            <div key={section.key} className="sidebar__section">
              <button
                type="button"
                className={`sidebar__section-header${isActive ? ' sidebar__section-header--active' : ''}`}
                onClick={() => toggle(section.key)}
                aria-expanded={isOpen}
              >
                <span className="sidebar__section-left">
                  <span className="sidebar__section-icon">{section.icon}</span>
                  <span className="sidebar__section-label">{section.label}</span>
                </span>
                <span className={`sidebar__chevron${isOpen ? ' sidebar__chevron--open' : ''}`}>
                  <ChevronRightIcon />
                </span>
              </button>

              <div className={`sidebar__groups${isOpen ? ' sidebar__groups--open' : ''}`}>
                {section.groups?.map((group) => (
                  <div key={group.label} className="sidebar__group">
                    <span className="sidebar__group-label">{group.label}</span>
                    {group.links.map((link) => (
                      <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive: a }) =>
                          `sidebar__link${a ? ' sidebar__link--active' : ''}`
                        }
                      >
                        <span className="sidebar__link-dot" aria-hidden="true" />
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      <div className="sidebar__footer">
        <p className="sidebar__footer-text">© 2026 ZedYor</p>
      </div>
    </aside>
  )
}
