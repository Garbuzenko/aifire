
const BASE_URL = 'http://localhost:3011';

async function checkHeaderElements() {
  console.log('='.repeat(60));
  console.log('🖥️  HEADER ELEMENTS VERIFICATION');
  console.log('='.repeat(60));
  console.log(`\nFetching homepage from ${BASE_URL}/en ...\n`);

  try {
    const response = await fetch(`${BASE_URL}/en`);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch homepage: ${response.status} ${response.statusText}`);
      return;
    }

    const html = await response.text();
    
    // Check for Header element
    console.log('📋 Checking for <header> element...');
    const hasHeader = html.includes('<header');
    if (hasHeader) {
      console.log('✅ PASS: <header> element is present');
    } else {
      console.log('❌ FAIL: <header> element not found');
    }

    // Check for Logo
    console.log('\n📋 Checking for Logo...');
    const logoSrc = "https://storage.yandexcloud.net/stickers/stickers-AgAD_g0AAoGJqEg.gif";
    const hasLogo = html.includes(logoSrc);
    
    if (hasLogo) {
      console.log('✅ PASS: Logo is present');
    } else {
      console.log('❌ FAIL: Logo not found');
    }

    // Check for Language Switcher
    console.log('\n📋 Checking for Language Switcher...');
    // The language switcher button has an SVG icon or text.
    // Based on LanguageSwitcher.tsx, it renders a button with a globe or flag.
    // It might be hard to match exact HTML due to dynamic rendering, but let's check for some unique class or text if possible.
    // The button has `onClick={() => setIsOpen(true)}`.
    // But this is client-side code. The initial HTML might just have the button structure.
    // Let's check for the SVG path or class names used in LanguageSwitcher.
    // Class: "bg-gray-800/50 backdrop-blur-md"
    const hasLanguageSwitcher = html.includes('bg-gray-800/50') || html.includes('backdrop-blur-md');
    
    if (hasLanguageSwitcher) {
      console.log('✅ PASS: Language Switcher seems to be present (checked for specific classes)');
    } else {
      console.log('⚠️  WARNING: Language Switcher might not be present or classes changed');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 HEADER VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const checks = [
      { name: 'Header Element', passed: hasHeader },
      { name: 'Logo', passed: hasLogo },
      { name: 'Language Switcher', passed: hasLanguageSwitcher },
    ];
    
    checks.forEach(check => {
      console.log(`${check.passed ? '✅' : '❌'} ${check.name}`);
    });
    
    const passedCount = checks.filter(c => c.passed).length;
    console.log(`\nTotal: ${passedCount}/${checks.length} checks passed`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Error fetching or parsing HTML:', error);
  }
}

// Main execution
(async () => {
  await checkHeaderElements();
})();
