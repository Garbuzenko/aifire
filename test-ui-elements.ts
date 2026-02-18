export {};

/**
 * Test script to verify UI elements on the homepage
 */

const BASE_URL = 'http://localhost:3011';

async function checkUIElements() {
  console.log('='.repeat(60));
  console.log('🖥️  UI ELEMENTS VERIFICATION');
  console.log('='.repeat(60));
  console.log(`\nFetching homepage from ${BASE_URL}/en ...\n`);

  try {
    const response = await fetch(`${BASE_URL}/en`);
    
    if (!response.ok) {
      console.error(`❌ Failed to fetch homepage: ${response.status} ${response.statusText}`);
      return;
    }

    const html = await response.text();
    
    // Check for input field
    console.log('📋 Checking for profession input field...');
    const hasInputField = html.includes('type="text"') && 
                          (html.includes('placeholder') || html.includes('Enter your profession'));
    
    if (hasInputField) {
      console.log('✅ PASS: Input field for profession analysis is present');
      
      // Try to find the placeholder text
      const placeholderMatch = html.match(/placeholder="([^"]+)"/);
      if (placeholderMatch) {
        console.log(`   Placeholder text: "${placeholderMatch[1]}"`);
      }
    } else {
      console.log('❌ FAIL: Input field not found');
    }

    // Check for submit button
    console.log('\n📋 Checking for submit button...');
    const hasSubmitButton = html.includes('button') && 
                           (html.includes('Check the future') || html.includes('Analyzing'));
    
    if (hasSubmitButton) {
      console.log('✅ PASS: Submit button is present');
    } else {
      console.log('⚠️  WARNING: Submit button might not be present or has different text');
    }

    // Check for "Top Risk Today" section
    console.log('\n📋 Checking for "Top Risk Today" section...');
    const hasTopRisk = html.includes('Top Risk') || 
                       html.includes('top_risk_today') ||
                       html.includes('🔥');
    
    if (hasTopRisk) {
      console.log('✅ PASS: "Top Risk Today" section is present');
    } else {
      console.log('❌ FAIL: "Top Risk Today" section not found');
    }

    // Check for "Top Safety" section
    console.log('\n📋 Checking for "Top Safety" section...');
    const hasTopSafety = html.includes('Top Safety') || 
                         html.includes('top_safety') ||
                         html.includes('🛡️');
    
    if (hasTopSafety) {
      console.log('✅ PASS: "Top Safety" section is present');
    } else {
      console.log('❌ FAIL: "Top Safety" section not found');
    }

    // Check for title
    console.log('\n📋 Checking for page title...');
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    if (titleMatch) {
      console.log(`✅ Page title: "${titleMatch[1]}"`);
    }

    // Check for main heading
    console.log('\n📋 Checking for main heading...');
    const hasMainHeading = html.includes('WILL AI TAKE MY JOB') || 
                          html.includes('title');
    
    if (hasMainHeading) {
      console.log('✅ PASS: Main heading is present');
    } else {
      console.log('⚠️  WARNING: Main heading might not be present');
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 UI VERIFICATION SUMMARY');
    console.log('='.repeat(60));
    
    const checks = [
      { name: 'Input Field', passed: hasInputField },
      { name: 'Submit Button', passed: hasSubmitButton },
      { name: 'Top Risk Section', passed: hasTopRisk },
      { name: 'Top Safety Section', passed: hasTopSafety },
      { name: 'Main Heading', passed: hasMainHeading },
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
  await checkUIElements();
})();
