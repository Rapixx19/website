export default function JournalLoading() {
  return (
    <div style={{ paddingTop: '80px' }}>
      <div style={{ padding: '80px 48px 56px', textAlign: 'center' }}>
        <div className="skeleton" style={{ width: '60px', height: '10px', margin: '0 auto 22px' }} />
        <div className="skeleton" style={{ width: '260px', height: '48px', margin: '0 auto 14px' }} />
        <div className="skeleton" style={{ width: '240px', height: '14px', margin: '0 auto' }} />
      </div>
      <div style={{ maxWidth: '820px', margin: '0 auto', padding: '60px 24px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ marginBottom: '64px' }}>
            <div className="skeleton" style={{ width: '100%', height: '260px', borderRadius: '3px', marginBottom: '24px' }} />
            <div className="skeleton" style={{ width: '120px', height: '10px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '70%', height: '28px', marginBottom: '12px' }} />
            <div className="skeleton" style={{ width: '90%', height: '14px' }} />
            <div style={{ marginTop: '40px', height: '1px', background: 'rgba(255,255,255,0.05)' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
