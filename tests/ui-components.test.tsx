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
import { render, fireEvent, screen } from '@testing-library/react';
import Navbar from '../src/components/Navbar';
import SqlShowcase from '../src/components/SqlShowcase';

test('UI Component Tests (DOM Rendering & Interactivity)', async (t) => {
  await t.test('Navbar: Renders branding, navigation tabs, and role toggle', () => {
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
    assert.ok(getByText('SQL Demo'), 'SQL Demo tab link must exist');

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

  await t.test('SqlShowcase: Renders 3 demonstration query options and triggers selection', async () => {
    // Mock global fetch for SqlShowcase API call
    (global as any).fetch = async (url: string) => ({
      ok: true,
      json: async () => ({
        success: true,
        demoKey: 'multi_join',
        sql: 'SELECT * FROM users JOIN search_query ON users.user_id = search_query.user_id',
        executionTimeMs: 4,
        rowCount: 3,
        rows: [
          { researcher_name: 'Dr. Neel Chandrakar', role: 'ADMIN', query_text: 'deep learning' },
        ],
      }),
    });

    const { getByText } = render(React.createElement(SqlShowcase));

    // Verify header and query cards
    assert.ok(getByText('Advanced DBMS Query Demonstrator'), 'Header must render');
    assert.ok(getByText('1. Multi-Table JOIN Query'), 'JOIN card must render');
    assert.ok(getByText('2. GROUP BY & HAVING Query'), 'GROUP BY card must render');
    assert.ok(getByText('3. Full-Text vs Vector Search'), 'FTS vs Vector card must render');

    // Click on GROUP BY with HAVING card
    const groupByCard = getByText('2. GROUP BY & HAVING Query');
    fireEvent.click(groupByCard);
    assert.ok(groupByCard, 'Clicked GROUP BY card successfully');
  });
});
