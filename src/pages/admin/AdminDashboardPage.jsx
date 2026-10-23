import { useSearchParams } from 'react-router-dom'
import { Layers, Library, Tag } from 'lucide-react'
import SermonsTab from './SermonsTab'
import { SeriesTab, TagsTab } from './TaxonomyTabs'
import { Segmented } from './shared'

const TABS = [
  { value: 'sermons', label: 'Sermons', Icon: Library, Panel: SermonsTab },
  { value: 'series', label: 'Series', Icon: Layers, Panel: SeriesTab },
  { value: 'tags', label: 'Tags', Icon: Tag, Panel: TagsTab },
]

/** Staff-only library management (gated by AdminRoute): sermons (with upload / CSV import), series, tags. */
export default function AdminDashboardPage() {
  const [params, setParams] = useSearchParams()

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
