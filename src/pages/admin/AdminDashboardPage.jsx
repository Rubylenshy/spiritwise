import { useSearchParams } from 'react-router-dom'
import { Layers, Library, Tag } from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { EmptyState } from '../../components/ui'
import SermonsTab from './SermonsTab'
import { SeriesTab, TagsTab } from './TaxonomyTabs'
import { Segmented } from './shared'

const TABS = [
  { value: 'sermons', label: 'Sermons', Icon: Library, Panel: SermonsTab },
  { value: 'series', label: 'Series', Icon: Layers, Panel: SeriesTab },
  { value: 'tags', label: 'Tags', Icon: Tag, Panel: TagsTab },
]

/** Staff-only library management: sermons (with upload / CSV import), series, tags. */
export default function AdminDashboardPage() {
  const user = useAuthStore((s) => s.user)
  const [params, setParams] = useSearchParams()

  if (!user?.is_staff && !user?.is_superuser) {
    return <EmptyState title="Admins only" subtitle="You need a staff account to manage the library." />
  }

  // The tab lives in the URL so a refresh or a shared link keeps it
  const active = TABS.find((t) => t.value === params.get('tab')) ?? TABS[0]
  const { Panel } = active

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 animate-slide-up">
      <Segmented
        options={TABS}
        value={active.value}
        onChange={(tab) => setParams(tab === TABS[0].value ? {} : { tab }, { replace: true })}
      />
      <Panel />
    </div>
  )
}
