import React from 'react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white shadow p-4 flex justify-between items-center">
      <h1 className="text-xl font-bold">Admin Dashboard</h1>
      <nav>
        <ul className="flex space-x-4">
          <li>
            <Link href="/admin/users">
              <a className="text-blue-600 hover:underline">Users</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/subscriptions">
              <a className="text-blue-600 hover:underline">Subscriptions</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/stats">
              <a className="text-blue-600 hover:underline">Stats</a>
            </Link>
          </li>
          <li>
            <Link href="/admin/audit-logs">
              <a className="text-blue-600 hover:underline">Audit Logs</a>
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
