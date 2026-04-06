export default function HomeLoading() {
  return (
    <div style={{ minHeight: '100vh', background: '#08090D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '62px', height: '62px', borderRadius: '50%', margin: '0 auto 24px' }} />
        <div className="skeleton" style={{ width: '280px', height: '60px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '40px', height: '1px', margin: '0 auto 16px' }} />
        <div className="skeleton" style={{ width: '200px', height: '12px', margin: '0 auto' }} />
      </div>
    </div>
  )
}
