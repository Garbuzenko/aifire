export {};

/**
 * Test script for profession analyzer
 * Tests the /api/analyze endpoint with various inputs
 */

interface AnalysisResult {
  id?: number;
  risk_score: number;
  verdict: string;
  reasoning: string;
  safe_skills: string[];
  replaced_tasks: string[];
  is_censored?: boolean;
  is_profession?: boolean;
}

const BASE_URL = 'http://localhost:3011';
const LOCALE = 'en';

async function testAnalyze(jobTitle: string): Promise<AnalysisResult | null> {
  try {
    console.log(`\n🔍 Testing: "${jobTitle}"`);
    const response = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobTitle, locale: LOCALE }),
    });

    if (!response.ok) {
      console.error(`❌ HTTP Error: ${response.status} ${response.statusText}`);
      return null;
    }

    const data = await response.json() as AnalysisResult;
    return data;
  } catch (error) {
    console.error(`❌ Request failed:`, error);
    return null;
  }
}

function displayResult(jobTitle: string, result: AnalysisResult | null) {
  if (!result) {
    console.log(`❌ No result received for "${jobTitle}"\n`);
    return;
  }

  console.log(`\n📊 Results for "${jobTitle}":`);
  console.log(`   Is Censored: ${result.is_censored ? '🚫 YES' : '✅ NO'}`);
  console.log(`   Is Profession: ${result.is_profession ? '✅ YES' : '❌ NO'}`);
  console.log(`   Risk Score: ${result.risk_score}%`);
  console.log(`   Verdict: ${result.verdict}`);
  console.log(`   Reasoning: ${result.reasoning}`);
  
  if (result.safe_skills && result.safe_skills.length > 0) {
    console.log(`   Safe Skills:`);
    result.safe_skills.forEach(skill => console.log(`      • ${skill}`));
  }
  
  if (result.replaced_tasks && result.replaced_tasks.length > 0) {
    console.log(`   Tasks at Risk:`);
    result.replaced_tasks.forEach(task => console.log(`      • ${task}`));
  }
  
  if (result.id) {
    console.log(`   Database ID: ${result.id}`);
  }
  console.log('');
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('🧪 PROFESSION ANALYZER TEST SUITE');
  console.log('='.repeat(60));

  // Test 1: Software Engineer (valid profession)
  console.log('\n📋 TEST 1: Valid Profession - "Software Engineer"');
  console.log('-'.repeat(60));
  const test1 = await testAnalyze('Software Engineer');
  displayResult('Software Engineer', test1);
  
  if (test1) {
    if (test1.is_censored) {
      console.log('⚠️  WARNING: Software Engineer should NOT be censored!');
    } else {
      console.log('✅ PASS: Software Engineer is not censored');
    }
    
    if (test1.risk_score >= 0 && test1.risk_score <= 100) {
      console.log('✅ PASS: Risk score is valid (0-100)');
    } else {
      console.log('❌ FAIL: Risk score is invalid');
    }
    
    if (test1.safe_skills && test1.safe_skills.length > 0) {
      console.log('✅ PASS: Safe skills are provided');
    } else {
      console.log('❌ FAIL: No safe skills provided');
    }
    
    if (test1.replaced_tasks && test1.replaced_tasks.length > 0) {
      console.log('✅ PASS: Replaced tasks are provided');
    } else {
      console.log('❌ FAIL: No replaced tasks provided');
    }
  }

  // Test 2: Politician (should be censored - politics)
  console.log('\n📋 TEST 2: Political Profession - "Politician"');
  console.log('-'.repeat(60));
  const test2 = await testAnalyze('Politician');
  displayResult('Politician', test2);
  
  if (test2) {
    if (test2.is_censored) {
      console.log('✅ PASS: Politician is correctly censored (politics)');
    } else {
      console.log('❌ FAIL: Politician should be censored but is not!');
    }
    
    if (test2.is_censored && test2.risk_score === 0) {
      console.log('✅ PASS: Censored content has risk_score = 0');
    } else if (test2.is_censored) {
      console.log('⚠️  WARNING: Censored content should have risk_score = 0');
    }
  }

  // Test 3: Profanity (should be censored)
  console.log('\n📋 TEST 3: Profanity - "fuck"');
  console.log('-'.repeat(60));
  const test3 = await testAnalyze('fuck');
  displayResult('fuck', test3);
  
  if (test3) {
    if (test3.is_censored) {
      console.log('✅ PASS: Profanity is correctly censored');
    } else {
      console.log('❌ FAIL: Profanity should be censored but is not!');
    }
    
    if (test3.is_censored && test3.risk_score === 0) {
      console.log('✅ PASS: Censored content has risk_score = 0');
    } else if (test3.is_censored) {
      console.log('⚠️  WARNING: Censored content should have risk_score = 0');
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const results = [
    { name: 'Software Engineer', result: test1, shouldBeCensored: false },
    { name: 'Politician', result: test2, shouldBeCensored: true },
    { name: 'fuck', result: test3, shouldBeCensored: true },
  ];
  
  let passed = 0;
  let failed = 0;
  
  results.forEach(({ name, result, shouldBeCensored }) => {
    if (!result) {
      console.log(`❌ ${name}: FAILED (no result)`);
      failed++;
    } else if (result.is_censored === shouldBeCensored) {
      console.log(`✅ ${name}: PASSED`);
      passed++;
    } else {
      console.log(`❌ ${name}: FAILED (censorship mismatch)`);
      failed++;
    }
  });
  
  console.log(`\nTotal: ${passed} passed, ${failed} failed`);
  console.log('='.repeat(60));
}

// Check if server is running before starting tests
async function checkServer() {
  try {
    console.log(`Checking if server is running at ${BASE_URL}...`);
    const response = await fetch(`${BASE_URL}/api/languages`);
    if (response.ok) {
      console.log('✅ Server is running\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running or not accessible');
    console.error('   Please start the server with: npm run dev');
    return false;
  }
  return false;
}

// Main execution
(async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await runTests();
  } else {
    process.exit(1);
  }
})();
