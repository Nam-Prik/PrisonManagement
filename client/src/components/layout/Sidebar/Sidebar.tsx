import { BarChartIcon, ChevronRightIcon, GearIcon, LockClosedIcon } from '@radix-ui/react-icons'
import type { ReactNode } from 'react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import './Sidebar.css'

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
  icon: ReactNode
  path?: string
  groups?: NavGroup[]
}

const NAV: NavSection[] = [
  {
    key: 'maintenance',
    label: 'Maintenance',
    icon: <GearIcon width={18} height={18} />,
    path: '/maintenance',
  },
  {
    key: 'reports',
    label: 'Reports',
    icon: <BarChartIcon width={18} height={18} />,
    groups: [
      {
        label: 'Maintenance',
        links: [
          { label: 'Maintainers by Skill', path: '/reports/maintenance/maintainers-by-skill' },
          { label: 'Labor by Cost', path: '/reports/maintenance/labor-by-cost' },
          { label: 'Cost by Location', path: '/reports/maintenance/cost-by-location' },
        ],
      },
    ],
  },
]

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
      <div className="sidebar__brand">
        <div className="sidebar__brand-icon">
          <LockClosedIcon width={20} height={20} />
        </div>
        <div className="sidebar__brand-text">
          <span className="sidebar__brand-name">ZedYor</span>
          <span className="sidebar__brand-sub">Prison Management</span>
        </div>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV.map((section) => {
          const isActive = section.path
            ? location.pathname === section.path || location.pathname.startsWith(`${section.path}/`)
            : section.groups
              ? isGroupActive(section.groups)
              : false

          const isOpen = open[section.key] ?? false

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
                  <ChevronRightIcon width={14} height={14} />
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
