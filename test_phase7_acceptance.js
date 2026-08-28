/**
 * Phase 7 Acceptance Test Suite
 * Tests UI Information Architecture, Category Navigation, Password Policy Customization,
 * Password Strength Meter, and Requirement Checklist.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

console.log('========================================================');
console.log('  RUNNING PHASE 7 ACCEPTANCE TEST SUITE');
console.log('========================================================\n');

let passedTests = 0;
let totalTests = 0;

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

// 1. Check index.html markup
const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

runTest('index.html contains .sidebar-category-nav with all required categories', () => {
  assert(indexHtml.includes('class="sidebar-category-nav"'), 'Category nav missing');
  assert(indexHtml.includes('data-inspector-category="all"'), 'All category missing');
  assert(indexHtml.includes('data-inspector-category="appearance"'), 'Appearance category missing');
  assert(indexHtml.includes('data-inspector-category="branding"'), 'Branding category missing');
  assert(indexHtml.includes('data-inspector-category="auth"'), 'Auth category missing');
  assert(indexHtml.includes('data-inspector-category="password"'), 'Password category missing');
  assert(indexHtml.includes('data-inspector-category="content"'), 'Content category missing');
  assert(indexHtml.includes('data-inspector-category="otp"'), 'OTP category missing');
  assert(indexHtml.includes('data-inspector-category="urls"'), 'URLs category missing');
  assert(indexHtml.includes('data-inspector-category="advanced"'), 'Advanced category missing');
});

runTest('index.html contains Password Policy & Security section', () => {
  assert(indexHtml.includes('data-category="password"'), 'Password policy section missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.minLength"'), 'minLength input missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.maxLength"'), 'maxLength input missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.requireUppercase"'), 'requireUppercase input missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.requireLowercase"'), 'requireLowercase input missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.requireNumber"'), 'requireNumber input missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.requireSpecialChar"'), 'requireSpecialChar input missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.allowedSpecialChars"'), 'allowedSpecialChars input missing');
  assert(indexHtml.includes('data-config-path="passwordPolicy.strengthRequirement"'), 'strengthRequirement input missing');
  assert(indexHtml.includes('id="inspectorStrengthBadge"'), 'inspectorStrengthBadge missing');
  assert(indexHtml.includes('id="inspectorReqsList"'), 'inspectorReqsList missing');
});

runTest('index.html contains 2-column responsive layout classes', () => {
  assert(indexHtml.includes('class="control-row-2col"'), '2-column layout missing');
  const occurrences = (indexHtml.match(/control-row-2col/g) || []).length;
  assert(occurrences >= 10, `Expected at least 10 2-column control rows, found ${occurrences}`);
});

// 2. Check config.js defaults
const configCode = fs.readFileSync(path.join(__dirname, 'js', 'config.js'), 'utf8');
const { defaultConfig } = require('./js/config.js');

runTest('config.js exports passwordPolicy with correct default values', () => {
  assert(defaultConfig.passwordPolicy, 'defaultConfig.passwordPolicy missing');
  assert.strictEqual(defaultConfig.passwordPolicy.minLength, 8);
  assert.strictEqual(defaultConfig.passwordPolicy.maxLength, 64);
  assert.strictEqual(defaultConfig.passwordPolicy.requireUppercase, true);
  assert.strictEqual(defaultConfig.passwordPolicy.requireLowercase, true);
  assert.strictEqual(defaultConfig.passwordPolicy.requireNumber, true);
  assert.strictEqual(defaultConfig.passwordPolicy.requireSpecialChar, true);
  assert.strictEqual(defaultConfig.passwordPolicy.minNumbers, 1);
  assert.strictEqual(defaultConfig.passwordPolicy.minSpecialChars, 1);
  assert.strictEqual(defaultConfig.passwordPolicy.preventUsername, true);
  assert.strictEqual(defaultConfig.passwordPolicy.preventEmail, true);
  assert.strictEqual(defaultConfig.passwordPolicy.strengthRequirement, 'medium');
});

// 3. Check templates.js
const Templates = require('./js/templates.js');

runTest('Templates.generateSignupPage renders dynamic password strength meter & requirements list', () => {
  const signupHtml = Templates.generateSignupPage(defaultConfig);
  assert(signupHtml.includes('signup-password-meter'), 'signup-password-meter missing in signup HTML');
  assert(signupHtml.includes('signupMeterBar'), 'signupMeterBar missing in signup HTML');
  assert(signupHtml.includes('signup-requirements-card'), 'signup-requirements-card missing in signup HTML');
  assert(signupHtml.includes('reqCheckMinLength'), 'reqCheckMinLength missing in signup HTML');
  assert(signupHtml.includes('reqCheckUpper'), 'reqCheckUpper missing in signup HTML');
  assert(signupHtml.includes('reqCheckLower'), 'reqCheckLower missing in signup HTML');
  assert(signupHtml.includes('reqCheckNumber'), 'reqCheckNumber missing in signup HTML');
  assert(signupHtml.includes('reqCheckSpecial'), 'reqCheckSpecial missing in signup HTML');
});

// 4. Check CSS definitions
const customCss = fs.readFileSync(path.join(__dirname, 'css', 'customization.css'), 'utf8');
const sidebarCss = fs.readFileSync(path.join(__dirname, 'css', 'sidebar.css'), 'utf8');

runTest('CSS files define all required Phase 7 components', () => {
  assert(sidebarCss.includes('.sidebar-category-nav'), '.sidebar-category-nav missing in sidebar.css');
  assert(sidebarCss.includes('.sidebar-category-btn'), '.sidebar-category-btn missing in sidebar.css');
  assert(customCss.includes('.control-row-2col'), '.control-row-2col missing in customization.css');
  assert(customCss.includes('.inspector-strength-card'), '.inspector-strength-card missing in customization.css');
  assert(customCss.includes('.signup-password-meter'), '.signup-password-meter missing in customization.css');
  assert(customCss.includes('.signup-requirements-card'), '.signup-requirements-card missing in customization.css');
});

// 5. Preserved single source of truth checks
runTest('Preserves exact single source of truth elements', () => {
  const resetBtnMatches = (indexHtml.match(/id="resetConfigurationButton"/g) || []).length;
  assert.strictEqual(resetBtnMatches, 1, `Expected exactly 1 resetConfigurationButton, found ${resetBtnMatches}`);

  const liveSyncMatches = (indexHtml.match(/id="liveSyncBadge"/g) || []).length;
  assert.strictEqual(liveSyncMatches, 1, `Expected exactly 1 liveSyncBadge, found ${liveSyncMatches}`);

  const pageTabMatches = (indexHtml.match(/data-builder-page=/g) || []).length;
  assert.strictEqual(pageTabMatches, 4, `Expected exactly 4 data-builder-page tabs, found ${pageTabMatches}`);
});

console.log('\n--------------------------------------------------------');
console.log(`  Phase 7 Acceptance Tests: ${passedTests}/${totalTests} Passed`);
console.log('--------------------------------------------------------\n');

if (passedTests !== totalTests) {
  process.exit(1);
}
