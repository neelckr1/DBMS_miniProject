import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// Initialize DOM environment for React Testing Library
const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  url: 'http://localhost:3000',
  pretendToBeVisual: true,
});
(global as any).window = dom.window;
(global as any).document = dom.window.document;
(global as any).HTMLElement = dom.window.HTMLElement;
Object.defineProperty(global, 'navigator', {
  value: dom.window.navigator,
  writable: true,
  configurable: true,
});

import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import Navbar from '../src/components/Navbar';
import SearchSection from '../src/components/SearchSection';

test('UI Component Tests (DOM Rendering & Interactivity)', async (t) => {
  await t.test('Navbar: Renders branding, navigation tabs, and role toggle', () => {
    cleanup();
    let currentTab = 'search';
    let currentRole: 'ADMIN' | 'STUDENT' = 'STUDENT';

    const { getByText, rerender } = render(
      React.createElement(Navbar, {
        activeTab: currentTab,
        setActiveTab: (tab: string) => { currentTab = tab; },
        userRole: currentRole,
        setUserRole: (role: 'ADMIN' | 'STUDENT') => { currentRole = role; },
      })
    );

    // Verify Title & Subtitle
    assert.ok(getByText('Campus Research Repository'), 'Header title must be rendered');
    assert.ok(getByText('Semantic Search System'), 'Badge must be rendered');

    // Verify Navigation Links
    assert.ok(getByText('Search'), 'Search tab link must exist');
    assert.ok(getByText('Papers'), 'Papers tab link must exist');
    assert.ok(getByText('Analytics'), 'Analytics tab link must exist');

    // Verify Role Toggle displays Student
    const roleButton = getByText('Student');
    assert.ok(roleButton, 'Role button must show Student');

    // Click Role button -> switches to Admin
    fireEvent.click(roleButton);
    assert.strictEqual(currentRole, 'ADMIN', 'Clicking role toggle must switch role to ADMIN');

    // Rerender with ADMIN role
    rerender(
      React.createElement(Navbar, {
        activeTab: currentTab,
        setActiveTab: (tab: string) => { currentTab = tab; },
        userRole: 'ADMIN',
        setUserRole: (role: 'ADMIN' | 'STUDENT') => { currentRole = role; },
      })
    );
    assert.ok(getByText('Admin'), 'Role button must now display Admin');

    // Click Papers Tab
    const papersTabButton = getByText('Papers');
    fireEvent.click(papersTabButton);
    assert.strictEqual(currentTab, 'papers', 'Clicking Papers must change activeTab to papers');
  });

  await t.test('SearchSection: Renders search input, options toggle, and suggestion pills', async () => {
    cleanup();
    const { getByText, getByPlaceholderText } = render(
      React.createElement(SearchSection, { userRole: 'STUDENT' })
    );

    // Verify header and input
    assert.ok(getByText('Find Campus Research Papers'), 'Search header must render');
    const input = getByPlaceholderText('Search by topic, e.g. how do transformers process language...');
    assert.ok(input, 'Search input placeholder must render');

    // Verify filters toggle button
    const filtersButton = getByText('Filters');
    assert.ok(filtersButton, 'Filters button must exist');
    fireEvent.click(filtersButton);

    // Verify similarity threshold slider appears
    assert.ok(getByText('Minimum Match:'), 'Threshold label must appear when filters toggled');
  });
});
