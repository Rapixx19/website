export default function ArticlesLoading() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <div style={{ padding: '80px 48px 56px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '60px', height: '10px', margin: '0 auto 22px' }} />
        <div className="skeleton" style={{ width: '240px', height: '48px', margin: '0 auto 14px' }} />
        <div className="skeleton" style={{ width: '300px', height: '14px', margin: '0 auto' }} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ padding: '38px 52px', background: '#08090D' }}>
            <div className="skeleton" style={{ width: '140px', height: '10px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '80%', height: '22px', marginBottom: '10px' }} />
            <div className="skeleton" style={{ width: '60%', height: '14px' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
