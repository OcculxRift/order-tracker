import { ReactNode } from 'react';
import Navigation from './Navigation';

type Props = {
  children: ReactNode;
};

export default function AppLayout({ children }: Props) {
  return (
    <div className="app-container">
      <Navigation />
      <main className="main-content">{children}</main>
    </div>
  );
}
