import { SAMPLE_TEMPLATES } from '../lib/prompt-core';

export default function Home() {
  const categories = [...new Set(SAMPLE_TEMPLATES.map(template => template.category))];
  return (
    <main style={{ maxWidth: 880, margin: '8vh auto', padding: 'clamp(24px,5vw,56px)', fontFamily: 'system-ui', lineHeight: 1.65 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <img src="/favicon.svg" alt="" width="46" height="46" />
        <div><strong style={{ fontSize: 17, letterSpacing: '-.3px' }}>Prompt Library</strong><div style={{ fontSize: 12, opacity: .58 }}>Your private prompt workbench</div></div>
      </div>
      <h1 style={{ fontSize: 'clamp(34px,6vw,56px)', lineHeight: 1.1, letterSpacing: '-2px', maxWidth: 650, margin: '48px 0 20px', fontWeight: 600 }}>A better starting point.<br />Your context, built in.</h1>
      <p style={{ fontSize: 18, maxWidth: 650, opacity: .72 }}>Find the right template, shape it with your conversation, and review every detail before you copy.</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, margin: '30px 0' }}>
        {categories.map(category => <span key={category} style={{ border: '1px solid color-mix(in srgb,currentColor 16%,transparent)', borderRadius: 100, padding: '7px 13px', fontSize: 12 }}>{category}</span>)}
      </div>
      <section style={{ border: '1px solid color-mix(in srgb,currentColor 16%,transparent)', borderRadius: 20, padding: '28px', marginTop: 36 }}>
        <p style={{ fontSize: 12, opacity: .6, margin: '0 0 8px' }}>{SAMPLE_TEMPLATES.length} ready-to-use templates · {categories.length} categories</p>
        <h2 style={{ fontSize: 22, letterSpacing: '-.5px', margin: '0 0 16px' }}>Open the library in ChatGPT</h2>
        <ol style={{ paddingLeft: 20, margin: 0, display: 'grid', gap: 10 }}>
          <li>Select the connected Prompt Library plugin and ask “Open my Prompt Library”.</li>
          <li>Search or browse by category, then choose a template.</li>
          <li>Fill missing fields from the chat or revise a draft with your latest context.</li>
          <li>Review the details and copy the prompt. Saving field values for later is optional.</li>
        </ol>
      </section>
      <p style={{ fontSize: 13, maxWidth: 660, opacity: .62, marginTop: 24 }}>The interactive library lives inside your conversation. Your saved templates and drafts stay tied to your signed-in account. The app receives only the field values ChatGPT supplies and never submits the finished prompt for you.</p>
      <footer aria-label="Policies and audience" style={{ fontSize: 12, opacity: .7, borderTop: '1px solid color-mix(in srgb,currentColor 16%,transparent)', paddingTop: 16, marginTop: 32 }}><span>Adults only · 18+</span><nav aria-label="Policies and support" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8 }}><a href="https://aaarslan.com/prompt-library/privacy">Privacy policy</a><a href="https://aaarslan.com/prompt-library/terms">Terms of use</a><a href="https://aaarslan.com/prompt-library/support">Support</a></nav></footer>
    </main>
  );
}
