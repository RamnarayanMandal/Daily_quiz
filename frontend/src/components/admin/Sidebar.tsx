

export default function Sidebar({ onOpenCreate, collapsed, onToggle, activeKey, onNavigate, onLogout }: { onOpenCreate: () => void; collapsed: boolean; onToggle: () => void; activeKey: 'all' | 'daily'; onNavigate: (key: 'all' | 'daily') => void; onLogout?: () => void }) {
  return (
    <aside className={`h-max md:sticky md:top-16 border rounded-2xl bg-card/80 backdrop-blur shadow-sm ${collapsed ? 'p-2 w-[64px]' : 'p-4 w-[220px]'} transition-all`}> 
      <div className={`flex items-center justify-between ${collapsed ? 'px-1' : ''}`}>
        {!collapsed && <div className="text-sm font-semibold text-muted-foreground">Sections</div>}
        <button onClick={onToggle} className="text-xs px-2 py-1 rounded-full border hover:bg-muted" title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>
      <nav className={`grid gap-2 ${collapsed ? 'mt-2' : 'mt-3'} text-sm`}>
        <button onClick={() => onNavigate('all')} className={`rounded-full ${activeKey==='all' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'} ${collapsed ? 'h-10 w-10 grid place-items-center' : 'px-3 py-2 text-left'}`} title="All Questions">{collapsed ? 'AQ' : 'All Questions'}</button>
        <button onClick={() => onNavigate('daily')} className={`rounded-full ${activeKey==='daily' ? 'bg-primary text-primary-foreground' : 'hover:bg-primary/10'} ${collapsed ? 'h-10 w-10 grid place-items-center' : 'px-3 py-2 text-left'}`} title="Daily Selection">{collapsed ? 'DS' : 'Daily Selection'}</button>
      </nav>
      <div className={`${collapsed ? 'mt-2' : 'mt-4'} grid gap-2`}>
        <button onClick={onOpenCreate} className={`${collapsed ? 'h-10 w-10 grid place-items-center rounded-full bg-primary text-primary-foreground' : 'px-3 py-2 rounded-full bg-primary text-primary-foreground'}`}>{collapsed ? '+' : '+ Create Question'}</button>
        <button onClick={onLogout} className={`${collapsed ? 'h-10 w-10 grid place-items-center rounded-full border' : 'px-3 py-2 rounded-full border'}`}>{collapsed ? '⎋' : 'Logout'}</button>
      </div>
    </aside>
  );
}


