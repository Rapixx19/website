export default function TeamLoading() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <div style={{ padding: '80px 48px 56px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '80px', height: '10px', margin: '0 auto 22px' }} />
        <div className="skeleton" style={{ width: '300px', height: '48px', margin: '0 auto 14px' }} />
        <div className="skeleton" style={{ width: '260px', height: '14px', margin: '0 auto' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1px', padding: '0' }}>
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ background: '#08090D', padding: '40px 32px' }}>
            <div className="skeleton" style={{ width: '50px', height: '50px', borderRadius: '50%', marginBottom: '22px' }} />
            <div className="skeleton" style={{ width: '120px', height: '20px', marginBottom: '8px' }} />
            <div className="skeleton" style={{ width: '80px', height: '10px', marginBottom: '16px' }} />
            <div className="skeleton" style={{ width: '100%', height: '60px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
