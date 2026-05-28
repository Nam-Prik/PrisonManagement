import { BarChartIcon, ChevronRightIcon, FileTextIcon, ListBulletIcon } from '@radix-ui/react-icons'
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
  links?: SidebarNavLink[]
  groups?: NavGroup[]
}

const NAV: NavSection[] = [
  {
    key: 'line-items',
    label: 'Line Items',
    icon: <ListBulletIcon width={18} height={18} />,
    links: [
      { label: 'Maintenance', path: '/maintenance' },
      { label: 'Visitment', path: '/visitation' },
      { label: 'Treatment', path: '/treatment' },
      { label: 'Incidents', path: '/incident' },
      { label: 'Prisoner Intake', path: '/prisoner-intake' },
      { label: 'Routines', path: '/routines' },
    ],
  },
  {
    key: 'simple-forms',
    label: 'Simple Forms',
    icon: <FileTextIcon width={18} height={18} />,
    links: [
      { label: 'Person', path: '/person' },
      { label: 'Prisoner', path: '/prisoner' },
      { label: 'Prison Location', path: '/prison-location' },
      { label: 'Medicine', path: '/medicine' },
      { label: 'Officer', path: '/officer' },
      { label: 'Nurse', path: '/nurse' },
      { label: 'Maintainer', path: '/maintainer' },
      { label: 'Irregularity', path: '/irregularity' },
    ],
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
      {
        label: 'Prisoner Incidents',
        links: [
          { label: 'Incidents by Officer', path: '/reports/incident/by-officer' },
          { label: 'Prisoners by Location', path: '/reports/incident/by-location' },
          { label: 'Top Prisoners by Location', path: '/reports/incident/top-by-location' },
        ],
      },
      {
        label: 'Prisoner Intake',
        links: [
          { label: 'Intake by Date Range', path: '/reports/prisoner-intake/by-date' },
          { label: 'Confiscated Items', path: '/reports/prisoner-intake/confiscated-items' },
          { label: 'Total Items Analysis', path: '/reports/prisoner-intake/total-items' },
        ],
      },
      {
        label: 'Officer & Routines',
        links: [
          { label: 'Officer Routines', path: '/reports/officer/routines' },
          { label: 'Irregularities List', path: '/reports/officer/irregularities-list' },
          { label: 'Irregularities Summary', path: '/reports/officer/irregularities-summary' },
        ],
      },
      {
        label: 'Treatment',
        links: [
          { label: 'Prisoner Treatment Experience', path: '/reports/treatment/experience' },
          { label: 'Medicine Prescription', path: '/reports/treatment/medicine-prescription' },
          { label: 'Nurse Workload', path: '/reports/treatment/nurse-workload' },
        ],
      },
      {
        label: 'Officer & Routines',
        links: [
          { label: 'Officer Routines', path: '/reports/officer/routines' },
          { label: 'Irregularities List', path: '/reports/officer/irregularities-list' },
          { label: 'Irregularities Summary', path: '/reports/officer/irregularities-summary' },
        ],
      },
    ],
  },
]

export default function Sidebar() {
  const location = useLocation()

  const isLinksActive = (links: SidebarNavLink[]) =>
    links.some((l) => location.pathname === l.path || location.pathname.startsWith(`${l.path}/`))

  const isGroupActive = (groups: NavGroup[]) =>
    groups.some((g) => g.links.some((l) => location.pathname.startsWith(l.path)))

  const [open, setOpen] = useState<Record<string, boolean>>(() =>
    NAV.reduce<Record<string, boolean>>((acc, section) => {
      if (section.links) acc[section.key] = isLinksActive(section.links)
      if (section.groups) acc[section.key] = isGroupActive(section.groups)
      return acc
    }, {})
  )

  const toggle = (key: string) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src="/logo.png" alt="Logo" className="sidebar__brand-icon" />
        <span className="sidebar__brand-name">Prison Management System</span>
      </div>

      <nav className="sidebar__nav" aria-label="Main navigation">
        {NAV.map((section) => {
          const isActive = section.path
            ? location.pathname === section.path || location.pathname.startsWith(`${section.path}/`)
            : section.links
              ? isLinksActive(section.links)
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
                {section.links && (
                  <div className="sidebar__group sidebar__group--flat">
                    {section.links.map((link) => (
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
                )}

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
    </aside>
  )
}
