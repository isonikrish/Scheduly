import Sidebar from '@/components/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex gap-2">
      <div className='w-64'>
        <Sidebar />
      </div>
      <main className="p-6">
        {children}
      </main>
      
    </div>
  )
}
